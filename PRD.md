# Product Requirements Document (PRD)
## Training Management System (TMS)

---

**Document Version:** 2.0
**Last Updated:** October 8, 2025
**Product Owner:** Jade Davila
**Status:** Pre-Release Development

---

## Executive Summary

The Training Management System (TMS) is a comprehensive platform designed for large organizations to efficiently manage training programs across multiple cohorts, locations, and facilitators. The system automates participant enrollment based on configurable filters, streamlines scheduling of training sessions, and provides robust management tools for coordinators, HR teams, and facilitators.

**Key Value Proposition:**
- Automate participant assignment to training cohorts based on hire date and location
- Manage multiple concurrent training programs with hundreds of participants
- Streamline facilitator and location scheduling across multiple cohorts
- Provide role-based access for administrators, HR staff, and facilitators
- Enable efficient tracking of training delivery and participant progress

---

## Table of Contents

1. [Product Overview](#product-overview)
2. [Problem Statement](#problem-statement)
3. [Goals & Objectives](#goals--objectives)
4. [User Personas](#user-personas)
5. [Core Features](#core-features)
6. [User Stories & Acceptance Criteria](#user-stories--acceptance-criteria)
7. [Technical Architecture](#technical-architecture)
8. [Security Architecture](#security-architecture)
9. [Scalability & Performance](#scalability--performance)
10. [Design Requirements](#design-requirements)
11. [Integration Requirements](#integration-requirements)
12. [Success Metrics](#success-metrics)
13. [Release Roadmap](#release-roadmap)
14. [Future Roadmap](#future-roadmap)

---

## Product Overview

### Vision
To become the leading training management solution for large enterprises, enabling seamless coordination of employee development programs at scale.

### Mission
Eliminate manual processes in training management by providing intelligent automation, intuitive interfaces, and comprehensive tracking capabilities.

### Target Market
- Large organizations (500+ employees)
- Companies with distributed workforces across multiple regions
- Organizations running structured onboarding and continuous learning programs
- HR departments managing frequent training cohorts

### Product Scope

**In Scope (Release 1.0):**
- Program creation and management
- Multi-cohort scheduling and automation
- Participant enrollment and management
- Facilitator and location assignment
- Calendar-based session viewing
- CSV import/export functionality
- Role-based access control (Admin, HR, Facilitator)
- Automated participant filtering by region and hire date
- **Enterprise authentication & authorization (SSO)**
- **Microsoft Outlook calendar integration**
- **Production-grade security architecture**
- **Scalability for 100,000+ users**

**Out of Scope (Future Phases):**
- Learning Management System (LMS) features (course content delivery)
- Video conferencing integration
- Mobile applications
- Participant self-service portal
- Automated reporting and analytics dashboards
- Integration with HRIS systems (Workday, SAP)
- Certification and credential tracking

---

## Problem Statement

### Current Pain Points

**For HR Administrators:**
1. **Manual Participant Assignment:** HR teams spend hours manually assigning employees to training cohorts based on hire dates and locations
2. **Scheduling Complexity:** Coordinating facilitators, locations, and participants across multiple cohorts is time-consuming and error-prone
3. **No Centralized View:** Training data is scattered across spreadsheets, emails, and calendar invitations
4. **Difficult to Scale:** Adding new cohorts or modifying existing programs requires significant manual effort
5. **No Visibility:** Hard to track which participants are enrolled, which sessions need resources, and overall program status

**For Facilitators:**
1. **Session Tracking:** No centralized way to see upcoming sessions and participant lists
2. **Attendance Recording:** Manual, paper-based attendance tracking
3. **Limited Participant Information:** Difficult to access participant details before sessions

**For the Organization:**
1. **Resource Conflicts:** Double-booking of facilitators or locations
2. **Compliance Risk:** Missed training requirements due to manual tracking
3. **Poor Utilization:** Training spaces underutilized or overcrowded
4. **No Historical Data:** Difficult to analyze training effectiveness or participation patterns

### Target Users Impacted
- **Primary:** HR Administrators and Training Coordinators (200+ hours/month saved)
- **Secondary:** Facilitators (20+ hours/month saved)
- **Tertiary:** Organizational leadership (improved compliance and reporting)

---

## Goals & Objectives

### Business Goals

1. **Reduce Administrative Overhead**
   - Target: 80% reduction in time spent on participant assignment
   - Metric: Hours spent per cohort creation (current: 8 hours → target: 1.5 hours)

2. **Increase Training Throughput**
   - Target: Enable 3x more concurrent training programs
   - Metric: Number of cohorts managed simultaneously

3. **Improve Resource Utilization**
   - Target: 95% session coverage (facilitator + location assigned)
   - Metric: Percentage of sessions fully resourced before start date

4. **Enhance Compliance**
   - Target: 100% of eligible participants auto-enrolled
   - Metric: Percentage of participants meeting criteria who are enrolled

### Product Goals

1. **Automation:** Eliminate manual participant assignment through intelligent filtering
2. **Scalability:** Support 50+ concurrent training programs with 1000+ participants
3. **Usability:** Enable non-technical users to create programs in under 15 minutes
4. **Visibility:** Provide real-time view of all programs, cohorts, and schedules
5. **Flexibility:** Allow easy modification of programs, participants, and schedules

### User Goals

**Admin/Coordinator:**
- Create and launch training programs with minimal manual work
- Quickly identify and resolve scheduling conflicts
- Track participant enrollment and session coverage
- Make changes to cohorts without disrupting existing schedules

**HR Staff:**
- Add participants to the system efficiently
- Import bulk participant data via CSV
- Keep participant information up to date

**Facilitators:**
- View assigned sessions at a glance
- Access participant lists before sessions
- Record attendance digitally
- Export attendance records

---

## User Personas

### Persona 1: Sarah - Training Coordinator (Admin)

**Demographics:**
- Age: 32
- Role: Senior Training Coordinator
- Experience: 5 years in L&D
- Tech Savviness: Medium

**Responsibilities:**
- Design and launch training programs
- Coordinate with facilitators and book training rooms
- Ensure all new hires complete onboarding training
- Track training completion rates
- Report on training metrics to leadership

**Pain Points:**
- Spends 2-3 days manually assigning 100+ new hires to onboarding cohorts each month
- Constantly dealing with scheduling conflicts
- Uses multiple tools (Excel, Outlook, email) to manage training
- Difficult to get a holistic view of all active training programs

**Goals:**
- Automate participant enrollment
- Reduce time spent on administrative tasks
- Improve visibility into training operations
- Enable self-service for HR team

**Success Criteria:**
- Can create a new training program in under 15 minutes
- Automated enrollment reduces manual work by 80%
- Single dashboard shows all programs and their status
- Can identify and fix scheduling conflicts in under 5 minutes

---

### Persona 2: Mike - HR Specialist (HR User)

**Demographics:**
- Age: 28
- Role: HR Specialist
- Experience: 2 years in HR
- Tech Savviness: Low-Medium

**Responsibilities:**
- Onboard new hires
- Maintain employee records
- Coordinate with Training team
- Add new employees to training rosters

**Pain Points:**
- Manually enters new hire data into multiple systems
- Doesn't know which training programs employees are in
- Makes data entry errors when transferring from spreadsheets
- Limited visibility into training schedules

**Goals:**
- Quickly add new hires to the system
- Import multiple participants at once
- Verify participants are enrolled in correct training

**Success Criteria:**
- Can add a participant in under 1 minute
- Can import 50+ participants via CSV in under 5 minutes
- Can search and verify participant enrollment status

---

### Persona 3: David - Training Facilitator

**Demographics:**
- Age: 45
- Role: Senior Training Facilitator
- Experience: 15 years as instructor
- Tech Savviness: Low

**Responsibilities:**
- Deliver training sessions
- Track attendance
- Prepare materials for upcoming sessions
- Provide feedback on participant performance

**Pain Points:**
- Receives participant lists via email, often outdated
- Paper-based attendance is time-consuming and gets lost
- Doesn't know which sessions he's scheduled for next month
- Has to ask coordinator for session details and location

**Goals:**
- See all assigned sessions in one place
- Access up-to-date participant lists
- Record attendance digitally
- Know where and when sessions are happening

**Success Criteria:**
- Can view all upcoming sessions in calendar view
- Can access participant list with 1 click
- Can record attendance in under 2 minutes
- Can export attendance to submit to HR

---

## Core Features

### 1. Program Management

**Description:** Create and manage training programs with multiple sessions and cohorts.

**Key Capabilities:**
- Multi-step program creation wizard (10 steps)
- Session definition (name, description, duration, requirements)
- Region-based targeting (Global, North America, Europe, Asia Pacific, Latin America)
- Session sequencing and scheduling
- Program editing and cohort expansion
- Program archival

**User Value:** Enables coordinators to define comprehensive training curricula and deploy them across multiple cohorts simultaneously.

---

### 2. Cohort Management

**Description:** Organize training delivery into cohorts with automated participant enrollment.

**Key Capabilities:**
- Create multiple cohorts within a program
- Define cohort-specific start dates
- Set participant filters (employee hire date range)
- Automated participant enrollment based on filters
- Manual participant add/remove
- Move participants between cohorts
- View cohort progress and enrollment

**User Value:** Automates the most time-consuming task (participant assignment) and enables flexible management of training groups.

---

### 3. Scheduling System

**Description:** Coordinate sessions, facilitators, and locations across all cohorts.

**Key Capabilities:**
- Automated session scheduling for all cohorts
- Facilitator assignment with skill matching
- Location assignment with capacity checking
- Conflict detection (missing facilitator/location)
- List and calendar view of sessions
- Session rescheduling
- Timeline visualization

**User Value:** Ensures all sessions have necessary resources and provides clear visibility into upcoming training.

---

### 4. Participant Management

**Description:** Centralized system for managing all training participants.

**Key Capabilities:**
- Add participants individually or via CSV import
- Search and filter participants (name, email, department, job title, hire date, location)
- View participant training history
- Edit participant information
- Department-based filtering
- Participant detail drawer with session enrollment

**User Value:** Gives HR teams efficient tools to maintain participant data and verify training assignments.

---

### 5. Resource Management

**Description:** Manage facilitators and training locations.

**Key Capabilities:**
- Create facilitator profiles with skills/qualifications
- Create location records with type, capacity, and address
- Filter locations by type
- View resource availability
- Assign resources to sessions

**User Value:** Ensures training has qualified instructors and appropriate spaces, preventing scheduling conflicts.

---

### 6. User & Access Management

**Description:** Role-based access control for different user types.

**Key Capabilities:**
- Three user roles: Admin/Coordinator, HR, Facilitator
- Admin: Full system access
- HR: Participant management only
- Facilitator: View assigned sessions and manage attendance
- User creation and management

**User Value:** Provides appropriate access levels while maintaining data security and system integrity.

---

### 7. Attendance Tracking

**Description:** Digital attendance recording for training sessions.

**Key Capabilities:**
- Checkbox-based attendance marking
- Select all/deselect all functionality
- Export attendance to CSV
- Attendance status preservation

**User Value:** Eliminates paper-based tracking and provides digital records for compliance.

---

### 8. Reporting & Export

**Description:** Export data for external reporting and analysis.

**Key Capabilities:**
- CSV export of participant lists
- CSV export of attendance records
- CSV import of participants

**User Value:** Enables integration with external systems and supports compliance reporting.

---

## User Stories & Acceptance Criteria

### Admin/Coordinator User Stories

#### Program Creation & Management

##### Story 1: Create Training Programs

**As an Admin**, I want to create training programs with multiple sessions so that I can define the curriculum structure.

**Priority:** P0 (Must Have)
**Estimate:** 8 points

**Acceptance Criteria:**
- [ ] I can access a program creation wizard from the Programs page
- [ ] I can enter program name, region, and description
- [ ] I can add multiple sessions with name, description, duration, and order
- [ ] I can specify participant types, facilitator skills, and location types for each session
- [ ] I can set group size minimums and maximums for each session
- [ ] The program is saved to the database and appears in the programs list
- [ ] I receive confirmation when the program is created successfully

**Technical Notes:**
- 10-step wizard implementation
- Form validation using Zod
- Zustand state management for wizard data
- Prisma transactions for atomic program creation

**Dependencies:** None

---

##### Story 2: Create Multiple Cohorts

**As an Admin**, I want to create multiple cohorts within a program so that I can run the same training for different groups.

**Priority:** P0 (Must Have)
**Estimate:** 13 points

**Acceptance Criteria:**
- [ ] I can specify the number of cohorts during program creation
- [ ] I can name each cohort individually
- [ ] I can set unique start dates for each cohort
- [ ] I can set participant filters for each cohort (employee start date range)
- [ ] Sessions are automatically scheduled for all cohorts based on the program structure
- [ ] Each cohort appears as a separate entity in the cohort list
- [ ] Participants are automatically enrolled based on cohort filters

**Technical Notes:**
- Participant filtering algorithm with timezone-safe date comparisons
- Backend enrollment logic during program creation
- Schedule generation for all cohorts

**Dependencies:** Story 1, Story 4

---

##### Story 3: Define Program Regions

**As an Admin**, I want to define program regions (Global, North America, etc.) so that I can target specific geographical locations.

**Priority:** P1 (Should Have)
**Estimate:** 3 points

**Acceptance Criteria:**
- [ ] I can select a region from a dropdown (Global, North America, Europe, Asia Pacific, Latin America)
- [ ] If region is "Global", participants from all locations are eligible
- [ ] If region is specific, only participants from that location are eligible
- [ ] The region filter is applied before cohort-level filters
- [ ] Region is displayed on the program details page

**Technical Notes:**
- Cascading filter implementation (Level 1)
- Regions stored as enum or string

**Dependencies:** None

---

##### Story 4: Set Employee Start Date Filters

**As an Admin**, I want to set employee start date filters for cohorts so that participants are automatically assigned based on their hire date.

**Priority:** P0 (Must Have)
**Estimate:** 8 points

**Acceptance Criteria:**
- [ ] I can set a "from" date and/or "to" date for employee start dates
- [ ] I can use a date range picker to select dates
- [ ] Participants with hire dates within the range are automatically enrolled
- [ ] Participants with hire dates outside the range are excluded
- [ ] Participants without hire dates are excluded if filters are set
- [ ] The date filter is applied in addition to region filters
- [ ] Date comparisons use local timezone to avoid off-by-one errors

**Technical Notes:**
- `parseLocalDate` utility for timezone-safe comparisons
- DateRangePicker component with auto-positioning
- Frontend and backend filtering consistency

**Dependencies:** None

**Known Issues:**
- ✅ RESOLVED: Timezone boundary bug (Sept 30 vs Oct 1) - fixed with parseLocalDate

---

##### Story 5: Edit Programs and Add Cohorts

**As an Admin**, I want to edit existing programs and add new cohorts so that I can scale training as needed.

**Priority:** P1 (Should Have)
**Estimate:** 13 points

**Acceptance Criteria:**
- [ ] I can click "Edit" on an existing program
- [ ] The program wizard opens with existing data pre-filled
- [ ] I can increase the number of cohorts in Step 6
- [ ] Step 7 automatically adds new cohort configuration forms
- [ ] I can configure new cohorts with names, dates, and filters
- [ ] Saving creates the new cohorts in the database
- [ ] New cohorts appear in the cohorts list
- [ ] Existing cohorts are not affected

**Technical Notes:**
- Program update API with cohort detection
- useEffect dependency on numberOfCohorts to dynamically update forms
- Cohort comparison by name to identify new cohorts

**Dependencies:** Story 1, Story 2

---

##### Story 6: Archive Programs

**As an Admin**, I want to archive completed programs so that I can keep the active list clean.

**Priority:** P2 (Nice to Have)
**Estimate:** 5 points

**Acceptance Criteria:**
- [ ] I can click "Archive" on a program from the programs list
- [ ] I receive a confirmation dialog before archiving
- [ ] Archived programs are hidden from the default programs list
- [ ] I can view archived programs using a filter/toggle
- [ ] I can unarchive programs if needed
- [ ] Cohorts and sessions remain intact when archived

**Technical Notes:**
- Add `archived` boolean field to Program model
- Filter active programs by default
- Archive toggle in UI

**Dependencies:** Story 1

**Status:** Not Implemented

---

#### Scheduling & Assignment

##### Story 7: Schedule Sessions

**As an Admin**, I want to schedule sessions with specific dates and times so that participants know when to attend.

**Priority:** P0 (Must Have)
**Estimate:** 5 points

**Acceptance Criteria:**
- [ ] I can set start date and time for each session
- [ ] I can set duration in minutes
- [ ] End time is automatically calculated based on duration
- [ ] Sessions are displayed in chronological order
- [ ] I can see session dates in both list and calendar views
- [ ] Dates display correctly in my local timezone

**Technical Notes:**
- DateTime picker in wizard
- `formatDateTime` utility for consistent display
- Automatic end time calculation

**Dependencies:** None

---

##### Story 8: Assign Facilitators

**As an Admin**, I want to assign facilitators to sessions so that each session has an instructor.

**Priority:** P0 (Must Have)
**Estimate:** 8 points

**Acceptance Criteria:**
- [ ] I can select facilitators from a dropdown of available facilitators
- [ ] Facilitator options are filtered by required skills for the session
- [ ] I can see facilitator names and emails in the dropdown
- [ ] Assigned facilitators appear in the session details
- [ ] I receive a warning if a session doesn't have a facilitator assigned
- [ ] I can change facilitator assignments after initial creation

**Technical Notes:**
- Facilitator skills matching algorithm
- Visual indicators for unassigned sessions

**Dependencies:** Story 22

---

##### Story 9: Assign Locations

**As an Admin**, I want to assign locations (physical or virtual) to sessions so that participants know where to attend.

**Priority:** P0 (Must Have)
**Estimate:** 8 points

**Acceptance Criteria:**
- [ ] I can select locations from a dropdown of available locations
- [ ] Location options are filtered by required location types for the session
- [ ] I can see location name, type, and capacity in the dropdown
- [ ] Assigned locations appear in the session details
- [ ] I receive a warning if a session doesn't have a location assigned
- [ ] I receive a warning if location capacity is less than expected participants
- [ ] I can change location assignments after initial creation

**Technical Notes:**
- Location type matching
- Capacity validation

**Dependencies:** Story 25

---

##### Story 10: View Sessions in Multiple Formats

**As an Admin**, I want to view sessions in both list and calendar views so that I can see schedules in different formats.

**Priority:** P1 (Should Have)
**Estimate:** 13 points

**Acceptance Criteria:**
- [ ] I can toggle between list view and calendar view
- [ ] List view shows sessions in a table with all details
- [ ] Calendar view shows sessions grouped by date in a week-based grid
- [ ] Calendar view displays Monday through Sunday
- [ ] Sessions are color-coded by assignment status (fully assigned vs missing resources)
- [ ] I can click sessions in either view to see/edit details
- [ ] Search and filter controls are hidden in calendar view

**Technical Notes:**
- CalendarView component with week-based rendering
- Color coding: teal (complete), orange (missing resources)
- Conditional rendering for search/filter

**Dependencies:** Story 7

---

##### Story 11: Identify Scheduling Conflicts

**As an Admin**, I want to identify scheduling conflicts (missing facilitators/locations) so that I can resolve issues before training starts.

**Priority:** P0 (Must Have)
**Estimate:** 5 points

**Acceptance Criteria:**
- [ ] Sessions without facilitators are visually highlighted (orange/warning color)
- [ ] Sessions without locations are visually highlighted
- [ ] I can see a count of unassigned sessions on the cohort overview
- [ ] A warning icon appears next to sessions with missing assignments
- [ ] I can filter to show only sessions with conflicts
- [ ] Tooltip or indicator shows which resources are missing

**Technical Notes:**
- Status calculation based on facilitatorId and locationId
- Color coding in both list and calendar views
- AlertCircle icon for warnings

**Dependencies:** Story 8, Story 9

---

#### Cohort Management

##### Story 12: View All Cohorts for a Program

**As an Admin**, I want to view all cohorts for a program so that I can monitor training delivery.

**Priority:** P0 (Must Have)
**Estimate:** 3 points

**Acceptance Criteria:**
- [ ] I can access cohorts from the program details page
- [ ] All cohorts for the program are listed with key information
- [ ] I can see cohort name, start date, end date, and participant count
- [ ] I can click on a cohort to view detailed information
- [ ] Cohorts are sorted chronologically by start date
- [ ] The cohort list updates when new cohorts are added

**Technical Notes:**
- ProgramCohortsPage component
- Cohort card grid layout

**Dependencies:** Story 2

---

##### Story 13: View Cohort Progress

**As an Admin**, I want to see cohort progress and participant counts so that I can track enrollment.

**Priority:** P1 (Should Have)
**Estimate:** 5 points

**Acceptance Criteria:**
- [ ] I can see total number of participants enrolled in each cohort
- [ ] I can see cohort capacity and enrollment percentage
- [ ] I can see overall progress bar showing timeline completion
- [ ] I can see number of sessions scheduled for the cohort
- [ ] I can see cohort status (Draft, Scheduled, In Progress, Completed)
- [ ] Progress updates automatically when sessions are completed

**Technical Notes:**
- Progress calculation based on current date vs. cohort date range
- Status badge component

**Dependencies:** Story 12

---

##### Story 14: View Participant Lists

**As an Admin**, I want to view participant lists for each cohort so that I know who's enrolled.

**Priority:** P0 (Must Have)
**Estimate:** 5 points

**Acceptance Criteria:**
- [ ] I can access the participants tab on cohort details page
- [ ] All enrolled participants are listed with name, email, department, job title, and hire date
- [ ] I can search participants by name, email, department, or job title
- [ ] I can filter participants by department
- [ ] Department filters show counts for each department
- [ ] The list updates when participants are added or removed
- [ ] I can click on a participant to view their full details

**Technical Notes:**
- CohortDetailPage with tabs (Sessions, Participants)
- Search and filter with debouncing
- Department pill filters

**Dependencies:** Story 12

---

##### Story 15: Move Participants Between Cohorts

**As an Admin**, I want to move participants between cohorts so that I can accommodate schedule changes.

**Priority:** P1 (Should Have)
**Estimate:** 8 points

**Acceptance Criteria:**
- [ ] I can click on a participant to open their detail drawer
- [ ] I can select "Move to Another Cohort" from the drawer
- [ ] I can choose a destination cohort from all available cohorts (including different programs)
- [ ] I receive confirmation before the move is executed
- [ ] The participant is removed from the current cohort and added to the destination cohort
- [ ] The cohort participant counts update immediately
- [ ] I receive success confirmation after the move

**Technical Notes:**
- ParticipantDetailDrawer component
- Backend cohortEnrollment API
- Prisma transaction for atomic move

**Dependencies:** Story 14

---

##### Story 16: Remove Participants from Cohorts

**As an Admin**, I want to remove participants from cohorts so that I can handle withdrawals.

**Priority:** P1 (Should Have)
**Estimate:** 5 points

**Acceptance Criteria:**
- [ ] I can click on a participant to open their detail drawer
- [ ] I can select "Remove from Cohort"
- [ ] I receive a confirmation dialog before removal
- [ ] The participant is removed from the cohort enrollment
- [ ] The participant remains in the system (not deleted)
- [ ] The cohort participant count decreases by one
- [ ] I receive success confirmation after removal

**Technical Notes:**
- Delete CohortParticipant record only
- Confirmation modal before destructive action

**Dependencies:** Story 14

---

#### Participant Management

##### Story 17: View All Participants

**As an Admin**, I want to view all participants in the system so that I can see who's available for training.

**Priority:** P0 (Must Have)
**Estimate:** 5 points

**Acceptance Criteria:**
- [ ] I can access the Participants page from the main navigation
- [ ] All participants are listed in a table format
- [ ] I can see first name, last name, email, department, job title, location, and hire date
- [ ] The list is paginated for performance
- [ ] Participant count is displayed
- [ ] The list loads within 2 seconds

**Technical Notes:**
- ParticipantsPage component
- Server-side pagination
- TanStack Query for data fetching

**Dependencies:** None

---

##### Story 18: Search and Filter Participants

**As an Admin**, I want to search and filter participants by name, email, department, job title, and hire date so that I can find specific people.

**Priority:** P0 (Must Have)
**Estimate:** 8 points

**Acceptance Criteria:**
- [ ] I can enter text in a search box to search across name, email, department, and job title
- [ ] Search results update as I type (debounced)
- [ ] I can filter by department using a dropdown
- [ ] I can filter by location
- [ ] I can filter by hire date range
- [ ] Multiple filters can be applied simultaneously
- [ ] I can clear all filters to see the full list again
- [ ] Filtered participant count is displayed

**Technical Notes:**
- Debounced search input
- Query parameter updates for filters
- Backend search implementation

**Dependencies:** Story 17

**Status:** Partial - Search implemented, date range filter not yet implemented

---

##### Story 19: View Participant Training History

**As an Admin**, I want to view a participant's training history (which cohorts they're in) so that I can track their development.

**Priority:** P1 (Should Have)
**Estimate:** 8 points

**Acceptance Criteria:**
- [ ] I can click on a participant to open their detail drawer
- [ ] The drawer has a "Sessions" tab showing all cohorts they're enrolled in
- [ ] I can see program name, cohort name, and all scheduled sessions
- [ ] Sessions are listed chronologically
- [ ] I can see session status (scheduled/completed)
- [ ] I can see session dates and times
- [ ] The session count is displayed in the tab header

**Technical Notes:**
- ParticipantDetailDrawer with tabs
- Query to fetch cohort with schedules
- Chronological sorting

**Dependencies:** Story 17

---

##### Story 20: Manually Add Participants

**As an Admin**, I want to manually add individual participants so that I can handle one-off additions.

**Priority:** P0 (Must Have)
**Estimate:** 5 points

**Acceptance Criteria:**
- [ ] I can click "Add Participant" from the Participants page
- [ ] A modal/form opens with fields for all participant information
- [ ] Required fields are: first name, last name, email
- [ ] Optional fields are: department, job title, location, hire date
- [ ] Email validation ensures proper format
- [ ] I receive an error if email already exists
- [ ] The new participant appears in the list immediately after saving
- [ ] I receive success confirmation

**Technical Notes:**
- AddParticipantModal component
- React Hook Form with Zod validation
- Mutation with cache invalidation

**Dependencies:** Story 17

---

##### Story 21: Import Participants via CSV

**As an Admin**, I want to import participants via CSV so that I can quickly bulk-add people.

**Priority:** P0 (Must Have)
**Estimate:** 13 points

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

**Technical Notes:**
- CSV parsing with Papa Parse or similar
- Backend batch import endpoint
- Error handling for duplicates

**Dependencies:** Story 17

---

#### User Management

##### Story 22: Create Facilitator Accounts

**As an Admin**, I want to create facilitator accounts so that instructors can be assigned to sessions.

**Priority:** P0 (Must Have)
**Estimate:** 8 points

**Acceptance Criteria:**
- [ ] I can click "Add User" from the Users page
- [ ] I can select "Facilitator" as the role
- [ ] I can enter name, email, and initial password
- [ ] I can specify facilitator qualifications/skills
- [ ] Email validation ensures proper format
- [ ] I receive an error if email already exists
- [ ] The facilitator appears in the users list and is available for session assignment
- [ ] I receive success confirmation

**Technical Notes:**
- User and Facilitator models in Prisma
- Password hashing with bcrypt
- Skills stored as string array

**Dependencies:** None

---

##### Story 23: Create HR User Accounts

**As an Admin**, I want to create HR user accounts so that they can add participants.

**Priority:** P1 (Should Have)
**Estimate:** 5 points

**Acceptance Criteria:**
- [ ] I can click "Add User" from the Users page
- [ ] I can select "HR" as the role
- [ ] I can enter name, email, and initial password
- [ ] Email validation ensures proper format
- [ ] I receive an error if email already exists
- [ ] The HR user can log in and access only the Participants page
- [ ] I receive success confirmation

**Technical Notes:**
- Role-based routing
- HR users restricted to Participants page

**Dependencies:** None

**Status:** Not Implemented - Authentication not yet built

---

##### Story 24: View All Users and Roles

**As an Admin**, I want to view all users and their roles so that I can manage system access.

**Priority:** P1 (Should Have)
**Estimate:** 5 points

**Acceptance Criteria:**
- [ ] I can access the Users page from the main navigation
- [ ] All users are listed with name, email, and role
- [ ] I can filter users by role (Admin, HR, Facilitator)
- [ ] I can search users by name or email
- [ ] User count is displayed
- [ ] I can click on a user to edit their details
- [ ] I can deactivate/delete users if needed

**Technical Notes:**
- UsersPage component
- Role badge component

**Dependencies:** None

---

#### Location Management

##### Story 25: Add Training Locations

**As an Admin**, I want to add training locations with capacity limits so that I can manage training spaces.

**Priority:** P0 (Must Have)
**Estimate:** 5 points

**Acceptance Criteria:**
- [ ] I can click "Add Location" from the Locations page
- [ ] I can enter location name (required)
- [ ] I can enter address (optional)
- [ ] I can set capacity (required, must be a positive number)
- [ ] I can specify equipment available at the location
- [ ] Name validation prevents duplicates
- [ ] The location appears in the list immediately after saving
- [ ] I receive success confirmation

**Technical Notes:**
- AddLocationModal component
- Location model with equipment as string array

**Dependencies:** None

---

##### Story 26: Specify Location Types

**As an Admin**, I want to specify location types (Physical, Virtual, Classroom) so that scheduling is clear.

**Priority:** P1 (Should Have)
**Estimate:** 3 points

**Acceptance Criteria:**
- [ ] I can select location type from a dropdown when creating a location
- [ ] Available types include: Physical, Virtual, Classroom, Conference Room, Lab
- [ ] Location type is displayed in the locations list
- [ ] I can filter locations by type
- [ ] Location type helps with session assignment matching

**Technical Notes:**
- Location type enum or string
- Type-based filtering

**Dependencies:** Story 25

---

##### Story 27: View All Locations

**As an Admin**, I want to view all available locations so that I can assign them to sessions.

**Priority:** P0 (Must Have)
**Estimate:** 3 points

**Acceptance Criteria:**
- [ ] I can access the Locations page from the main navigation
- [ ] All locations are listed with name, type, capacity, and address
- [ ] I can search locations by name
- [ ] I can filter locations by type
- [ ] Location count is displayed
- [ ] I can click on a location to edit its details
- [ ] The list updates when locations are added or modified

**Technical Notes:**
- LocationsPage component
- Search and type filter

**Dependencies:** None

---

### HR User Stories

##### Story 28: View All Participants

**As an HR user**, I want to view all participants in the system so that I can see who's already added.

**Priority:** P0 (Must Have)
**Estimate:** 2 points

**Acceptance Criteria:**
- [ ] I can access the Participants page (only page available to HR users)
- [ ] All participants are listed with full details
- [ ] I can see participant count
- [ ] The interface is the same as for Admin users

**Technical Notes:**
- Same ParticipantsPage component
- Role-based navigation restriction

**Dependencies:** Story 17

**Status:** Not Implemented - Authentication/authorization not yet built

---

##### Story 29: Add New Participants

**As an HR user**, I want to add new participants with their details so that they're available for training.

**Priority:** P0 (Must Have)
**Estimate:** 3 points

**Acceptance Criteria:**
- [ ] I can click "Add Participant"
- [ ] A form opens with all participant fields
- [ ] Required fields: first name, last name, email
- [ ] Optional fields: department, job title, location, hire date
- [ ] Email validation prevents duplicates
- [ ] The participant is saved to the database
- [ ] I receive success confirmation
- [ ] The participant appears in the list immediately

**Technical Notes:**
- Same component as Story 20
- Role-based permission check on backend

**Dependencies:** Story 28

**Status:** Not Implemented - Authentication/authorization not yet built

---

##### Story 30: Import Participants via CSV

**As an HR user**, I want to import participants via CSV so that I can quickly add multiple people.

**Priority:** P0 (Must Have)
**Estimate:** 2 points

**Acceptance Criteria:**
- [ ] I can click "Import CSV"
- [ ] I can upload a CSV file with participant data
- [ ] The system validates the CSV format
- [ ] I can preview the data before importing
- [ ] Duplicate emails are handled gracefully
- [ ] I receive import summary with success/error counts
- [ ] New participants appear in the list after import

**Technical Notes:**
- Same component as Story 21
- Role-based permission check on backend

**Dependencies:** Story 29

**Status:** Not Implemented - Authentication/authorization not yet built

---

##### Story 31: Search for Participants

**As an HR user**, I want to search for participants by name or email so that I can verify if someone is already in the system.

**Priority:** P0 (Must Have)
**Estimate:** 1 point

**Acceptance Criteria:**
- [ ] I can use the search box to find participants
- [ ] Search works across name and email fields
- [ ] Results update as I type
- [ ] Search is case-insensitive
- [ ] I can clear the search to see all participants

**Technical Notes:**
- Same search as Story 18

**Dependencies:** Story 28

**Status:** Not Implemented - Authentication/authorization not yet built

---

##### Story 32: Edit Participant Details

**As an HR user**, I want to edit participant details so that I can keep information up to date.

**Priority:** P1 (Should Have)
**Estimate:** 3 points

**Acceptance Criteria:**
- [ ] I can click on a participant to open their details
- [ ] I can edit all participant fields except email (unique identifier)
- [ ] Changes are saved to the database
- [ ] The list updates immediately with the new information
- [ ] I receive success confirmation

**Technical Notes:**
- Edit participant modal
- Update mutation

**Dependencies:** Story 28

**Status:** Not Implemented - Authentication/authorization not yet built

---

### Facilitator User Stories

##### Story 33: View Assigned Sessions

**As a Facilitator**, I want to see which sessions I'm assigned to so that I know my schedule.

**Priority:** P0 (Must Have)
**Estimate:** 8 points

**Acceptance Criteria:**
- [ ] I can access a My Sessions page or dashboard
- [ ] All sessions where I'm the assigned facilitator are listed
- [ ] I can see session name, date, time, location, and cohort
- [ ] Sessions are listed in chronological order
- [ ] Upcoming sessions are highlighted or separated from past sessions
- [ ] I can see session count

**Technical Notes:**
- Filter schedules by facilitatorId
- Dashboard or dedicated page for facilitators

**Dependencies:** Story 8

**Status:** Not Implemented - Facilitator views not yet built

---

##### Story 34: View Participant Lists

**As a Facilitator**, I want to view participant lists for my sessions so that I know who to expect.

**Priority:** P0 (Must Have)
**Estimate:** 5 points

**Acceptance Criteria:**
- [ ] I can click on a session to view details
- [ ] A participant list shows all enrolled participants for that cohort
- [ ] I can see participant names, emails, and departments
- [ ] I can see participant count
- [ ] The list is searchable
- [ ] I can filter by department

**Technical Notes:**
- SessionEditDrawer accessible to facilitators
- Participants tab in drawer

**Dependencies:** Story 33

**Status:** Partial - UI exists but not restricted to facilitator's assigned sessions

---

##### Story 35: Track Attendance

**As a Facilitator**, I want to track attendance for participants so that I can record who attended.

**Priority:** P0 (Must Have)
**Estimate:** 8 points

**Acceptance Criteria:**
- [ ] I can access an attendance view for each session
- [ ] Each participant has a checkbox to mark as present/absent
- [ ] I can select/deselect all participants at once
- [ ] I can save attendance records
- [ ] Attendance status is preserved when I navigate away and come back
- [ ] I can see attendance counts (X of Y attended)

**Technical Notes:**
- Attendance state management
- Backend API for saving attendance

**Dependencies:** Story 34

**Status:** Partial - UI exists but backend persistence not implemented

---

##### Story 36: Export Attendance to CSV

**As a Facilitator**, I want to export attendance to CSV so that I can maintain records.

**Priority:** P1 (Should Have)
**Estimate:** 3 points

**Acceptance Criteria:**
- [ ] I can click "Export Attendance" for a session
- [ ] A CSV file is downloaded to my computer
- [ ] The CSV includes: participant name, email, department, job title, attendance status
- [ ] The filename includes session name and date
- [ ] The export includes all participants (not just those present)

**Technical Notes:**
- CSV generation in frontend
- Blob download

**Dependencies:** Story 35

**Status:** Implemented in SessionEditDrawer

---

##### Story 37: See Session Details

**As a Facilitator**, I want to see session details (date, time, location) so that I know where and when to be.

**Priority:** P0 (Must Have)
**Estimate:** 3 points

**Acceptance Criteria:**
- [ ] I can view session date and time in my local timezone
- [ ] I can see full location details (name, address, type, equipment)
- [ ] I can see session duration
- [ ] I can see program and cohort name for context
- [ ] I can see any special requirements or materials needed
- [ ] I can view this information on mobile devices

**Technical Notes:**
- Responsive session detail view
- formatDateTime for timezone handling

**Dependencies:** Story 33

**Status:** Partial - Session details visible but not mobile-optimized

---

## Technical Architecture

### Tech Stack

#### Frontend
- **Framework:** React 18+ with TypeScript
- **Build Tool:** Vite
- **State Management:** Zustand (global state), React Query (server state)
- **Routing:** React Router v6
- **UI Components:** Radix UI (accessible primitives)
- **Styling:** Tailwind CSS with custom design tokens
- **Forms:** React Hook Form + Zod validation
- **Data Fetching:** TanStack Query (React Query)
- **Date Handling:** date-fns with custom timezone-safe utilities
- **Testing:** Vitest + Testing Library
- **Package Manager:** pnpm

#### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** Auth0 or JWT (planned, not implemented)
- **Password Hashing:** bcrypt
- **Validation:** Zod
- **CORS:** cors middleware with origin whitelisting

#### Database Schema

**Core Entities:**
- **Program:** Training program template
- **Session:** Individual session within a program
- **Cohort:** Program instance with participants
- **Participant:** Individuals attending training
- **Facilitator:** Training instructors
- **Location:** Training spaces (physical/virtual)
- **User:** System users with roles
- **Schedule:** Links sessions, cohorts, facilitators, locations
- **CohortParticipant:** Many-to-many enrollment relationship

**Key Relationships:**
- Program → many Sessions
- Program → many Cohorts
- Cohort ↔ many Participants (via CohortParticipant)
- Schedule: Session + Cohort + Facilitator + Location

#### Deployment Architecture

**Infrastructure:**
- **Hosting:** Render (Platform-as-a-Service)
- **Database:** Render PostgreSQL (free tier, 90-day limit)
- **Frontend:** Static site deployment
- **Backend:** Node.js web service
- **CI/CD:** GitHub integration with auto-deploy

**URLs:**
- Frontend: https://tms-frontend-nnh5.onrender.com
- Backend API: https://tms-backend-pbto.onrender.com

**Environment Variables:**
- `DATABASE_URL`: PostgreSQL connection string
- `ALLOWED_ORIGINS`: Frontend URL for CORS
- `VITE_API_URL`: Backend URL for frontend API calls
- `PORT`: Server port (10000 for backend)
- `NODE_ENV`: Environment (production/development)

---

## Security Architecture

### Overview

The TMS handles sensitive employee data (PII) and must meet enterprise security standards for organizations with 100,000+ users. Security is a foundational requirement for Release 1.0.

---

### Authentication & Authorization

#### Single Sign-On (SSO)

**Protocols Supported:**
- **SAML 2.0** - Primary protocol for enterprise customers
- **OAuth 2.0 / OpenID Connect (OIDC)** - Modern protocol for cloud-native identity providers

**Supported Identity Providers:**
- Microsoft Azure Active Directory
- Okta
- Ping Identity
- OneLogin
- Generic SAML 2.0 and OIDC providers

**Implementation:**
- **Library:** Passport.js with passport-saml and passport-openidconnect strategies
- **Session Management:** Secure HTTP-only cookies with Redis session store
- **Token Handling:** JWT access tokens (15-minute expiry), refresh tokens (7-day expiry)
- **User Provisioning:** Just-in-Time (JIT) provisioning - create user on first login
- **Role Mapping:** Map IdP groups/claims to TMS roles (Admin, HR, Facilitator)

**Configuration:**
```typescript
// Example SAML configuration
{
  entryPoint: 'https://login.microsoftonline.com/{tenant}/saml2',
  issuer: 'urn:tms:app',
  cert: process.env.SAML_CERT,
  callbackUrl: 'https://tms.company.com/auth/saml/callback',
  identifierFormat: 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress'
}
```

---

#### Role-Based Access Control (RBAC)

**Roles & Permissions:**

| Role | Permissions |
|------|------------|
| **Admin/Coordinator** | Full system access: Programs, Cohorts, Schedules, Participants, Facilitators, Locations, Users |
| **HR** | Participants only: View, Create, Edit, Import CSV |
| **Facilitator** | Read-only: View assigned sessions, View participant lists, Track attendance (own sessions only) |

**Implementation:**
- **Backend Middleware:** Role check on every protected route
- **Frontend Guards:** Route guards in React Router, conditional UI rendering
- **Database-Level:** Row-level security in PostgreSQL (future enhancement)

**Example Middleware:**
```typescript
const requireRole = (roles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
};

// Usage
router.post('/api/programs', requireRole(['ADMIN']), createProgram);
router.get('/api/participants', requireRole(['ADMIN', 'HR']), getParticipants);
```

---

#### Session Management

**Security Features:**
- **Session Storage:** Redis for distributed session management (supports horizontal scaling)
- **Session Duration:** 8 hours active, 24 hours idle timeout
- **Secure Cookies:** `httpOnly`, `secure`, `sameSite: 'strict'`
- **Session Fixation Prevention:** Regenerate session ID on login
- **Concurrent Session Limits:** Max 3 active sessions per user
- **Logout:** Server-side session destruction + client-side token clearing

**Example Configuration:**
```typescript
app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: true, // HTTPS only
    sameSite: 'strict',
    maxAge: 8 * 60 * 60 * 1000 // 8 hours
  }
}));
```

---

### Data Security

#### Encryption

**Data at Rest:**
- **Database Encryption:** PostgreSQL encryption at rest (AES-256)
- **Backup Encryption:** Encrypted database backups
- **Sensitive Fields:** Additional application-level encryption for PII (SSN, if stored)
- **Key Management:** AWS KMS or HashiCorp Vault for encryption key rotation

**Data in Transit:**
- **TLS 1.3 Only:** Minimum TLS version enforced
- **Certificate Management:** Let's Encrypt with auto-renewal
- **HSTS:** HTTP Strict Transport Security enabled (max-age: 31536000)
- **Certificate Pinning:** Mobile apps (future) will use cert pinning

**Configuration:**
```typescript
const httpsOptions = {
  minVersion: 'TLSv1.3',
  ciphers: 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256',
  honorCipherOrder: true
};
```

---

#### Password Security (Fallback Authentication)

**For Admin Accounts (SSO unavailable scenarios):**
- **Hashing:** bcrypt with work factor 12
- **Password Requirements:**
  - Minimum 12 characters
  - At least one uppercase, lowercase, number, special character
  - No dictionary words or common patterns
  - Cannot reuse last 5 passwords
- **Password Reset:** Time-limited tokens (1 hour expiry), sent via secure email
- **Failed Login Protection:** Account lockout after 5 failed attempts (15-minute lockout)

**Implementation:**
```typescript
// Password hashing
const hashedPassword = await bcrypt.hash(password, 12);

// Password validation (Zod schema)
const passwordSchema = z.string()
  .min(12)
  .regex(/[A-Z]/, 'Must contain uppercase')
  .regex(/[a-z]/, 'Must contain lowercase')
  .regex(/[0-9]/, 'Must contain number')
  .regex(/[^A-Za-z0-9]/, 'Must contain special character');
```

---

### Application Security

#### Input Validation & Sanitization

**Defense Against Injection Attacks:**
- **SQL Injection:** Prisma ORM uses parameterized queries (prevents SQL injection)
- **NoSQL Injection:** Input validation with Zod schemas on all endpoints
- **XSS (Cross-Site Scripting):**
  - React escapes output by default
  - Sanitize HTML content with DOMPurify (if rich text added)
  - Content Security Policy (CSP) headers
- **Command Injection:** Never execute shell commands with user input

**CSP Header Example:**
```typescript
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;"
  );
  next();
});
```

**Input Validation:**
```typescript
// Example: Validate program creation input
const createProgramSchema = z.object({
  name: z.string().min(1).max(200).trim(),
  region: z.enum(['Global', 'North America', 'Europe', 'Asia Pacific', 'Latin America']),
  description: z.string().max(2000).optional(),
  sessions: z.array(z.object({
    name: z.string().min(1).max(200),
    duration: z.number().int().min(15).max(480)
  }))
});
```

---

#### CSRF Protection

**Implementation:**
- **CSRF Tokens:** Generate unique tokens per session
- **Cookie-based:** Store token in cookie, validate in request header
- **SameSite Cookies:** Set `sameSite: 'strict'` to prevent CSRF

**Library:** `csurf` middleware for Express

```typescript
import csrf from 'csurf';
const csrfProtection = csrf({ cookie: true });

app.use(csrfProtection);

// Frontend sends token in header
axios.defaults.headers.common['X-CSRF-Token'] = csrfToken;
```

---

#### CORS Security

**Current Implementation:**
- Whitelist allowed origins via `ALLOWED_ORIGINS` environment variable
- Automatic `https://` prepending to prevent misconfiguration

**Enhanced Configuration:**
```typescript
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  maxAge: 86400 // 24 hours
};
```

---

#### Rate Limiting & DDoS Protection

**Implementation:**
- **Library:** `express-rate-limit` for API rate limiting
- **Rate Limits:**
  - Authentication endpoints: 5 requests per 15 minutes per IP
  - API endpoints: 100 requests per 15 minutes per user
  - Public endpoints: 50 requests per 15 minutes per IP
- **DDoS Mitigation:** Cloudflare or AWS Shield for network-level protection

**Example:**
```typescript
import rateLimit from 'express-rate-limit';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: 'Too many login attempts, please try again later'
});

app.use('/auth/login', authLimiter);

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/', apiLimiter);
```

---

### Audit Logging & Monitoring

#### Security Audit Log

**Events to Log:**
- Authentication: Login, logout, failed login attempts
- Authorization: Permission denied events
- Data Access: Sensitive data queries (participant PII, user data)
- Data Modification: Create, update, delete operations on critical entities
- Administrative Actions: User creation, role changes, program deletion
- Security Events: Password changes, session termination, suspicious activity

**Log Format:**
```json
{
  "timestamp": "2025-10-08T14:32:11Z",
  "eventType": "DATA_MODIFICATION",
  "action": "UPDATE_PARTICIPANT",
  "userId": "user-123",
  "userEmail": "admin@company.com",
  "userRole": "ADMIN",
  "resourceType": "Participant",
  "resourceId": "participant-456",
  "changes": {
    "department": { "old": "Engineering", "new": "Sales" }
  },
  "ipAddress": "192.168.1.100",
  "userAgent": "Mozilla/5.0...",
  "status": "SUCCESS"
}
```

**Storage:**
- **Short-term:** PostgreSQL audit table (90 days)
- **Long-term:** AWS CloudWatch Logs or Splunk (7 years for compliance)

**Implementation:**
```typescript
async function auditLog(event: AuditEvent) {
  await prisma.auditLog.create({
    data: {
      timestamp: new Date(),
      eventType: event.type,
      action: event.action,
      userId: event.userId,
      details: event.details,
      ipAddress: event.ipAddress
    }
  });
}
```

---

#### Security Monitoring

**Real-Time Alerts:**
- Failed login threshold exceeded (5+ failures in 5 minutes)
- Privilege escalation attempts
- Unusual data access patterns (mass export, off-hours access)
- Authentication anomalies (impossible travel, new device)

**Tools:**
- **SIEM Integration:** Splunk, Datadog Security Monitoring
- **Alerting:** PagerDuty, Slack webhooks
- **Log Aggregation:** ELK Stack (Elasticsearch, Logstash, Kibana)

---

### Compliance & Privacy

#### Data Privacy (GDPR, CCPA)

**Requirements:**
- **Data Minimization:** Only collect necessary participant data
- **Right to Access:** API endpoint for users to export their data
- **Right to Deletion:** Hard delete participant data on request (after 30-day grace period)
- **Data Retention:** Configurable retention policies (default: 7 years)
- **Consent Management:** Track consent for data processing (if required)

**Implementation:**
```typescript
// Export user data
router.get('/api/participants/:id/export', async (req, res) => {
  const data = await prisma.participant.findUnique({
    where: { id: req.params.id },
    include: { cohorts: true, sessions: true }
  });
  res.json(data);
});

// Delete user data
router.delete('/api/participants/:id/gdpr-delete', async (req, res) => {
  await prisma.participant.delete({ where: { id: req.params.id } });
  await auditLog({ type: 'GDPR_DELETION', userId: req.params.id });
  res.json({ success: true });
});
```

---

#### SOC 2 Type II Compliance (Future)

**Control Categories:**
- **Security:** Access controls, encryption, monitoring
- **Availability:** Uptime SLA (99.9%), disaster recovery
- **Confidentiality:** NDA agreements, data classification
- **Processing Integrity:** Input validation, error handling
- **Privacy:** GDPR/CCPA compliance, consent management

**Requirements:**
- Annual third-party audit
- Penetration testing (quarterly)
- Vulnerability scanning (continuous)
- Security awareness training for team

---

### Vulnerability Management

#### Dependency Scanning

**Tools:**
- **npm audit:** Run on every build
- **Snyk:** Continuous dependency monitoring
- **Dependabot:** Automated security updates

**Process:**
- Critical vulnerabilities: Patch within 24 hours
- High vulnerabilities: Patch within 7 days
- Medium/Low vulnerabilities: Patch within 30 days

**CI/CD Integration:**
```bash
# Fail build on high/critical vulnerabilities
npm audit --audit-level=high
```

---

#### Penetration Testing

**Schedule:**
- **Pre-Release:** Full penetration test before launch
- **Quarterly:** External penetration tests by certified firm
- **Annual:** Comprehensive security audit

**Scope:**
- Authentication and authorization bypass
- Injection attacks (SQL, XSS, CSRF)
- Privilege escalation
- Data exposure vulnerabilities
- Infrastructure security

---

#### Security Headers

**Implemented Headers:**
```typescript
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  next();
});
```

---

### Incident Response

#### Security Incident Response Plan

**Phases:**
1. **Detection:** Automated monitoring + manual reports
2. **Containment:** Isolate affected systems, revoke compromised credentials
3. **Investigation:** Root cause analysis, affected user identification
4. **Eradication:** Patch vulnerabilities, remove malicious access
5. **Recovery:** Restore services, validate security controls
6. **Post-Incident:** Document lessons learned, update procedures

**Communication:**
- **Internal:** Engineering, Security, Management (within 1 hour)
- **External:** Affected users (within 72 hours if PII breach, per GDPR)
- **Regulatory:** Notify authorities if required by law

**Contacts:**
- Security Team: security@company.com
- On-Call Engineer: PagerDuty rotation
- Legal: legal@company.com

---

### Security Checklist (Release 1.0)

**Pre-Release Requirements:**

- [ ] **Authentication:** SSO implemented (SAML 2.0 + OIDC)
- [ ] **Authorization:** RBAC enforced on all routes
- [ ] **Session Management:** Redis sessions with secure cookies
- [ ] **Encryption:** TLS 1.3, database encryption at rest
- [ ] **Input Validation:** Zod schemas on all API endpoints
- [ ] **CSRF Protection:** CSRF tokens on state-changing requests
- [ ] **Rate Limiting:** Authentication (5/15min), API (100/15min)
- [ ] **Audit Logging:** All security events logged
- [ ] **Security Headers:** All recommended headers implemented
- [ ] **Dependency Scanning:** No high/critical vulnerabilities
- [ ] **Penetration Testing:** External pentest completed and findings remediated
- [ ] **Incident Response Plan:** Documented and team trained
- [ ] **Data Privacy:** GDPR/CCPA compliance (export, delete endpoints)
- [ ] **Password Security:** bcrypt (work factor 12), lockout after 5 failures
- [ ] **Monitoring:** Real-time alerts for security events

---

## Scalability & Performance

### Overview

The TMS must scale to support organizations with **100,000+ users** (participants + coordinators + facilitators) running **hundreds of concurrent training programs** with **thousands of cohorts**.

---

### Database Optimization

#### Indexing Strategy

**Current Indexes (via Prisma):**
- Primary keys (id) on all tables
- Unique constraints (email fields)

**Additional Indexes Required:**

```prisma
model Participant {
  @@index([email])
  @@index([hireDate])
  @@index([location])
  @@index([department])
}

model Schedule {
  @@index([cohortId])
  @@index([facilitatorId])
  @@index([locationId])
  @@index([scheduledAt])
}

model CohortParticipant {
  @@index([cohortId])
  @@index([participantId])
  @@unique([cohortId, participantId]) // Composite unique
}

model Program {
  @@index([region])
  @@index([createdAt])
}

model User {
  @@index([email])
  @@index([role])
}
```

**Composite Indexes:**
```prisma
model Schedule {
  @@index([cohortId, scheduledAt]) // Common query pattern
}

model Participant {
  @@index([location, hireDate]) // Participant filtering
}
```

**Benefits:**
- Participant search by email: O(log n) instead of O(n)
- Date range filtering: 100x faster with index on hireDate
- Cohort participant queries: Instant lookup with composite index

---

#### Connection Pooling

**Current:** Default Prisma connection pool (10 connections)

**Production Configuration:**
```typescript
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Connection string with pooling
DATABASE_URL="postgresql://user:password@host:5432/db?connection_limit=100&pool_timeout=20"
```

**External Connection Pooler: PgBouncer**
```ini
# pgbouncer.ini
[databases]
tms_db = host=postgres-host port=5432 dbname=tms_db

[pgbouncer]
pool_mode = transaction
max_client_conn = 1000
default_pool_size = 25
reserve_pool_size = 5
reserve_pool_timeout = 3
```

**Benefits:**
- Support 1000+ concurrent API requests with 25 DB connections
- Reduce connection overhead (connection reuse)
- Prevent database connection exhaustion

---

#### Query Optimization

**Common Query Patterns:**

1. **Participant Search with Filters:**
```typescript
// BEFORE: N+1 query problem
const participants = await prisma.participant.findMany();
for (const p of participants) {
  const cohorts = await prisma.cohortParticipant.findMany({
    where: { participantId: p.id }
  });
}

// AFTER: Single query with includes
const participants = await prisma.participant.findMany({
  where: {
    hireDate: { gte: fromDate, lte: toDate },
    location: region
  },
  include: {
    cohorts: {
      include: { cohort: true }
    }
  },
  take: 100,
  skip: (page - 1) * 100
});
```

2. **Cohort Schedule Loading:**
```typescript
// Eager load all related data
const cohort = await prisma.cohort.findUnique({
  where: { id },
  include: {
    program: { include: { sessions: true } },
    schedules: {
      include: {
        session: true,
        facilitator: true,
        location: true
      }
    },
    participants: {
      include: { participant: true }
    }
  }
});
```

**Query Performance Targets:**
- Simple queries (by ID): < 10ms
- Filtered searches: < 100ms
- Complex joins (cohort details): < 200ms
- Paginated lists: < 150ms

---

#### Database Scaling

**Vertical Scaling (Short-term):**
- Render PostgreSQL: Free tier → Starter ($7/month) → Standard ($90/month)
- Starter: 1 vCPU, 1GB RAM, 10GB storage
- Standard: 2 vCPU, 4GB RAM, 100GB storage

**Horizontal Scaling (Long-term):**
- **Read Replicas:** Separate read-heavy queries (reports, searches)
- **Primary-Replica Setup:**
  - Primary: Write operations (create, update, delete)
  - Replica: Read operations (list, search, reports)
- **Load Balancing:** Route reads to replicas, writes to primary

```typescript
// Prisma with read replicas (future)
const readPrisma = new PrismaClient({
  datasources: { db: { url: READ_REPLICA_URL } }
});

const writePrisma = new PrismaClient({
  datasources: { db: { url: PRIMARY_URL } }
});

// Use read replica for queries
const participants = await readPrisma.participant.findMany();

// Use primary for writes
await writePrisma.participant.create({ data: {...} });
```

---

### Caching Strategy

#### Redis Caching Layer

**What to Cache:**
1. **User Sessions:** Already planned for session management
2. **Frequently Accessed Data:**
   - Program list (TTL: 5 minutes)
   - Facilitator list (TTL: 10 minutes)
   - Location list (TTL: 10 minutes)
   - Participant counts (TTL: 1 minute)
3. **Computed Data:**
   - Dashboard statistics (TTL: 15 minutes)
   - Report aggregations (TTL: 1 hour)

**Cache Implementation:**
```typescript
import Redis from 'ioredis';
const redis = new Redis(process.env.REDIS_URL);

// Cache wrapper function
async function cacheOrFetch<T>(
  key: string,
  ttl: number,
  fetchFn: () => Promise<T>
): Promise<T> {
  const cached = await redis.get(key);
  if (cached) {
    return JSON.parse(cached);
  }

  const data = await fetchFn();
  await redis.setex(key, ttl, JSON.stringify(data));
  return data;
}

// Usage
router.get('/api/programs', async (req, res) => {
  const programs = await cacheOrFetch(
    'programs:list',
    300, // 5 minutes
    async () => await prisma.program.findMany()
  );
  res.json(programs);
});
```

**Cache Invalidation:**
```typescript
// Invalidate on data change
router.post('/api/programs', async (req, res) => {
  const program = await prisma.program.create({ data: req.body });
  await redis.del('programs:list'); // Invalidate cache
  res.json(program);
});
```

**Redis Configuration:**
- **Hosting:** Render Redis (free tier) or Upstash (serverless)
- **Eviction Policy:** `allkeys-lru` (least recently used)
- **Max Memory:** 100MB (free tier) → 1GB (production)

---

#### Browser Caching

**Static Assets:**
```typescript
// Vite build configuration
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'chunks/[name]-[hash].js',
        entryFileNames: 'entries/[name]-[hash].js'
      }
    }
  }
});
```

**Cache Headers:**
```typescript
// Backend: Set cache headers for static assets
app.use('/assets', express.static('public', {
  maxAge: '1y', // 1 year for hashed assets
  immutable: true
}));

// API responses: Short cache for safe requests
app.use((req, res, next) => {
  if (req.method === 'GET') {
    res.setHeader('Cache-Control', 'private, max-age=60'); // 1 minute
  }
  next();
});
```

---

### API Performance

#### Pagination

**Already Implemented:**
```typescript
router.get('/api/participants', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 100;

  const [participants, total] = await Promise.all([
    prisma.participant.findMany({
      skip: (page - 1) * pageSize,
      take: pageSize
    }),
    prisma.participant.count()
  ]);

  res.json({ data: participants, total, page, pageSize });
});
```

**Optimization: Cursor-based Pagination (for large datasets)**
```typescript
// Better for infinite scroll, avoids offset inefficiency
router.get('/api/participants', async (req, res) => {
  const cursor = req.query.cursor;
  const pageSize = 100;

  const participants = await prisma.participant.findMany({
    take: pageSize,
    ...(cursor && { cursor: { id: cursor }, skip: 1 }),
    orderBy: { id: 'asc' }
  });

  const nextCursor = participants.length === pageSize
    ? participants[participants.length - 1].id
    : null;

  res.json({ data: participants, nextCursor });
});
```

---

#### Response Compression

**Gzip/Brotli Compression:**
```typescript
import compression from 'compression';

app.use(compression({
  level: 6, // Compression level (0-9)
  threshold: 1024, // Only compress responses > 1KB
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
}));
```

**Benefits:**
- JSON responses: 70-80% size reduction
- Faster page loads over slow networks
- Reduced bandwidth costs

---

#### Background Jobs

**Use Cases:**
- Participant enrollment (batch processing)
- Email notifications (session reminders)
- Report generation (CSV exports)
- Outlook calendar sync (async)

**Implementation: BullMQ (Redis-based job queue)**
```typescript
import { Queue, Worker } from 'bullmq';

// Create job queue
const enrollmentQueue = new Queue('participant-enrollment', {
  connection: redis
});

// Add job
await enrollmentQueue.add('enroll-cohort', {
  cohortId: 'cohort-123',
  filters: { hireDate: { gte: '2025-01-01' } }
});

// Worker to process jobs
const worker = new Worker('participant-enrollment', async (job) => {
  const { cohortId, filters } = job.data;

  const participants = await prisma.participant.findMany({
    where: filters
  });

  await prisma.cohortParticipant.createMany({
    data: participants.map(p => ({
      cohortId,
      participantId: p.id
    }))
  });

  return { enrolled: participants.length };
});
```

**Benefits:**
- Non-blocking API responses
- Retry failed jobs automatically
- Scale workers independently

---

### Frontend Performance

#### Code Splitting

**Already Implemented:** Vite automatically code-splits React components

**Lazy Loading Routes:**
```typescript
import { lazy, Suspense } from 'react';

const ProgramsPage = lazy(() => import('./pages/admin/ProgramsPage'));
const ParticipantsPage = lazy(() => import('./pages/admin/ParticipantsPage'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/admin/programs" element={<ProgramsPage />} />
        <Route path="/admin/participants" element={<ParticipantsPage />} />
      </Routes>
    </Suspense>
  );
}
```

**Benefits:**
- Initial bundle: 200KB → 80KB
- Subsequent pages load on demand
- Faster initial page load

---

#### React Query Optimization

**Already Implemented:** TanStack Query with cache

**Optimizations:**
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});

// Prefetch data on hover (faster navigation)
<Link
  to="/programs/123"
  onMouseEnter={() => {
    queryClient.prefetchQuery(['program', 123], () => fetchProgram(123));
  }}
>
  View Program
</Link>
```

---

#### Virtual Scrolling

**For Large Lists (1000+ items):**
```typescript
import { useVirtualizer } from '@tanstack/react-virtual';

function ParticipantList({ participants }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: participants.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50, // Row height
    overscan: 5
  });

  return (
    <div ref={parentRef} style={{ height: '600px', overflow: 'auto' }}>
      <div style={{ height: virtualizer.getTotalSize() }}>
        {virtualizer.getVirtualItems().map((virtualRow) => (
          <div
            key={virtualRow.index}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transform: `translateY(${virtualRow.start}px)`
            }}
          >
            {participants[virtualRow.index].name}
          </div>
        ))}
      </div>
    </div>
  );
}
```

**Benefits:**
- Render 50 rows instead of 10,000 rows
- Smooth scrolling even with massive lists

---

### Infrastructure Scaling

#### Horizontal Scaling

**Backend Services:**
- **Load Balancer:** Nginx or AWS ALB
- **Multiple Instances:** 3+ backend servers
- **Session Affinity:** Sticky sessions via Redis (not required)
- **Health Checks:** `/health` endpoint for load balancer

**Architecture:**
```
                    ┌─────────────────┐
                    │  Load Balancer  │
                    └────────┬────────┘
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
    ┌────▼─────┐       ┌────▼─────┐       ┌────▼─────┐
    │ Backend  │       │ Backend  │       │ Backend  │
    │ Server 1 │       │ Server 2 │       │ Server 3 │
    └────┬─────┘       └────┬─────┘       └────┬─────┘
         │                   │                   │
         └───────────────────┼───────────────────┘
                             │
                        ┌────▼──────┐
                        │ PostgreSQL│
                        │ + Redis   │
                        └───────────┘
```

**Render Configuration:**
- Scale instances via dashboard: 1 → 3 → 5 instances
- Auto-scaling: Based on CPU/memory usage
- Zero-downtime deployments

---

#### CDN for Static Assets

**Purpose:** Serve frontend assets from edge locations globally

**Providers:**
- Cloudflare (free tier available)
- AWS CloudFront
- Fastly

**Configuration:**
```typescript
// Vite build with CDN base URL
export default defineConfig({
  base: 'https://cdn.tms.company.com/',
  build: {
    assetsInlineLimit: 0 // Don't inline assets, serve from CDN
  }
});
```

**Benefits:**
- Faster asset loading (serve from nearest location)
- Reduced backend load
- Better global performance

---

### Performance Monitoring

#### Application Performance Monitoring (APM)

**Tools:**
- **Datadog APM:** Full-stack observability
- **New Relic:** Application performance insights
- **Sentry:** Error tracking + performance monitoring

**Metrics to Track:**
- API response times (p50, p95, p99)
- Database query durations
- Cache hit rates
- Error rates
- Frontend load times (LCP, FID, CLS)

**Example: Datadog Integration**
```typescript
import tracer from 'dd-trace';
tracer.init({
  service: 'tms-backend',
  env: 'production'
});

// Automatic instrumentation for Express, Prisma, Redis
```

---

#### Performance Targets (Release 1.0)

**Backend API:**
- p95 response time: < 200ms
- p99 response time: < 500ms
- Uptime: 99.9% (43 minutes downtime/month)
- Throughput: 1000 requests/second

**Frontend:**
- Time to Interactive (TTI): < 3 seconds
- Largest Contentful Paint (LCP): < 2.5 seconds
- First Input Delay (FID): < 100ms
- Cumulative Layout Shift (CLS): < 0.1

**Database:**
- Query time (p95): < 100ms
- Connection pool utilization: < 80%
- Cache hit rate: > 80%

---

### Scalability Checklist (Release 1.0)

- [ ] **Database Indexes:** All critical queries indexed
- [ ] **Connection Pooling:** PgBouncer configured (100 connections)
- [ ] **Redis Caching:** Session store + data caching
- [ ] **API Pagination:** Cursor-based for large datasets
- [ ] **Response Compression:** Gzip enabled
- [ ] **Background Jobs:** BullMQ for async operations
- [ ] **Rate Limiting:** API and auth endpoints protected
- [ ] **Code Splitting:** Lazy-loaded routes
- [ ] **Virtual Scrolling:** For participant/cohort lists
- [ ] **CDN:** Static assets served from edge locations
- [ ] **Horizontal Scaling:** 3+ backend instances with load balancer
- [ ] **APM:** Datadog or New Relic monitoring
- [ ] **Performance Testing:** Load testing with 10,000+ concurrent users
- [ ] **Auto-scaling:** CPU/memory-based scaling enabled

---

## Design Requirements

### Visual Design Principles

**Design System:**
- **Font:** Montserrat (headings and body)
- **Color Palette:** Warm tones, professional yet approachable
  - Primary (Teal): #0d9488
  - Secondary: Warm grays
  - Success: Green tones
  - Warning: Orange tones
  - Error: Red tones
- **Style:** Modern, elegant, clean
- **Whitespace:** Intentional spacing for breathing room
- **Visual Hierarchy:** Size, weight, color guide user attention

### Accessibility (WCAG 2.1 AA)

**Requirements:**
- Semantic HTML with proper heading hierarchy
- ARIA labels for all interactive elements
- Keyboard navigation support (tab order, focus indicators)
- Focus trapping in modals
- Screen reader compatibility
- 4.5:1 minimum color contrast
- Support browser zoom up to 200%
- No time-based interactions
- Descriptive link text
- Form labels and error messages

**Implementation:**
- Radix UI provides accessible primitives
- Focus indicators on all interactive elements
- Skip to main content link
- Alt text for images
- ARIA live regions for dynamic updates

### Responsive Design

**Breakpoints:**
- Mobile: 320px - 767px
- Tablet: 768px - 1023px
- Desktop: 1024px+

**Requirements:**
- Mobile-first approach
- Touch-friendly targets (44px minimum)
- Readable text on small screens
- Collapsible navigation on mobile
- Scrollable tables on small screens

**Status:** Desktop-first implementation, mobile optimization pending

---

### UX Patterns

#### Feedback & States

**Loading States:**
- Skeleton screens for content loading
- Spinners for action buttons
- Progress indicators for multi-step processes

**Success/Error Feedback:**
- Toast notifications for actions
- Inline validation for forms
- Error boundaries for crashes
- Detailed error messages with recovery suggestions

**Empty States:**
- Helpful guidance when no data exists
- Clear call-to-action to populate data
- Illustrations or icons for visual interest

#### Interaction Patterns

**Buttons:**
- Primary actions: Right-aligned, teal background
- Secondary actions: Outline or ghost style
- Destructive actions: Red color with confirmation
- Loading state: Disabled with spinner

**Navigation:**
- Left sidebar navigation
- Breadcrumbs for deep navigation
- Back buttons to previous pages
- Active page highlighted

**Forms:**
- Required field indicators
- Inline validation on blur
- Error messages below fields
- Help text for complex fields
- Clear button to reset

**Modals/Drawers:**
- Backdrop to focus attention
- Close on backdrop click
- Escape key to close
- Confirmation for unsaved changes

---

## Integration Requirements

### Release 1.0 Integrations

#### Microsoft Outlook (Graph API)

**Priority:** P0 (Must Have for Release)

**Purpose:** Calendar integration for training sessions

**Capabilities:**
- Create calendar invitations for sessions
- Send invitations to participants and facilitators
- Update events when schedules change
- Handle cancellations and rescheduling
- Sync facilitator availability

**Technical Approach:**
- **Authentication:** OAuth 2.0 with Microsoft Identity Platform
- **API:** Microsoft Graph API v1.0
- **Endpoints:**
  - `POST /me/events` - Create calendar event
  - `PATCH /me/events/{id}` - Update event
  - `DELETE /me/events/{id}` - Delete event
  - `POST /me/events/{id}/accept` - Accept meeting
  - `GET /me/calendar/calendarView` - Get availability
- **Background Processing:** BullMQ job queue for async calendar operations
- **Webhooks:** Microsoft Graph change notifications for real-time updates
- **Error Handling:** Retry logic for failed API calls, graceful degradation

**Implementation:**
```typescript
import { Client } from '@microsoft/microsoft-graph-client';

async function createCalendarInvite(schedule: Schedule) {
  const client = Client.init({
    authProvider: (done) => {
      done(null, accessToken);
    }
  });

  const event = {
    subject: `${schedule.session.name} - ${schedule.cohort.name}`,
    start: {
      dateTime: schedule.scheduledAt.toISOString(),
      timeZone: 'UTC'
    },
    end: {
      dateTime: addMinutes(schedule.scheduledAt, schedule.session.duration).toISOString(),
      timeZone: 'UTC'
    },
    location: {
      displayName: schedule.location.name,
      address: { street: schedule.location.address }
    },
    attendees: [
      ...schedule.cohort.participants.map(p => ({
        emailAddress: { address: p.email, name: p.name },
        type: 'required'
      })),
      {
        emailAddress: { address: schedule.facilitator.email, name: schedule.facilitator.name },
        type: 'required'
      }
    ],
    body: {
      contentType: 'HTML',
      content: schedule.session.description
    }
  };

  const createdEvent = await client.api('/me/events').post(event);

  // Store event ID for future updates/cancellations
  await prisma.schedule.update({
    where: { id: schedule.id },
    data: { outlookEventId: createdEvent.id }
  });
}
```

**User Stories:**
- As a Coordinator, I want calendar invites auto-sent when creating a program
- As a Facilitator, I want calendar updates when sessions are rescheduled
- As a Participant, I want to receive calendar invites for my training sessions

**Acceptance Criteria:**
- [ ] Calendar invites created automatically when program is published
- [ ] Invites include session name, date, time, location, description
- [ ] Facilitator and all cohort participants receive invites
- [ ] Updates propagate when schedules change (reschedule, reassign facilitator/location)
- [ ] Cancellation emails sent when sessions are deleted
- [ ] Error handling for failed API calls (retry 3 times, log failures)
- [ ] Admin dashboard shows calendar sync status per session

---

### Future Integrations (Post-Release)

#### Workday (REST API)

**Priority:** Phase 2 (Q2 2026)

**Purpose:** HRIS integration for participant data

**Capabilities:**
- Import participant data (name, email, department, location, hire date)
- Sync user data for coordinators and facilitators
- Update participant status changes
- Export training completion data
- Daily scheduled sync with manual trigger option

**Technical Approach:**
- REST API integration
- OAuth 2.0 or API key authentication
- Scheduled cron jobs
- Data mapping and transformation
- Conflict resolution (TMS as source of truth for training data)

---

#### SendGrid (Email API)

**Priority:** Phase 2 (Q2 2026)

**Purpose:** Transactional email notifications

**Capabilities:**
- Session reminders to participants
- Facilitator assignment notifications
- Schedule change alerts
- Training completion confirmations
- Attendance reports to coordinators

**Technical Approach:**
- SendGrid API
- Email templates
- Event-driven triggers
- Queued sending for performance

---

## Success Metrics

### Key Performance Indicators (KPIs)

#### Operational Efficiency

1. **Time to Create Program**
   - Current (manual): 8 hours
   - Target: 1.5 hours (80% reduction)
   - Measurement: Time from program start to first cohort scheduled

2. **Participant Assignment Time**
   - Current (manual): 5 minutes per participant × 100 = 500 minutes
   - Target: 0 minutes (fully automated)
   - Measurement: Time spent manually assigning participants

3. **Scheduling Conflict Resolution Time**
   - Target: < 5 minutes per conflict
   - Measurement: Time to identify and resolve missing facilitator/location

4. **Concurrent Programs Managed**
   - Current: 5-10 programs
   - Target: 30+ programs
   - Measurement: Number of active programs in system

#### Accuracy & Quality

5. **Participant Assignment Accuracy**
   - Target: 100% of eligible participants enrolled
   - Measurement: (Enrolled / Eligible) × 100

6. **Resource Assignment Completeness**
   - Target: 95% of sessions with facilitator + location before start date
   - Measurement: (Complete Sessions / Total Sessions) × 100

7. **Data Entry Error Rate**
   - Target: < 1% error rate
   - Measurement: Errors found / Total entries

#### Adoption & Usage

8. **User Adoption Rate**
   - Target: 90% of coordinators using system within 2 months
   - Measurement: Active users / Total coordinators

9. **Login Frequency**
   - Target: Daily logins by coordinators
   - Measurement: Average logins per user per week

10. **Feature Utilization**
    - Target: 80% of users use calendar view, CSV import, participant move features
    - Measurement: Users using feature / Total users

#### Business Impact

11. **Training Throughput**
    - Target: 3x increase in cohorts run per quarter
    - Measurement: Cohorts this quarter / Baseline cohorts

12. **Participant Satisfaction**
    - Target: 85% satisfaction with training logistics
    - Measurement: Survey responses rating logistics 4+ out of 5

13. **Administrative Cost Savings**
    - Target: $50,000 annual savings in coordinator time
    - Measurement: (Hours saved × Hourly rate)

---

### Analytics & Reporting (Future)

**Dashboard Metrics:**
- Programs created per month
- Total participants enrolled
- Sessions delivered vs. scheduled
- Facilitator utilization rate
- Location utilization rate
- Average cohort size
- Training completion rate

**Reports:**
- Participant training history
- Facilitator assignment report
- Location booking report
- Monthly training summary
- Compliance report (required training completion)

---

## Release Roadmap

### Release 1.0 (Pre-Launch Requirements)

**Target Date:** Q1 2026

**Core Features (Already Built):**
- ✅ Program creation and management
- ✅ Multi-cohort scheduling
- ✅ Participant enrollment and management
- ✅ Facilitator and location assignment
- ✅ Calendar and list views
- ✅ CSV import/export
- ✅ Attendance tracking (frontend)

**Pre-Release Requirements:**

#### Security & Authentication (P0)
- [ ] SSO implementation (SAML 2.0 + OIDC)
  - [ ] Azure AD integration
  - [ ] Okta integration
  - [ ] Generic SAML/OIDC support
- [ ] Role-based access control (RBAC) enforcement
  - [ ] Backend middleware for all routes
  - [ ] Frontend route guards
- [ ] Session management with Redis
- [ ] CSRF protection
- [ ] Rate limiting (auth + API)
- [ ] Security headers
- [ ] Audit logging
- [ ] Data privacy endpoints (GDPR export/delete)
- [ ] Password security (bcrypt, lockout)
- [ ] Penetration testing

**Estimate:** 13 weeks

---

#### Scalability & Performance (P0)
- [ ] Database indexes (all critical queries)
- [ ] Connection pooling (PgBouncer, 100 connections)
- [ ] Redis caching layer
  - [ ] Session storage
  - [ ] Data caching (programs, facilitators, locations)
- [ ] API optimizations
  - [ ] Cursor-based pagination
  - [ ] Response compression (Gzip)
- [ ] Background job queue (BullMQ)
- [ ] Frontend performance
  - [ ] Code splitting (lazy-loaded routes)
  - [ ] Virtual scrolling (large lists)
- [ ] CDN for static assets (Cloudflare)
- [ ] Horizontal scaling (3+ backend instances, load balancer)
- [ ] APM monitoring (Datadog or New Relic)
- [ ] Performance testing (10,000+ concurrent users)

**Estimate:** 8 weeks

---

#### Microsoft Outlook Integration (P0)
- [ ] OAuth 2.0 authentication
- [ ] Calendar event creation
- [ ] Send invites to participants and facilitators
- [ ] Update events on schedule changes
- [ ] Delete events on cancellation
- [ ] Sync facilitator availability
- [ ] Background job processing
- [ ] Webhook for real-time updates
- [ ] Error handling and retry logic
- [ ] Admin dashboard sync status

**Estimate:** 5 weeks

---

#### Additional Pre-Launch Work
- [ ] Attendance persistence to backend
- [ ] HR and Facilitator user views (role-specific dashboards)
- [ ] Mobile optimization (responsive design)
- [ ] Load testing and optimization
- [ ] Documentation (user guides, admin guides)
- [ ] Training videos for admins
- [ ] Production infrastructure setup
- [ ] Disaster recovery plan
- [ ] Incident response plan documentation

**Estimate:** 8 weeks

---

**Total Pre-Launch Estimate:** 34 weeks (~8 months)

**Launch Blockers:**
- All P0 items in Security & Authentication
- All P0 items in Scalability & Performance
- Microsoft Outlook Integration complete
- Penetration testing passed with no high/critical findings
- Load testing passed (10,000 concurrent users, p95 < 200ms)
- SOC 2 audit initiated (if required by customers)

---

## Future Roadmap

### Phase 2 (Q2 2026)

**Enhanced Cohort Management**
- [ ] Bulk participant reassignment
- [ ] Waitlist management
- [ ] Attendance-based auto-enrollment
- [ ] Cohort cloning

**Notification System (SendGrid Integration)**
- [ ] Email notifications for session reminders
- [ ] Facilitator assignment alerts
- [ ] Schedule change notifications
- [ ] In-app notification center

**Reporting & Analytics**
- [ ] Custom report builder
- [ ] Training completion dashboard
- [ ] Facilitator utilization reports
- [ ] Participant progress tracking
- [ ] Export to PDF/Excel

---

### Phase 3 (Q3 2026)

**Workday Integration**
- [ ] Automated participant sync
- [ ] HR data import
- [ ] Training completion export
- [ ] Job role-based auto-enrollment

**Advanced Scheduling**
- [ ] Recurring session templates
- [ ] Multi-facilitator sessions
- [ ] Co-located session optimization
- [ ] Automatic conflict resolution suggestions

**Learning Management**
- [ ] Pre-session materials upload
- [ ] Post-session surveys
- [ ] Completion certificates
- [ ] Skills tracking

---

### Phase 4 (Q4 2026)

**Participant Portal**
- [ ] Self-service enrollment
- [ ] View upcoming sessions
- [ ] Access training materials
- [ ] Certificate download

**Mobile Applications**
- [ ] Native iOS app (facilitators)
- [ ] Native Android app (facilitators)
- [ ] Offline attendance tracking

---

### Phase 5 (2027)

**Advanced Analytics**
- [ ] Predictive enrollment forecasting
- [ ] Training effectiveness metrics
- [ ] ROI calculations
- [ ] ML-powered recommendations

**API & Extensibility**
- [ ] Public REST API
- [ ] Webhook support
- [ ] Third-party integrations marketplace

**Enterprise Features**
- [ ] Multi-tenancy support
- [ ] White-label branding
- [ ] Custom workflows
- [ ] Advanced compliance (SOC 2 Type II, ISO 27001)

---

## Appendix

### Glossary

**Admin/Coordinator:** User role with full system access to create programs, manage cohorts, and administer the system.

**Cohort:** A group of participants going through a training program together, with specific start/end dates.

**Facilitator:** An instructor who delivers training sessions. Has system access to view assignments and track attendance.

**HR User:** User role with limited access to add and manage participants only.

**Location:** A physical or virtual space where training sessions are held.

**Participant:** An individual enrolled in training cohorts.

**Program:** A training curriculum consisting of multiple sessions, deployed across one or more cohorts.

**Schedule:** A specific instance of a session, linked to a cohort, facilitator, location, and time.

**Session:** An individual training activity within a program (e.g., "Onboarding - Day 1").

---

### Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Oct 8, 2025 | Rebecca Davila | Initial comprehensive PRD created |
| 2.0 | Oct 8, 2025 | Rebecca Davila | Added Security Architecture, Scalability & Performance sections; moved SSO, Outlook, and scalability requirements to Release 1.0; reorganized roadmap |

---

### References

- User Stories Document: `USER_STORIES.md`
- Technical Documentation: `CLAUDE.md`
- Current State: `CURRENT_STATE.md`
- Test Coverage: `apps/frontend/src/utils/*.test.ts`

---

**END OF DOCUMENT**
