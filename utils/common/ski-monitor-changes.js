"use strict";

class SkiMonitorChanges {
  static watchForElementByQuery(elementQuery, callbackFunction) {
    const element = document.querySelector(elementQuery);
    if (element) {
      callbackFunction(element);
    } else {
      const observer = new MutationObserver(() => {
        const newElement = document.querySelector(elementQuery);
        if (newElement) {
          observer.disconnect();
          callbackFunction(newElement);
        }
      });
      observer.observe(document.body, { childList: true });
    }
  }
  
  static watchForElementById(elementId, callbackFunction) {
    const element = document.getElementById(elementId);
    if (element) {
      callbackFunction(element);
    } else {
      const observer = new MutationObserver(() => {
        const newElement = document.getElementById(elementId);
        if (newElement) {
          observer.disconnect();
          callbackFunction(newElement);
        }
      });
      observer.observe(document.body, { childList: true });
    }
  }

  static watchForAddedNodesByParentId(parentId, callbackFunction, config = { childList: true, subtree: true}) {
    this.watchForElementById(parentId, (parentElement) => {
      const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          const addedNodes = [...mutation.addedNodes];
          for (const addedNode of addedNodes) {
            callbackFunction(addedNode);
          }
        }
      });

      observer.observe(parentElement, config);
    });
  }

  static waitForDocumentReady(callbackFunction) {
    if (document.readyState == "complete") {
      callbackFunction();
    } else {
      window.addEventListener("load", callbackFunction);
    }
  }
}