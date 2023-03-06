(() => {
  chrome.storage.sync.get(
    {
      globalNavBetaIndicator: true,
    },
    function (items) {
      if (items.globalNavBetaIndicator) {
        setGlobalNavBetaIndicator();
      }
    }
  );

  function setGlobalNavBetaIndicator() {
    const body = document.body;
    if (body) {
      if (!body.classList.contains("ski-global-nav-beta-indicator")) {
        body.classList.add("ski-global-nav-beta-indicator");
      }
    }
  }
})();
