import { z } from 'zod';

// ============================================
// PARTICIPANT SCHEMAS
// ============================================

export const createParticipantSchema = z.object({
  email: z.string().email('Invalid email format').toLowerCase(),
  firstName: z.string().min(1, 'First name required').max(100),
  lastName: z.string().min(1, 'Last name required').max(100),
  jobTitle: z.string().max(200).optional(),
  department: z.string().max(100).optional(),
  location: z.string().max(100).optional(),
  hireDate: z.string().datetime().optional().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
});

export const updateParticipantSchema = createParticipantSchema.partial();

export const bulkImportParticipantsSchema = z.object({
  participants: z.array(createParticipantSchema).min(1).max(1000), // Max 1000 at a time
});

// ============================================
// PROGRAM SCHEMAS
// ============================================

export const createSessionSchema = z.object({
  title: z.string().min(1, 'Session title required').max(200),
  description: z.string().max(2000).optional(),
  duration: z.number().int().min(15, 'Minimum 15 minutes').max(480, 'Maximum 8 hours'),
  materials: z.array(z.string()).default([]),
  order: z.number().int().min(0),
  participantTypes: z.array(z.string()).default([]),
  facilitatorSkills: z.array(z.string()).default([]),
  locationTypes: z.array(z.string()).default([]),
  requiresFacilitator: z.boolean().default(true),
  groupSizeMin: z.number().int().min(1).default(1),
  groupSizeMax: z.number().int().min(1).max(1000).default(20),
});

export const createProgramSchema = z.object({
  name: z.string().min(1, 'Program name required').max(200),
  description: z.string().max(2000).optional(),
  duration: z.number().int().min(1, 'Duration required'),
  objectives: z.array(z.string()).default([]),
  sessions: z.array(createSessionSchema).min(1, 'At least one session required'),
  cohorts: z.array(z.object({
    name: z.string().min(1).max(200),
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
    capacity: z.number().int().min(1).max(10000),
    participantFilters: z.object({
      employeeStartDateFrom: z.string().optional(),
      employeeStartDateTo: z.string().optional(),
      regions: z.array(z.string()).optional(),
    }).optional(),
  })).min(1, 'At least one cohort required'),
  formData: z.any().optional(), // Store original wizard data
});

export const updateProgramSchema = createProgramSchema.partial();

// ============================================
// USER SCHEMAS
// ============================================

export const createUserSchema = z.object({
  email: z.string().email('Invalid email format').toLowerCase(),
  name: z.string().min(1, 'Name required').max(200),
  role: z.enum(['ADMIN', 'COORDINATOR', 'HR', 'FACILITATOR'], {
    errorMap: () => ({ message: 'Invalid role' }),
  }),
  password: z.string()
    .min(12, 'Password must be at least 12 characters')
    .regex(/[A-Z]/, 'Password must contain uppercase letter')
    .regex(/[a-z]/, 'Password must contain lowercase letter')
    .regex(/[0-9]/, 'Password must contain number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain special character'),
  qualifications: z.array(z.string()).optional(), // For facilitators
});

export const updateUserSchema = createUserSchema.partial().omit({ password: true });

export const loginSchema = z.object({
  email: z.string().email('Invalid email format').toLowerCase(),
  password: z.string().min(1, 'Password required'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password required'),
  newPassword: z.string()
    .min(12, 'Password must be at least 12 characters')
    .regex(/[A-Z]/, 'Password must contain uppercase letter')
    .regex(/[a-z]/, 'Password must contain lowercase letter')
    .regex(/[0-9]/, 'Password must contain number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain special character'),
});

// ============================================
// LOCATION SCHEMAS
// ============================================

export const createLocationSchema = z.object({
  name: z.string().min(1, 'Location name required').max(200),
  address: z.string().max(500).optional(),
  capacity: z.number().int().min(1, 'Capacity must be at least 1').max(10000),
  equipment: z.array(z.string()).default([]),
  type: z.enum(['Physical', 'Virtual', 'Classroom', 'Conference Room', 'Lab'], {
    errorMap: () => ({ message: 'Invalid location type' }),
  }),
});

export const updateLocationSchema = createLocationSchema.partial();

// ============================================
// COHORT ENROLLMENT SCHEMAS
// ============================================

export const moveParticipantSchema = z.object({
  participantId: z.string().cuid('Invalid participant ID'),
  fromCohortId: z.string().cuid('Invalid cohort ID'),
  toCohortId: z.string().cuid('Invalid cohort ID'),
});

export const removeParticipantSchema = z.object({
  participantId: z.string().cuid('Invalid participant ID'),
  cohortId: z.string().cuid('Invalid cohort ID'),
});

// ============================================
// SCHEDULE SCHEMAS
// ============================================

export const updateScheduleSchema = z.object({
  facilitatorId: z.string().cuid('Invalid facilitator ID').optional().nullable(),
  locationId: z.string().cuid('Invalid location ID').optional().nullable(),
  startTime: z.string().datetime().optional(),
  endTime: z.string().datetime().optional(),
  status: z.enum(['scheduled', 'completed', 'cancelled']).optional(),
});

// ============================================
// PAGINATION SCHEMAS
// ============================================

export const paginationSchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().min(1)).default('1'),
  pageSize: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().min(1).max(100)).default('20'),
});

export const searchSchema = z.object({
  search: z.string().max(200).optional(),
});

// ============================================
// TYPE EXPORTS
// ============================================

export type CreateParticipantInput = z.infer<typeof createParticipantSchema>;
export type UpdateParticipantInput = z.infer<typeof updateParticipantSchema>;
export type CreateProgramInput = z.infer<typeof createProgramSchema>;
export type UpdateProgramInput = z.infer<typeof updateProgramSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateLocationInput = z.infer<typeof createLocationSchema>;
export type UpdateLocationInput = z.infer<typeof updateLocationSchema>;
export type MoveParticipantInput = z.infer<typeof moveParticipantSchema>;
export type RemoveParticipantInput = z.infer<typeof removeParticipantSchema>;
export type UpdateScheduleInput = z.infer<typeof updateScheduleSchema>;
