// Saves options to chrome.storage
function saveOptions() {
  // Global settings
  const isGlobalFullWidthEnabled = document.getElementById("global-body-full-width").checked;

  // Global Nav settings
  const isGlobalNavAdminQuickAccessEnabled = document.getElementById("admin-global-nav-quick-access-enabled").checked;
  const isGlobalNavTestIndicatorEnabled = document.getElementById("global-nav-test-server-indicator").checked;
  const isGlobalNavBetaIndicatorEnabled = document.getElementById("global-nav-beta-server-indicator").checked;

  // Account - Profile settings
  const isAccountProfileGradesButtonEnabled = document.getElementById("account-profile-grades-button").checked;

  // Dashboard settings
  const isDashboardAddAllCoursesButton = document.getElementById("dashboard-add-all-courses-button").checked;
  const isDashboardCourseGradesShown = document.getElementById("dashboard-show-course-grades").checked;

  // All Courses settings
  const areFiltersEnabled = document.getElementById("courses-filters").checked;
  const areSearchesEnabled = document.getElementById("courses-search-bars").checked;
  const areColumnSortsEnabled = document.getElementById("courses-column-sorts").checked;

  // Course - Global settings
  const isCourseGlobalStickyHeaderEnabled = document.getElementById("course-global-sticky-header").checked;

  // Course - Modules settings
  const isCourseModulesJumpToEnabled = document.getElementById("course-modules-jump-to").checked;

  // Course - People/Users settings
  const isCoursePeopleExportEnabled = document.getElementById("course-users-export").checked;
  const isCoursePeopleInactiveFilterEnabled = document.getElementById("course-users-inactive").checked;
  const isCoursePeopleSectionFilterEnabled = document.getElementById("course-users-section-filter").checked;
  const isCoursePeopleSortEnabled = document.getElementById("course-people-sort").checked;

  // Course - Groups settings
  const isGroupsExportButtonEnabled = document.getElementById("course-groups-export").checked;

  // Course - User Access Report settings
  const isCourseUserAccessReportButtonEnabled = document.getElementById("course-user-access-report-export").checked;

  // Course - SpeedGrader settings
  const isSpeedGraderCommentHyperlinksEnabled = document.getElementById("course-speedgrader-make-links-in-comments-clickable").checked;
  const isSpeedGraderDraftCommentIndicatorReplaced = document.getElementById("course-speedgrader-draft-comment-indicator").checked;

  // Course - Statistics settings
  const isStatisticsCourseReportsEnabled = document.getElementById("course-statistics-course-reports").checked;

  // Course - Assignments settings
  const isAssignmentGradesExportButtonEnabled = document.getElementById("course-assignments-assignment-export-grades").checked;

  // Admin - Courses settings
  const isBlueprintInputFillPrevent = document.getElementById("admin-courses-blueprint-input-prevent-fill").checked;
  const isCourseCodeEnabled = document.getElementById("admin-courses-course-code").checked;
  const isCourseConcludedIconEnabled = document.getElementById("admin-courses-concluded-icon").checked;
  const isAdminCoursesSubaccountLinkEnabled = document.getElementById("admin-courses-subaccount-link").checked;
  const isPeopleLinkEnabled = document.getElementById("admin-courses-people-link").checked;
  const isAdminCoursesViewGradesButtonEnabled = document.getElementById("admin-courses-view-grades-button").checked;
  const isAdditionalSearchEnabled = document.getElementById("admin-courses-additional-search-inputs").checked;

  // Admin - Users settings
  const isCourseListResizable = document.getElementById("admin-users-enrollments-resizable").checked;
  let enrollmentCourseListDefaultSize = Number.parseInt(document.getElementById("admin-users-enrollments-default-height").value);
  if (Number.isNaN(enrollmentCourseListDefaultSize)) { enrollmentCourseListDefaultSize = 400; }
  const isSortCourseEnrollments = document.getElementById("admin-users-enrollments-sort").checked;
  const isAddCourseEnrollmentFilters = document.getElementById("admin-users-enrollments-filter").checked;
  const isShowCourseCodeInEnrollments = document.getElementById("admin-users-enrollments-course-code").checked;
  const isShowCanvasIdInEnrollments = document.getElementById("admin-users-enrollments-canvas-id").checked;

  const isAccountListResizable = document.getElementById("admin-users-accounts-resizable").checked;
  let accountListDefaultSize = Number.parseInt(document.getElementById("admin-users-accounts-default-height").value);
  if (Number.isNaN(accountListDefaultSize)) { accountListDefaultSize = 400; }
  const isShowAdminRoles = document.getElementById("admin-users-accounts-roles").checked;

  const isGroupListResizable = document.getElementById("admin-users-groups-resizable").checked;
  let groupListDefaultSize = Number.parseInt(document.getElementById("admin-users-groups-default-height").value);
  if (Number.isNaN(groupListDefaultSize)) { groupListDefaultSize = 400; }

  const isAvatarImgResizable = document.getElementById("admin-users-avatar-resizable").checked;

  const isAdminUsersGradesLinkEnabled = document.getElementById("admin-users-add-grades-link").checked;

  // Admin - User Grades settings
  const isAdminUsersGradesPersonalized = document.getElementById("admin-users-grades-personalized").checked;

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

  // Shared - Rubrics
  const isRubricsDragDropCriteriaEnabled = document.getElementById("rubrics-drag-drop-criteria").checked;
  const isRubricsImportCriteriaEnabled = document.getElementById("rubrics-import-criteria").checked;

  chrome.storage.sync.set({
    globalBodyFullWidth: isGlobalFullWidthEnabled,
    globalNavAdminQuickAccess: isGlobalNavAdminQuickAccessEnabled,
    globalNavTestIndicator: isGlobalNavTestIndicatorEnabled,
    globalNavBetaIndicator: isGlobalNavBetaIndicatorEnabled,
    accountProfileGradesButton: isAccountProfileGradesButtonEnabled,
    dashboardAddAllCoursesButton: isDashboardAddAllCoursesButton,
    dashboardShowCourseGrades: isDashboardCourseGradesShown,
    allCoursesFilters: areFiltersEnabled,
    allCoursesSearchFields: areSearchesEnabled,
    allCoursesColumnSorts: areColumnSortsEnabled,
    courseGlobalStickyHeader: isCourseGlobalStickyHeaderEnabled,
    courseModulesJumpToEnabled: isCourseModulesJumpToEnabled,
    coursePeopleExportEnabled: isCoursePeopleExportEnabled,
    coursePeopleInactiveFilter: isCoursePeopleInactiveFilterEnabled,
    coursePeopleSectionFilter: isCoursePeopleSectionFilterEnabled,
    coursePeopleSortEnabled: isCoursePeopleSortEnabled,
    courseGroupsExportEnabled: isGroupsExportButtonEnabled,
    courseUserAccessExportEnabled: isCourseUserAccessReportButtonEnabled,
    courseSpeedGraderCommentsWithHyperlinksEnabled: isSpeedGraderCommentHyperlinksEnabled,
    courseSpeedGraderDraftCommentIndicator: isSpeedGraderDraftCommentIndicatorReplaced,
    courseStatisticsCourseReport: isStatisticsCourseReportsEnabled,
    courseAssignmentExportGrades: isAssignmentGradesExportButtonEnabled,
    adminCoursesBlueprintInputPreventFill: isBlueprintInputFillPrevent,
    adminCoursesSubaccountLink: isAdminCoursesSubaccountLinkEnabled,
    adminCoursesConcludedIcon: isCourseConcludedIconEnabled,
    adminCoursesPeopleLink: isPeopleLinkEnabled,
    adminCoursesCourseCode: isCourseCodeEnabled,
    adminCoursesGradesButton: isAdminCoursesViewGradesButtonEnabled,
    adminCoursesAdditionalSearchInputs: isAdditionalSearchEnabled,
    adminUsersEnrollmentsResizable: isCourseListResizable,
    adminUsersEnrollmentsDefaultHeight: enrollmentCourseListDefaultSize,
    adminUsersEnrollmentsSort: isSortCourseEnrollments,
    adminUsersEnrollmentsFilter: isAddCourseEnrollmentFilters,
    adminUsersEnrollmentsCourseCode: isShowCourseCodeInEnrollments,
    adminUsersEnrollmentsCanvasId: isShowCanvasIdInEnrollments,
    adminUsersAccountsResizable: isAccountListResizable,
    adminUsersAccountsDefaultHeight: accountListDefaultSize,
    adminUsersAccountsRoles: isShowAdminRoles,
    adminUsersGroupsResizable: isGroupListResizable,
    adminUsersGroupsDefaultHeight: groupListDefaultSize,
    adminUsersAvatarResizable: isAvatarImgResizable,
    adminUsersAddGradesLink: isAdminUsersGradesLinkEnabled,
    adminUsersGradesPersonalized: isAdminUsersGradesPersonalized,
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
    adminSisImportLog: isSisImportLogEnabled,
    rubricsImport: isRubricsDragDropCriteriaEnabled,
    rubricsDragDropCriteria: isRubricsImportCriteriaEnabled
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
    globalBodyFullWidth: true,
    globalNavAdminQuickAccess: true,
    globalNavTestIndicator: true,
    globalNavBetaIndicator: true,
    accountProfileGradesButton: true,
    dashboardAddAllCoursesButton: true,
    dashboardShowCourseGrades: true,
    allCoursesFilters: true,
    allCoursesSearchFields: true,
    allCoursesColumnSorts: true,
    courseGlobalStickyHeader: true,
    courseModulesJumpToEnabled: true,
    coursePeopleExportEnabled: true,
    coursePeopleInactiveFilter: true,
    coursePeopleSectionFilter: true,
    coursePeopleSortEnabled: true,
    courseGroupsExportEnabled: true,
    courseUserAccessExportEnabled: true,
    courseSpeedGraderCommentsWithHyperlinksEnabled: true,
    courseSpeedGraderDraftCommentIndicator: true,
    courseStatisticsCourseReport: true,
    courseAssignmentExportGrades: true,
    adminCoursesBlueprintInputPreventFill: true,
    adminCoursesAdditionalSearchInputs: true,
    adminCoursesCourseCode: true,
    adminCoursesConcludedIcon: true,
    adminCoursesSubaccountLink: true,
    adminCoursesPeopleLink: true,
    adminCoursesGradesButton: true,
    adminUsersEnrollmentsResizable: true,
    adminUsersEnrollmentsDefaultHeight: 400,
    adminUsersEnrollmentsSort: true,
    adminUsersEnrollmentsFilter: true,
    adminUsersEnrollmentsCourseCode: true,
    adminUsersEnrollmentsCanvasId: true,
    adminUsersAccountsResizable: true,
    adminUsersAccountsDefaultHeight: 100,
    adminUsersAccountsRoles: true,
    adminUsersGroupsResizable: true,
    adminUsersGroupsDefaultHeight: 100,
    adminUsersAvatarResizable: true,
    adminUsersAddGradesLink: true,
    adminUsersGradesPersonalized: true,
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
    adminSisImportLog: true,
    rubricsImport: true,
    rubricsDragDropCriteria: true
  }, function(items) {
    // Global settings
    document.getElementById("global-body-full-width").checked = items.globalBodyFullWidth;

    // Global Nav settings
    document.getElementById("admin-global-nav-quick-access-enabled").checked = items.globalNavAdminQuickAccess,
    document.getElementById("global-nav-test-server-indicator").checked = items.globalNavTestIndicator;
    document.getElementById("global-nav-beta-server-indicator").checked = items.globalNavBetaIndicator;

    // Account - Profile settings
    document.getElementById("account-profile-grades-button").checked = items.accountProfileGradesButton;
    
    // Dashboard settings
    document.getElementById("dashboard-add-all-courses-button").checked = items.dashboardAddAllCoursesButton;
    document.getElementById("dashboard-show-course-grades").checked = items.dashboardShowCourseGrades;

    // All Courses settings
    document.getElementById("courses-filters").checked = items.allCoursesFilters;
    document.getElementById("courses-search-bars").checked = items.allCoursesSearchFields;
    document.getElementById("courses-column-sorts").checked = items.allCoursesColumnSorts;

    // Course - Global settings
    document.getElementById("course-global-sticky-header").checked = items.courseGlobalStickyHeader;

    // Course - Modules settings
    document.getElementById("course-modules-jump-to").checked = items.courseModulesJumpToEnabled;

    // Course - People/Users settings
    document.getElementById("course-users-export").checked = items.coursePeopleExportEnabled;
    document.getElementById("course-users-inactive").checked = items.coursePeopleInactiveFilter;
    document.getElementById("course-users-section-filter").checked = items.coursePeopleSectionFilter;
    document.getElementById("course-people-sort").checked = items.coursePeopleSortEnabled;

    // Course - Groups settings
    document.getElementById("course-groups-export").checked = items.courseGroupsExportEnabled;

    // Course - User Access Report settings
    document.getElementById("course-user-access-report-export").checked = items.courseUserAccessExportEnabled;

    // Course - SpeedGrader settings
    document.getElementById("course-speedgrader-make-links-in-comments-clickable").checked = items.courseSpeedGraderCommentsWithHyperlinksEnabled;
    document.getElementById("course-speedgrader-draft-comment-indicator").checked = items.courseSpeedGraderDraftCommentIndicator;

    // Course - Statistics settings
    document.getElementById("course-statistics-course-reports").checked = items.courseStatisticsCourseReport;

    // Course - Assignments settings
    document.getElementById("course-assignments-assignment-export-grades").checked = items.courseAssignmentExportGrades;

    // Admin - Courses settings
    document.getElementById("admin-courses-blueprint-input-prevent-fill").checked = items.adminCoursesBlueprintInputPreventFill;
    document.getElementById("admin-courses-course-code").checked = items.adminCoursesCourseCode;
    document.getElementById("admin-courses-concluded-icon").checked = items.adminCoursesConcludedIcon;
    document.getElementById("admin-courses-subaccount-link").checked = items.adminCoursesSubaccountLink;
    document.getElementById("admin-courses-people-link").checked = items.adminCoursesPeopleLink;
    document.getElementById("admin-courses-view-grades-button").checked = items.adminCoursesGradesButton;
    document.getElementById("admin-courses-additional-search-inputs").checked = items.adminCoursesAdditionalSearchInputs;

    // Admin - Users settings
    document.getElementById("admin-users-enrollments-resizable").checked = items.adminUsersEnrollmentsResizable;
    document.getElementById("admin-users-enrollments-default-height").value = items.adminUsersEnrollmentsDefaultHeight;
    document.getElementById("admin-users-enrollments-sort").checked = items.adminUsersEnrollmentsSort;
    document.getElementById("admin-users-enrollments-filter").checked = items.adminUsersEnrollmentsFilter;
    document.getElementById("admin-users-enrollments-course-code").checked = items.adminUsersEnrollmentsCourseCode;
    document.getElementById("admin-users-enrollments-canvas-id").checked = items.adminUsersEnrollmentsCanvasId;

    document.getElementById("admin-users-accounts-resizable").checked = items.adminUsersAccountsResizable;
    document.getElementById("admin-users-accounts-default-height").value = items.adminUsersAccountsDefaultHeight;
    document.getElementById("admin-users-accounts-roles").checked = items.adminUsersAccountsRoles;

    document.getElementById("admin-users-groups-resizable").checked = items.adminUsersGroupsResizable;
    document.getElementById("admin-users-groups-default-height").value = items.adminUsersGroupsDefaultHeight;

    document.getElementById("admin-users-avatar-resizable").checked = items.adminUsersAvatarResizable;

    document.getElementById("admin-users-add-grades-link").checked = items.adminUsersAddGradesLink;

    // Admin - User Grades settings
    document.getElementById("admin-users-grades-personalized").checked = items.adminUsersGradesPersonalized;

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

    // Shared - Rubrics
    document.getElementById("rubrics-drag-drop-criteria").checked = items.rubricsDragDropCriteria;
    document.getElementById("rubrics-import-criteria").checked = items.rubricsImport;
  });
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click',
    saveOptions);