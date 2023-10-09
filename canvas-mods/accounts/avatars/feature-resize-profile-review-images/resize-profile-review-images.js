(() => {
  if (/^\/accounts\/[0-9]+\/avatars/.test(window.location.pathname)) {
    chrome.storage.sync.get({
      adminProfilePicturesResizable: true,
      adminProfilePicturesDefaultHeight: "200",
      adminProfilePicturesSquare: true
    }, function (items) {
      // Make avatar resizable and rounded square shape to reveal more of the image
      adjustProfileAvatarImages(items.adminProfilePicturesResizable, items.adminProfilePicturesDefaultHeight, items.adminProfilePicturesSquare);
    });
  }

  /*
    This takes in values to determine how the profile pictures should be adjusted.
  
    If isResizable, it will make each image resizable.  It sets the height and width
    to the defaultSize.  If isRoundedSquare, it changes the border-radius so it looks
    like a rounded square.
  
    It gets all profile images on the page and adjusts their settings accordingly.
  */
  function adjustProfileAvatarImages(isResizable, defaultSize, isRoundedSquare) {
    const profileImages = [...document.querySelectorAll("span.avatar")];

    profileImages.forEach(image => {
      image.style.minWidth = "60px";
      image.style.minHeight = "60px";

      image.style.width = `${defaultSize}px`;
      image.style.height = `${defaultSize}px`;

      if (isResizable) {
        image.style.resize = "both";
      }

      if (isRoundedSquare) {
        image.style.borderRadius = "20px";
      }
    });
  }
})();