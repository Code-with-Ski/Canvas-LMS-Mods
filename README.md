# Canvas LMS Mods

The purpose of this repository is to provide a browser extension to use with Canvas LMS from Instructure.

This is currently being designed as a Chrome browser extension, but additional versions for other browsers may be developed in the future. The target audience for the initial version will be admin users as customizations will target the admin area of Canvas first.

This will continue to grow in functionality. If you notice issues, please submit an issue and it will be investigated for consideration.  Suggestions for new features may be considered if they are low-code. Users are encouraged to continue to submit feature requests to Instructure in the Canvas Community to try to get them added as native features, especially for more advanced requests.

If you find this code and/or extension useful, I would appreciate your support so that I can continue to maintain and enhance this project.

[![Buy Me A Coffee](https://cdn.buymeacoffee.com/buttons/default-blue.png)](https://www.buymeacoffee.com/codewithski)

## Change to Host Permissions

Originally, I planned to limit host permissions to Canvas LMS specific sites.  While this works well for institutions on the default domain provided by Instructure, it has become time consuming to continue to manage support for custom domains.  To make it easier for users to begin using the tool without the need to request an update to accomodate their institution's custom domain, I have updated the host permissions in the manifest file to work on any site.  

By default, the Instructure hosted Canvas LMS domains should work upon installation.  To ensure these features aren't accidentally applied to website that isn't the Canvas LMS, all other domains are permitted as optional.  To use this extension with a custom domain, you will need to update the settings on the extension to list it as a specific approved site or when clicked.  [Install and manage extensions](https://support.google.com/chrome_webstore/answer/2664769?hl=en)

If you would like to continue to keep the host permissions limited, you are welcome to make a copy of this repository and adjust the host permissions to be limited to your own domain.  If you have access to Developer mode in Google Chrome, you can then begin using your own local version of the extension.  [Loading an unpacked extension](https://developer.chrome.com/docs/extensions/mv3/getstarted/development-basics/#load-unpacked)
*While I don't provide support for Microsoft Edge or Firefox at this time, you may be able to get it to work on those browsers too with little to no additional changes to the code.*

## Code Organization

Customizations will be organized primarily by the page on which they will be used. This will help with only loading the relevant script files when needed. It should also help with tracking down errors when reported. Scripts that are re-used across multiple pages will be organized in their own folders to avoid repeating code for the same feature.

I am in the process of re-factoring and re-organizing features to reduce repeated code. Common code is being extracted into the utils folder and will make it easier to add new features in the future and test/maintain existing features. I am also beginning to put each feature in its own folder and adding a README file to provide more information about the feature.

## Options

Options will also be updated to allow the user to enable/disable certain customizations and adjust default values.  This is to help avoid potential conflicts with any local Canvas customizations and to allow the user some choice in the applied mods.

## Current Customizations Available

- Global
  - Enable full-width for body

- Global Nav (All Users)
  - Enable indicator on the global nav when on the test server
  - Enable indicator on the global nav when on the beta server

- Account (User)
  - Profile
    - Enable "View Grades" button on the profile

- All Courses
  - Enable filters on enrollment lists (Term, Enrolled as, Published)
  - Enable search bars on enrollment lists (Course, Nickname)
  - Enable column sorts on enrollment lists

- Dashboard
  - Enable "See all courses" button on the dashboard
  - Show current course grade on course cards for student enrollments (Uses Canvas LMS API)

- Course
  - Global for Course
    - Enable sticky course header
  - Modules
    - Enable "Jump to Module" selection
  - People/Users
    - Enable users export to CSV button (Requires course admin permission)
    - Enable ability to hide inactive users
    - Enable ability to filter by section (Uses Canvas LMS API)
    - Enable people sort by columns
  - Groups
    - Enable groups export to CSV button (Requires course admin permission) (Uses Canvas LMS API)
  - User
    - Enable access report export to CSV button
  - SpeedGrader
    - Enable converting text that resembles links (begins with http:// or https://) to a hyperlink in the comments
    - Enable changing the draft comment indicator from "*" to the "DRAFT"
  - Statistics
    - Enable course reports
  - Assignments
    - Add export grades button to assignment page

- Admin
  - Global Nav Admin Menu
    - Enable quick access admin links for course search, people search, and some account links (Uses Canvas LMS API)
  - Course Search
    - Prevents input for "Show only blueprint courses" from filling to the end of the page in desktop view
    - Add additional search inputs (published/unpublished, sort by Canvas course id)
    - Add the course code to the course search results (Uses Canvas LMS API)
    - Add concluded icon to course names in search results, if the course is concluded (Uses Canvas LMS API)
    - Convert subaccount name in search results to link to the course search for that subaccount (*Requires manage account settings permission) (Uses Canvas LMS API)
    - Convert number of students in search results to link to people in course
    - Add a "View Grades" button to the course search results
  - People
    - User Account Details
      - Course enrollments box
        - Make it resizable
        - Set a default height
        - Sort the enrollments by status, term, and role
        - Filter enrollments by course published status, enrollment status, and/or term
        - Add the course code to the list of enrollments (Uses Canvas LMS API)
        - Add the Canvas course ID to the list of enrollments
      - Accounts box
        - Make it resizable
        - Set a default height
        - Show the admin roles in each account (Uses Canvas LMS API)
      - Groups box
        - Make it resizable
        - Set a default height
      - Avatar image
        - Make it resizable by clicking and/or dragging it to resize
      - Add link to grades for active courses
    - User Grades
      - Updates the name and headings to reflect the user (Uses Canvas LMS API)
    - Profile Pictures
      - Make it resizable by dragging the corner
      - Make it a rounded square instead of a circle to show more of the background
      - Adjust the default size
  - Rubrics
    - Add a search ability to the rubrics
  - Question Banks
    - Add a search ability to the question banks
  - Sub-accounts
    - Enable show Canvas account ID
    - Enable show SIS account ID (Uses Canvas LMS API)
  - Terms
    - Add a search ability to the terms
    - Move the add term button to the top of the terms table
    - Show the Canvas Term ID
  - SIS Import
    - Enable SIS History Log (Uses Canvas LMS API)

  Shared Features
  - Rubrics
    - Enabled drag-and-drop criteria rows when editing
    - Add import rubric criteria option