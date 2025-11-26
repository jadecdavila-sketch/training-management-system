import { logger } from '../lib/logger.js';

/**
 * Environment Validation Module
 *
 * Validates all required environment variables on server startup.
 * Throws clear errors if any are missing or invalid.
 * Prevents server from starting with invalid configuration.
 */

interface ValidationError {
  variable: string;
  message: string;
}

/**
 * Validates that a required environment variable is set
 */
function requireEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

/**
 * Validates that an environment variable is a valid URL
 */
function validateUrl(name: string, value: string): void {
  try {
    new URL(value);
  } catch {
    throw new Error(`${name} must be a valid URL: ${value}`);
  }
}

/**
 * Validates that an environment variable is a valid PostgreSQL connection string
 */
function validateDatabaseUrl(value: string): void {
  if (!value.startsWith('postgresql://') && !value.startsWith('postgres://')) {
    throw new Error('DATABASE_URL must be a PostgreSQL connection string (postgresql:// or postgres://)');
  }

  // Basic validation of connection string format
  const urlPattern = /^postgres(ql)?:\/\/.+@.+:\d+\/.+/;
  if (!urlPattern.test(value)) {
    throw new Error('DATABASE_URL format appears invalid. Expected: postgresql://user:password@host:port/database');
  }
}

/**
 * Validates JWT secret strength
 */
function validateJwtSecret(value: string): void {
  const errors: string[] = [];

  // Check length
  if (value.length < 32) {
    errors.push('must be at least 32 characters');
  }

  // Check for default values
  const defaultSecrets = [
    'your-secret-key-change-in-production',
    'dev-secret-change-in-production',
    'your-super-secret-jwt-key-change-this-min-32-characters',
    'change-me',
    'secret',
    'jwt-secret',
  ];

  if (defaultSecrets.some(defaultValue => value.toLowerCase().includes(defaultValue))) {
    errors.push('cannot use default/example value');
  }

  // In production, enforce stronger requirements
  if (process.env.NODE_ENV === 'production') {
    if (value.length < 48) {
      errors.push('should be at least 48 characters in production');
    }

    // Check for sufficient entropy (at least some variety of characters)
    const hasUppercase = /[A-Z]/.test(value);
    const hasLowercase = /[a-z]/.test(value);
    const hasNumbers = /[0-9]/.test(value);
    const hasSpecial = /[^A-Za-z0-9]/.test(value);

    if (!(hasUppercase && hasLowercase && hasNumbers && hasSpecial)) {
      errors.push('should contain uppercase, lowercase, numbers, and special characters for better entropy');
    }
  }

  if (errors.length > 0) {
    throw new Error(`JWT_SECRET ${errors.join(', ')}`);
  }
}

/**
 * Validates CORS origins
 */
function validateCorsOrigins(value: string): void {
  const origins = value.split(',').map(o => o.trim());

  for (const origin of origins) {
    // Allow wildcard only in development
    if (origin === '*') {
      if (process.env.NODE_ENV === 'production') {
        throw new Error('ALLOWED_ORIGINS cannot be "*" in production. Specify explicit origins.');
      }
      continue;
    }

    // Validate each origin is a proper URL
    try {
      const url = new URL(origin);

      // In production, enforce HTTPS
      if (process.env.NODE_ENV === 'production' && url.protocol !== 'https:') {
        throw new Error(`ALLOWED_ORIGINS must use HTTPS in production: ${origin}`);
      }
    } catch {
      throw new Error(`ALLOWED_ORIGINS contains invalid URL: ${origin}`);
    }
  }

  // In production, warn if localhost is allowed
  if (process.env.NODE_ENV === 'production' && origins.some(o => o.includes('localhost') || o.includes('127.0.0.1'))) {
    logger.warn('ALLOWED_ORIGINS includes localhost in production environment');
  }
}

/**
 * Validates port number
 */
function validatePort(value: string): void {
  const port = parseInt(value, 10);
  if (isNaN(port) || port < 1 || port > 65535) {
    throw new Error(`PORT must be a valid port number (1-65535): ${value}`);
  }
}

/**
 * Validates Redis URL if provided
 */
function validateRedisUrl(value: string): void {
  if (!value.startsWith('redis://') && !value.startsWith('rediss://')) {
    throw new Error('REDIS_URL must start with redis:// or rediss://');
  }

  try {
    new URL(value);
  } catch {
    throw new Error(`REDIS_URL is not a valid URL: ${value}`);
  }
}

/**
 * Main validation function
 * Called on server startup to ensure all environment variables are properly configured
 */
export function validateEnvironment(): void {
  const errors: ValidationError[] = [];

  logger.info('Validating environment configuration...');

  try {
    // ============================================
    // REQUIRED VARIABLES
    // ============================================

    // Node environment
    const nodeEnv = requireEnvVar('NODE_ENV');
    if (!['development', 'production', 'test'].includes(nodeEnv)) {
      errors.push({
        variable: 'NODE_ENV',
        message: 'must be one of: development, production, test',
      });
    }

    // Database
    const databaseUrl = requireEnvVar('DATABASE_URL');
    try {
      validateDatabaseUrl(databaseUrl);
    } catch (error) {
      errors.push({
        variable: 'DATABASE_URL',
        message: error instanceof Error ? error.message : 'Invalid database URL',
      });
    }

    // JWT Secret
    const jwtSecret = requireEnvVar('JWT_SECRET');
    try {
      validateJwtSecret(jwtSecret);
    } catch (error) {
      errors.push({
        variable: 'JWT_SECRET',
        message: error instanceof Error ? error.message : 'Invalid JWT secret',
      });
    }

    // CSRF Secret (required in production)
    if (nodeEnv === 'production') {
      const csrfSecret = requireEnvVar('CSRF_SECRET');
      if (csrfSecret.length < 32) {
        errors.push({
          variable: 'CSRF_SECRET',
          message: 'must be at least 32 characters in production',
        });
      }
    }

    // CORS
    const allowedOrigins = requireEnvVar('ALLOWED_ORIGINS');
    try {
      validateCorsOrigins(allowedOrigins);
    } catch (error) {
      errors.push({
        variable: 'ALLOWED_ORIGINS',
        message: error instanceof Error ? error.message : 'Invalid CORS configuration',
      });
    }

    // ============================================
    // OPTIONAL BUT VALIDATED IF PRESENT
    // ============================================

    // Port
    const port = process.env.PORT;
    if (port) {
      try {
        validatePort(port);
      } catch (error) {
        errors.push({
          variable: 'PORT',
          message: error instanceof Error ? error.message : 'Invalid port',
        });
      }
    }

    // Redis (required if SAML is enabled)
    const samlEnabled = process.env.SAML_ENABLED === 'true';
    if (samlEnabled) {
      const redisUrl = process.env.REDIS_URL;
      if (!redisUrl) {
        errors.push({
          variable: 'REDIS_URL',
          message: 'required when SAML_ENABLED=true',
        });
      } else {
        try {
          validateRedisUrl(redisUrl);
        } catch (error) {
          errors.push({
            variable: 'REDIS_URL',
            message: error instanceof Error ? error.message : 'Invalid Redis URL',
          });
        }
      }

      // Validate SAML configuration
      if (!process.env.SAML_ENTRY_POINT) {
        errors.push({ variable: 'SAML_ENTRY_POINT', message: 'required when SAML_ENABLED=true' });
      }
      if (!process.env.SAML_ISSUER) {
        errors.push({ variable: 'SAML_ISSUER', message: 'required when SAML_ENABLED=true' });
      }
      if (!process.env.SAML_CALLBACK_URL) {
        errors.push({ variable: 'SAML_CALLBACK_URL', message: 'required when SAML_ENABLED=true' });
      }
      if (!process.env.SESSION_SECRET) {
        errors.push({ variable: 'SESSION_SECRET', message: 'required when SAML_ENABLED=true' });
      }
    }

    // Frontend URL (for SAML redirects)
    const frontendUrl = process.env.FRONTEND_URL;
    if (frontendUrl) {
      try {
        validateUrl('FRONTEND_URL', frontendUrl);
      } catch (error) {
        errors.push({
          variable: 'FRONTEND_URL',
          message: error instanceof Error ? error.message : 'Invalid URL',
        });
      }
    }

    // ============================================
    // PRODUCTION-SPECIFIC VALIDATIONS
    // ============================================

    if (nodeEnv === 'production') {
      // Ensure BYPASS_AUTH is not enabled
      if (process.env.BYPASS_AUTH === 'true') {
        errors.push({
          variable: 'BYPASS_AUTH',
          message: 'cannot be true in production',
        });
      }

      // Ensure database is not using localhost
      if (databaseUrl.includes('localhost') || databaseUrl.includes('127.0.0.1')) {
        logger.warn('DATABASE_URL is using localhost in production environment');
      }

      // Recommend log level
      const logLevel = process.env.LOG_LEVEL;
      if (logLevel && !['warn', 'error'].includes(logLevel)) {
        logger.warn(`LOG_LEVEL is "${logLevel}" in production. Consider using "warn" or "error" for better performance.`);
      }
    }

  } catch (error) {
    if (error instanceof Error && error.message.startsWith('Missing required environment variable')) {
      errors.push({
        variable: error.message.split(': ')[1],
        message: 'is required but not set',
      });
    } else {
      throw error;
    }
  }

  // ============================================
  // REPORT RESULTS
  // ============================================

  if (errors.length > 0) {
    logger.error('Environment validation failed:', { errorCount: errors.length });

    console.error('\n❌ Environment Validation Failed\n');
    console.error('The following environment variables have issues:\n');

    errors.forEach(({ variable, message }) => {
      console.error(`  • ${variable}: ${message}`);
    });

    console.error('\nPlease fix these issues before starting the server.');
    console.error('See .env.example for configuration guidance.\n');

    process.exit(1);
  }

  logger.info('Environment validation passed', {
    nodeEnv: process.env.NODE_ENV,
    samlEnabled: process.env.SAML_ENABLED === 'true',
    port: process.env.PORT || 4000,
  });

  console.log('✅ Environment validation passed\n');
}
