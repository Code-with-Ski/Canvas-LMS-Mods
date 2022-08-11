(() => {
  if (/^\/courses\/[0-9]+\/modules\??[^\/]*\/?$/.test(window.location.pathname)) {
    chrome.storage.sync.get(
      {
        courseModulesJumpToEnabled: true,
        courseGlobalStickyHeader: true,
      },
      function (items) {
        if (items.courseModulesJumpToEnabled) {
          addJumpToModuleSelection();

          if (items.courseGlobalStickyHeader) {
            addStickyScrollHandlerClassToLinks();
          }
        }
      }
    );
  }

  /*
    Adds a select menu that allows the user to jump to a module
  */
  function addJumpToModuleSelection() {
    const contextModulesDiv = document.getElementById("context_modules");
    if (contextModulesDiv) {
      const moduleDivs = [...document.querySelectorAll("#context_modules div.context_module")];
      const moduleOptions = [];
      for (let moduleDiv of moduleDivs) {
        const moduleId = moduleDiv.id.split("_").pop();
        if (moduleId) {
          const moduleHeader = document.getElementById(`${moduleId}`);
          if (moduleHeader) {
            const moduleNameSpan = document.querySelector(`#context_module_${moduleId} div.header span.name`);
            if (moduleNameSpan) {
              const moduleName = moduleNameSpan.innerText;
              if (moduleName) {
                moduleOptions.push({
                  "id": moduleId,
                  "name": moduleName
                });
              }
            }
          }
        }
      }

      let jumpToModuleSelectionHTML = `
      <details id='ski-jump-to-module-selection' class='ski-comp'>
        <summary>Jump to Module</summary>
        <ul>`
      for (let option of moduleOptions) {
        jumpToModuleSelectionHTML += `<li><a href='#module_${option.id}'>${option.name}</a></li>`;
      }
      jumpToModuleSelectionHTML += `</ul></details>`;

      contextModulesDiv.insertAdjacentHTML("beforebegin", jumpToModuleSelectionHTML);
    }
  }

  /*
    Adds a class for handling scrolling with the sticky header to
    each of the links
  */
  function addStickyScrollHandlerClassToLinks() {
    const links = document.querySelectorAll("div#context_modules > div > a");
    for (let link of links) {
      link.classList.add("ski-sticky-link-handler");
    }
  }
})();
