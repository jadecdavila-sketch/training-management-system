/**
 * Application-wide constants
 * Centralized configuration values to avoid magic numbers throughout the codebase
 */

// ============================================
// TIME CONSTANTS
// ============================================

/** Milliseconds in one day */
export const MS_PER_DAY = 1000 * 60 * 60 * 24;

/** Milliseconds in one week */
export const MS_PER_WEEK = MS_PER_DAY * 7;

/** Milliseconds in one hour */
export const MS_PER_HOUR = 1000 * 60 * 60;

/** Milliseconds in one minute */
export const MS_PER_MINUTE = 1000 * 60;

// ============================================
// PROGRAM CONSTANTS
// ============================================

/** Default program duration in weeks if not specified */
export const DEFAULT_PROGRAM_DURATION_WEEKS = 12;

/** Minimum program duration in weeks */
export const MIN_PROGRAM_DURATION_WEEKS = 1;

/** Default cohort capacity if not specified */
export const DEFAULT_COHORT_CAPACITY = 20;

/** Minimum cohort capacity */
export const MIN_COHORT_CAPACITY = 1;

/** Maximum cohort capacity */
export const MAX_COHORT_CAPACITY = 10000;

/** Default session duration in minutes */
export const DEFAULT_SESSION_DURATION_MINUTES = 60;

/** Minimum session duration in minutes */
export const MIN_SESSION_DURATION_MINUTES = 15;

/** Maximum session duration in minutes (8 hours) */
export const MAX_SESSION_DURATION_MINUTES = 480;

/** Default minimum group size */
export const DEFAULT_GROUP_SIZE_MIN = 1;

/** Default maximum group size */
export const DEFAULT_GROUP_SIZE_MAX = 20;

/** Maximum group size allowed */
export const MAX_GROUP_SIZE = 1000;

// ============================================
// PAGINATION CONSTANTS
// ============================================

/** Default page number */
export const DEFAULT_PAGE = 1;

/** Default items per page */
export const DEFAULT_PAGE_SIZE = 20;

/** Maximum items per page */
export const MAX_PAGE_SIZE = 100;

// ============================================
// IMPORT CONSTANTS
// ============================================

/** Maximum number of participants that can be imported at once */
export const MAX_BULK_IMPORT_SIZE = 1000;

// ============================================
// VALIDATION CONSTANTS
// ============================================

/** Maximum length for names (users, programs, locations, etc.) */
export const MAX_NAME_LENGTH = 200;

/** Maximum length for descriptions */
export const MAX_DESCRIPTION_LENGTH = 2000;

/** Maximum length for addresses */
export const MAX_ADDRESS_LENGTH = 500;

/** Minimum password length */
export const MIN_PASSWORD_LENGTH = 12;

/** Maximum password length */
export const MAX_PASSWORD_LENGTH = 128;

// ============================================
// LOGGING CONSTANTS
// ============================================

/** Maximum log file size in bytes (5MB) */
export const MAX_LOG_FILE_SIZE = 5 * 1024 * 1024;

/** Maximum number of log files to keep */
export const MAX_LOG_FILES = 5;

// ============================================
// RATE LIMITING CONSTANTS
// ============================================

/** Rate limit window for auth endpoints (15 minutes) */
export const AUTH_RATE_LIMIT_WINDOW_MS = 15 * MS_PER_MINUTE;

/** Maximum requests per window for auth endpoints */
export const AUTH_RATE_LIMIT_MAX_REQUESTS = 5;

/** Rate limit window for general API (15 minutes) */
export const API_RATE_LIMIT_WINDOW_MS = 15 * MS_PER_MINUTE;

/** Maximum requests per window for general API */
export const API_RATE_LIMIT_MAX_REQUESTS = 100;

/** Rate limit window for mutation endpoints (15 minutes) */
export const MUTATION_RATE_LIMIT_WINDOW_MS = 15 * MS_PER_MINUTE;

/** Maximum requests per window for mutation endpoints */
export const MUTATION_RATE_LIMIT_MAX_REQUESTS = 50;

// ============================================
// DATABASE CONSTANTS
// ============================================

/** Number of days to retain database backups */
export const BACKUP_RETENTION_DAYS = 30;

// ============================================
// SECURITY CONSTANTS
// ============================================

/** Minimum JWT secret length for production */
export const MIN_JWT_SECRET_LENGTH = 32;

/** Bcrypt work factor (number of salt rounds) */
export const BCRYPT_SALT_ROUNDS = 12;

/** JWT token expiration time */
export const JWT_EXPIRES_IN = '8h';

/** Refresh token expiration time */
export const REFRESH_TOKEN_EXPIRES_IN = '7d';
