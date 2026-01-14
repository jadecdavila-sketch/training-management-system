# RBAC Permissions Matrix
**Training Management System - Role-Based Access Control**

Last Updated: October 14, 2025

---

## User Roles

| Role | Description | Primary Use Case |
|------|-------------|------------------|
| **ADMIN** | Full system access | System administrators, platform owners |
| **COORDINATOR** | Training management | Training coordinators who manage programs |
| **HR** | Participant management | HR staff who onboard employees |
| **FACILITATOR** | View-only + attendance | Trainers who deliver sessions |

---

## Backend API Permissions

### Programs (`/api/programs`)

| Endpoint | Method | ADMIN | COORDINATOR | HR | FACILITATOR |
|----------|--------|-------|-------------|----|----|
| List all programs | GET | ✅ | ✅ | ✅ | ✅ |
| Get program by ID | GET | ✅ | ✅ | ✅ | ✅ |
| Create program | POST | ✅ | ✅ | ❌ | ❌ |
| Update program | PUT | ✅ | ✅ | ❌ | ❌ |
| Archive program | PATCH | ✅ | ✅ | ❌ | ❌ |
| Delete program | DELETE | ✅ | ✅ | ❌ | ❌ |

**Implementation:** [apps/backend/src/routes/programs.ts:8-18](apps/backend/src/routes/programs.ts)

---

### Participants (`/api/participants`)

| Endpoint | Method | ADMIN | COORDINATOR | HR | FACILITATOR |
|----------|--------|-------|-------------|----|----|
| List participants | GET | ✅ | ✅ | ✅ | ✅ |
| Get participant by ID | GET | ✅ | ✅ | ✅ | ✅ |
| Create participant | POST | ✅ | ✅ | ✅ | ❌ |
| Update participant | PUT | ✅ | ✅ | ✅ | ❌ |
| Delete participant | DELETE | ✅ | ❌ | ❌ | ❌ |
| Import participants (CSV) | POST | ✅ | ❌ | ✅ | ❌ |

**Implementation:** [apps/backend/src/routes/participants.ts:16-53](apps/backend/src/routes/participants.ts)

**Rationale:**
- HR needs full CRUD for participants (their primary job)
- Only ADMIN can delete (prevent accidental data loss)
- Import restricted to ADMIN/HR (bulk operations need oversight)

---

### Schedules (`/api/schedules`)

| Endpoint | Method | ADMIN | COORDINATOR | HR | FACILITATOR |
|----------|--------|-------|-------------|----|----|
| Update schedule | PATCH | ✅ | ✅ | ❌ | ❌ |

**Implementation:** [apps/backend/src/routes/schedules.ts:11](apps/backend/src/routes/schedules.ts)

**Note:** Schedules are primarily managed through programs. Minimal direct schedule API.

---

### Users (`/api/users`)

| Endpoint | Method | ADMIN | COORDINATOR | HR | FACILITATOR |
|----------|--------|-------|-------------|----|----|
| List all users | GET | ✅ | ✅ | ✅ | ✅ |
| List facilitators | GET | ✅ | ✅ | ✅ | ✅ |
| Get user by ID | GET | ✅ | ✅ | ✅ | ✅ |
| Create user | POST | ✅ | ❌ | ✅ | ❌ |
| Update user | PUT | ✅ | ❌ | ✅ | ❌ |
| Delete user | DELETE | ✅ | ❌ | ❌ | ❌ |

**Implementation:** [apps/backend/src/routes/users.ts:11-18](apps/backend/src/routes/users.ts)

**Rationale:**
- HR can create users (onboarding facilitators)
- Only ADMIN can delete users (critical operation)

---

### Locations (`/api/locations`)

| Endpoint | Method | ADMIN | COORDINATOR | HR | FACILITATOR |
|----------|--------|-------|-------------|----|----|
| List locations | GET | ✅ | ✅ | ✅ | ✅ |
| Get location by ID | GET | ✅ | ✅ | ✅ | ✅ |
| Create location | POST | ✅ | ✅ | ❌ | ❌ |
| Update location | PUT | ✅ | ✅ | ❌ | ❌ |
| Delete location | DELETE | ✅ | ✅ | ❌ | ❌ |

**Implementation:** [apps/backend/src/routes/locations.ts:11-17](apps/backend/src/routes/locations.ts)

---

### Cohort Enrollments (`/api/cohort-enrollments`)

| Endpoint | Method | ADMIN | COORDINATOR | HR | FACILITATOR |
|----------|--------|-------|-------------|----|----|
| Move participant between cohorts | POST | ✅ | ✅ | ❌ | ❌ |
| Remove participant from cohort | POST | ✅ | ✅ | ❌ | ❌ |

**Implementation:** [apps/backend/src/routes/cohortEnrollments.ts:9-12](apps/backend/src/routes/cohortEnrollments.ts)

**Rationale:**
- Cohort management is core training coordination work
- HR should not move participants (could disrupt training schedules)

---

### Authentication (`/api/auth`)

| Endpoint | Method | Public/Auth | Notes |
|----------|--------|-------------|-------|
| Register | POST | Public (rate-limited) | 5 requests/15min |
| Login | POST | Public (rate-limited) | 5 requests/15min |
| Refresh token | POST | Public (rate-limited) | Requires valid refresh token |
| Get current user | GET | Authenticated | Any logged-in user |
| Logout | POST | Authenticated | Any logged-in user |

**SSO Endpoints (`/auth/saml`)**

| Endpoint | Method | Public/Auth | Notes |
|----------|--------|-------------|-------|
| Initiate SAML login | GET | Public | Redirects to IdP |
| SAML callback | POST | Public | Called by IdP |
| SAML metadata | GET | Public | For IdP configuration |
| SAML logout | POST | Authenticated | Single logout |

---

## Frontend Route Permissions

### Recommended Route Protection

```tsx
// Admin/Coordinator-only routes
<ProtectedRoute allowedRoles={['ADMIN', 'COORDINATOR']}>
  <ProgramsPage />
  <ProgramCreatePage />
  <ProgramEditPage />
  <CohortManagePage />
  <SchedulingPage />
  <LocationsPage />
</ProtectedRoute>

// Admin/Coordinator/HR routes
<ProtectedRoute allowedRoles={['ADMIN', 'COORDINATOR', 'HR']}>
  <ParticipantsPage />
  <ParticipantImportPage />
</ProtectedRoute>

// All authenticated users
<ProtectedRoute>
  <DashboardPage />
  <ProfilePage />
</ProtectedRoute>

// Facilitator-specific routes
<ProtectedRoute allowedRoles={['FACILITATOR', 'ADMIN', 'COORDINATOR']}>
  <MySessionsPage />
  <AttendancePage />
</ProtectedRoute>
```

---

## Navigation Visibility by Role

| Nav Item | ADMIN | COORDINATOR | HR | FACILITATOR |
|----------|-------|-------------|----|----|
| Dashboard | ✅ | ✅ | ✅ | ✅ |
| Programs | ✅ | ✅ | 👁️ View Only | ❌ |
| Cohorts | ✅ | ✅ | 👁️ View Only | ❌ |
| Participants | ✅ | ✅ | ✅ | 👁️ View Only |
| Schedules | ✅ | ✅ | ❌ | 👁️ View Only |
| Locations | ✅ | ✅ | ❌ | 👁️ View Only |
| Users | ✅ | ❌ | ✅ | ❌ |
| My Sessions | N/A | N/A | N/A | ✅ |
| Settings | ✅ | ✅ | ✅ | ✅ |

---

## Security Patterns

### Backend Implementation

```typescript
// Pattern 1: Apply to all routes in a router
router.use(requireAuth);
router.use(requireRole('ADMIN', 'COORDINATOR'));

// Pattern 2: Apply to specific routes
router.post('/', requireRole('ADMIN'), controller.create);

// Pattern 3: Different permissions per operation
router.get('/', requireAuth, controller.getAll); // All users
router.post('/', requireAuth, requireRole('ADMIN'), controller.create); // Admin only
```

### Frontend Implementation

```tsx
// Pattern 1: Route-level protection
<Route path="/programs" element={
  <ProtectedRoute allowedRoles={['ADMIN', 'COORDINATOR']}>
    <ProgramsPage />
  </ProtectedRoute>
} />

// Pattern 2: Component-level hiding
const { user } = useAuth();
{['ADMIN', 'COORDINATOR'].includes(user.role) && (
  <Button onClick={handleCreate}>Create Program</Button>
)}

// Pattern 3: Sidebar filtering
const navItems = [
  { path: '/programs', label: 'Programs', roles: ['ADMIN', 'COORDINATOR'] },
  { path: '/participants', label: 'Participants', roles: ['ADMIN', 'COORDINATOR', 'HR'] },
].filter(item => item.roles.includes(user.role));
```

---

## Testing RBAC

### Test User Accounts

Create test users for each role:

```bash
# Via backend API
POST /api/auth/register
{
  "email": "admin@test.com",
  "password": "Test123!@#",
  "name": "Admin User",
  "role": "ADMIN"
}

# Or via seed script (recommended)
pnpm db:seed
```

### Test Scenarios

**ADMIN User:**
- ✅ Can access all pages
- ✅ Can create/edit/delete everything
- ✅ Sees all navigation items

**COORDINATOR User:**
- ✅ Can manage programs, cohorts, schedules, locations
- ✅ Can view participants (read-only for delete)
- ❌ Cannot access Users page
- ❌ Cannot delete participants

**HR User:**
- ✅ Can manage participants (create, edit, import)
- ✅ Can manage users (create facilitators)
- ✅ Can view programs/cohorts (read-only)
- ❌ Cannot create programs
- ❌ Cannot manage cohort enrollments

**FACILITATOR User:**
- ✅ Can view assigned sessions
- ✅ Can view participant lists
- ✅ Can mark attendance (when implemented)
- ❌ Cannot create/edit anything
- ❌ Cannot access admin pages

---

## Security Considerations

### Defense in Depth

1. **Backend enforcement is primary** - Never trust frontend
2. **Frontend guards improve UX** - Don't show what users can't do
3. **Rate limiting protects auth endpoints** - 5 attempts/15min
4. **Audit logging tracks actions** - Who did what, when

### Common Pitfalls to Avoid

❌ **DON'T:** Only protect routes in frontend
- Malicious users can bypass React Router
- Always enforce on backend

❌ **DON'T:** Check `user.role === 'ADMIN'` everywhere
- Use `requireRole()` middleware consistently
- Centralized logic reduces bugs

❌ **DON'T:** Return sensitive data in error messages
- "Access denied" not "You need ADMIN role"
- Prevents information leakage

✅ **DO:** Return 403 Forbidden (not 404) for unauthorized access
- Clear feedback for legitimate users
- Consistent error handling

✅ **DO:** Log all authorization failures
- Track potential security issues
- Audit trail for compliance

---

## Audit Logging (To Implement)

### Events to Log

**Authentication:**
- Login success/failure
- Logout
- SSO authentication

**Authorization:**
- Permission denied (403 errors)
- Role changes

**Data Modifications:**
- Program create/update/delete
- Participant create/update/delete
- User create/update/delete
- Cohort enrollment changes

**Sensitive Operations:**
- Bulk imports
- Data exports
- User role changes

### Log Format

```json
{
  "timestamp": "2025-10-14T19:00:00Z",
  "eventType": "AUTHORIZATION_DENIED",
  "action": "DELETE_PROGRAM",
  "userId": "user-123",
  "userEmail": "coordinator@company.com",
  "userRole": "COORDINATOR",
  "resourceType": "Program",
  "resourceId": "prog-456",
  "requiredRole": ["ADMIN"],
  "ipAddress": "192.168.1.100",
  "statusCode": 403
}
```

---

## Next Steps

- [ ] Wrap all frontend routes with `ProtectedRoute`
- [ ] Filter sidebar navigation by role
- [ ] Implement audit logging
- [ ] Create test users for all roles
- [ ] Run RBAC test suite
- [ ] Document role assignment process

---

**Related Documentation:**
- [Backend Auth Middleware](apps/backend/src/middleware/auth.ts)
- [Frontend ProtectedRoute](apps/frontend/src/components/common/ProtectedRoute.tsx)
- [SSO Setup Guide](SSO_SETUP.md)
