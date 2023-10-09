(() => {
  chrome.storage.sync.get(
    {
      globalBodyFullWidth: true,
    },
    function (items) {
      if (items.globalBodyFullWidth) {
        setBodyToFullWidth();
      }
    }
  );

  /*
    Adds the full-width class to the document body
  */
  function setBodyToFullWidth() {
    const body = document.body;
    if (body) {
      if (!body.classList.contains("full-width")) {
        body.classList.add("full-width");
      }
    }
  }
})();
