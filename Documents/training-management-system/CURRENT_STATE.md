# Training Management System - Current State

**Last Updated:** October 4, 2025
**Git Commit:** `a671ad8` - Program wizard with clickable navigation

## Project Overview

Full-stack training management system with React/TypeScript frontend and Node.js/Express backend.

**Tech Stack:**
- Frontend: React 18 + TypeScript + Vite + TailwindCSS + TanStack Query
- Backend: Node.js + Express + Prisma + PostgreSQL
- Monorepo: pnpm workspaces

## What's Been Built

### ✅ Completed Features

1. **Admin Pages (Full CRUD)**
   - Participants page with filters (Department, Status)
   - Users page with filters (Role, Skills)
   - Locations page with filters (Type, Equipment)
   - Programs page (UI only, no backend yet)

2. **Program Creation Wizard (4 Steps)**
   - **Step 1:** Program Type Details (name, region, description, email)
   - **Step 2:** Training Sessions (blocks vs. simple sessions)
   - **Step 3:** Session Details (name, facilitator requirements, participant types)
   - **Step 4:** Session Cadence (calendar scheduling - needs refinement)
   - **Clickable sidebar navigation** with smart validation constraints

3. **Backend APIs**
   - `/api/participants` - Full CRUD
   - `/api/users` - Full CRUD with facilitator profiles
   - `/api/locations` - Full CRUD
   - Alphabetical sorting on all lists

4. **Database Schema**
   - Participant (with jobTitle field)
   - User (with FacilitatorProfile relation)
   - Location
   - Program, Cohort, Session models (not yet used)

## Key Design Decisions

### UI/UX Patterns

1. **Color Palette:**
   - Primary: `#23A2B1` (teal/accent-500)
   - Background: `#FDF9F3` (warm off-white)
   - Headers/footers: White
   - Error: Red-600

2. **Multi-select Pattern (Step 3):**
   - Dropdown to add → Tags appear below → Click X to remove
   - NOT the dropdown checkbox pattern

3. **Facilitator Requirements:**
   - Toggle switch: "Requires Facilitator" (default: true)
   - Facilitator Skills field only shows when toggle is ON
   - Location Type is single-select dropdown

4. **Navigation:**
   - Can click previous steps to go back
   - Can click next step ONLY if current step validates
   - Cannot skip ahead multiple steps

### Data Flow Architecture

```typescript
ProgramCreationWizard (parent)
  ├── formData state (all wizard data)
  ├── updateFormData (updates parent state)
  ├── validateCurrentStep()
  └── Step components receive:
      - formData props
      - updateFormData callback
      - onNext / onBack callbacks
```

**Important:** ProgramContext.tsx exists but is NOT USED. Data flows via props.

## Current Issues & Gotchas

### 🐛 Known Issues

1. **Step 3 Session Initialization:**
   - Sessions don't always regenerate when going back to Step 2 and changing block counts
   - useEffect deps: `[formData.blocks, formData.useBlocks, formData.numberOfSessions]`
   - Only generates if `formData.sessions.length === 0`

2. **Step 4 Needs Work:**
   - Calendar scheduling concept is there but needs UX refinement
   - No backend integration yet

3. **No Program Backend Yet:**
   - Programs page is UI only
   - No POST/PUT/DELETE endpoints
   - Wizard doesn't save to database

### ⚠️ Important Notes

- **Job Title** was added to Participant schema (migration exists)
- **Department** is a dropdown with predefined values
- **First session auto-expands** in Step 3
- **Add Session button** appears at top (non-blocks mode) and in block headers
- All lists sort alphabetically by default

## File Structure

```
apps/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── admin/          # Drawer modals (Participant, User, Location)
│   │   │   ├── program/        # Step1-4 wizard components
│   │   │   └── common/         # Button, Input
│   │   ├── pages/
│   │   │   └── admin/          # ParticipantsPage, UsersPage, etc.
│   │   ├── contexts/           # ProgramContext (unused)
│   │   └── services/api.ts     # API calls
│   └── tailwind.config.js      # Custom colors
└── backend/
    ├── src/
    │   ├── controllers/        # participant, user, location
    │   └── routes/
    └── prisma/
        ├── schema.prisma
        └── migrations/

packages/shared/
└── src/types.ts               # Shared TypeScript types
```

## Next Steps (Suggested)

1. **Fix Step 3 session regeneration** when block counts change
2. **Build Step 5-10** of wizard:
   - Step 5: Program Structure
   - Step 6: Cohorts
   - Step 7: Cohort Details
   - Step 8: Facilitators
   - Step 9: Locations
   - Step 10: Summary
3. **Create Program backend API** (`/api/programs`)
4. **Connect wizard to backend** (save program on completion)
5. **Refine Step 4** calendar UX

## Code Patterns to Follow

### Adding a New Step

```typescript
// 1. Create component in components/program/
export function Step5ProgramStructure({ formData, updateFormData, onNext, onBack }: StepProps) {
  // Your UI
}

// 2. Add to ProgramCreationWizard.tsx renderStep()
case 5:
  return <Step5ProgramStructure formData={formData} updateFormData={updateFormData} onNext={goToNextStep} onBack={goToPreviousStep} />

// 3. Add validation to validateCurrentStep()
case 5:
  return !!(formData.someRequiredField);
```

### Multi-Select Pattern (Dropdown + Tags)

```tsx
<select value="" onChange={(e) => {
  if (e.target.value && !array.includes(e.target.value)) {
    updateData({ array: [...array, e.target.value] });
  }
}}>
  <option value="">Add item</option>
  {OPTIONS.filter(x => !array.includes(x)).map(item => (
    <option key={item} value={item}>{item}</option>
  ))}
</select>

{array.map(item => (
  <span className="inline-flex items-center gap-1 px-2 py-1 bg-teal-100 text-teal-700 text-xs rounded-full">
    {item}
    <button onClick={() => removeItem(item)}>×</button>
  </span>
))}
```

## Git Workflow

**Current commit:** `a671ad8`

**Commit frequency:** After each small feature (5-20 files)

**Message format:**
```
Title describing change

- Bullet point details
- What was added/changed
- Why it matters

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

## How to Continue (For Next Agent)

1. **Read this file first**
2. **Check git log:** `git log --oneline -5`
3. **Review recent files:** Check Step3SessionDetails.tsx for latest patterns
4. **Ask user what they want to build next**
5. **Follow commit strategy:** Commit after each feature

## Questions for User (If Starting Fresh)

- What's the priority: Fix bugs or build new features?
- Which wizard steps (5-10) should we tackle first?
- Does Step 4 calendar scheduling work as expected?
- Should we build the Program backend API next?
