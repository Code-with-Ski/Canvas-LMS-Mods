(() => {
  if (/^\/accounts\/[0-9]+\/sis_import\??[^\/]*\/?$/.test(window.location.pathname)) {
    chrome.storage.sync.get({
      adminSisImportLog: true
    }, function (items) {
      if (items.adminSisImportLog) {
        addSisImportHistoryLog();
      }
    });
  }


  /*
    This will add the components for the SIS Import
    Log and add the event listeners to the
    buttons to be able to load past SIS Import details
  */
  function addSisImportHistoryLog() {
    const contentDiv = document.getElementById("content");
    if (contentDiv) {
      const sisImportHistoryLogHTML = `
      <div id='ski-sis-import-log'>
        <h2>SIS Import Log</h2>
        
        <fieldset id='ski-workflow-states' class='ic-Fieldset ic-Fieldset--radio-checkbox'>
          <legend class='ic-Legend'>Completed Workflow States</legend>
          <div class="ic-Checkbox-group ic-Checkbox-group--inline">
            <div class='ic-Form-control ic-Form-control--checkbox'>
              <input type="checkbox" id='ski-workflow-states-imported' value="imported" checked>
              <label class='ic-Label' for='ski-workflow-states-imported'>imported</label>
            </div>
            <div class='ic-Form-control ic-Form-control--checkbox'>
              <input type="checkbox" id='ski-workflow-states-imported_with_messages' value="imported_with_messages" checked>
              <label class='ic-Label' for='ski-workflow-states-imported_with_messages'>imported_with_messages</label>
            </div>
            <div class='ic-Form-control ic-Form-control--checkbox'>
              <input type="checkbox" id='ski-workflow-states-failed_with_messages' value="failed_with_messages" checked>
              <label class='ic-Label' for='ski-workflow-states-failed_with_messages'>failed_with_messages</label>
            </div>
            <div class='ic-Form-control ic-Form-control--checkbox'>
              <input type="checkbox" id='ski-workflow-states-failed' value="failed" checked>
              <label class='ic-Label' for='ski-workflow-states-failed'>failed</label>
            </div>
            <div class='ic-Form-control ic-Form-control--checkbox'>
              <input type="checkbox" id='ski-workflow-states-aborted' value="aborted" checked>
              <label class='ic-Label' for='ski-workflow-states-aborted'>aborted</label>
            </div>
            <div class='ic-Form-control ic-Form-control--checkbox'>
              <input type="checkbox" id='ski-workflow-states-restored' value="restored" checked>
              <label class='ic-Label' for='ski-workflow-states-restored'>restored</label>
            </div>
            <div class='ic-Form-control ic-Form-control--checkbox'>
              <input type="checkbox" id='ski-workflow-states-partially_restored' value="partially_restored" checked>
              <label class='ic-Label' for='ski-workflow-states-partially_restored'>partially_restored</label>
            </div>
          </div>
          <br/>

          <legend class='ic-Legend'>Processing Workflow States</legend>
          <div class="ic-Checkbox-group ic-Checkbox-group--inline">
            <div class='ic-Form-control ic-Form-control--checkbox'>
              <input type="checkbox" id='ski-workflow-states-created' value="created" checked>
              <label class='ic-Label' for='ski-workflow-states-created'>created</label>
            </div>
            <div class='ic-Form-control ic-Form-control--checkbox'>
              <input type="checkbox" id='ski-workflow-states-initializing' value="initializing" checked>
              <label class='ic-Label' for='ski-workflow-states-initializing'>initializing*</label>
            </div>
            <div class='ic-Form-control ic-Form-control--checkbox'>
              <input type="checkbox" id='ski-workflow-states-importing' value="importing" checked>
              <label class='ic-Label' for='ski-workflow-states-importing'>importing**</label>
            </div>
            <div class='ic-Form-control ic-Form-control--checkbox'>
              <input type="checkbox" id='ski-workflow-states-cleanup_batch' value="cleanup_batch" checked>
              <label class='ic-Label' for='ski-workflow-states-cleanup_batch'>cleanup_batch</label>
            </div>
            <div class='ic-Form-control ic-Form-control--checkbox'>
              <input type="checkbox" id='ski-workflow-states-restoring' value="restoring" checked>
              <label class='ic-Label' for='ski-workflow-states-restoring'>restoring</label>
            </div>
          </div>
        </fieldset>
        <div class='content-box-mini'>
          <button id="ski-sis-import-log-select-all" class='Button'>Select All Workflow States</button>
          <button id="ski-sis-import-log-clear-all" class='Button'>Clear All Workflow States</button>
        </div>

        <div class='content-box-mini'>
          <div class="grid-row">
            <div class='col-xs-12 col-sm-6 col-lg-4'>
              <label class='ic-Label' for='ski-input-created-since'>Created Since: </label>
              <input id='ski-input-created-since' type='datetime-local' pattern='[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}'>
            </div>
            <div class='col-xs-12 col-sm-6 col-lg-4'>
              <label class='ic-Label' for='ski-input-created-before'>Created Before: </label>
              <input id='ski-input-created-before' type='datetime-local' pattern='[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}'>
            </div>
          </div>
        </div>
        
        <p><em>*An import that is stuck on intializing may need to be aborted</em></p>
        <p><em>**An import that is importing for a long time unexpectedly should be reviewed for unexpected changes.  May need to abort and restore.</em></p>

        <div class='content-box-mini'>
          <button id="ski-sis-import-log-update" class='Button Button--primary'>Update Log</button>
        </div>
        
        <div id="ski-sis-import-log-results-wrapper" style="height: 600px; overflow: auto; resize: vertical;">
          <table id="ski-sis-import-log-results" class='table table-hover' style="height: 700px;">
            <thead>
              <tr>
                <th style="position: sticky; top: 0; background: #e4e9ed; z-index:99;">ID</th>
                <th style="position: sticky; top: 0; background: #e4e9ed; z-index:99;">Date/Time</th>
                <th style="position: sticky; top: 0; background: #e4e9ed; z-index:99;">Progress</th>
                <th style="position: sticky; top: 0; background: #e4e9ed; z-index:99;">Workflow State</th>
                <th style="position: sticky; top: 0; background: #e4e9ed; z-index:99;">Summary</th>
              </tr>
            </thead>
            <tbody style='max-height: 400px; overflow-y: scroll;'>
            </tbody>
          </table>
          <div class='ski-loading-icon' title="More results loading" style="display: none;">
          </div>
        </div>

        <div class='content-box-mini'>
          <button id='ski-sis-import-log-next' class='Button Button--secondary' style="display: none;" disabled>Next</button>
        </div>
      </div>`;
      contentDiv.insertAdjacentHTML("beforeend", sisImportHistoryLogHTML);

      // Add event listeners
      const selectAllButton = document.getElementById("ski-sis-import-log-select-all");
      selectAllButton.addEventListener("click", () => selectAllWorkflowStates(true));

      const clearAllButton = document.getElementById("ski-sis-import-log-clear-all");
      clearAllButton.addEventListener("click", () => selectAllWorkflowStates(false));

      const updateLogButton = document.getElementById("ski-sis-import-log-update");
      updateLogButton.addEventListener("click", async () => {
        showLoading(true);
        await updateLogTable(null);
        showLoading(false);
      });

      showLoading(true);
      updateLogTable(null);
      showLoading(false);

      const sisImportLogResultsWrapper = document.getElementById("ski-sis-import-log-results-wrapper");
      sisImportLogResultsWrapper.addEventListener("scroll", async () => {
        if (Math.ceil(sisImportLogResultsWrapper.scrollTop + sisImportLogResultsWrapper.clientHeight) >= sisImportLogResultsWrapper.scrollHeight) {
          const nextLogButton = document.getElementById("ski-sis-import-log-next");
          if (!nextLogButton.disabled) {
            nextLogButton.disabled = true;
            showLoading(true);
            await updateLogTable(nextLogButton.dataset.url);
            showLoading(false);
          }
        }
      });
    }
  }

  function showLoading(isLoading) {
    const loadingIcon = document.querySelector("#ski-sis-import-log div.ski-loading-icon");
    if (loadingIcon) {
      if (isLoading) {
        loadingIcon.style.display = "block";
      } else {
        loadingIcon.style.display = "none";
      }
    }
  }


  /*
    This takes in a boolean representing if all workflow state options should 
    be checked or unchecked.
  
    It gets all workflow state checkbox inputs and sets it to the given value.
  */
  function selectAllWorkflowStates(isChecked) {
    const workflowStateCheckboxes = [...document.querySelectorAll("div#ski-sis-import-log input[id^='ski-workflow-states-']")];
    workflowStateCheckboxes.forEach(checkbox => {
      checkbox.checked = isChecked;
    });
  }


  /*
    This will update the results based on the given url.
  
    If the url is null, it will get the first page of results
    based on the currently selected workflow states.
  */
  async function updateLogTable(url) {
    const sisImportLogWrapper = document.getElementById("ski-sis-import-log-results-wrapper");

    const sisImportLogBody = document.querySelector("table#ski-sis-import-log-results tbody");
    const nextButton = document.getElementById("ski-sis-import-log-next");

    if (!url) {
      sisImportLogWrapper.scrollTop = 0;

      sisImportLogBody.innerHTML = "";
      const workflowStateCheckboxes = [...document.querySelectorAll("div#ski-sis-import-log input[id^='ski-workflow-states-']")];
      const checkedWorkflowStates = workflowStateCheckboxes.filter(input => input.checked);
      if (checkedWorkflowStates.length == 0) {
        nextButton.dataset.url = "";
        nextButton.disabled = true;

        return;
      }

      const PER_PAGE = 10;
      const baseUrl = `${window.location.protocol}//${window.location.hostname}`;
      url = `${baseUrl}/api/v1/accounts/self/sis_imports?per_page=${PER_PAGE}`;
      checkedWorkflowStates.forEach(state => {
        url += `&workflow_state[]=${state.value}`;
      });

      const createdSinceInput = document.getElementById("ski-input-created-since");
      if (createdSinceInput) {
        const createdSinceValue = createdSinceInput.value;
        if (createdSinceValue) {
          if (/^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}$/.test(createdSinceValue)) {
            url += `&created_since=${createdSinceValue}`;
          } else {
            alert("Invalid format for created since date. Clearing input...");
            createdSinceInput.value = '';
          }
        }
      }

      const createdBeforeInput = document.getElementById("ski-input-created-before");
      if (createdBeforeInput) {
        const createdBeforeValue = createdBeforeInput.value;
        if (createdBeforeValue) {
          if (/^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}$/.test(createdBeforeValue)) {
            url += `&created_before=${createdBeforeValue}`;
          } else {
            alert("Invalid format for created before date. Clearing input...");
            createdBeforeInput.value = '';
          }
        }
      }
    }

    let fetches = [];
    fetches.push(
      fetch(url)
        .then(response => {
          let links = response.headers.get("link");
          links = links.replaceAll("<", "").replaceAll(">", "").replaceAll(" rel=", "").replaceAll('"', "");
          links = links.split(",");
          links = links.map(link => link.split(";"));
          const linkDictionary = {};
          links.forEach(link => linkDictionary[link[1]] = link[0]);

          const nextUrl = linkDictionary["next"];
          if (nextUrl) {
            nextButton.dataset.url = nextUrl;
            nextButton.disabled = false;
          } else {
            nextButton.disabled = true;
            nextButton.dataset.url = "";
          }
          return response.json();
        })
        .then(data => {
          data['sis_imports'].forEach(sisImport => {
            sisImportLogBody.insertAdjacentElement("beforeend", createSisImportLogResultsRow(sisImport));
            
            const logCountsButton = document.getElementById(`ski-sis-import-log-counts-btn-${sisImport["id"]}`);
            if (logCountsButton) {
              logCountsButton.addEventListener("click", () => updateRowDetails(sisImport["id"]));
            }
          });
        })
        .catch((error) => {
          console.error(`Error: ${error}`);
        })
      );

    await Promise.all(fetches);
  }


  /*
    This will create an a table row element based
    on the given SIS Import JSON response.
  
    It returns the table row element that is created.
  */
  function createSisImportLogResultsRow(sisImportJSON) {
    const newRow = document.createElement("tr");

    const idTd = document.createElement("td");
    const sisImportId = sisImportJSON['id']
    idTd.innerHTML = `<a href='/accounts/self/sis_imports/${sisImportId}' target='_blank'>${sisImportId}</a>`;

    const dateTimeTd = document.createElement("td");
    const createdAtDate = new Date(sisImportJSON['created_at']);
    const startedAt = sisImportJSON['started_at'];
    const startedAtDate = startedAt ? new Date(startedAt) : "N/A";
    const updatedAt = sisImportJSON['updated_at'];
    const updatedAtDate = startedAt ? new Date(updatedAt) : "N/A";
    const endedAt = sisImportJSON['ended_at'];
    const endedAtDate = endedAt ? new Date(endedAt) : "N/A";
    const skipDeletes = sisImportJSON['skip_deletes'];
    const changeThreshold = sisImportJSON['change_threshold'];
    const overrideSisStickiness = sisImportJSON['override_sis_stickiness'];
    const updateSisIdIfLoginClaimed = sisImportJSON['update_sis_id_if_login_claimed'];
    const batchMode = sisImportJSON['batch_mode'];
    const batchModeTermId = sisImportJSON['batch_mode_term_id'];

    const workflowState = sisImportJSON['workflow_state'];
    let totalTime = 0;
    if (endedAtDate != "N/A") {
      totalTime = endedAtDate - createdAtDate;
    } else if (workflowState == "failed") {
      totalTime = updatedAtDate - createdAtDate;
    } else if (workflowState == "aborted") {
      totalTime = 0;
    } else {
      totalTime = Date.now() - createdAtDate;
    }

    dateTimeTd.innerHTML = `<strong>Running Time:</strong> ${convertMillisecondsToString(totalTime)}<br>
    <br>Created at: ${createdAtDate.toLocaleString().replaceAll(" ", "&nbsp;")}
    <br>Started at: ${startedAtDate.toLocaleString().replaceAll(" ", "&nbsp;")}
    <br>Updated at: ${updatedAtDate.toLocaleString().replaceAll(" ", "&nbsp;")}
    <br>Ended at: ${endedAtDate.toLocaleString().replaceAll(" ", "&nbsp;")}`;

    const progressTd = document.createElement("td");
    progressTd.innerHTML = `${sisImportJSON['progress']}%`;

    const workflowStateTd = document.createElement("td");
    workflowStateTd.innerHTML = `${workflowState}`;

    const summaryTd = document.createElement("td");
    const user = sisImportJSON["user"];
    const diffingDataSetId = sisImportJSON['diffing_data_set_identifier'];
    const importData = sisImportJSON['data'];
    const totalChanges = 'statistics' in importData ? importData['statistics']["total_state_changes"] : 0;
    const suppliedBatches = 'supplied_batches' in importData ? importData['supplied_batches'].join(", ") : "Unavailable";
    summaryTd.innerHTML = `<strong>Total State Changes:</strong> ${totalChanges}`;
    if (totalChanges > 0) {
      summaryTd.innerHTML += `<span style='display: none;' id='ski-sis-import-log-details-${sisImportId}'>
      <br>${getListOfCounts(sisImportJSON['data']['statistics'])}
      </span>`;
      summaryTd.innerHTML += `<br /><button class='Button Button--secondary' id='ski-sis-import-log-counts-btn-${sisImportId}'>Show Count Details</button>`;
      
    }

    summaryTd.innerHTML += `<br><br>User: <a href='/accounts/self/users/${user["id"]}' target='_blank'>${user["name"]} (ID: ${user["id"]})</a>
    <br>Diffing Data Set ID: ${diffingDataSetId}
    <br>Supplied Batches: ${suppliedBatches}
    <br>Skip Deletes: ${skipDeletes}
    <br>Change Threshold: ${changeThreshold}
    <br>Override SIS Stickiness: ${overrideSisStickiness}
    <br>Update SIS ID if Login Claims: ${updateSisIdIfLoginClaimed}`;

    if (batchMode != null) {
      summaryTd.innerHTML += `<br>Batch Mode Term ID: ${batchMode}
      <br>Batch Mode Term Id: ${batchModeTermId}`
    }

    if (workflowState == "failed") {
      const errorMessage = (new DOMParser).parseFromString(importData["error_message"], 'text/html').body.textContent;
      summaryTd.innerHTML += `<br><br><span class='text-error'><strong>Error Message:</strong></span><ul><li>${errorMessage}</li></ul>`;
    } else if (workflowState == "imported_with_messages") {
      const processingWarnings = sisImportJSON["processing_warnings"];
      summaryTd.innerHTML += `<br><br><span class='text-warning'><strong>Warning Message(s):</strong></span><ul>`;
      processingWarnings.forEach(warning => {
        summaryTd.innerHTML += `<li>${warning[1]}`;
        const fileName = warning[0];
        if (fileName != null) {
          summaryTd.innerHTML += ` for file ${warning[0]}</li>`;
        }
        summaryTd.innerHTML += '</li>';
      });
      summaryTd.innerHTML += '</ul>'
    } else if (workflowState == "failed_with_messages") {
      const processingErrors = sisImportJSON["processing_errors"];
      summaryTd.innerHTML += `<br><br><span class='text-error'><strong>Error Message(s):</strong></span><ul>`;
      processingErrors.forEach(error => {
        summaryTd.innerHTML += `<li>${error[1]}`;
        const fileName = error[0];
        if (fileName != null) {
          summaryTd.innerHTML += `from file ${error[0]}</li>`;
        }
        summaryTd.innerHTML += '</li>';
      });
      summaryTd.innerHTML += '</ul>'
    }

    summaryTd.innerHTML += "<br>";

    newRow.appendChild(idTd);
    newRow.appendChild(dateTimeTd);
    newRow.appendChild(progressTd);
    newRow.appendChild(workflowStateTd);
    newRow.appendChild(summaryTd);
    return newRow;
  }

  /*
    Takes in the statistics from an import JSON response
    and returns an HTML list string representation of the 
    statistics
  */
  function getListOfCounts(importStatistics) {
    htmlList = "<ul>";
    for(const category in importStatistics) {
      let hasNonZero = false;
      let categoryHTML = "";
      if (category != "total_state_changes") {
        categoryHTML += `<li>${category}<ul>`;
        for (const changeType in importStatistics[category]) {
          let numOfChanges = importStatistics[category][changeType];
          if (numOfChanges > 0) {
            hasNonZero = true;
          } 
          categoryHTML += `<li>${changeType}: ${numOfChanges}</li>`
        };
        categoryHTML += "</ul></li>";
        
        if (hasNonZero) {
          htmlList += categoryHTML;
        }
      }
    };
    htmlList += "</ul>";
    return htmlList;
  }

  /*
    Takes in an SIS Import ID of the row in the SIS Import log
    to update.
  
    If the additional details are currently hidden, then it will reveal
    them.  However, if they are currently shown, it will hide them.
  
    It also updates the text of the button for handling the details.
  */
  function updateRowDetails(sisImportId) {
    const rowDetails = document.getElementById(`ski-sis-import-log-details-${sisImportId}`);
    const detailsBtn = document.getElementById(`ski-sis-import-log-counts-btn-${sisImportId}`);
    if (rowDetails.style.display === "none") {
      rowDetails.style.display = "inline";
      detailsBtn.innerText = "Hide Count Details";
    } else {
      rowDetails.style.display = "none";
      detailsBtn.innerText = "Show Count Details";
    }
  }

  /*
    Convert given time in milliseconds to string representation
  */
  function convertMillisecondsToString(time) {
    const days = Math.floor(time / 1000 / 60 / 60 / 24);
    const hours = Math.floor(time / 1000 / 60 / 60) % 24;
    const minutes = Math.floor(time / 1000 / 60) % 60;
    const seconds = (time / 1000 % 60).toFixed(2);

    if (days > 0) {
      return `${days} days: ${hours} hours: ${minutes} minutes: ${seconds} seconds`;
    } else if (hours > 0) {
      return `${hours} hours: ${minutes} minutes: ${seconds} seconds`;
    } else if (minutes > 0) {
      return `${minutes} minutes: ${seconds} seconds`;
    } else {
      return `${seconds} seconds`;
    }
  }

})();