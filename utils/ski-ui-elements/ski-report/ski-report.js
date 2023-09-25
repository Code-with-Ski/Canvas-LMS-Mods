class SkiReport {
  #name
  #reportContainer

  constructor(reportName) {
    if (this.constructor === SkiReport) {
      throw new Error("SkiReport is an abstract class and cannot be instantiated");
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
    const div = document.createElement("div");
    div.classList.add("ski-report-form");

    const loadAllButton = document.createElement("button");
    loadAllButton.innerText = "Load All";
    loadAllButton.classList.add("btn", "btn-primary");
    loadAllButton.addEventListener("click", async () => {
      await this.loadResults(table);
    });

    div.appendChild(loadAllButton);

    this.#reportContainer.appendChild(div);
  }

  async loadData(table) {
    throw new Error("loadData is an abstract function and must be defined");
  }

  extractData(rawData) {
    throw new Error("extractData is an abstract function and must be defined");
  }

  disableInteractiveElements() {
    const elements = [...this.#reportContainer.querySelectorAll("button, input, select")];
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
    const loadingIndicator = this.#reportContainer.querySelector(".ski-loading-icon");
    if (!loadingIndicator) {
      return;
    }
    loadingIndicator.style.display = "";
  }

  disableLoading() {
    const loadingIndicator = this.#reportContainer.querySelector(".ski-loading-icon");
    if (!loadingIndicator) {
      return;
    }
    loadingIndicator.style.display = "none";
  }

  async loadResults(table) {
    window.requestAnimationFrame(async () => {
      const disabledElements = this.disableInteractiveElements();
      this.enableLoading();
      window.requestAnimationFrame(async () => {
        await this.loadData(table);
        this.disableLoading();
        this.enableInteractiveElements(disabledElements);
      });
    });
  }
}