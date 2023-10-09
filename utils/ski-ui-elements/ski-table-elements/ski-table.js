"use strict";

class SkiTable {
  #name;
  #hasHideableColumns = false;
  #hiddenColumnNums = new Set();
  #isPaginated = false;
  #htmlElements;
  static #MIN_ROWS_FOR_LOADING_INDICATOR = 1000;

  constructor(
    name,
    tableConfigs = { maxHeight: "800px" },
    headingConfigs,
    bodyData = []
  ) {
    this.#name = name.toLowerCase().replaceAll(" ", "-");
    this.#createTableSkeleton(tableConfigs, headingConfigs);
    this.setTableBody(bodyData);
  }

  getName() {
    return this.#name;
  }

  getHtml() {
    return this.#htmlElements;
  }

  #createTableSkeleton(tableConfigs, headingConfigs) {
    // Add container for table and related elements
    const tableContainer = document.createElement("div");

    // Add show/hide column options
    if (tableConfigs?.hideableColumns === true) {
      this.#hasHideableColumns = true;
      this.#addColumnsShowHideControls(tableContainer, headingConfigs);
    }

    // Add loading icon div
    const loadingDiv = document.createElement("div");
    loadingDiv.classList.add("ski-loading-icon");
    loadingDiv.title = "Loading...";
    loadingDiv.style.display = "none";
    tableContainer.appendChild(loadingDiv);

    // Add wrapper for table
    const tableWrapper = document.createElement("div");
    tableWrapper.classList.add("ski-table-wrapper");
    if (tableConfigs.hasOwnProperty("maxHeight")) {
      tableWrapper.style.maxHeight = tableConfigs.maxHeight;
    }

    // Add table starter
    const table = document.createElement("table");
    table.id = this.#name;
    table.classList.add("ski-table-hover-rows", "ski-table-striped-rows");
    if (tableConfigs?.showUnsorted === true) {
      table.classList.add("ski-show-unsorted");
    }

    // Add caption for screen-reader about sorting buttons
    const caption = document.createElement("caption");
    const captionSpan = document.createElement("span");
    captionSpan.classList.add("ski-ui-screenreader-only");
    captionSpan.innerText = "column headers with buttons are sortable";
    caption.appendChild(captionSpan);
    table.appendChild(caption);

    // Add thead and initial tbody to table wrapper
    this.#addThead(table, headingConfigs);
    table.appendChild(document.createElement("tbody"));
    tableWrapper.appendChild(table);
    tableContainer.appendChild(tableWrapper);

    // Add pagination controls
    if (tableConfigs?.pagination === true) {
      this.#isPaginated = true;
      this.#addPaginationControls(tableContainer);
    }

    // Add download button if applicable
    if (tableConfigs?.isDownloadable === true) {
      this.#addDownloadButton(tableContainer);
    }

    this.#htmlElements = tableContainer;
  }

  #addColumnsShowHideControls(tableContainer, headingConfigs) {
    const controlsFieldset = document.createElement("fieldset");
    controlsFieldset.classList.add("ski-ui", "ski-show-hide-columns-container");
    const legend = document.createElement("legend");
    legend.innerText = "Show/Hide Columns";

    for (let index = 0; index < headingConfigs.length; index++) {
      const heading = headingConfigs[index];
      this.#addColumnShowHideControl(controlsFieldset, heading, index);
    }

    controlsFieldset.appendChild(legend);

    tableContainer.appendChild(controlsFieldset);
  }

  #addColumnShowHideControl(controlsContainer, headingConfig, index) {
    const columnNum = index + 1;
    const input = document.createElement("input");
    input.type = "checkbox";
    input.id = `${this.#name}-show-hide-col-${columnNum}`;
    input.dataset.columnNum = columnNum;
    input.classList.add("ski-table-column-show-hide-btn");
    input.checked = !(headingConfig?.isHidden === true);
    if (input.checked == false) {
      this.#hiddenColumnNums.add(columnNum.toString());
    }
    if (
      !headingConfig.hasOwnProperty("isLocked") ||
      headingConfig.isLocked !== true
    ) {
      input.addEventListener("click", () => {
        const columnNum = input.dataset.columnNum;
        const tableCellsInColumn = document.querySelectorAll(`
          table#${this.#name} th:nth-child(${columnNum}), 
          table#${this.#name} td:nth-child(${columnNum})`);
        const isChecked = input.checked;
        for (const cell of tableCellsInColumn) {
          if (isChecked) {
            if (this.#hiddenColumnNums.has(columnNum)) {
              this.#hiddenColumnNums.delete(columnNum);
            }
            cell.style.display = "";
          } else {
            this.#hiddenColumnNums.add(columnNum);
            cell.style.display = "none";
          }
        }
      });
    } else {
      input.disabled = true;
    }

    const label = document.createElement("label");
    label.setAttribute("for", `${this.#name}-show-hide-col-${columnNum}`);
    label.innerText = headingConfig.name;

    const formControl = document.createElement("div");
    formControl.classList.add("ski-checkbox-inline");
    formControl.appendChild(input);
    formControl.appendChild(label);

    controlsContainer.appendChild(formControl);
  }

  #addPaginationControls(tableContainer) {
    const controlsFieldset = document.createElement("fieldset");
    controlsFieldset.classList.add("ski-ui");
    controlsFieldset.style.margin = "0 auto";
    controlsFieldset.style.marginTop = "1rem";
    controlsFieldset.style.textAlign = "center";
    const label = document.createElement("label");
    label.textContent = "Page #";
    const selectPage = document.createElement("select");
    selectPage.classList.add("ski-page-selector");
    selectPage.style.marginLeft = "0.5rem";
    selectPage.style.width = "auto";
    const pageOneOption = document.createElement("option");
    pageOneOption.value = 1;
    pageOneOption.textContent = "1";
    selectPage.appendChild(pageOneOption);
    selectPage.value = 1;

    label.appendChild(selectPage);

    const prevPageButton = document.createElement("button");
    prevPageButton.textContent = "< Previous";
    prevPageButton.classList.add("btn");
    prevPageButton.classList.add("ski-pagination-prev");
    prevPageButton.style.display = "inline-block";
    prevPageButton.style.marginLeft = "1rem";
    prevPageButton.style.marginRight = "1rem";
    prevPageButton.disabled = true;
    prevPageButton.addEventListener("click", () => {
      const selectedIndex = selectPage.selectedIndex;
      if (selectedIndex > 0) {
        selectPage.selectedIndex = selectedIndex - 1;
        this.#updatePaginationOptions();
      }
    });

    const nextPageButton = document.createElement("button");
    nextPageButton.textContent = "Next >";
    nextPageButton.classList.add("btn");
    nextPageButton.classList.add("ski-pagination-next");
    nextPageButton.style.display = "inline-block";
    nextPageButton.style.marginLeft = "1rem";
    nextPageButton.style.marginRight = "1rem";
    nextPageButton.disabled = true;
    nextPageButton.addEventListener("click", () => {
      const selectedIndex = selectPage.selectedIndex;
      const options = selectPage.options;
      if (selectedIndex < options.length - 1) {
        selectPage.selectedIndex = selectedIndex + 1;
        this.#updatePaginationOptions();
      }
    });

    controlsFieldset.appendChild(prevPageButton);
    controlsFieldset.appendChild(label);
    controlsFieldset.appendChild(nextPageButton);
    tableContainer.appendChild(controlsFieldset);

    const resultsPerPageDiv = document.createElement("div");
    const resultsPerPageLabel = document.createElement("label");
    resultsPerPageLabel.textContent = "Results Per Page:";
    const selectResultsPerPage = document.createElement("select");
    selectResultsPerPage.classList.add("ski-per-page-selector");
    selectResultsPerPage.style.marginLeft = "0.5rem";
    selectResultsPerPage.style.width = "auto";
    const perPageOptions = [Number.MAX_VALUE, 5, 10, 25, 50, 100];
    for (const perPageOption of perPageOptions) {
      const option = document.createElement("option");
      option.value = perPageOption;
      option.text =
        perPageOption == Number.MAX_VALUE ? "All" : perPageOption.toString();
      selectResultsPerPage.appendChild(option);
      if (perPageOption == 10) {
        selectResultsPerPage.value = perPageOption;
      }
    }

    selectPage.addEventListener("change", () => {
      this.#updatePaginationButtons(
        selectPage.selectedIndex,
        selectPage.options.length
      );
      this.#updateShownRows(selectPage.value, selectResultsPerPage.value);
    });

    selectResultsPerPage.addEventListener("change", () => {
      selectPage.selectedIndex = 0;
      this.#updatePaginationOptions();
      this.#updateShownRows(selectPage.value, selectResultsPerPage.value);
    });

    resultsPerPageLabel.appendChild(selectResultsPerPage);
    resultsPerPageDiv.appendChild(resultsPerPageLabel);
    tableContainer.appendChild(resultsPerPageDiv);
  }

  #updateShownRows(pageNum, numOfResults = 10) {
    pageNum = Number(pageNum);
    if (Number.isNaN(pageNum)) {
      return;
    }

    const tableRows = this.#htmlElements.querySelectorAll("table tbody tr");
    for (let index = 0; index < tableRows.length; index++) {
      const row = tableRows[index];
      if (
        numOfResults == Number.MAX_VALUE ||
        (index >= (pageNum - 1) * numOfResults &&
          index < pageNum * numOfResults)
      ) {
        row.style.display = "";
      } else {
        row.style.display = "none";
      }
    }
  }

  #updatePaginationButtons(selectedIndex, numOfOptions) {
    if (!this.#isPaginated) {
      return;
    }

    const prevButton = this.#htmlElements.querySelector(
      "button.ski-pagination-prev"
    );
    if (prevButton) {
      if (selectedIndex == 0) {
        prevButton.disabled = true;
      } else {
        prevButton.disabled = false;
      }
    }

    const nextButton = this.#htmlElements.querySelector(
      "button.ski-pagination-next"
    );
    if (nextButton) {
      if (selectedIndex == numOfOptions - 1) {
        nextButton.disabled = true;
      } else {
        nextButton.disabled = false;
      }
    }
  }

  #updatePaginationOptions() {
    if (!this.#isPaginated) {
      return;
    }
    const resultsPerPageSelector = this.#htmlElements.querySelector(
      "select.ski-per-page-selector"
    );
    let numOfResultsPerPage = 10;
    if (resultsPerPageSelector) {
      numOfResultsPerPage = resultsPerPageSelector.value;
    }
    const tableRows = this.#htmlElements.querySelectorAll("table tbody tr");
    const numOfPages =
      numOfResultsPerPage == Math.MAX_VALUE
        ? 1
        : Math.max(1, Math.ceil(tableRows.length / numOfResultsPerPage));

    const pageSelector = this.#htmlElements.querySelector(
      "select.ski-page-selector"
    );
    const pageSelectorOptions = [
      ...this.#htmlElements.querySelectorAll("select.ski-page-selector option"),
    ];
    if (pageSelectorOptions.length < numOfPages) {
      for (
        let pageNum = pageSelectorOptions.length + 1;
        pageNum <= numOfPages;
        pageNum++
      ) {
        const pageNumOption = document.createElement("option");
        pageNumOption.value = pageNum.toString();
        pageNumOption.text = pageNum.toString();
        pageSelector.appendChild(pageNumOption);
      }
    } else if (pageSelectorOptions.length > numOfPages) {
      for (
        let index = pageSelectorOptions.length - 1;
        index > numOfPages - 1;
        index--
      ) {
        const option = pageSelectorOptions[index];
        pageSelector.removeChild(option);
      }
    }
    this.#updatePaginationButtons(
      pageSelector.selectedIndex,
      pageSelector.options.length
    );
    this.#updateShownRows(pageSelector.value, numOfResultsPerPage);
  }

  #addDownloadButton(tableContainer) {
    const downloadBtn = document.createElement("button");
    downloadBtn.style.marginTop = "1rem";
    const spanIcon = document.createElement("i");
    spanIcon.classList.add("icon-download");
    const downloadText = document.createTextNode(" Download Table as CSV");
    downloadBtn.classList.add("btn");
    downloadBtn.addEventListener("click", () => {
      this.downloadTableCsv();
    });

    downloadBtn.appendChild(spanIcon);
    downloadBtn.appendChild(downloadText);
    tableContainer.appendChild(downloadBtn);
  }

  #addThead(table, headingConfigs) {
    const tableHeading = document.createElement("thead");
    const headingRow = document.createElement("tr");
    for (let index = 0; index < headingConfigs.length; index++) {
      const heading = headingConfigs[index];
      this.#addTh(headingRow, heading, index);
    }
    tableHeading.appendChild(headingRow);
    table.appendChild(tableHeading);
  }

  #addTh(row, headingData, index) {
    const tableHeading = document.createElement("th");
    const columnNum = index + 1;
    tableHeading.dataset.columnNum = columnNum;
    if (
      this.#hasHideableColumns &&
      this.#hiddenColumnNums.has(columnNum.toString())
    ) {
      tableHeading.style.display = "none";
    }
    const isSortable = headingData?.isSortable === true;
    if (isSortable) {
      const button = document.createElement("button");
      const textNode = document.createTextNode(headingData.name);
      const span = document.createElement("span");
      span.ariaHidden = true;
      button.addEventListener("click", () => {
        const tableHeadings = row.querySelectorAll("th");
        for (const currHeading of tableHeadings) {
          if (tableHeading != currHeading) {
            if (currHeading.hasAttribute("aria-sort")) {
              currHeading.removeAttribute("aria-sort");
            }
          }
        }

        if (
          tableHeading.hasAttribute("aria-sort") &&
          tableHeading.ariaSort == "ascending"
        ) {
          tableHeading.ariaSort = "descending";
          this.#sortTableRows(columnNum, false);
        } else {
          tableHeading.ariaSort = "ascending";
          this.#sortTableRows(columnNum, true);
        }
      });

      button.appendChild(textNode);
      button.appendChild(span);

      tableHeading.appendChild(button);
    } else {
      tableHeading.innerText = headingData.name;
    }

    row.appendChild(tableHeading);
  }

  appendColumnHeadings(headingConfigs) {
    const headingRow = this.#htmlElements.querySelector("thead tr");
    if (!headingRow) {
      return;
    }
    const existingHeadings = [...headingRow.querySelectorAll("th")];
    const numOfExistingHeadings = existingHeadings.length;

    const hideColumnsContainer = this.#htmlElements.querySelector(
      ".ski-show-hide-columns-container"
    );

    for (let index = 0; index < headingConfigs.length; index++) {
      const heading = headingConfigs[index];
      const doesHeadingExist = existingHeadings.some((existingHeading) => {
        return heading.name == existingHeading.innerText;
      });
      if (doesHeadingExist) {
        continue;
      }

      const newIndex = index + numOfExistingHeadings;
      if (this.#hasHideableColumns && hideColumnsContainer) {
        this.#addColumnShowHideControl(hideColumnsContainer, heading, newIndex);
      }
      this.#addTh(headingRow, heading, newIndex);
    }
  }

  setTableBody(bodyData) {
    const table = this.#htmlElements.querySelector(`table#${this.#name}`);
    if (!table) {
      return;
    }

    const newTableBody = document.createElement("tbody");
    const oldTableBody = table.querySelector("tbody");
    if (oldTableBody) {
      table.replaceChild(newTableBody, oldTableBody);
    } else {
      table.appendChild(newTableBody);
    }

    this.#clearEnabledSort();

    for (const rowData of bodyData) {
      this.#addBodyRow(newTableBody, rowData);
    }

    this.#updatePaginationOptions();
  }

  appendTableRows(dataToAdd) {
    const table = this.#htmlElements.querySelector(`table#${this.#name}`);
    if (!table) {
      return;
    }

    let tableBody = table.querySelector("tbody");
    if (!tableBody) {
      tableBody = document.createElement("tbody");
      table.appendChild(tableBody);
    }

    this.#clearEnabledSort();

    for (const rowData of dataToAdd) {
      this.#addBodyRow(tableBody, rowData);
    }

    this.#updatePaginationOptions();
  }

  #addBodyRow(tableBody, rowData) {
    const row = document.createElement("tr");
    for (let index = 0; index < rowData.length; index++) {
      const cellData = rowData[index];
      this.#addCell(row, cellData, index + 1);
    }

    tableBody.appendChild(row);
  }

  #addCell(row, cellData, columnNum) {
    const cell = document.createElement("td");
    const cellContent = cellData.content;
    if (
      typeof cellContent == "object" &&
      cellContent?.nodeType == Node.ELEMENT_NODE
    ) {
      cell.appendChild(cellContent);
    } else {
      cell.innerText = cellContent;
    }

    if (
      this.#hasHideableColumns &&
      this.#hiddenColumnNums.has(columnNum.toString())
    ) {
      cell.style.display = "none";
    }

    if (
      cellData.hasOwnProperty("sortValue") &&
      cellData.sortValue !== undefined
    ) {
      cell.dataset.sortValue = cellData.sortValue;
    }

    if (
      cellData.hasOwnProperty("primarySortType") &&
      cellData.primarySortType !== undefined
    ) {
      cell.dataset.primarySortType = cellData.primarySortType;
    }

    if (
      cellData.hasOwnProperty("downloadInfo") &&
      cellData.downloadInfo !== undefined
    ) {
      cell.dataset.downloadInfo = cellData.downloadInfo;
    }

    if (cellData.hasOwnProperty("styles")) {
      const styles = cellData.styles;
      if (styles && typeof styles == "object") {
        const styleKeys = Object.keys(styles);
        for (const property of styleKeys) {
          if (property == "display") {
            continue;
          }
          cell.style[property] = styles[property];
        }
      }
    }

    row.appendChild(cell);
  }

  #sortTableRows(columnNumber, isAscendingOrder) {
    const tableBody = this.#htmlElements.querySelector("tbody");
    const tableRows = [...tableBody.querySelectorAll("tr")];
    if (!tableRows || tableRows.length < 2) {
      return;
    }
    const numOfRows = tableRows.length;

    window.requestAnimationFrame(() => {
      const disabledElements = this.disableEnabledInteractiveElements();
      if (numOfRows >= SkiTable.#MIN_ROWS_FOR_LOADING_INDICATOR) {
        this.#updateLoading(true, "Loading: Sorting rows...", tableRows.length);
      }
      window.requestAnimationFrame(() => {
        tableRows.sort((aRow, bRow) => {
          const aCell = aRow.querySelector(`td:nth-of-type(${columnNumber})`);
          const bCell = bRow.querySelector(`td:nth-of-type(${columnNumber})`);
          const multiplier = isAscendingOrder ? 1 : -1;
          if (aCell && bCell) {
            const aCellSortValue = aCell.hasAttribute("data-sort-value")
              ? aCell.dataset.sortValue
              : aCell.innerText.toUpperCase().trim();
            const bCellSortValue = bCell.hasAttribute("data-sort-value")
              ? bCell.dataset.sortValue
              : bCell.innerText.toUpperCase().trim();

            const aCellPrimarySortType = aCell.hasAttribute(
              "data-primary-sort-type"
            )
              ? aCell.dataset.primarySortType
              : "string";
            const bCellPrimarySortType = bCell.hasAttribute(
              "data-primary-sort-type"
            )
              ? bCell.dataset.primarySortType
              : "string";

            if (
              aCellPrimarySortType == "dateISO" &&
              bCellPrimarySortType == "dateISO"
            ) {
              const aDate = new Date(aCellSortValue);
              const bDate = new Date(bCellSortValue);
              const isAaDate =
                !Number.isNaN(aDate.valueOf()) &&
                aDate.toISOString() === aCellSortValue;
              const isBaDate =
                !Number.isNaN(bDate.valueOf()) &&
                bDate.toISOString() === bCellSortValue;
              if (isAaDate || isBaDate) {
                if (isAaDate && isBaDate) {
                  return multiplier * (aDate.getTime() - bDate.getTime());
                } else if (isAaDate) {
                  return multiplier;
                } else {
                  return multiplier * -1;
                }
              } else {
                return (
                  multiplier *
                  aCell.innerText
                    .toUpperCase()
                    .trim()
                    .localeCompare(bCell.innerText.toUpperCase().trim())
                );
              }
            } else if (
              aCellPrimarySortType == "number" &&
              bCellPrimarySortType == "number"
            ) {
              const isAaNum = !Number.isNaN(Number.parseFloat(aCellSortValue));
              const isBaNum = !Number.isNaN(Number.parseFloat(bCellSortValue));
              if (isAaNum || isBaNum) {
                if (isAaNum && isBaNum) {
                  return (
                    multiplier *
                    (Number.parseFloat(aCellSortValue) -
                      Number.parseFloat(bCellSortValue))
                  );
                } else if (isAaNum) {
                  return multiplier;
                } else {
                  return multiplier * -1;
                }
              } else {
                return (
                  multiplier *
                  aCell.innerText
                    .toUpperCase()
                    .trim()
                    .localeCompare(bCell.innerText.toUpperCase().trim())
                );
              }
            } else {
              return (
                multiplier *
                aCell.innerText
                  .toUpperCase()
                  .trim()
                  .localeCompare(bCell.innerText.toUpperCase().trim())
              );
            }
          } else {
            return 0;
          }
        });

        for (let row of tableRows) {
          tableBody.insertBefore(row, null);
        }

        if (this.#isPaginated) {
          this.#updatePaginationOptions();
        }

        if (numOfRows >= SkiTable.#MIN_ROWS_FOR_LOADING_INDICATOR) {
          this.#updateLoading(false, "Loading...");
        }

        this.enableInteractiveElements(disabledElements);
      });
    });
  }

  #updateLoading(isShown, message = "Loading") {
    const table = this.#htmlElements.querySelector("table");
    const loadingIcon = this.#htmlElements.querySelector(
      "div.ski-loading-icon"
    );
    loadingIcon.title = message;

    if (isShown) {
      loadingIcon.style.display = "block";
      table.style.visibility = "none";
    } else {
      loadingIcon.style.display = "none";
      table.style.visibility = "visible";
    }
  }

  #clearEnabledSort() {
    const sortedColumns = this.#htmlElements.querySelectorAll(
      "table thead th[aria-sort]"
    );
    if (!sortedColumns) {
      return;
    }
    for (const column of sortedColumns) {
      column.removeAttribute("aria-sort");
    }
  }

  disableEnabledInteractiveElements() {
    const interactiveElements = [
      ...this.#htmlElements.querySelectorAll("button, input, select"),
    ];
    const enabledInteractiveElements = interactiveElements.filter((element) => {
      return element.disabled == false;
    });

    for (const element of enabledInteractiveElements) {
      element.disabled = true;
    }

    return enabledInteractiveElements;
  }

  enableInteractiveElements(elements) {
    for (const element of elements) {
      element.disabled = false;
    }
  }

  downloadTableCsv(
    fileName = `export_table_${this.#name}.csv`,
    includeHiddenData = true
  ) {
    const table = this.#htmlElements.querySelector("table");
    if (table) {
      const rows = table.querySelectorAll("tr");

      const csv = [];
      for (const row of rows) {
        const rowData = [];
        const cols = row.querySelectorAll("td, th");

        for (const cell of cols) {
          if (!includeHiddenData && cell.style.display == "none") {
            continue;
          }
          let data = "";
          if (cell.hasAttribute("data-download-info")) {
            data = cell.getAttribute("data-download-info");
          } else {
            data = cell.innerText.trim();
            if (cell.nodeName == "TH") {
              data = data.toLowerCase().replaceAll(" ", "_");
            }
          }

          data = data.replace(/(\r\n|\n|\r)/gm, ";");
          data = data.replace(/(\s\s)/gm, " ");
          data = data.replace(/(; )+/gm, ";");
          data = data.replace(/"/g, '""');

          // Push escaped string
          rowData.push(`"${data}"`);
        }
        csv.push(rowData.join(","));
      }
      const csvString = csv.join("\n");

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
  }
}
