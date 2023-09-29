(() => {
  chrome.storage.sync.get(
    {
      globalNavTestIndicator: true,
    },
    function (items) {
      if (items.globalNavTestIndicator) {
        setGlobalNavTestIndicator();
      }
    }
  );

  function setGlobalNavTestIndicator() {
    const body = document.body;
    if (body) {
      if (!body.classList.contains("ski-global-nav-test-indicator")) {
        body.classList.add("ski-global-nav-test-indicator");
      }
    }
  }
})();
