(() => {
  if (
    /^\/courses\/[0-9]+\/modules\??[^\/]*\/?$/.test(window.location.pathname) ||
    /^\/courses\/[0-9]+\??[^\/]*\/?$/.test(window.location.pathname) // In case course home is set to modules
  ) {
    chrome.storage.sync.get(
      {
        courseModulesJumpToEnabled: true,
        courseGlobalStickyHeader: true,
      },
      function (items) {
        if (items.courseModulesJumpToEnabled) {
          SkiMonitorChanges.watchForElementById(
            "context_modules",
            addJumpToModuleSelection
          );
        }
      }
    );
  }

  /*
    Adds a select menu that allows the user to jump to a module and 
    back to top links before each module
  */
  function addJumpToModuleSelection(contextModulesDiv) {
    if (contextModulesDiv) {
      createJumpToModuleMenu(contextModulesDiv);
      
      const moduleDivs = [
        ...document.querySelectorAll("#context_modules div.context_module"),
      ];
      addModuleLinksToMenu(moduleDivs);

      SkiMonitorChanges.watchForChangeOfNodesByParentId("context_modules", 
        (addedNode) => {
          if (addedNode.classList?.contains("context_module")) {
            SkiMonitorChanges.watchForAttributeChangeOfElement(addedNode, 
              (element) => { addModuleLinkToMenu(element); },
              (element) => { return element.id != "context_module_new"; });
          }
        },
        (removedNode) => {
          if (removedNode.classList?.contains("context_module")) {
            moduleId = removedNode?.dataset?.moduleId;
            if (moduleId) {
              removeBackToTopContainer(moduleId);
              removeLinkItem(moduleId);
            }
          }
        }
      )
    }
  }

  function addBackToTopButton(moduleDiv) {
    const containerDiv = document.createElement("div");
    containerDiv.classList.add("ski-container-back-top-button");
    containerDiv.style.textAlign = "right";
    containerDiv.style.padding = "9px";
    containerDiv.style.marginTop = "-0.5rem";
    containerDiv.style.marginBottom = "-0.5rem";
    containerDiv.dataset.associatedModuleId = `${moduleDiv?.dataset?.moduleId}`;
    containerDiv.innerHTML = `<a class="Button" href="#"><i class="icon-line icon-arrow-up"></i> Back to Top</a>`;
    
    moduleDiv.insertAdjacentElement(
      "beforeEnd",
      containerDiv
    );
  }

  function createJumpToModuleMenu(contextModulesDiv) {
    let jumpToModuleSelectionHTML = `
      <details id='ski-jump-to-module-menu' class='ski-ui' style="margin: 9px;">
        <summary>Jump to Module</summary>
        <ul></ul>
      </details>`;
    
    contextModulesDiv.insertAdjacentHTML(
      "beforebegin",
      jumpToModuleSelectionHTML
    );
  }

  function addModuleLinksToMenu(moduleDivs) {
    for (let moduleDiv of moduleDivs) {
      addModuleLinkToMenu(moduleDiv);
    }
  }

  function addModuleLinkToMenu(moduleDiv) {
    const jumpToModuleMenu = document.getElementById("ski-jump-to-module-menu");
    if (!jumpToModuleMenu) { return; }

    const menuList = jumpToModuleMenu.querySelector("ul");
    const moduleId = moduleDiv.id.split("_").pop();
    if (menuList && moduleId) {
      const moduleHeader = document.getElementById(`${moduleId}`);
      if (moduleHeader) {
        const moduleNameSpan = document.querySelector(
          `#context_module_${moduleId} div.header span.name`
        );
        if (moduleNameSpan) {
          const moduleName = moduleNameSpan.innerText;
          if (moduleName) {
            addBackToTopButton(moduleDiv);

            const menuLinkItem = document.createElement("li");
            menuLinkItem.innerHTML = `<a href='#context_module_${moduleId}'>${moduleName}</a>`;
            menuList.insertAdjacentElement("beforeEnd", menuLinkItem);
          }
        }
      }
    }

    jumpToModuleMenu.style.display = "";
  }

  function removeBackToTopContainer(moduleId) {
    const backToTopContainer = document.querySelector(`#context_modules div[data-associated-module-id='${moduleId}']`);
    backToTopContainer?.parentElement?.removeChild(backToTopContainer);
  }
  
  function removeLinkItem(moduleId) {
    const link = document.querySelector(`#ski-jump-to-module-menu li > a[href='#context_module_${moduleId}']`);
    const linkItem = link?.parentElement;
    linkItem?.parentElement?.removeChild(linkItem);
  }
})();
