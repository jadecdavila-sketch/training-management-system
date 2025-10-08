# Training Management System - User Stories

**Document Version:** 1.0
**Last Updated:** October 8, 2025
**Project:** Training Management System (TMS)

---

## Table of Contents

1. [Admin/Coordinator User Stories](#admincoordinator-user-stories)
   - [Program Creation & Management](#program-creation--management)
   - [Scheduling & Assignment](#scheduling--assignment)
   - [Cohort Management](#cohort-management)
   - [Participant Management](#participant-management)
   - [User Management](#user-management)
   - [Location Management](#location-management)
2. [HR User Stories](#hr-user-stories)
3. [Facilitator User Stories](#facilitator-user-stories)

---

## Admin/Coordinator User Stories

**Role Description:** Admin/Coordinator users have full system access and can perform all operations including program creation, scheduling, participant management, and system administration.

---

### Program Creation & Management

#### Story 1: Create Training Programs

**As an Admin**, I want to create training programs with multiple sessions so that I can define the curriculum structure.

**Acceptance Criteria:**
- [ ] I can access a program creation wizard from the Programs page
- [ ] I can enter program name, region, and description
- [ ] I can add multiple sessions with name, description, duration, and order
- [ ] I can specify participant types, facilitator skills, and location types for each session
- [ ] I can set group size minimums and maximums for each session
- [ ] The program is saved to the database and appears in the programs list
- [ ] I receive confirmation when the program is created successfully

---

#### Story 2: Create Multiple Cohorts

**As an Admin**, I want to create multiple cohorts within a program so that I can run the same training for different groups.

**Acceptance Criteria:**
- [ ] I can specify the number of cohorts during program creation
- [ ] I can name each cohort individually
- [ ] I can set unique start dates for each cohort
- [ ] I can set participant filters for each cohort (employee start date range)
- [ ] Sessions are automatically scheduled for all cohorts based on the program structure
- [ ] Each cohort appears as a separate entity in the cohort list
- [ ] Participants are automatically enrolled based on cohort filters

---

#### Story 3: Define Program Regions

**As an Admin**, I want to define program regions (Global, North America, etc.) so that I can target specific geographical locations.

**Acceptance Criteria:**
- [ ] I can select a region from a dropdown (Global, North America, Europe, Asia Pacific, Latin America)
- [ ] If region is "Global", participants from all locations are eligible
- [ ] If region is specific, only participants from that location are eligible
- [ ] The region filter is applied before cohort-level filters
- [ ] Region is displayed on the program details page

---

#### Story 4: Set Employee Start Date Filters

**As an Admin**, I want to set employee start date filters for cohorts so that participants are automatically assigned based on their hire date.

**Acceptance Criteria:**
- [ ] I can set a "from" date and/or "to" date for employee start dates
- [ ] I can use a date range picker to select dates
- [ ] Participants with hire dates within the range are automatically enrolled
- [ ] Participants with hire dates outside the range are excluded
- [ ] Participants without hire dates are excluded if filters are set
- [ ] The date filter is applied in addition to region filters
- [ ] Date comparisons use local timezone to avoid off-by-one errors

---

#### Story 5: Edit Programs and Add Cohorts

**As an Admin**, I want to edit existing programs and add new cohorts so that I can scale training as needed.

**Acceptance Criteria:**
- [ ] I can click "Edit" on an existing program
- [ ] The program wizard opens with existing data pre-filled
- [ ] I can increase the number of cohorts in Step 6
- [ ] Step 7 automatically adds new cohort configuration forms
- [ ] I can configure new cohorts with names, dates, and filters
- [ ] Saving creates the new cohorts in the database
- [ ] New cohorts appear in the cohorts list
- [ ] Existing cohorts are not affected

---

#### Story 6: Archive Programs

**As an Admin**, I want to archive completed programs so that I can keep the active list clean.

**Acceptance Criteria:**
- [ ] I can click "Archive" on a program from the programs list
- [ ] I receive a confirmation dialog before archiving
- [ ] Archived programs are hidden from the default programs list
- [ ] I can view archived programs using a filter/toggle
- [ ] I can unarchive programs if needed
- [ ] Cohorts and sessions remain intact when archived

---

### Scheduling & Assignment

#### Story 7: Schedule Sessions

**As an Admin**, I want to schedule sessions with specific dates and times so that participants know when to attend.

**Acceptance Criteria:**
- [ ] I can set start date and time for each session
- [ ] I can set duration in minutes
- [ ] End time is automatically calculated based on duration
- [ ] Sessions are displayed in chronological order
- [ ] I can see session dates in both list and calendar views
- [ ] Dates display correctly in my local timezone

---

#### Story 8: Assign Facilitators

**As an Admin**, I want to assign facilitators to sessions so that each session has an instructor.

**Acceptance Criteria:**
- [ ] I can select facilitators from a dropdown of available facilitators
- [ ] Facilitator options are filtered by required skills for the session
- [ ] I can see facilitator names and emails in the dropdown
- [ ] Assigned facilitators appear in the session details
- [ ] I receive a warning if a session doesn't have a facilitator assigned
- [ ] I can change facilitator assignments after initial creation

---

#### Story 9: Assign Locations

**As an Admin**, I want to assign locations (physical or virtual) to sessions so that participants know where to attend.

**Acceptance Criteria:**
- [ ] I can select locations from a dropdown of available locations
- [ ] Location options are filtered by required location types for the session
- [ ] I can see location name, type, and capacity in the dropdown
- [ ] Assigned locations appear in the session details
- [ ] I receive a warning if a session doesn't have a location assigned
- [ ] I receive a warning if location capacity is less than expected participants
- [ ] I can change location assignments after initial creation

---

#### Story 10: View Sessions in Multiple Formats

**As an Admin**, I want to view sessions in both list and calendar views so that I can see schedules in different formats.

**Acceptance Criteria:**
- [ ] I can toggle between list view and calendar view
- [ ] List view shows sessions in a table with all details
- [ ] Calendar view shows sessions grouped by date in a week-based grid
- [ ] Calendar view displays Monday through Sunday
- [ ] Sessions are color-coded by assignment status (fully assigned vs missing resources)
- [ ] I can click sessions in either view to see/edit details
- [ ] Search and filter controls are hidden in calendar view

---

#### Story 11: Identify Scheduling Conflicts

**As an Admin**, I want to identify scheduling conflicts (missing facilitators/locations) so that I can resolve issues before training starts.

**Acceptance Criteria:**
- [ ] Sessions without facilitators are visually highlighted (orange/warning color)
- [ ] Sessions without locations are visually highlighted
- [ ] I can see a count of unassigned sessions on the cohort overview
- [ ] A warning icon appears next to sessions with missing assignments
- [ ] I can filter to show only sessions with conflicts
- [ ] Tooltip or indicator shows which resources are missing

---

### Cohort Management

#### Story 12: View All Cohorts for a Program

**As an Admin**, I want to view all cohorts for a program so that I can monitor training delivery.

**Acceptance Criteria:**
- [ ] I can access cohorts from the program details page
- [ ] All cohorts for the program are listed with key information
- [ ] I can see cohort name, start date, end date, and participant count
- [ ] I can click on a cohort to view detailed information
- [ ] Cohorts are sorted chronologically by start date
- [ ] The cohort list updates when new cohorts are added

---

#### Story 13: View Cohort Progress

**As an Admin**, I want to see cohort progress and participant counts so that I can track enrollment.

**Acceptance Criteria:**
- [ ] I can see total number of participants enrolled in each cohort
- [ ] I can see cohort capacity and enrollment percentage
- [ ] I can see overall progress bar showing timeline completion
- [ ] I can see number of sessions scheduled for the cohort
- [ ] I can see cohort status (Draft, Scheduled, In Progress, Completed)
- [ ] Progress updates automatically when sessions are completed

---

#### Story 14: View Participant Lists

**As an Admin**, I want to view participant lists for each cohort so that I know who's enrolled.

**Acceptance Criteria:**
- [ ] I can access the participants tab on cohort details page
- [ ] All enrolled participants are listed with name, email, department, job title, and hire date
- [ ] I can search participants by name, email, department, or job title
- [ ] I can filter participants by department
- [ ] Department filters show counts for each department
- [ ] The list updates when participants are added or removed
- [ ] I can click on a participant to view their full details

---

#### Story 15: Move Participants Between Cohorts

**As an Admin**, I want to move participants between cohorts so that I can accommodate schedule changes.

**Acceptance Criteria:**
- [ ] I can click on a participant to open their detail drawer
- [ ] I can select "Move to Another Cohort" from the drawer
- [ ] I can choose a destination cohort from all available cohorts (including different programs)
- [ ] I receive confirmation before the move is executed
- [ ] The participant is removed from the current cohort and added to the destination cohort
- [ ] The cohort participant counts update immediately
- [ ] I receive success confirmation after the move

---

#### Story 16: Remove Participants from Cohorts

**As an Admin**, I want to remove participants from cohorts so that I can handle withdrawals.

**Acceptance Criteria:**
- [ ] I can click on a participant to open their detail drawer
- [ ] I can select "Remove from Cohort"
- [ ] I receive a confirmation dialog before removal
- [ ] The participant is removed from the cohort enrollment
- [ ] The participant remains in the system (not deleted)
- [ ] The cohort participant count decreases by one
- [ ] I receive success confirmation after removal

---

### Participant Management

#### Story 17: View All Participants

**As an Admin**, I want to view all participants in the system so that I can see who's available for training.

**Acceptance Criteria:**
- [ ] I can access the Participants page from the main navigation
- [ ] All participants are listed in a table format
- [ ] I can see first name, last name, email, department, job title, location, and hire date
- [ ] The list is paginated for performance
- [ ] Participant count is displayed
- [ ] The list loads within 2 seconds

---

#### Story 18: Search and Filter Participants

**As an Admin**, I want to search and filter participants by name, email, department, job title, and hire date so that I can find specific people.

**Acceptance Criteria:**
- [ ] I can enter text in a search box to search across name, email, department, and job title
- [ ] Search results update as I type (debounced)
- [ ] I can filter by department using a dropdown
- [ ] I can filter by location
- [ ] I can filter by hire date range
- [ ] Multiple filters can be applied simultaneously
- [ ] I can clear all filters to see the full list again
- [ ] Filtered participant count is displayed

---

#### Story 19: View Participant Training History

**As an Admin**, I want to view a participant's training history (which cohorts they're in) so that I can track their development.

**Acceptance Criteria:**
- [ ] I can click on a participant to open their detail drawer
- [ ] The drawer has a "Sessions" tab showing all cohorts they're enrolled in
- [ ] I can see program name, cohort name, and all scheduled sessions
- [ ] Sessions are listed chronologically
- [ ] I can see session status (scheduled/completed)
- [ ] I can see session dates and times
- [ ] The session count is displayed in the tab header

---

#### Story 20: Manually Add Participants

**As an Admin**, I want to manually add individual participants so that I can handle one-off additions.

**Acceptance Criteria:**
- [ ] I can click "Add Participant" from the Participants page
- [ ] A modal/form opens with fields for all participant information
- [ ] Required fields are: first name, last name, email
- [ ] Optional fields are: department, job title, location, hire date
- [ ] Email validation ensures proper format
- [ ] I receive an error if email already exists
- [ ] The new participant appears in the list immediately after saving
- [ ] I receive success confirmation

---

#### Story 21: Import Participants via CSV

**As an Admin**, I want to import participants via CSV so that I can quickly bulk-add people.

**Acceptance Criteria:**
- [ ] I can click "Import CSV" from the Participants page
- [ ] I can select a CSV file from my computer
- [ ] The CSV must have headers matching the participant fields
- [ ] The system validates the CSV format and shows errors if invalid
- [ ] I can preview the data before importing
- [ ] The system shows how many participants will be added
- [ ] Duplicate emails are skipped with a warning
- [ ] Import progress is displayed
- [ ] I receive a summary of successful imports and any errors
- [ ] New participants appear in the list after import

---

### User Management

#### Story 22: Create Facilitator Accounts

**As an Admin**, I want to create facilitator accounts so that instructors can be assigned to sessions.

**Acceptance Criteria:**
- [ ] I can click "Add User" from the Users page
- [ ] I can select "Facilitator" as the role
- [ ] I can enter name, email, and initial password
- [ ] I can specify facilitator qualifications/skills
- [ ] Email validation ensures proper format
- [ ] I receive an error if email already exists
- [ ] The facilitator appears in the users list and is available for session assignment
- [ ] I receive success confirmation

---

#### Story 23: Create HR User Accounts

**As an Admin**, I want to create HR user accounts so that they can add participants.

**Acceptance Criteria:**
- [ ] I can click "Add User" from the Users page
- [ ] I can select "HR" as the role
- [ ] I can enter name, email, and initial password
- [ ] Email validation ensures proper format
- [ ] I receive an error if email already exists
- [ ] The HR user can log in and access only the Participants page
- [ ] I receive success confirmation

---

#### Story 24: View All Users and Roles

**As an Admin**, I want to view all users and their roles so that I can manage system access.

**Acceptance Criteria:**
- [ ] I can access the Users page from the main navigation
- [ ] All users are listed with name, email, and role
- [ ] I can filter users by role (Admin, HR, Facilitator)
- [ ] I can search users by name or email
- [ ] User count is displayed
- [ ] I can click on a user to edit their details
- [ ] I can deactivate/delete users if needed

---

### Location Management

#### Story 25: Add Training Locations

**As an Admin**, I want to add training locations with capacity limits so that I can manage training spaces.

**Acceptance Criteria:**
- [ ] I can click "Add Location" from the Locations page
- [ ] I can enter location name (required)
- [ ] I can enter address (optional)
- [ ] I can set capacity (required, must be a positive number)
- [ ] I can specify equipment available at the location
- [ ] Name validation prevents duplicates
- [ ] The location appears in the list immediately after saving
- [ ] I receive success confirmation

---

#### Story 26: Specify Location Types

**As an Admin**, I want to specify location types (Physical, Virtual, Classroom) so that scheduling is clear.

**Acceptance Criteria:**
- [ ] I can select location type from a dropdown when creating a location
- [ ] Available types include: Physical, Virtual, Classroom, Conference Room, Lab
- [ ] Location type is displayed in the locations list
- [ ] I can filter locations by type
- [ ] Location type helps with session assignment matching

---

#### Story 27: View All Locations

**As an Admin**, I want to view all available locations so that I can assign them to sessions.

**Acceptance Criteria:**
- [ ] I can access the Locations page from the main navigation
- [ ] All locations are listed with name, type, capacity, and address
- [ ] I can search locations by name
- [ ] I can filter locations by type
- [ ] Location count is displayed
- [ ] I can click on a location to edit its details
- [ ] The list updates when locations are added or modified

---

## HR User Stories

**Role Description:** HR users have limited access focused solely on participant management. They can view, add, edit, and import participants but cannot access program creation, scheduling, or other administrative functions.

---

#### Story 28: View All Participants

**As an HR user**, I want to view all participants in the system so that I can see who's already added.

**Acceptance Criteria:**
- [ ] I can access the Participants page (only page available to HR users)
- [ ] All participants are listed with full details
- [ ] I can see participant count
- [ ] The interface is the same as for Admin users (read-only or edit depends on permissions)

---

#### Story 29: Add New Participants

**As an HR user**, I want to add new participants with their details (name, email, department, job title, hire date, location) so that they're available for training.

**Acceptance Criteria:**
- [ ] I can click "Add Participant"
- [ ] A form opens with all participant fields
- [ ] Required fields: first name, last name, email
- [ ] Optional fields: department, job title, location, hire date
- [ ] Email validation prevents duplicates
- [ ] The participant is saved to the database
- [ ] I receive success confirmation
- [ ] The participant appears in the list immediately

---

#### Story 30: Import Participants via CSV

**As an HR user**, I want to import participants via CSV so that I can quickly add multiple people.

**Acceptance Criteria:**
- [ ] I can click "Import CSV"
- [ ] I can upload a CSV file with participant data
- [ ] The system validates the CSV format
- [ ] I can preview the data before importing
- [ ] Duplicate emails are handled gracefully
- [ ] I receive import summary with success/error counts
- [ ] New participants appear in the list after import

---

#### Story 31: Search for Participants

**As an HR user**, I want to search for participants by name or email so that I can verify if someone is already in the system.

**Acceptance Criteria:**
- [ ] I can use the search box to find participants
- [ ] Search works across name and email fields
- [ ] Results update as I type
- [ ] Search is case-insensitive
- [ ] I can clear the search to see all participants

---

#### Story 32: Edit Participant Details

**As an HR user**, I want to edit participant details so that I can keep information up to date.

**Acceptance Criteria:**
- [ ] I can click on a participant to open their details
- [ ] I can edit all participant fields except email (unique identifier)
- [ ] Changes are saved to the database
- [ ] The list updates immediately with the new information
- [ ] I receive success confirmation

---

## Facilitator User Stories

**Role Description:** Facilitator users can view their assigned sessions, manage attendance, and access participant information for sessions they teach. They cannot create programs, edit schedules, or manage users.

---

#### Story 33: View Assigned Sessions

**As a Facilitator**, I want to see which sessions I'm assigned to so that I know my schedule.

**Acceptance Criteria:**
- [ ] I can access a My Sessions page or dashboard
- [ ] All sessions where I'm the assigned facilitator are listed
- [ ] I can see session name, date, time, location, and cohort
- [ ] Sessions are listed in chronological order
- [ ] Upcoming sessions are highlighted or separated from past sessions
- [ ] I can see session count

---

#### Story 34: View Participant Lists

**As a Facilitator**, I want to view participant lists for my sessions so that I know who to expect.

**Acceptance Criteria:**
- [ ] I can click on a session to view details
- [ ] A participant list shows all enrolled participants for that cohort
- [ ] I can see participant names, emails, and departments
- [ ] I can see participant count
- [ ] The list is searchable
- [ ] I can filter by department

---

#### Story 35: Track Attendance

**As a Facilitator**, I want to track attendance for participants so that I can record who attended.

**Acceptance Criteria:**
- [ ] I can access an attendance view for each session
- [ ] Each participant has a checkbox to mark as present/absent
- [ ] I can select/deselect all participants at once
- [ ] I can save attendance records
- [ ] Attendance status is preserved when I navigate away and come back
- [ ] I can see attendance counts (X of Y attended)

---

#### Story 36: Export Attendance to CSV

**As a Facilitator**, I want to export attendance to CSV so that I can maintain records.

**Acceptance Criteria:**
- [ ] I can click "Export Attendance" for a session
- [ ] A CSV file is downloaded to my computer
- [ ] The CSV includes: participant name, email, department, job title, attendance status
- [ ] The filename includes session name and date
- [ ] The export includes all participants (not just those present)

---

#### Story 37: See Session Details

**As a Facilitator**, I want to see session details (date, time, location) so that I know where and when to be.

**Acceptance Criteria:**
- [ ] I can view session date and time in my local timezone
- [ ] I can see full location details (name, address, type, equipment)
- [ ] I can see session duration
- [ ] I can see program and cohort name for context
- [ ] I can see any special requirements or materials needed
- [ ] I can view this information on mobile devices

---

## Summary

**Total User Stories:** 37

**By Role:**
- Admin/Coordinator: 27 stories
- HR: 5 stories
- Facilitator: 5 stories

**By Feature Area:**
- Program Creation & Management: 6 stories
- Scheduling & Assignment: 5 stories
- Cohort Management: 5 stories
- Participant Management: 5 stories
- User Management: 3 stories
- Location Management: 3 stories
- HR Functions: 5 stories
- Facilitator Functions: 5 stories

---

**Document End**
