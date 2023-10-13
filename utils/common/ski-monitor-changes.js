"use strict";

class SkiMonitorChanges {
  static watchForElementByQuery(
    elementQuery,
    callbackFunction,
    config = { childList: true, subtree: true }
  ) {
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
      observer.observe(document.body, config);
    }
  }

  static watchForElementById(
    elementId,
    callbackFunction,
    config = { childList: true, subtree: true }
  ) {
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
      observer.observe(document.body, config);
    }
  }

  static watchForAttributeChangeOfElement(
    element,
    callbackFunction,
    conditionalFunctionToStopObserving = null
  ) {
    const observer = new MutationObserver((mutations) => {
      callbackFunction(element);

      if (
        conditionalFunctionToStopObserving &&
        conditionalFunctionToStopObserving(element)
      ) {
        observer.disconnect();
      }
    });
    observer.observe(element, { attributes: true });
  }

  static watchForAddedNodesByParentId(
    parentId,
    callbackFunction,
    config = { childList: true, subtree: true }
  ) {
    this.watchForElementById(parentId, (parentElement) => {
      this.watchForAddedNodesOfElement(parentElement, callbackFunction, config);
    });
  }

  static watchForAddedNodesOfElement(
    element,
    callbackFunction,
    config = { childList: true, subtree: true }
  ) {
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        const addedNodes = [...mutation.addedNodes];
        for (const addedNode of addedNodes) {
          callbackFunction(addedNode);
        }
      }
    });

    observer.observe(element, config);
  }

  static watchForAddedNodeOfElement(
    element,
    querySelectorToFind,
    callbackFunction,
    config = { childList: true, subtree: true }
  ) {
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        const addedNodes = [...mutation.addedNodes];
        for (const addedNode of addedNodes) {
          if (element.querySelector(querySelectorToFind)) {
            callbackFunction(addedNode);
            observer.disconnect();
            return;
          }
        }
      }
    });

    observer.observe(element, config);
  }

  static watchForRemovedNodesOfElement(
    element,
    callbackFunction,
    config = { childList: true, subtree: true }
  ) {
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        const removedNodes = [...mutation.removedNodes];
        for (const removedNode of removedNodes) {
          callbackFunction(removedNode);
        }
      }
    });

    observer.observe(element, config);
  }

  static watchForChangeOfNodesByParentId(
    parentId,
    addedNodeCallbackFunction,
    removedNodeCallbackFunction,
    config = { childList: true, subtree: true }
  ) {
    this.watchForElementById(parentId, (parentElement) => {
      const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          const addedNodes = [...mutation.addedNodes];
          for (const addedNode of addedNodes) {
            addedNodeCallbackFunction(addedNode);
          }

          const removedNodes = [...mutation.removedNodes];
          for (const removedNode of removedNodes) {
            removedNodeCallbackFunction(removedNode);
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

  static watchForElementChanges(
    element,
    callbackFunction,
    config = { childList: true, subtree: true }
  ) {
    const observer = new MutationObserver((mutations) => {
      callbackFunction(element);
    });
    observer.observe(element, config);
  }
}
