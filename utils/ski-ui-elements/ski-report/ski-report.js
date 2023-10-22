class SkiReport {
  #name;
  #reportContainer;

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
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("ski-ui-loading-message-wrapper");

    return messageDiv;
  }

  updateLoadingMessage(messageType, newMessage = "") {
    const messageWrapper = this.#reportContainer.querySelector(
      ".ski-ui-loading-message-wrapper"
    );
    if (messageType == "clear") {
      messageWrapper.innerHTML = "";
    } else if (messageType == "success") {
      messageWrapper.innerHTML = `
        <p class='text-success'><i class='icon-line icon-check'></i> ${newMessage}</p>
      `;
    } else if (messageType == "error") {
      messageWrapper.innerHTML = `
        ${messageWrapper.innerHTML}
        <p class='text-error'><i class='icon-line icon-warning'></i> ${newMessage}</p>
      `;
    } else {
      messageWrapper.innerHTML = `
        <p class='text-info'><i class='icon-line icon-info'></i> ${newMessage}</p>
      `;
    }
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
}
