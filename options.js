// Saves options to chrome.storage
function saveOptions() {
  // Admin - Courses settings
  const isBlueprintInputFillPrevent = document.getElementById("admin-courses-blueprint-input-prevent-fill").checked;
  const isCourseCodeEnabled = document.getElementById("admin-courses-course-code").checked;

  // Admin - Users settings
  const isCourseListResizable = document.getElementById("admin-users-enrollments-resizable").checked;
  let enrollmentCourseListDefaultSize = Number.parseInt(document.getElementById("admin-users-enrollments-default-height").value);
  if (Number.isNaN(enrollmentCourseListDefaultSize)) { enrollmentCourseListDefaultSize = 400; }
  const isSortCourseEnrollments = document.getElementById("admin-users-enrollments-sort").checked;
  const isAddCourseEnrollmentFilters = document.getElementById("admin-users-enrollments-filter").checked;
  const isShowCourseCodeInEnrollments = document.getElementById("admin-users-enrollments-course-code").checked;

  const isAccountListResizable = document.getElementById("admin-users-accounts-resizable").checked;
  let accountListDefaultSize = Number.parseInt(document.getElementById("admin-users-accounts-default-height").value);
  if (Number.isNaN(accountListDefaultSize)) { accountListDefaultSize = 400; }
  const isShowAdminRoles = document.getElementById("admin-users-accounts-roles").checked;

  const isGroupListResizable = document.getElementById("admin-users-groups-resizable").checked;
  let groupListDefaultSize = Number.parseInt(document.getElementById("admin-users-groups-default-height").value);
  if (Number.isNaN(groupListDefaultSize)) { groupListDefaultSize = 400; }

  const isAvatarImgResizable = document.getElementById("admin-users-avatar-resizable").checked;

  // Admin - Profile Pictures settings
  const isProfileAvatarImgResizable = document.getElementById("admin-profile-pictures-resizable").checked;
  const isRoundedSquare = document.getElementById("admin-profile-pictures-square").checked;
  let profileImageDefaultSize = Number.parseInt(document.getElementById("admin-profile-pictures-default-height").value);
  if (Number.isNaN(profileImageDefaultSize)) { profileImageDefaultSize = 200; }

  // Admin - Terms settings
  const isTermsSearchable = document.getElementById("admin-terms-search").checked;
  const isAddTermMoved = document.getElementById("admin-terms-move-add-term").checked;
  const isTermIdShown = document.getElementById("admin-terms-term-id").checked;

  // Admin - Rubrics settings
  const isRubricsSearchable = document.getElementById("admin-rubrics-search").checked;

  // Admin - Question Banks settings
  const isQuestionBanksSearchable = document.getElementById("admin-question-banks-search").checked;

  // Admin - Sub-Accounts settings
  const isCanvasAccountIdShown = document.getElementById("admin-sub-accounts-canvas-id").checked;
  const isSisAccountIdShown = document.getElementById("admin-sub-accounts-sis-id").checked;

  // Admin - SIS Import settings
  const isSisImportLogEnabled = document.getElementById("admin-sis-import-log").checked;

  chrome.storage.sync.set({
    adminCoursesBlueprintInputPreventFill: isBlueprintInputFillPrevent,
    adminCoursesCourseCode: isCourseCodeEnabled,
    adminUsersEnrollmentsResizable: isCourseListResizable,
    adminUsersEnrollmentsDefaultHeight: enrollmentCourseListDefaultSize,
    adminUsersEnrollmentsSort: isSortCourseEnrollments,
    adminUsersEnrollmentsFilter: isAddCourseEnrollmentFilters,
    adminUsersEnrollmentsCourseCode: isShowCourseCodeInEnrollments,
    adminUsersAccountsResizable: isAccountListResizable,
    adminUsersAccountsDefaultHeight: accountListDefaultSize,
    adminUsersAccountsRoles: isShowAdminRoles,
    adminUsersGroupsResizable: isGroupListResizable,
    adminUsersGroupsDefaultHeight: groupListDefaultSize,
    adminUsersAvatarResizable: isAvatarImgResizable,
    adminTermsSearch: isTermsSearchable,
    adminTermsMoveAddTerm: isAddTermMoved,
    adminTermsTermId: isTermIdShown,
    adminProfilePicturesResizable: isProfileAvatarImgResizable,
    adminProfilePicturesDefaultHeight: profileImageDefaultSize,
    adminProfilePicturesSquare: isRoundedSquare,
    adminRubricsSearch: isRubricsSearchable,
    adminQuestionBanksSearch: isQuestionBanksSearchable,
    adminSubAccountsCanvasId: isCanvasAccountIdShown,
    adminSubAccountsSisId: isSisAccountIdShown,
    adminSisImportLog: isSisImportLogEnabled
  }, function() {
    // Update status to let user know options were saved.
    const status = document.getElementById("status");
    status.textContent = "Options saved.";
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restoreOptions() {
  chrome.storage.sync.get({
    adminCoursesBlueprintInputPreventFill: true,
    adminCoursesCourseCode: true,
    adminUsersEnrollmentsResizable: true,
    adminUsersEnrollmentsDefaultHeight: 400,
    adminUsersEnrollmentsSort: true,
    adminUsersEnrollmentsFilter: true,
    adminUsersEnrollmentsCourseCode: true,
    adminUsersAccountsResizable: true,
    adminUsersAccountsDefaultHeight: 100,
    adminUsersAccountsRoles: true,
    adminUsersGroupsResizable: true,
    adminUsersGroupsDefaultHeight: 100,
    adminUsersAvatarResizable: true,
    adminTermsSearch: true,
    adminTermsMoveAddTerm: true,
    adminTermsTermId: true,
    adminProfilePicturesResizable: true,
    adminProfilePicturesDefaultHeight: "200px",
    adminProfilePicturesSquare: true,
    adminRubricsSearch: true,
    adminQuestionBanksSearch: true,
    adminSubAccountsCanvasId: true,
    adminSubAccountsSisId: true,
    adminSisImportLog: true
  }, function(items) {
    // Admin - Courses settings
    document.getElementById("admin-courses-blueprint-input-prevent-fill").checked = items.adminCoursesBlueprintInputPreventFill;
    document.getElementById("admin-courses-course-code").checked = items.adminCoursesCourseCode;

    // Admin - Users settings
    document.getElementById("admin-users-enrollments-resizable").checked = items.adminUsersEnrollmentsResizable;
    document.getElementById("admin-users-enrollments-default-height").value = items.adminUsersEnrollmentsDefaultHeight;
    document.getElementById("admin-users-enrollments-sort").checked = items.adminUsersEnrollmentsSort;
    document.getElementById("admin-users-enrollments-filter").checked = items.adminUsersEnrollmentsFilter;
    document.getElementById("admin-users-enrollments-course-code").checked = items.adminUsersEnrollmentsCourseCode;

    document.getElementById("admin-users-accounts-resizable").checked = items.adminUsersAccountsResizable;
    document.getElementById("admin-users-accounts-default-height").value = items.adminUsersAccountsDefaultHeight;
    document.getElementById("admin-users-accounts-roles").checked = items.adminUsersAccountsRoles;

    document.getElementById("admin-users-groups-resizable").checked = items.adminUsersGroupsResizable;
    document.getElementById("admin-users-groups-default-height").value = items.adminUsersGroupsDefaultHeight;

    document.getElementById("admin-users-avatar-resizable").checked = items.adminUsersAvatarResizable;

    // Admin - Profile Pictures
    document.getElementById("admin-profile-pictures-resizable").checked = items.adminProfilePicturesResizable;
    document.getElementById("admin-profile-pictures-default-height").checked = items.adminProfilePicturesDefaultHeight;
    document.getElementById("admin-profile-pictures-square").checked = items.adminProfilePicturesSquare;

    // Admin - Rubrics settings
    document.getElementById("admin-rubrics-search").checked = items.adminRubricsSearch;

    // Admin - Question Banks settings
    document.getElementById("admin-question-banks-search").checked = items.adminQuestionBanksSearch;

    // Admin - Sub-accounts settings
    document.getElementById("admin-sub-accounts-canvas-id").checked = items.adminSubAccountsCanvasId;
    document.getElementById("admin-sub-accounts-sis-id").checked = items.adminSubAccountsSisId;

    // Admin - Terms settings
    document.getElementById("admin-terms-search").checked = items.adminTermsSearch;
    document.getElementById("admin-terms-move-add-term").checked = items.adminTermsMoveAddTerm;
    document.getElementById("admin-terms-term-id").checked = items.adminTermsTermId;

    // Admin - SIS Imports settings
    document.getElementById("admin-sis-import-log").checked = items.adminSisImportLog;
  });
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click',
    saveOptions);