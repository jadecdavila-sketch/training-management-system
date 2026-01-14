

## Development Principles

### Code Quality Standards
- **TypeScript strict mode** enabled
- **Keep changes as small as possible** 
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
- remove anthropic and Claude code attribution from messaging
- Use pnpm for all package management



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


**Remember**: Less is tidy. Clean, reusable code prevents tech debt. Always verify before committing.

Security-First Approach
Before you do ANYTHING, establish these security rules:
Flutter Installation Rules:
ONLY use official Flutter from https://flutter.dev
ONLY use packages from pub.dev (Flutter's official package repository)
Verify package popularity and pub points before using
Check package publisher verification (blue checkmark on pub.dev)
Review package dependencies for anything suspicious
Packages I'll Use (All Verified):
I'll show you each package BEFORE installing, with:
Direct pub.dev link
Publisher info
Download stats
Last update date
Your approval
