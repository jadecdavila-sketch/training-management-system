import { PrismaClient } from '@prisma/client';
import { Request } from 'express';
import { logger } from '../lib/logger.js';
import '../types/express.js';

const prisma = new PrismaClient();

export type AuditEventType =
  | 'LOGIN'
  | 'LOGOUT'
  | 'AUTH_FAILURE'
  | 'SSO_LOGIN'
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'EXPORT'
  | 'IMPORT'
  | 'AUTHORIZATION_DENIED';

export type AuditOutcome = 'SUCCESS' | 'FAILURE' | 'DENIED';

interface AuditLogData {
  eventType: AuditEventType;
  action: string;
  outcome: AuditOutcome;

  // User info (from req.user or explicit)
  userId?: string;
  userEmail?: string;
  userRole?: string;

  // Resource info
  resourceType?: string;
  resourceId?: string;
  resourceName?: string;

  // Request context
  ipAddress?: string;
  userAgent?: string;
  requestPath?: string;
  requestMethod?: string;
  statusCode?: number;

  // Extra metadata
  metadata?: Record<string, any>;
  errorMessage?: string;
}

export const auditService = {
  /**
   * Log an audit event
   */
  async log(data: AuditLogData): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          timestamp: new Date(),
          eventType: data.eventType,
          action: data.action,
          outcome: data.outcome,
          userId: data.userId,
          userEmail: data.userEmail,
          userRole: data.userRole,
          resourceType: data.resourceType,
          resourceId: data.resourceId,
          resourceName: data.resourceName,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
          requestPath: data.requestPath,
          requestMethod: data.requestMethod,
          statusCode: data.statusCode,
          metadata: data.metadata || {},
          errorMessage: data.errorMessage,
        },
      });

      // Also log to Winston for real-time monitoring
      logger.info('Audit Event', {
        eventType: data.eventType,
        action: data.action,
        outcome: data.outcome,
        userId: data.userId,
        resourceType: data.resourceType,
      });
    } catch (error) {
      // Don't let audit logging failures break the app
      logger.error('Failed to write audit log', {
        error: error instanceof Error ? error.message : 'Unknown error',
        auditData: data,
      });
    }
  },

  /**
   * Log authentication event
   */
  async logAuth(
    req: Request,
    eventType: 'LOGIN' | 'LOGOUT' | 'AUTH_FAILURE' | 'SSO_LOGIN',
    outcome: AuditOutcome,
    userId?: string,
    userEmail?: string,
    errorMessage?: string
  ): Promise<void> {
    await this.log({
      eventType,
      action: eventType,
      outcome,
      userId,
      userEmail,
      ipAddress: this.getClientIp(req),
      userAgent: req.headers['user-agent'],
      requestPath: req.path,
      requestMethod: req.method,
      errorMessage,
    });
  },

  /**
   * Log authorization denial
   */
  async logAuthorizationDenied(
    req: Request,
    requiredRoles: string[],
    userRole?: string
  ): Promise<void> {
    await this.log({
      eventType: 'AUTHORIZATION_DENIED',
      action: `${req.method}_${req.path}`,
      outcome: 'DENIED',
      userId: req.user?.userId,
      userEmail: req.user?.email,
      userRole: req.user?.role || userRole,
      ipAddress: this.getClientIp(req),
      userAgent: req.headers['user-agent'],
      requestPath: req.path,
      requestMethod: req.method,
      statusCode: 403,
      metadata: {
        requiredRoles,
        userRole: req.user?.role || userRole,
      },
    });
  },

  /**
   * Log resource modification (CREATE, UPDATE, DELETE)
   */
  async logResourceChange(
    req: Request,
    eventType: 'CREATE' | 'UPDATE' | 'DELETE',
    resourceType: string,
    resourceId: string,
    resourceName?: string,
    outcome: AuditOutcome = 'SUCCESS',
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.log({
      eventType,
      action: `${eventType}_${resourceType.toUpperCase()}`,
      outcome,
      userId: req.user?.userId,
      userEmail: req.user?.email,
      userRole: req.user?.role,
      resourceType,
      resourceId,
      resourceName,
      ipAddress: this.getClientIp(req),
      userAgent: req.headers['user-agent'],
      requestPath: req.path,
      requestMethod: req.method,
      metadata,
    });
  },

  /**
   * Log bulk operations (IMPORT, EXPORT)
   */
  async logBulkOperation(
    req: Request,
    eventType: 'IMPORT' | 'EXPORT',
    resourceType: string,
    count: number,
    outcome: AuditOutcome = 'SUCCESS',
    errorMessage?: string
  ): Promise<void> {
    await this.log({
      eventType,
      action: `${eventType}_${resourceType.toUpperCase()}`,
      outcome,
      userId: req.user?.userId,
      userEmail: req.user?.email,
      userRole: req.user?.role,
      resourceType,
      ipAddress: this.getClientIp(req),
      userAgent: req.headers['user-agent'],
      requestPath: req.path,
      requestMethod: req.method,
      metadata: {
        count,
      },
      errorMessage,
    });
  },

  /**
   * Get recent audit logs
   */
  async getRecentLogs(limit = 100, filters?: {
    eventType?: AuditEventType;
    userId?: string;
    resourceType?: string;
    outcome?: AuditOutcome;
    startDate?: Date;
    endDate?: Date;
  }) {
    const where: any = {};

    if (filters?.eventType) where.eventType = filters.eventType;
    if (filters?.userId) where.userId = filters.userId;
    if (filters?.resourceType) where.resourceType = filters.resourceType;
    if (filters?.outcome) where.outcome = filters.outcome;
    if (filters?.startDate || filters?.endDate) {
      where.timestamp = {};
      if (filters.startDate) where.timestamp.gte = filters.startDate;
      if (filters.endDate) where.timestamp.lte = filters.endDate;
    }

    return prisma.auditLog.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: limit,
    });
  },

  /**
   * Get audit statistics
   */
  async getStats(startDate?: Date, endDate?: Date) {
    const where: any = {};
    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp.gte = startDate;
      if (endDate) where.timestamp.lte = endDate;
    }

    const [total, byType, byOutcome, byUser] = await Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.groupBy({
        by: ['eventType'],
        _count: true,
        where,
      }),
      prisma.auditLog.groupBy({
        by: ['outcome'],
        _count: true,
        where,
      }),
      prisma.auditLog.groupBy({
        by: ['userId'],
        _count: true,
        where,
        orderBy: { _count: { userId: 'desc' } },
        take: 10,
      }),
    ]);

    return {
      total,
      byType,
      byOutcome,
      topUsers: byUser,
    };
  },

  /**
   * Helper: Extract client IP address
   */
  getClientIp(req: Request): string {
    return (
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      (req.headers['x-real-ip'] as string) ||
      req.socket.remoteAddress ||
      'unknown'
    );
  },
};
