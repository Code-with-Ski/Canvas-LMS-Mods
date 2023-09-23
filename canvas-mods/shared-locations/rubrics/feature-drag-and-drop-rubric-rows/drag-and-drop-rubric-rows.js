"use strict";

(() => {
  let dragSourceElement = null;
  let dragCounter = 0;
  
  if (
    /^\/(course|account)s\/([0-9]+)\/rubrics/.test(window.location.pathname)
  ) {
    watchForEditableRubricRows();
  }

  function watchForEditableRubricRows() {
    const contentDiv = document.getElementById("content");
    if (!contentDiv) {
      return;
    }

    const config = { childList: true, subtree: true};
    const contentObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        const addedNodes = [...mutation.addedNodes];
        for (const addedNode of addedNodes) {
          if (addedNode.classList?.contains("rubric_container") && addedNode.classList?.contains("editing")) {
            makeTableRowsDraggable();
          } else if (addedNode.nodeName == "TR") {
            if (addedNode.parentNode.parentNode.parentNode.classList?.contains("editing")) {
              makeTableRowDraggable(addedNode);
            }
          }
        }
      }
    });

    contentObserver.observe(contentDiv, config);
  }

  function makeTableRowsDraggable() {
    const editableRows = [...document.querySelectorAll(".rubric_container.editing table.rubric_table > tbody > tr.criterion:not(.blank)")];
    for (const row of editableRows) {
      makeTableRowDraggable(row);
    }
  }

  function makeTableRowDraggable(tr) {
    tr.draggable = true;
    tr.addEventListener("dragstart", handleDragStart);
    tr.addEventListener("dragend", handleDragEnd);
    tr.addEventListener("dragenter", handleDragEnter);
    tr.addEventListener("dragleave", handleDragLeave);
    tr.addEventListener("dragover", handleDragOver);
    tr.addEventListener("drop", handleDrop);
  }

  function handleDragStart(e) {
    this.style.opacity = '0.4';

    dragSourceElement = this;
  }

  function handleDragEnd(e) {
    this.style.opacity = '1';

    const items = [...document.querySelectorAll("tr[draggable=true]")];
    for (const item of items) {
      item.classList.remove("over");
    }
  }
  
  function handleDragEnter(e) {
    dragCounter++;
    this.classList.add("over");
  }

  function handleDragLeave(e) {
    dragCounter--;
    if (dragCounter <= 1) {
      this.classList.remove("over");
    }
  }

  function handleDragOver(e) {
    e.preventDefault();
    
    this.classList.add("over");
    
    return false;
  }

  function handleDrop(e) {
    e.stopPropagation();
    
    dragCounter = 0;
    if (dragSourceElement !== this) {
      const dragSourceElementTop = dragSourceElement.getBoundingClientRect().top;
      const thisTop = this.getBoundingClientRect().top;
      if (dragSourceElementTop < thisTop) {
        this.insertAdjacentElement("afterend", dragSourceElement);
      } else {
        this.insertAdjacentElement("beforebegin", dragSourceElement);
      }
    }

    return false;
  }
})();