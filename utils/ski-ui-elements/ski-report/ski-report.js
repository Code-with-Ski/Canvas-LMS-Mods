class SkiReport {
  #name;
  #reportContainer;
  static cache = new Map();
  static contextDetails = new Map();

  constructor(reportName) {
    if (this.constructor === SkiReport) {
      throw new Error(
        "SkiReport is an abstract class and cannot be instantiated"
      );
    }
    this.#name = reportName;
    this.createReport();
  }

  getName() {
    return this.#name;
  }

  getReportContainer() {
    return this.#reportContainer;
  }

  createReport() {
    const container = document.createElement("div");
    container.classList.add("ski-report-container");
    this.#reportContainer = container;

    const heading = document.createElement("h2");
    heading.innerText = this.#name;
    container.appendChild(heading);

    const table = this.createTable();

    this.addForm(table);
    container.appendChild(table.getHtml());
  }

  createTable() {
    throw new Error("createTable is an abstract function and must be defined");
  }

  addForm(table) {
    const form = this.createForm(table);
    this.#reportContainer.appendChild(form);
  }

  createForm(table) {
    const div = document.createElement("div");
    div.classList.add("ski-report-form");

    this.addFormElements(table, div);

    return div;
  }

  addFormElements(table, formContainer) {
    const loadAllButton = this.createLoadAllButton(table, formContainer);
    formContainer.appendChild(loadAllButton);

    const loadingMessageContainer = this.createLoadingMessageContainer();
    formContainer.appendChild(loadingMessageContainer);
  }

  createLoadAllButton(table, formContainer) {
    const loadAllButton = document.createElement("button");
    loadAllButton.innerText = "Load All";
    loadAllButton.classList.add("btn", "btn-primary");
    loadAllButton.addEventListener("click", async () => {
      await this.loadResults(table, formContainer);
    });

    return loadAllButton;
  }

  createLoadingMessageContainer() {
    const wrapper = document.createElement("div");
    wrapper.style.marginTop = "1rem";

    const headingWrapper = document.createElement("div");
    headingWrapper.style.display = "flex";
    headingWrapper.style.justifyContent = "space-between";

    const heading = document.createElement("h3");
    heading.innerText = "Loading Messages";

    const loadingMessageControlsWrapper = document.createElement("div");

    const clearButton = document.createElement("button");
    clearButton.innerText = "Clear Messages";
    clearButton.classList.add("btn");
    clearButton.addEventListener("click", () => {
      this.updateLoadingMessage("clear");
    });

    const downloadButton = document.createElement("button");
    downloadButton.innerHTML = `<i class='icon-line icon-download' title="Download loading messages"></i>`;
    downloadButton.classList.add("btn");
    downloadButton.style.marginLeft = "0.5rem";
    downloadButton.addEventListener("click", () => {
      this.downloadLoadingMessages();
    });

    const messageDiv = document.createElement("div");
    messageDiv.classList.add("ski-ui-loading-message-wrapper");

    loadingMessageControlsWrapper.append(clearButton);
    loadingMessageControlsWrapper.append(downloadButton);
    headingWrapper.append(heading);
    headingWrapper.append(loadingMessageControlsWrapper);
    wrapper.append(headingWrapper);
    wrapper.append(messageDiv);

    return wrapper;
  }

  updateLoadingMessage(messageType, newMessage = "", appendMessage = false) {
    const messageWrapper = this.#reportContainer.querySelector(
      ".ski-ui-loading-message-wrapper"
    );
    if (messageType == "clear") {
      messageWrapper.innerHTML = "";
    } else if (messageType == "success") {
      if (appendMessage) {
        messageWrapper.innerHTML += `
          <p class='text-success' data-type='${messageType}'><i class='icon-line icon-check'></i> ${newMessage}</p>
        `;
      } else {
        messageWrapper.innerHTML = `
          <p class='text-success' data-type='${messageType}'><i class='icon-line icon-check'></i> ${newMessage}</p>
        `;
      }
    } else if (messageType == "error") {
      messageWrapper.innerHTML = `
        ${messageWrapper.innerHTML}
        <p class='text-error' data-type='${messageType}'><i class='icon-line icon-warning'></i> ${newMessage}</p>
      `;
    } else {
      if (appendMessage) {
        messageWrapper.innerHTML += `
          <p class='text-info' data-type='${messageType}'><i class='icon-line icon-info'></i> ${newMessage}</p>
        `;
      } else {
        messageWrapper.innerHTML = `
          <p class='text-info' data-type='${messageType}'><i class='icon-line icon-info'></i> ${newMessage}</p>
        `;
      }
    }

    messageWrapper.scrollTop = messageWrapper.scrollHeight;
  }

  downloadLoadingMessages() {
    const fileName = `export-loading-${this.#name}.csv`;
    const data = [];
    const messages = [
      ...this.#reportContainer.querySelectorAll(
        ".ski-ui-loading-message-wrapper p"
      ),
    ];
    for (const message of messages) {
      const rowData = [];

      const messageType = message?.dataset?.type ?? "";
      rowData.push(`"${messageType}"`);

      let messageText = message.innerText?.trim();
      messageText = messageText.replace(/(\r\n|\n|\r)/gm, ";");
      messageText = messageText.replace(/(\s\s)/gm, " ");
      messageText = messageText.replace(/(; )+/gm, ";");
      messageText = messageText.replace(/"/g, '""');
      rowData.push(`"${messageText}"`);

      data.push(rowData.join(","));
    }

    const csvString = data.join("\n");

    // Download it
    const link = document.createElement("a");
    link.style.display = "none";
    link.setAttribute("target", "_blank");
    link.setAttribute(
      "href",
      "data:text/csv;charset=utf-8," + encodeURIComponent(csvString)
    );
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  async loadData(table, formContainer) {
    throw new Error("loadData is an abstract function and must be defined");
  }

  extractData(rawData) {
    throw new Error("extractData is an abstract function and must be defined");
  }

  disableInteractiveElements() {
    const elements = [
      ...this.#reportContainer.querySelectorAll("button, input, select"),
    ];
    const elementsToDisable = elements.filter((element) => {
      return element.disabled == false;
    });
    for (const element of elementsToDisable) {
      element.disabled = true;
    }
    return elementsToDisable;
  }

  enableInteractiveElements(elements) {
    for (const element of elements) {
      element.disabled = false;
    }
  }

  enableLoading() {
    const loadingIndicator =
      this.#reportContainer.querySelector(".ski-loading-icon");
    if (!loadingIndicator) {
      return;
    }
    loadingIndicator.style.display = "";
  }

  disableLoading() {
    const loadingIndicator =
      this.#reportContainer.querySelector(".ski-loading-icon");
    if (!loadingIndicator) {
      return;
    }
    loadingIndicator.style.display = "none";
  }

  async loadResults(table, formContainer) {
    window.requestAnimationFrame(async () => {
      const disabledElements = this.disableInteractiveElements();
      this.enableLoading();
      window.requestAnimationFrame(async () => {
        await this.loadData(table, formContainer);
        this.disableLoading();
        this.enableInteractiveElements(disabledElements);
      });
    });
  }

  static sanitizeText(unsanitizedText) {
    const sanitizedText = new DOMParser().parseFromString(
      unsanitizedText,
      "text/html"
    ).body.innerText;
    return sanitizedText;
  }

  static memoizeRequest(key, requestFunction) {
    if (SkiReport.cache.has(key)) {
      return SkiReport.cache.get(key);
    }

    SkiReport.cache.set(
      key,
      requestFunction().catch((error) => {
        SkiReport.cache.delete(key);
        return Promise.reject(error);
      })
    );

    return SkiReport.cache.get(key);
  }
}
