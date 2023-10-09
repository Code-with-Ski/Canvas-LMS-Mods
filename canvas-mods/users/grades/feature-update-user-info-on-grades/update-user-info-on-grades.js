(() => {
  if (/^\/users\/[0-9]+\/grades/.test(window.location.pathname)) {
    chrome.storage.sync.get(
      {
        adminUsersGradesPersonalized: true,
      },
      function (items) {
        if (items.adminUsersGradesPersonalized) {
          updateDisplayedName();
        }
      }
    );
  }

  /*
    Updates the name in the breadcrumb and headings to reflect that
    of the user being viewed.
  */
  async function updateDisplayedName() {
    const userIdForGrades = window.location.pathname.split("/")[2];
    const breadcrumbNavUserNameLink = document.querySelector(
      "nav#breadcrumbs ul li:nth-of-type(2) a"
    );
    if (breadcrumbNavUserNameLink) {
      const currentUserId = breadcrumbNavUserNameLink.href.split("/").pop();
      if (userIdForGrades != currentUserId) {
        breadcrumbNavUserNameLink.href = breadcrumbNavUserNameLink.href.replace(
          `about/${currentUserId}`,
          `about/${userIdForGrades}`
        );
        const userForGrades = await getUser(userIdForGrades);
        if (userForGrades) {
          const userDisplayName = userForGrades.short_name;

          const breadcrumbNavUserNameSpan =
            breadcrumbNavUserNameLink.querySelector("span");
          if (breadcrumbNavUserNameSpan) {
            breadcrumbNavUserNameSpan.innerHTML = userDisplayName;
          }

          const headings = [...document.querySelectorAll("div#content h2")];
          for (let heading of headings) {
            if (heading.innerText.includes("I'm")) {
              heading.innerHTML = heading.innerText.replace(
                "I'm",
                `${userDisplayName} is`
              );
            }
          }

          const links = [...document.querySelectorAll("div#content table a")];
          for (let link of links) {
            if (link.href.includes(`/users/${currentUserId}`)) {
              link.href = link.href.replace(
                `/users/${currentUserId}`,
                `/users/${userIdForGrades}`
              );
            }
          }
        }
      }
    }
  }

  /*
    Returns the user with the given userId
  */
  async function getUser(userId) {
    let user = {};
    const baseUrl = `${window.location.protocol}//${window.location.hostname}`;
    const url = `${baseUrl}/api/v1/users/${userId}`;

    const fetches = [];
    fetches.push(
      fetch(url)
        .then((response) => response.json())
        .then((data) => {
          user = data;
        })
        .catch((error) => {
          console.error(`Error: ${error}`);
        })
    );

    await Promise.all(fetches);

    return user;
  }
})();
