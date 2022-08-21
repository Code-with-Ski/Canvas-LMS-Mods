# Canvas LMS Mods

The purpose of this repository is to provide a browser extension to use with Canvas LMS from Instructure.

This is currently being designed as a Chrome browser extension, but additional versions for other browsers may be developed in the future. The target audience for the initial version will be admin users as customizations will target the admin area of Canvas first.

This will continue to grow in functionality. If you notice issues, please submit an issue and it will be investigated for consideration.  Suggestions for new features may be considered if they are low-code. Users are encouraged to continue to submit feature requests to Instructure in the Canvas Community to try to get them added as native features, especially for more advanced requests.

If you find this code and/or extension useful, I would appreciate your support so that I can continue to maintain and enhance this project.

[![Buy Me A Coffee](https://cdn.buymeacoffee.com/buttons/default-blue.png)](https://www.buymeacoffee.com/codewithski)

## Code Organization

Customizations will be organized primarily by the page on which they will be used. This will allow for only loading the relevant script files when needed. It should also help with tracking down errors when reported.

Longer scripts and/or scripts that are re-used across multiple pages may be organized in their own files/folders in the future.

## Options

Options will also be updated to allow the user to enable/disable certain customizations and adjust default values.  This is to help avoid potential conflicts with any local Canvas customizations and to allow the user some choice in the applied mods.

## Current Customizations Available

- Global
  - Enable full-width for body

- Account
  - Profile
    - Enable "View Grades" button on the profile

- All Courses
  - Enable filters on enrollment lists (Term, Enrolled as, Published)
  - Enable search bars on enrollment lists (Course, Nickname)
  - Enable column sorts on enrollment lists

- Dashboard
  - Enable "See all courses" button on the dashboard

- Course
  - Global for Course
    - Enable sticky course header
  - Modules
    - Enable "Jump to Module" selection
  - People/Users
    - Enable users export to CSV button
    - Enable ability to hide inactive users
    - Enable ability to filter by section
  - Groups
    - Enable groups export to CSV button
  - User
    - Enable access report export to CSV button

- Admin
  - Course Search
    - Prevents input for "Show only blueprint courses" from filling to the end of the page in desktop view
    - Add the course code to the course search results (Uses Canvas LMS API calls)
  - People
    - User Account Details
      - Course enrollments box
        - Make it resizable
        - Set a default height
        - Sort the enrollments by status, term, and role
        - Filter enrollments by course published status, enrollment status, and/or term
        - Add the course code to the list of enrollments (Uses Canvas LMS API calls)
      - Accounts box
        - Make it resizable
        - Set a default height
        - Show the admin roles in each account (Uses Canvas LMS API calls)
      - Groups box
        - Make it resizable
        - Set a default height
      - Avatar image
        - Make it resizable by clicking and/or dragging it to resize
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
    - Enable show SIS account ID (Uses Canvas LMS API calls)
  - Terms
    - Add a search ability to the terms
    - Move the add term button to the top of the terms table
    - Show the Canvas Term ID
  - SIS Import
    - Enable SIS History Log (Uses Canvas LMS API Calls)