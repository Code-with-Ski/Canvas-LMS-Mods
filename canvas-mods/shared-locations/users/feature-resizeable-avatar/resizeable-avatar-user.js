(() => {
  if (
    /^\/accounts\/[0-9]+\/users\/[0-9]+/.test(window.location.pathname) ||
    /^\/accounts\/self\/users\/[0-9]+/.test(window.location.pathname) ||
    /^\/users\/[0-9]+/.test(window.location.pathname) ||
    /^\/users\/self/.test(window.location.pathname)
  ) {
    chrome.storage.sync.get(
      {
        adminUsersAvatarResizable: true,
      },
      function (items) {
        // Make avatar clickable to resize if available
        const avatarImgWrapper = document.querySelector("span.avatar_image");
        if (items.adminUsersAvatarResizable && avatarImgWrapper) {
          makeAvatarImageResizable(avatarImgWrapper);
        }
      }
    );
  }

  /*
    This modifies the avatar img and its container so that it is manually resizable
    and allows you to enlarge and shrink the image to defined sizes by clicking on it.
  */
  function makeAvatarImageResizable(avatarImgWrapper) {
    avatarImgWrapper.style.display = "inline-block";
    avatarImgWrapper.style.resize = "both";
    avatarImgWrapper.style.overflow = "auto";
    avatarImgWrapper.style.minWidth = "60px";
    avatarImgWrapper.style.minHeight = "60px";
    avatarImgWrapper.style.width = "60px";
    avatarImgWrapper.style.height = "60px";

    const imgSpan = avatarImgWrapper.querySelector("span.avatar");
    imgSpan.style.width = "90%";
    imgSpan.style.height = "90%";

    imgSpan.addEventListener("click", () => {
      if (parseInt(avatarImgWrapper.style.width) < 100) {
        avatarImgWrapper.style.width = "180px";
        avatarImgWrapper.style.height = "180px";
      } else {
        avatarImgWrapper.style.width = "60px";
        avatarImgWrapper.style.height = "60px";
      }
    });
  }
})();
