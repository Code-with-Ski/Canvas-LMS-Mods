"use strict";

(() => {
  if (
    /^\/(course|account)s\/([0-9]+)\/rubrics/.test(window.location.pathname) ||
    /^\/courses\/([0-9]+)\/assignments\/[0-9]+/.test(window.location.pathname)
  ) {
    chrome.storage.sync.get(
      {
        rubricsImport: true,
      },
      function (items) {
        if (items.rubricsImport) {
          const importDialog = addImportDialog();
          watchForEditRubricDialog(importDialog);
        }
      }
    );
  }

  function watchForEditRubricDialog(importDialog) {
    SkiMonitorChanges.watchForAddedNodesByParentId("content", (addedNode) => {
      if (
        addedNode.classList?.contains("rubric_container") &&
        addedNode.classList?.contains("editing")
      ) {
        addImportDialogButton(addedNode, importDialog);
      }
    });
  }

  function addImportDialogButton(editRubricDiv, dialog) {
    const existingButtonDiv = editRubricDiv.querySelector(
      ".ski-import-buttons-div"
    );
    if (existingButtonDiv) {
      return;
    }
    const importButtonDiv = document.createElement("div");
    importButtonDiv.style.textAlign = "right";
    importButtonDiv.classList.add("ski-import-buttons-div");

    const importButton = document.createElement("button");
    importButton.innerText = "Import Details";
    importButton.classList.add("Button", "Button--secondary");
    importButton.style.marginLeft = "0.5rem";
    importButton.addEventListener("click", () => {
      resetDialog(dialog);
      dialog.showModal();
    });

    const exportButton = document.createElement("button");
    exportButton.innerText = "Export Criteria for Import";
    exportButton.title =
      "Click to export criteria data in a tab separated format that matches import format.";
    exportButton.classList.add("Button");
    exportButton.addEventListener("click", downloadExistingCriteria);

    importButtonDiv.appendChild(exportButton);
    importButtonDiv.appendChild(importButton);
    editRubricDiv.insertAdjacentElement("afterbegin", importButtonDiv);

    const updateRubricButton =
      editRubricDiv.querySelector("button.save_button");
    updateRubricButton?.addEventListener("click", () => {
      editRubricDiv.removeChild(importButtonDiv);
    });
  }

  function addImportDialog() {
    const importDialog = document.createElement("dialog");
    importDialog.id = "ski-rubric-import-dialog";
    importDialog.classList.add("ski-dialog");
    importDialog.style.maxHeight = "70%";

    const headerDiv = document.createElement("div");
    headerDiv.classList.add("ski-dialog-header");

    const heading = document.createElement("h2");
    heading.innerText = "Import Rubric Details";

    const closeButton = document.createElement("button");
    closeButton.title = "Close dialog";
    closeButton.innerHTML = `<i class='icon-line icon-end'></i>`;
    closeButton.classList.add("Button", "Button--icon-action");
    closeButton.addEventListener("click", () => {
      importDialog.close();
    });

    headerDiv.appendChild(heading);
    headerDiv.appendChild(closeButton);

    const bodyDiv = document.createElement("div");
    bodyDiv.classList.add("ski-dialog-body");

    const rubricDetailsDiv = document.createElement("div");
    rubricDetailsDiv.classList.add("ic-Form-control");

    const rubricDetailsLabel = document.createElement("label");
    rubricDetailsLabel.classList.add("ic-Label");
    rubricDetailsLabel.innerHTML =
      "Paste rubric criteria details below. <em>Separate columns with a tab.</em>";
    rubricDetailsLabel.for = "ski-import-rubric-dialog-details";

    const rubricDetailsTextarea = document.createElement("textarea");
    rubricDetailsTextarea.required = true;
    rubricDetailsTextarea.placeholder = `Enter Rubric Criteria Details`;
    rubricDetailsTextarea.rows = "8";
    rubricDetailsTextarea.style.width = "600px";
    rubricDetailsTextarea.id = "ski-import-rubric-dialog-details";

    rubricDetailsDiv.appendChild(rubricDetailsLabel);
    rubricDetailsDiv.appendChild(rubricDetailsTextarea);

    const sampleFileButton = document.createElement("button");
    sampleFileButton.classList.add("Button");
    sampleFileButton.innerHTML = `<i class='icon-line icon-download'></i> Download Sample File`;
    sampleFileButton.addEventListener("click", downloadSampleFile);

    const sampleFileMessage = document.createElement("p");
    sampleFileMessage.innerHTML = `
      Click the Download button to download a sample set of import data in a tab separated value file format. <em>Recommend opening the file in a spreadsheet application after download.</em>`;

    const importMessage = document.createElement("p");
    importMessage.classList.add("ski-dialog-message");

    bodyDiv.appendChild(rubricDetailsDiv);
    bodyDiv.appendChild(sampleFileMessage);
    bodyDiv.appendChild(sampleFileButton);
    bodyDiv.appendChild(importMessage);

    const footerDiv = document.createElement("div");
    footerDiv.classList.add("ski-dialog-footer");

    const cancelButton = document.createElement("button");
    cancelButton.innerHTML = `<i class='icon-line icon-no'></i> Cancel`;
    cancelButton.classList.add("Button");
    cancelButton.addEventListener("click", () => {
      importDialog.close();
    });

    const importButton = document.createElement("button");
    importButton.innerHTML = `Import`;
    importButton.title =
      "Click to keep exisiting criteria in the rubric and import these new criteria";
    importButton.style.marginLeft = "0.5rem";
    importButton.classList.add("Button", "Button--primary");
    importButton.addEventListener("click", () => {
      handleImportClick(importDialog, false);
    });

    const importAndReplaceButton = document.createElement("button");
    importAndReplaceButton.innerHTML = `Import and Replace`;
    importAndReplaceButton.title =
      "Click to remove existing criteria and import these new criteria";
    importAndReplaceButton.style.marginLeft = "0.5rem";
    importAndReplaceButton.classList.add("Button", "Button--warning");
    importAndReplaceButton.addEventListener("click", () => {
      handleImportClick(importDialog, true);
    });

    const footerDivLeft = document.createElement("div");
    const footerDivRight = document.createElement("div");

    footerDivLeft.appendChild(cancelButton);
    footerDivRight.appendChild(importAndReplaceButton);
    footerDivRight.appendChild(importButton);

    footerDiv.appendChild(footerDivLeft);
    footerDiv.appendChild(footerDivRight);

    importDialog.appendChild(headerDiv);
    importDialog.appendChild(bodyDiv);
    importDialog.appendChild(footerDiv);

    const contentDiv = document.getElementById("content");
    contentDiv?.appendChild(importDialog);

    return importDialog;
  }

  function resetDialog(dialog) {
    const inputs = [...dialog.querySelectorAll("input, textarea")];
    for (const input of inputs) {
      input.value = "";
    }

    updateMessage("");
  }

  function updateMessage(messageText, isError = false) {
    const messageElem = document.querySelector(".ski-dialog-message");
    if (!messageElem) {
      return;
    }
    messageElem.innerText = messageText;

    if (isError) {
      messageElem.classList.add("text-error");
    } else {
      messageElem.classList.remove("text-error");
    }
  }

  async function handleImportClick(dialog, shouldRemoveExistingCriteria) {
    const [isValid, errors, details, outcomes] = await validateImportDetails();
    if (isValid) {
      if (shouldRemoveExistingCriteria) {
        removeExistingCriteria();
      }
      loadCriteria(details, outcomes);
      dialog.close();
    } else {
      updateMessage(`Error(s):\n${errors.join("\n")}`, true);
    }
  }

  async function validateImportDetails() {
    const errors = [];
    const details = [];
    const outcomes = {};

    const rubricDetailsTextarea = document.getElementById(
      "ski-import-rubric-dialog-details"
    );
    if (!rubricDetailsTextarea) {
      errors.push("Missing rubric details textarea");
    } else if (!rubricDetailsTextarea.value) {
      errors.push("Missing rubric criteria details");
    } else {
      const rubricDetails = getImportedCriteria();
      for (let i = 0; i < rubricDetails.length; i++) {
        const row = rubricDetails[i];
        const validatedRowData = [];
        for (let j = 0; j < row.length; j++) {
          const data = row[j].trim();
          if (j == 0) {
            if (Number.isInteger(Number.parseInt(data))) {
              const outcomeDetails = await getOutcome(data);
              if (!outcomeDetails) {
                errors.push(`ROW ${i + 1}: Outcome not found: ${data}`);
              } else {
                outcomes[data] = outcomeDetails;
                // Currently ignores any other data when a number is found first
                // If rubrics support overriding outcome details consider updating
                // import process and validation to allow for additional values
                validatedRowData.push(data);
              }
              break;
            } else if (row.length % 3 != 0) {
              errors.push(
                `ROW ${
                  i + 1
                }: Unexpected amount of data. Review for missing/extra data and that all columns are separated by a tab.`
              );
              break;
            } else if (data.length == 0) {
              errors.push(`ROW ${i + 1}: Missing criteria title`);
            } else {
              validatedRowData.push(data);
            }
          } else if (j == 2) {
            if (!["TRUE", "FALSE"].includes(data.toUpperCase())) {
              errors.push(
                `ROW ${i + 1}: Expected third column data to be true or false.`
              );
            } else {
              validatedRowData.push(data.toUpperCase() == "TRUE");
            }
          } else if (j % 3 == 0) {
            if (data.length == 0) {
              errors.push(`ROW ${i + 1}: Missing rating points`);
            } else {
              const parsedData = Number.parseFloat(data);
              if (Number.isNaN(parsedData)) {
                errors.push(`ROW ${i + 1}: Points must be numeric`);
              } else if (parsedData < 0) {
                errors.push(`ROW ${i + 1}: Points can't be less than 0`);
              } else if (
                j > 3 &&
                parsedData >=
                  (Number.isNaN(Number.parseFloat(row[j - 3].trim()))
                    ? Number.MAX_VALUE
                    : Number.parseFloat(row[j - 3].trim()))
              ) {
                errors.push(
                  `ROW ${
                    i + 1
                  }: Ratings must be in descending point order (${parsedData} > ${Number.parseFloat(
                    row[j - 3].trim()
                  )})`
                );
              } else {
                validatedRowData.push(data);
              }
            }
          } else if (j >= 4 && j % 3 == 1) {
            if (data.length == 0) {
              errors.push(`ROW ${i + 1}: Missing rating title/description`);
            } else {
              validatedRowData.push(data);
            }
          } else {
            validatedRowData.push(data);
          }
        }
        details.push(validatedRowData);
      }
    }

    return [errors.length == 0, errors, details, outcomes];
  }

  function removeExistingCriteria() {
    const newRubricDiv = document.getElementById("rubric_new");
    if (!newRubricDiv) {
      return;
    }

    const criterionRows = [
      ...newRubricDiv.querySelectorAll("table.rubric_table tbody tr.criterion"),
    ];
    for (const criteriaRow of criterionRows) {
      if (criteriaRow.id == "criterion_blank") {
        continue;
      }
      criteriaRow.parentElement.removeChild(criteriaRow);
    }
  }

  function getImportedCriteria() {
    const rubricDetailsTextarea = document.getElementById(
      "ski-import-rubric-dialog-details"
    );
    const value = rubricDetailsTextarea?.value;

    const data = [];
    if (value) {
      const rows = value.split("\n");
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i].trim();
        if (row) {
          const splitRow = row.split("\t");
          if (splitRow.length % 3 == 2) {
            splitRow.push("");
          }
          data.push(splitRow);
        }
      }
    }

    return data;
  }

  function loadCriteria(criteriaDetails, outcomes) {
    let num = 1;
    let totalPoints = 0;

    const existingRows = [
      ...document.querySelectorAll(
        ".rubric_container.editing table.rubric_table > tbody > tr.criterion:not(.blank)"
      ),
    ];
    for (const row of existingRows) {
      const pointsSpan = row.querySelector(".display_criterion_points");
      if (pointsSpan && !!pointsSpan.innerText?.trim()) {
        totalPoints += Number(pointsSpan.innerText?.trim() ?? "0");
      }
    }

    for (const criteriaRowDetails of criteriaDetails) {
      totalPoints += loadCriteriaRow(criteriaRowDetails, num, outcomes);
      num++;
    }

    const rubricTotalSpan = document.querySelector(
      ".rubric_container.editing span.rubric_total"
    );
    if (rubricTotalSpan) {
      rubricTotalSpan.innerText = ` ${totalPoints}`;
    }

    /*
    const editCriterionLink = document.querySelector(
      ".rubric_container.editing tr#criterion_1 .edit_criterion_link"
    );
    editCriterionLink?.click();
    const updateCriterionButton = document.querySelector(
      ".ui-dialog .ui-dialog-buttonset button:nth-of-type(2)"
    );
    if (
      updateCriterionButton &&
      updateCriterionButton.innerText == "Update Criterion"
    ) {
      updateCriterionButton.click();
    }
    */
  }

  function loadCriteriaRow(rowDetails, criteriaNum, outcomes) {
    if (rowDetails.length > 1) {
      return loadStandardCriteriaRow(rowDetails, criteriaNum);
    } else {
      return loadOutcomeCriteriaRow(rowDetails, criteriaNum, outcomes);
    }
  }

  function loadStandardCriteriaRow(rowDetails, criteriaNum) {
    const criterionRow = document.createElement("tr");
    criterionRow.id = `criterion_${criteriaNum}`;
    criterionRow.classList.add("criterion");

    const criterionDescriptionTd = document.createElement("td");
    criterionDescriptionTd.classList.add(
      "criterion_description",
      "hover-container",
      "pad-box-micro"
    );
    criterionDescriptionTd.innerHTML = `
      <div class="criterion_description_container">
        <div class="description_content">
          <span role="text">
            <span class="description description_title">${rowDetails[0]}</span>
            <div class="long_description small_description">${
              rowDetails[1]
            }</div>
          </span>
          <div class="hide_when_learning_outcome">
            <div class="criterion_use_range_div editing toggle_for_hide_points ">
              <label class="criterion_range_label" aria-label="Range">
                <input type="checkbox" class="criterion_use_range" ${
                  rowDetails[2] ? "checked" : ""
                }>
                <span aria-hidden="true">
                  Range
                </span>
              </label>
            </div>
          </div>
        </div>
        <div class="links editing">
          <a href="#" class="edit_criterion_link" role="button">
            <i class="icon-edit standalone-icon"></i>
            <span class="screenreader-only">Edit criterion description</span>
          </a>
          <a href="#" class="delete_criterion_link" role="button">
            <i class="icon-trash standalone-icon"></i>
            <span class="screenreader-only">Delete criterion row</span>
          </a>
        </div>
      </div>
    `;

    const criterionRatingTd = document.createElement("td");
    criterionRatingTd.style.padding = 0;
    criterionRatingTd.innerHTML = `
      <div class="ratings">
        ${generateRatingCellsHTML(rowDetails)}
      </div>
    `;

    const criterionPointsTd = document.createElement("td");
    criterionPointsTd.classList.add(
      "nobr",
      "points_form",
      "toggle_for_hide_points"
    );
    criterionPointsTd.innerHTML = `
      <div class="editing" style="white-space: normal">
        <span style="white-space: nowrap; font-size: 0.8em">
          <input disabled type="text" aria-label="Points" value="${rowDetails[3]}" class="criterion_points span1 no-margin-bottom">
            pts
        </span><br>
      </div>
    `;

    criterionRow.appendChild(criterionDescriptionTd);
    criterionRow.appendChild(criterionRatingTd);
    criterionRow.appendChild(criterionPointsTd);

    const tableBody = document.querySelector(
      ".rubric.editing table.rubric_table > tbody"
    );
    tableBody?.insertAdjacentElement("beforeend", criterionRow);

    const rangeCheckbox = criterionRow.querySelector(
      "input.criterion_use_range"
    );
    rangeCheckbox?.addEventListener("change", () => {
      const rangeRatingSpans = [
        ...criterionRow.querySelectorAll("td span.range_rating"),
      ];
      for (const span of rangeRatingSpans) {
        const parent = span.parentElement;
        const pointsSpan = parent?.querySelector(".points");
        const minPointsSpan = parent?.querySelector(".min_points");
        if (!pointsSpan || !minPointsSpan) {
          continue;
        }
        if (pointsSpan.innerText == minPointsSpan.innerText) {
          continue;
        }

        span.style.display = rangeCheckbox.checked ? "inline" : "none";
      }
    });

    return Number(rowDetails[3]);
  }

  function generateRatingCellsHTML(rowDetails) {
    const cells = [];
    for (let i = 3; i < rowDetails.length; i += 3) {
      if (i == 3) {
        cells.push(`
          <div class="rating edge_rating">
            <div class="container">
              <div class="rating-main">
                <span role="text" class="rating-content-wrapper">
                  <span class="nobr toggle_for_hide_points ">
                    <span class="points">${rowDetails[i]}</span>
                    <span class="range_rating" ${
                      rowDetails[2] ? "" : "style='display: none;'"
                    }>to &gt;
                      <span class="min_points">${rowDetails[i + 3]}</span>
                    </span> pts
                  </span>
                  <span class="description rating_description_value">${
                    rowDetails[i + 1]
                  }</span>
                  <span class="rating_long_description small_description">${
                    rowDetails[i + 2]
                  }</span>
                </span>
                <span class="rating_id" style="display: none;">blank</span>
                ${generateEditingLinksHTML()}          
              </div>
              ${generateAddRatingLinkHTML()}
            </div>
          </div>
        `);
      } else if (i == rowDetails.length - 3) {
        cells.push(`
          <div class="rating edge_rating infinitesimal">
            <div class="container">
              <div class="rating-main">
                <span role="text" class="rating-content-wrapper">
                  <span class="nobr toggle_for_hide_points ">
                    <span class="points">${rowDetails[i]}</span>
                    <span class="range_rating" ${
                      rowDetails[2] && rowDetails[i] != "0"
                        ? ""
                        : "style='display: none;'"
                    }>to &gt;
                      <span class="min_points">0</span>
                    </span> pts
                  </span>
                  <span class="description rating_description_value">${
                    rowDetails[i + 1]
                  }</span>
                  <span class="rating_long_description small_description">${
                    rowDetails[i + 2]
                  }</span>
                </span>
                <span class="rating_id" style="display: none;">blank</span>
                ${generateEditingLinksHTML()}
              </div>
            </div>
          </div>
        `);
      } else {
        cells.push(`
          <div class="rating">
            <div class="container">
              <div class="rating-main">
                <span role="text" class="rating-content-wrapper">
                  <span class="nobr toggle_for_hide_points ">
                    <span class="points">${rowDetails[i]}</span>
                    <span class="range_rating" ${
                      rowDetails[2] ? "" : "style='display: none;'"
                    }>to &gt;
                      <span class="min_points">${rowDetails[i + 3]}</span>
                    </span> pts
                  </span>
                  <span class="description rating_description_value">${
                    rowDetails[i + 1]
                  }</span>
                  <span class="rating_long_description small_description">${
                    rowDetails[i + 2]
                  }</span>
                </span>
                <span class="rating_id" style="display: none;">blank</span>
                ${generateEditingLinksHTML()}
              </div>
              ${generateAddRatingLinkHTML()}
            </div>
          </div>
        `);
      }
    }

    return cells.join("");
  }

  function generateEditingLinksHTML() {
    return `
      <div class="editing links">
        <a href="#" class="edit_rating_link" role="button" aria-label="Edit rating">
          <i class="icon-edit standalone-icon" aria-hidden="true"></i>
        </a>
        <a href="#" class="delete_rating_link" role="button" aria-label="Delete rating" aria-hidden="true">
          <i class="icon-trash standalone-icon"></i>
        </a>
      </div>
    `;
  }

  function generateAddRatingLinkHTML() {
    return `
      <div class="editing links add_rating_link">
        <a href="#" class="add_rating_link_after" aria-label="Add rating" role="button">
          <i class="icon-add icon-Solid"></i>
        </a>
      </div>
    `;
  }

  function loadOutcomeCriteriaRow(rowDetails, criteriaNum, outcomes) {
    const outcomeId = rowDetails[0];
    const outcomeDetails = outcomes[outcomeId];
    if (!outcomeDetails) {
      console.warn(`SKIP: Missing outcome details for outcome ID ${outcomeId}`);
      return;
    }

    // Outcome rows are currently created only based on the outcome details
    // If rubrics are found to support overriding these values, at least to
    // provide detailed rating descriptions, then considering updating to
    // allow for this.  Need to update validate function too if changing.

    const criterionRow = document.createElement("tr");
    criterionRow.id = `criterion_${criteriaNum}`;
    criterionRow.classList.add("criterion", "learning_outcome_criterion");

    const criterionDescriptionTd = document.createElement("td");
    criterionDescriptionTd.classList.add(
      "criterion_description",
      "hover-container",
      "pad-box-micro"
    );
    criterionDescriptionTd.innerHTML = `
      <div class="criterion_description_container">
        <div class="description_content">
          <span class="outcome_sr_content" aria-hidden="false">
            <i class="learning_outcome_flag icon-outcomes" aria-hidden="true"></i>
            <span class="screenreader-only">This criterion is linked to a Learning Outcome</span>
          </span> 
          <span role="text">
            <span class="description description_title">${outcomeDetails.title}</span>
            <span class="learning_outcome_id" style="display: none;">${outcomeId}</span>
            <span class="criterion_id" style="display: none;"></span>
            <div class="long_description small_description">${outcomeDetails.description}</div>
            <div role="text" class="threshold toggle_for_hide_points">
              threshold:
              <span class="mastery_points">${outcomeDetails.mastery_points}</span> pts
            </div>
          </span>   
          <div class="hide_when_learning_outcome hidden">
            <div class="criterion_use_range_div editing toggle_for_hide_points ">
              <label class="criterion_use_range_label" aria-label="Range">
                <input type="checkbox" class="criterion_use_range">
                <span aria-hidden="true"> Range </span>
              </label>
            </div>
          </div>
        </div>
        <div class="links editing">
          <a href="#" class="delete_criterion_link" role="button">
            <i class="icon-trash standalone-icon"></i>
            <span class="screenreader-only">Delete criterion row</span>
          </a>
        </div>
      </div>
    `;

    const criterionRatingTd = document.createElement("td");
    criterionRatingTd.style.padding = 0;
    criterionRatingTd.innerHTML = `
      <div class="ratings">
        ${generateOutcomeRatingCellsHTML(outcomeDetails)}
      </div>
    `;

    const criterionPointsTd = document.createElement("td");
    criterionPointsTd.classList.add(
      "nobr",
      "points_form",
      "toggle_for_hide_points"
    );
    criterionPointsTd.innerHTML = `
      <div class="displaying">
        <span style="white-space: nowrap;">
          <span class="criterion_rating_points_holder" style="display: none;">
            <span class="criterion_rating_points">&nbsp;</span> /
          </span>
          <span class="display_criterion_points">${outcomeDetails.points_possible}</span> pts<br>
        </span>
      </div>
    `;

    criterionRow.appendChild(criterionDescriptionTd);
    criterionRow.appendChild(criterionRatingTd);
    criterionRow.appendChild(criterionPointsTd);

    const tableBody = document.querySelector(
      ".rubric.editing table.rubric_table > tbody"
    );
    tableBody?.insertAdjacentElement("beforeend", criterionRow);

    return outcomeDetails.points_possible;
  }

  function generateOutcomeRatingCellsHTML(outcomeDetails) {
    const cells = [];
    const ratings = outcomeDetails.ratings;
    for (let i = 0; i < ratings.length; i++) {
      const rating = ratings[i];
      if (i == 0) {
        cells.push(`
          <div class="rating edge_rating">
            <div class="container">
              <div class="rating-main">
                <span role="text" class="rating-content-wrapper">
                  <span class="nobr toggle_for_hide_points ">
                    <span class="points">${rating.points}</span>
                  </span>
                  <span class="description rating_description_value">${rating.description}</span>
                  <span class="rating_long_description small_description"></span>
                </span>
                <span class="rating_id" style="display: none;">blank</span>
              </div>
            </div>
          </div>
        `);
      } else if (i == ratings.length - 1) {
        cells.push(`
          <div class="rating edge_rating infinitesimal">
            <div class="container">
              <div class="rating-main">
                <span role="text" class="rating-content-wrapper">
                  <span class="nobr toggle_for_hide_points ">
                    <span class="points">${rating.points}</span>
                  </span>
                  <span class="description rating_description_value">${rating.description}</span>
                  <span class="rating_long_description small_description"></span>
                </span>
                <span class="rating_id" style="display: none;">blank</span>
              </div>
            </div>
          </div>
        `);
      } else {
        cells.push(`
          <div class="rating">
            <div class="container">
              <div class="rating-main">
                <span role="text" class="rating-content-wrapper">
                  <span class="nobr toggle_for_hide_points ">
                    <span class="points">${rating.points}</span>
                  </span>
                  <span class="description rating_description_value">${rating.description}</span>
                  <span class="rating_long_description small_description"></span>
                </span>
                <span class="rating_id" style="display: none;">blank</span>
              </div>
            </div>
          </div>
        `);
      }
    }
    return cells.join("");
  }

  async function getOutcome(outcomeId) {
    return await SkiCanvasLmsApiCaller.getRequestAllPages(
      `/api/v1/outcomes/${outcomeId}`
    );
  }

  function downloadSampleFile() {
    // Construct tsv
    const sampleData = [
      "title_or_outcome_id\tdescription	use_range\trating_points_1\trating_title_1\trating_description_1\trating_points_2\trating_title_2\trating_description_2\trating_points_3\trating_title_3\trating_description_3\trating_points_4\trating_title_4\trating_description_4\t*DO NOT COPY THIS LINE FOR IMPORT* Note: Additional rating columns can be added if needed.",
      "Criteria 1\tOptional long description\tTRUE\t10\tExcellent\tOptional description\t8\tGood\t\t6\tSatisfactory\t\t0\tIncomplete",
      "1932391",
      "Criteria 3\t\tFALSE\t20\tExcellent\t\t16\tGood\t\t12\tSatisfactory\t\t0\tNone",
      "Criteria 4\t\tFALSE\t10\tComplete\t\t0\tIncomplete",
      "1134090",
    ];
    const dataString = sampleData.join("\n");

    // Download it
    const filename = `sample_import_rubric_details.tsv`;
    const link = document.createElement("a");
    link.style.display = "none";
    link.setAttribute("target", "_blank");
    link.setAttribute(
      "href",
      "data:text/tab-separated-values;charset=utf-8," +
        encodeURIComponent(dataString)
    );
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function downloadExistingCriteria() {
    // Construct tsv
    const data = [
      "title_or_outcome_id\tdescription	use_range\trating_points_1\trating_title_1\trating_description_1\trating_points_2\trating_title_2\trating_description_2\trating_points_3\trating_title_3\trating_description_3\trating_points_4\trating_title_4\trating_description_4\t*DO NOT COPY THIS LINE FOR IMPORT* Note: Additional rating columns can be added if needed.",
    ];

    const rubricTitle =
      document.getElementById("rubric-title")?.value || "untitled";
    const criteriaRows = [
      ...document.querySelectorAll(
        ".rubric_container.editing table.rubric_table tr.criterion:not(.blank)"
      ),
    ];
    for (const row of criteriaRows) {
      const rowData = [];
      if (row.classList.contains("learning_outcome_criterion")) {
        rowData.push(
          `${row
            .querySelector("td.criterion_description .learning_outcome_id")
            ?.innerText?.trim()}`
        );
      } else {
        rowData.push(
          `${row
            .querySelector(
              "td.criterion_description .description.description_title"
            )
            ?.innerText?.trim()}`
        );
        rowData.push(
          `${row
            .querySelector("td.criterion_description .long_description")
            ?.innerText?.trim()}`
        );
        rowData.push(
          `${
            row.querySelector(
              "td.criterion_description input.criterion_use_range"
            )?.checked
          }`
        );

        const ratingsData = [...row.querySelectorAll(".ratings > .rating")];
        for (const ratingCell of ratingsData) {
          rowData.push(
            `${ratingCell.querySelector(".points")?.innerText?.trim()}`
          );
          rowData.push(
            `${ratingCell
              .querySelector(".description.rating_description_value")
              ?.innerText?.trim()}`
          );
          rowData.push(
            `${ratingCell
              .querySelector(".rating_long_description")
              ?.innerText?.trim()}`
          );
        }
      }
      data.push(rowData.join("\t"));
    }

    const dataString = data.join("\n");

    // Download it
    const filename = `export_rubric_details_${rubricTitle}.tsv`;
    const link = document.createElement("a");
    link.style.display = "none";
    link.setAttribute("target", "_blank");
    link.setAttribute(
      "href",
      "data:text/tab-separated-values;charset=utf-8," +
        encodeURIComponent(dataString)
    );
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
})();
