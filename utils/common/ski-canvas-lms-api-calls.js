"use strict";

let SKI_DEBUG_MODE = false;
chrome.storage.sync.get(
  {
    enableDetailedLogging: false
  },
  function (items) {
    SKI_DEBUG_MODE = items.enableDetailedLogging;
    
  }
);

class SkiCanvasLmsApiCaller {
  static BASE_URL = `${window.location.protocol}//${window.location.hostname}`;
  static MAX_ATTEMPTS = 3;
  static WAIT_TIME_PER_RETRY = 5000;

  constructor() {}

  static #sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /* REST API Calls */

  static async getRequest(endpointUrl, params={}, resultPropertySelector=null) {
    if (typeof endpointUrl === 'string' && !endpointUrl.startsWith("http")) {
      endpointUrl = `${SkiCanvasLmsApiCaller.BASE_URL}${endpointUrl}`;
    }
    
    const requestUrl = endpointUrl instanceof URL ? endpointUrl : new URL(endpointUrl);
    for(const key in params) {
      const value = params[key];
      if (key.endsWith("[]") && value instanceof Array) {
        for (const item of value) {
          requestUrl.searchParams.append(key, item);  
        }
      } else {
        requestUrl.searchParams.append(key, value);
      }
    }

    if (SKI_DEBUG_MODE) { console.log(requestUrl); }

    let requestResponse;
    return await fetch(requestUrl)
      .then(response => {
        requestResponse = response;
        return response.json();
      })
      .then(data => {
        if (SKI_DEBUG_MODE) { console.log(data); }
        const responseResults = new SkiCanvasLmsApiResponse(requestResponse, data, resultPropertySelector);
        if (SKI_DEBUG_MODE) { console.log(responseResults); }
        return responseResults;
      })
      .catch((error) => {
        console.error(`Error: ${error}`);
        return;
      });
  }

  static async getRequestAllPages(endpointUrl, params={}, resultPropertySelector=null) {
    const firstPageResponse = await SkiCanvasLmsApiCaller.getRequest(endpointUrl, params, resultPropertySelector);
    if (!firstPageResponse) { return; }

    if (!firstPageResponse.isSuccessful) { return; }

    if (!firstPageResponse.hasNextPage()) { return firstPageResponse.results; }

    if (firstPageResponse.isNumericPagination()) {
      return await SkiCanvasLmsApiCaller.#getRemainingPagesNumbers(firstPageResponse, resultPropertySelector);
    } else {
      return await SkiCanvasLmsApiCaller.#getRemainingPagesBookmarks(firstPageResponse, resultPropertySelector);
    }
  }

  static async #getRemainingPagesBookmarks(firstPageResponse, resultPropertySelector=null) {
    const paginatedResults = [];
    const firstPageResults = firstPageResponse.results;
    SkiCanvasLmsApiCaller.#addCurrentPageResultsToTotalResults(firstPageResults, paginatedResults);

    let currentPageResponse = firstPageResponse;
    while(currentPageResponse.hasNextPage()) {
      const nextPageUrl = currentPageResponse.links["next"];
      const nextPageResponse = await SkiCanvasLmsApiCaller.getRequest(nextPageUrl, {}, resultPropertySelector);
      const status = await SkiCanvasLmsApiCaller.#handlePageResponse(nextPageResponse, paginatedResults, resultPropertySelector, 1);
      if (status == SkiCanvasLmsApiResponse.FAILED_RETRY) {
        if (SKI_DEBUG_MODE) { console.log("Retry attempts failed. Stopping pagination."); }
        break;
      }

      currentPageResponse = nextPageResponse;
    }

    if (SKI_DEBUG_MODE) { console.log(paginatedResults); }
    return paginatedResults;
  }

  static async #getRemainingPagesNumbers(firstPageResponse, resultPropertySelector=null) {
    const MAX_BATCH_SIZE = 20;

    const paginatedResults = [];
    const firstPageResults = firstPageResponse.results;
    SkiCanvasLmsApiCaller.#addCurrentPageResultsToTotalResults(firstPageResults, paginatedResults);

    let currentPageResponse = firstPageResponse;
    let nextPageNumber = 2;
    let nextPageUrl = new URL(currentPageResponse.links["next"]);
    let lastPageNumber = currentPageResponse.getLastPageNumber();
    let requests = [];
    while(lastPageNumber == SkiCanvasLmsApiResponse.UNKNOWN_LAST_PAGE_NUM || nextPageNumber <= lastPageNumber) {
      const requestUrl = new URL(nextPageUrl);
      requestUrl.searchParams.set("page", nextPageNumber);
      requests.push(SkiCanvasLmsApiCaller.getRequest(requestUrl, {}, resultPropertySelector));
      if (requests.length >= MAX_BATCH_SIZE) {
        await Promise.all(requests)
          .then(async (responses) => {
            for (const response of responses) {
              const pageNumber = await SkiCanvasLmsApiCaller.#handlePageResponse(response, paginatedResults, resultPropertySelector, 1);
              if (pageNumber == SkiCanvasLmsApiResponse.FAILED_RETRY) {
                if (SKI_DEBUG_MODE) { console.log(`Skipping request due to failed retries: ${response.url}`); }
              } else if (lastPageNumber == SkiCanvasLmsApiResponse.UNKNOWN_LAST_PAGE_NUM && pageNumber != SkiCanvasLmsApiResponse.UNKNOWN_LAST_PAGE_NUM) {
                lastPageNumber = pageNumber;
              }
            }
          });
        requests = [];
      }
      
      nextPageNumber++;
    }

    await Promise.all(requests)
      .then(async (responses) => {
        for (const response of responses) {
          const pageNumber = await SkiCanvasLmsApiCaller.#handlePageResponse(response, paginatedResults, resultPropertySelector, 1);
          if (pageNumber == SkiCanvasLmsApiResponse.FAILED_RETRY) {
            if (SKI_DEBUG_MODE) { console.log(`Skipping request due to failed retries: ${response.url}`); }
          } 
        }
      });

    if (SKI_DEBUG_MODE) { console.log(paginatedResults); }
    return paginatedResults;
  }

  static #addCurrentPageResultsToTotalResults(currentPageResults, totalPageResults) {
    if (Array.isArray(currentPageResults)) {
      totalPageResults.push(...currentPageResults);
    } else {
      totalPageResults.push(currentPageResults);
    }
  }

  static async #handlePageResponse(response, totalPageResults, resultPropertySelector=null, attempt=1) {
    if (response.isSuccessful) {
      const pageResults = response.results;
      SkiCanvasLmsApiCaller.#addCurrentPageResultsToTotalResults(pageResults, totalPageResults);
      
      if (response.hasLastPage()) {
        const lastPageNumber = response.getLastPageNumber();
        if (SKI_DEBUG_MODE) { console.log(`Last Page Number found: ${lastPageNumber}`); }
        return lastPageNumber;
      } else {
        return SkiCanvasLmsApiResponse.UNKNOWN_LAST_PAGE_NUM;
      }
    } else if (response.statusCode == 403 && response.statusMessage?.toLowerCase().includes("rate limit exceeded")) {
      if (SKI_DEBUG_MODE) { console.log("Rate limit was exceeded."); }
      if (attempt < SKI_MAX_ATTEMPTS) {
        await SkiCanvasLmsApiCaller.#sleep(SKI_WAIT_TIME_PER_RETRY);
        if (SKI_DEBUG_MODE) { console.log("Retrying request"); }
        const retryResponse = await SkiCanvasLmsApiCaller.getRequest(response.url, {}, resultPropertySelector);
        attempt++;
        return await SkiCanvasLmsApiCaller.#handlePageResponse(retryResponse, totalPageResults, resultPropertySelector, attempt);
      } else {
        if (SKI_DEBUG_MODE) { console.log("Rate limit was exceeded. Retries failed."); }
        return SkiCanvasLmsApiResponse.FAILED_RETRY;
      }
    } else {
      return SkiCanvasLmsApiResponse.FAILED_RETRY;
    }
  }

  static async getRequestsInBulk(endpointUrl, substitutionValues, params={}, resultPropertySelector=null) {
    const MAX_BATCH_SIZE = 20;

    const bulkResults = []
    let requests = [];
    for (const currentValues of substitutionValues) {
      // Substitute values in URL
      let currentEndpointUrl = endpointUrl;
      for (const key in currentValues) {
        if (currentEndpointUrl.endsWith(`/:${key}`)) {
          currentEndpointUrl = currentEndpointUrl.replace(`/:${key}`, `/${currentValues[key]}`);
        } else if (currentEndpointUrl.includes(`/:${key}?`)) {
          currentEndpointUrl = currentEndpointUrl.replace(`/:${key}?`, `/${currentValues[key]}?`);
        } else if (currentEndpointUrl.includes(`/:${key}/`)) {
          currentEndpointUrl = currentEndpointUrl.replace(`/:${key}/`, `/${currentValues[key]}/`);
        }
      }
      
      // Substitute values in params
      let currentParams = JSON.parse(JSON.stringify(params));
      for (const key in currentValues) {
        if (currentParams.hasOwnProperty(key)) {
          if (currentParams[key] == "__sub__") {
            currentParams[key] = currentValues[key];
          }
        }
      }
      
      if (SKI_DEBUG_MODE) { console.log("Sending request as part of batch:"); console.log(currentEndpointUrl); console.log(currentParams); }
      requests.push(SkiCanvasLmsApiCaller.getRequestAllPages(currentEndpointUrl, currentParams, resultPropertySelector));
      if (requests.length >= MAX_BATCH_SIZE) {
        await Promise.all(requests)
          .then((responses) => {
            for (const response of responses) {
              if (Array.isArray(response)) {
                bulkResults.push(response);
              } else {
                if (SKI_DEBUG_MODE) { console.log("Response was not an array."); console.log(response); }
              }
            }
          })
        requests = [];
      }
    }
  }

  static async #nonGetRequest(endpointUrl, method, params, isJsonFormat=true) {
    const CSRFtoken = function () {
      return decodeURIComponent(
        (document.cookie.match("(^|;) *_csrf_token=([^;]*)") || "")[2]
      );
    };

    const VALID_METHODS = ["POST", "PUT", "DELETE"];
    const validatedMethod = method.toUpperCase();
    if (VALID_METHODS.includes(validatedMethod)) { 
      console.warn(`Invalid request method: ${method}`);
      return; 
    }

    const requestHeaders = {
      "X-CSRF-Token": CSRFtoken()
    }

    if (isJsonFormat) {
      headers["Content-Type"] = "application/json";
      headers["Accept"] = "application/json";
    }

    if (typeof endpointUrl === 'string' && !endpointUrl.startsWith("http")) {
      endpointUrl = `${SkiCanvasLmsApiCaller.BASE_URL}${endpointUrl}`;
    }
    
    const requestUrl = endpointUrl instanceof URL ? endpointUrl : new URL(endpointUrl);
    
    if (SKI_DEBUG_MODE) { console.log(requestUrl); }

    let requestResponse;
    return await fetch(requestUrl, {
      method: validatedMethod,
      headers: requestHeaders,
      body: JSON.stringify(params),
    })
      .then((response) => {
        requestResponse = response;
        if (response.ok) {
          return response.json();
        } else {
          throw(`Request failed: ${requestUrl} Status: ${response.statusTest} (${response.status})`);
        }
      })
      .then(data => {
        if (SKI_DEBUG_MODE) { console.log(data); }
        const responseResults = new SkiCanvasLmsApiResponse(requestResponse, data, resultPropertySelector);
        if (SKI_DEBUG_MODE) { console.log(responseResults); }
        return responseResults;
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }

  static async postRequest(url, params, isJsonFormat=true) {
    return await this.#nonGetRequest(url, "POST", params, isJsonFormat);
  }

  static async putRequest(url, params, isJsonFormat=true) {
    return await this.#nonGetRequest(url, "PUT", params, isJsonFormat);
  }

  static async deleteRequest(url, params, isJsonFormat=true) {
    return await this.#nonGetRequest(url, "DELETE", params, isJsonFormat);
  }
}


/* Canvas API Response */
class SkiCanvasLmsApiResponse {
  static UNKNOWN_NEXT_PAGE_NUM = 0;
  static UNKNOWN_LAST_PAGE_NUM = -1;
  static FAILED_RETRY = -999;

  constructor(response, responseJson, resultPropertySelector=null) {
    this.isSuccessful = response.ok;
    this.url = response.url;
    this.statusCode = response.status;
    this.statusMessage = SkiCanvasLmsApiResponse.#getStatusMessage(response, responseJson);
    this.requestCost = response.headers.get("X-Request-Cost");
    this.limitRemaining = response.headers.get("X-Rate-Limit-Remaining");
    this.links = SkiCanvasLmsApiResponse.#getRequestLinks(response);
    this.results = SkiCanvasLmsApiResponse.#getResponseResults(responseJson, resultPropertySelector);
  }

  static #getStatusMessage(response, responseJson) {
    if (response.ok) { return response.statusMessage; }
    
    const errorMessage = `${responseJson.status} (${responseJson.errors.map(error => error.message).join("; ")})`;
    console.error(errorMessage);
    return errorMessage;
  }

  static #getRequestLinks(response) {
    let links = response.headers.get("link");
    if (!links) { return {}; }
    links = links.replaceAll("<", "").replaceAll(">", "").replaceAll(" rel=", "").replaceAll('"', "");
    links = links.split(",");
    links = links.map(link => link.split(";"));
    const linkDictionary = {};
    links.forEach(link => linkDictionary[link[1]] = link[0]);
    return linkDictionary;
  }

  static #getResponseResults(responseJson, resultPropertySelector) {
    if (!resultPropertySelector) { return responseJson; }

    return responseJson[resultPropertySelector]
  }

  hasNextPage() {
    return "next" in this.links && this.links["next"] != this.links["current"];
  }

  hasLastPage() {
    return "last" in this.links;
  }

  isNumericPagination() {
    if (!this.hasNextPage() && !this.hasLastPage()) { return false; }

    const currentLink = new URL(this.links["current"]);
    const pageParam = currentLink.searchParams.get("page");
    return (/^\d+$/).test(pageParam);
  }

  getNextPageNumber() {
    if (!this.hasNextPage()) { return SkiCanvasLmsApiResponse.UNKNOWN_NEXT_PAGE_NUM; }
    if (!this.isNumericPagination()) { return SkiCanvasLmsApiResponse.UNKNOWN_NEXT_PAGE_NUM; }

    const nextLink = new URL(this.links["next"]);
    const pageParam = nextLink.searchParams.get("page");
    return Number.parseInt(pageParam) || SkiCanvasLmsApiResponse.UNKNOWN_NEXT_PAGE_NUM;
  }

  getLastPageNumber() {
    if (!this.hasLastPage()) { return SkiCanvasLmsApiResponse.UNKNOWN_LAST_PAGE_NUM; }
    if (!this.isNumericPagination()) { return SkiCanvasLmsApiResponse.UNKNOWN_LAST_PAGE_NUM; }

    const lastLink = new URL(this.links["last"]);
    const pageParam = lastLink.searchParams.get("page");
    return Number.parseInt(pageParam) || SkiCanvasLmsApiResponse.UNKNOWN_LAST_PAGE_NUM;
  }
}