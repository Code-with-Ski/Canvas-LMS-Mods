"use strict";

let SKI_DEBUG_MODE = false;
chrome.storage.sync.get(
  {
    enableDetailedLogging: false,
  },
  function (items) {
    SKI_DEBUG_MODE = items.enableDetailedLogging;
  }
);
