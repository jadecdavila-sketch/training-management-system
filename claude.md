# Training Management System - Claude Development Guide

## Project Overview

This is a Training Management System (TMS) for large organizations to manage training programs across multiple cohorts. The system automates scheduling of facilitators, participants, and locations.

## Core Product Areas

1. **Program Creation**: Define training program structure and generate automated schedules
2. **Cohort Management**: Move participants, reschedule facilitators, manage locations, resolve gaps
3. **Admin**: Manage participants, users (HR, coordinators, facilitators), and training locations

## Tech Stack

### Frontend
- React 18+ with TypeScript
- Vite (build tool)
- Zustand (state management)
- React Router v6
- Radix UI (accessible components)
- Tailwind CSS (styling with custom theme)
- React Hook Form + Zod (forms/validation)
- TanStack Query (data fetching)
- date-fns (date manipulation)
- pnpm (package manager)

### Backend
- Node.js with TypeScript
- Express.js or Fastify
- PostgreSQL (database)
- Prisma (ORM)
- Auth0 or JWT with SSO support
- Bull/BullMQ (job queue)

### Integrations
- Microsoft Graph API (Outlook calendar)
- Workday REST API (HR data)
- SendGrid (email notifications)

## Development Principles

### Code Quality Standards
- **TypeScript strict mode** enabled
- **Keep changes under 100 lines** where possible
- **Reuse existing components** before creating new ones - always ask first
- **Only modify what's needed** for the current task
- **Clean, descriptive naming** for variables and functions
- **Single responsibility principle** for functions and components
- **DRY principle** - create reusable utilities

### Git Standards
- Use **descriptive conventional commits**:
  - `feat(area): description`
  - `fix(area): description`
  - `refactor(area): description`
  - `test(area): description`
- Clear commit messages explaining what and why
- Use pnpm for all package management

### File Structure
```
/src
  /components
    /common        # Reusable UI components
    /program       # Program-specific components
    /cohort        # Cohort management components
    /admin         # Admin area components
  /features        # Feature-based modules
  /hooks           # Custom React hooks
  /services        # API calls and external services
  /utils           # Helper functions
  /types           # TypeScript type definitions
  /styles          # Global styles and theme
  /tests           # Test files colocated with components
```

## Design System

### Visual Design
- **Font**: Montserrat (headings and body)
- **Color Palette**: Warm tones, professional yet approachable
- **Modern & Elegant**: Clean interfaces with intentional whitespace
- **Clear Visual Hierarchy**: Size, weight, color guide attention
- **Consistent Patterns**: Predictable interactions

### Style Guide UI
Create internal design system management for designers:
- Color palette editor (primary, secondary, accent, semantic colors)
- Typography scale configuration
- Component library showcase
- Button states (default, hover, active, disabled, loading)
- Spacing system
- Elevation/shadows
- Icon library
- Live preview of token changes

### Design Tokens
Store in JSON/TypeScript for Tailwind consumption:
```typescript
{
  colors: { primary: {...}, secondary: {...}, success: {...} },
  typography: { fontFamily: {...}, fontSize: {...} },
  spacing: {...},
  borderRadius: {...}
}
```

## Accessibility Requirements (WCAG 2.1 AA)

- **Semantic HTML**: Proper heading hierarchy, lists, buttons vs links
- **ARIA labels**: Descriptive labels for interactive elements
- **Keyboard navigation**: All functionality accessible via keyboard
- **Focus indicators**: Visible focus, logical tab order, focus trapping in modals
- **Screen reader support**: Alt text, ARIA live regions
- **Color contrast**: 4.5:1 minimum for normal text
- **Browser zoom**: Support up to 200%

## UX Requirements

### Feedback & States
- **Action feedback**: Toast notifications for success/error
- **Loading states**: Skeleton screens for content, spinners for actions
- **Error handling**: Clear, actionable messages with recovery suggestions
- **Inline validation**: Helpful validation messages
- **Empty states**: Guidance when no data exists
- **Progress indicators**: Show position in multi-step processes

### Interaction Patterns
- Primary actions on right, prominent styling
- Secondary actions subtle (ghost/outline buttons)
- Destructive actions clearly differentiated (warning colors)
- Confirmation dialogs for destructive actions
- Breadcrumbs for deep navigation
- Inline editing where appropriate
- Keyboard shortcuts for power users

## Testing Requirements

### E2E Tests (Playwright/Cypress)
Core journeys to test:
1. **Program Creation**: Create program → add sessions → configure cohorts → generate schedules → verify correctness
2. **Cohort Management**: Move participant → reschedule facilitator → change location → verify notifications
3. **Admin Configuration**: Import participants → create users → add locations → verify persistence

### Unit Tests (Jest)
- All business logic (scheduling algorithms, validation rules)
- API endpoints (integration tests)
- Data access layer (repository tests)
- Target: 80% code coverage for business logic

### Pre-Commit Checklist
- Unit tests pass: `pnpm test`
- No TypeScript errors: `pnpm type-check`
- No linting errors: `pnpm lint`
- Code formatted: `pnpm format`
- E2E tests pass for affected journeys: `pnpm test:e2e`

## Change Verification Process

### Before Committing
1. **Test Happy Path**: Complete primary user flow end-to-end
2. **Test Edge Cases**: Empty states, maximum values, boundaries
3. **Test Error Scenarios**: Invalid inputs, network failures, permission errors
4. **Test Interactions**: Button clicks, form submissions, navigation
5. **Test Responsiveness**: Different screen sizes
6. **Test Accessibility**: Keyboard navigation, screen reader
7. **Cross-browser**: Chrome, Firefox, Safari, Edge

### Feature-Specific Tests
- **Program Creation**: Create program, add sessions, verify schedules, check conflicts
- **Cohort Management**: Move participants, verify capacity limits, check notifications
- **Admin Functions**: Add users, import participants (test CSV), add locations with capacity

## Integration Requirements

### SSO Authentication
- Support SAML 2.0 and OAuth 2.0/OIDC
- Integration with Azure AD, Okta, Ping Identity
- Automatic user provisioning

### Microsoft Outlook
- Create calendar invitations for sessions
- Send to participants and facilitators
- Update events on schedule changes
- Handle cancellations and rescheduling
- Sync facilitator availability

### Workday
- Import participant data (name, email, department, location, hire date)
- Sync user data for coordinators and facilitators
- Update participant status changes
- Export training completion data
- Daily scheduled sync with manual option

## Data Model (Core Entities)

- **Program**: Training program template
- **Session**: Individual sessions within a program
- **Cohort**: Program instance with specific dates and participants
- **Participant**: Individuals attending training
- **Facilitator**: Training instructors
- **Location**: Physical or virtual training spaces
- **User**: System users with roles (Admin, Coordinator, HR, Facilitator)
- **Schedule**: Links sessions, cohorts, facilitators, and locations

## Key Relationships
- Program → many Sessions
- Program → many Cohorts
- Cohort ↔ many Participants
- Schedule links Session + Facilitator + Location + Cohort

## Non-Functional Requirements

### Performance Targets
- Initial page load: < 2 seconds
- Schedule generation: < 5 seconds for 10 cohorts
- Search/filter: < 500ms
- API response: < 200ms (95th percentile)

### Security
- TLS 1.3 encryption
- Encrypted data at rest
- SQL injection prevention
- XSS protection
- CSRF tokens
- Rate limiting
- Audit logging for sensitive operations

## Development Workflow

### When Making Changes
1. **Think before building**: Understand existing architecture
2. **Check for existing components**: Always reuse before creating
3. **Ask permission**: Before building new components, verify no existing solution
4. **Keep it minimal**: Only change what's necessary for current task
5. **Stay under 100 lines**: Break larger changes into smaller commits
6. **Test thoroughly**: Use checklist above before committing
7. **Verify with team**: Confirm manual testing completed before pushing

### Component Development
- Use Radix UI primitives (pre-built accessibility)
- Follow design system tokens
- Implement all button states
- Include loading and error states
- Add keyboard navigation
- Ensure proper ARIA labels
- Test with screen reader

## Common Pitfalls to Avoid

❌ Creating new components without checking existing ones  
❌ Making changes unrelated to current task  
❌ Deleting previously edited elements when adding new ones  
❌ Committing without running test suite  
❌ Using non-descriptive commit messages  
❌ Implementing without understanding existing architecture  
❌ Skipping accessibility requirements  
❌ Hardcoding values instead of using design tokens  
❌ Not handling loading and error states  
❌ Poor error messages without recovery suggestions

## Questions to Ask Before Development

1. Does a component already exist that does this?
2. Can I modify an existing component instead of creating new?
3. Does this change relate to the current task?
4. Is this under 100 lines or should I break it up?
5. Have I used design tokens instead of hardcoding?
6. Does this meet accessibility requirements?
7. Have I included all necessary states (loading, error, empty)?
8. Is my commit message descriptive?
9. Have I tested this thoroughly?

## Resources

- Design wireframes: See project images
- API documentation: [Link to API docs]
- Design system: [Link to Figma/style guide]
- Microsoft Graph API: https://docs.microsoft.com/graph
- Workday API: [Link to Workday docs]

---

**Remember**: Less is tidy. Clean, reusable code prevents tech debt. Always verify before committing.