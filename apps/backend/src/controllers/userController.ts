import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import bcrypt from 'bcrypt';
import { auditService } from '../services/auditService.js';

interface CreateUserDto {
  email: string;
  name: string;
  role: 'ADMIN' | 'COORDINATOR' | 'HR' | 'FACILITATOR';
  password?: string;
  facilitatorProfile?: {
    qualifications: string[];
  };
}

interface UpdateUserDto {
  email?: string;
  name?: string;
  role?: 'ADMIN' | 'COORDINATOR' | 'HR' | 'FACILITATOR';
  password?: string;
  facilitatorProfile?: {
    qualifications: string[];
  };
}

export const getAll = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;
    const role = req.query.role as string;

    const where = role ? { role: role as any } : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { name: 'asc' },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          facilitatorProfile: {
            select: {
              qualifications: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      success: true,
      data: users,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch users' });
  }
};

export const getById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch user' });
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    const { facilitatorProfile, ...userData }: CreateUserDto = req.body;

    const hashedPassword = userData.password
      ? await bcrypt.hash(userData.password, 10)
      : null;

    const user = await prisma.user.create({
      data: {
        email: userData.email,
        name: userData.name,
        role: userData.role,
        password: hashedPassword,
        ...(facilitatorProfile && userData.role === 'FACILITATOR' && {
          facilitatorProfile: {
            create: {
              qualifications: facilitatorProfile.qualifications,
            },
          },
        }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        facilitatorProfile: {
          select: {
            qualifications: true,
          },
        },
      },
    });

    // Audit log: User created
    await auditService.logResourceChange(
      req,
      'CREATE',
      'user',
      user.id,
      user.name,
      'SUCCESS',
      {
        email: user.email,
        role: user.role,
      }
    );

    res.status(201).json({ success: true, data: user });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ success: false, error: 'Email already exists' });
    }
    res.status(500).json({ success: false, error: 'Failed to create user' });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { facilitatorProfile, ...userData }: UpdateUserDto = req.body;

    // Get current user state for audit comparison
    const currentUser = await prisma.user.findUnique({
      where: { id },
      select: { name: true, email: true, role: true },
    });

    if (!currentUser) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const updateData: any = {
      email: userData.email,
      name: userData.name,
      role: userData.role,
    };

    if (userData.password) {
      updateData.password = await bcrypt.hash(userData.password, 10);
    }

    // Handle facilitator profile update
    if (facilitatorProfile && userData.role === 'FACILITATOR') {
      // Check if facilitator profile exists
      const existingUser = await prisma.user.findUnique({
        where: { id },
        include: { facilitatorProfile: true },
      });

      if (existingUser?.facilitatorProfile) {
        // Update existing profile
        updateData.facilitatorProfile = {
          update: {
            qualifications: facilitatorProfile.qualifications,
          },
        };
      } else {
        // Create new profile
        updateData.facilitatorProfile = {
          create: {
            qualifications: facilitatorProfile.qualifications,
          },
        };
      }
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        facilitatorProfile: {
          select: {
            qualifications: true,
          },
        },
      },
    });

    // Audit log: User updated (especially important for role changes)
    const changes: string[] = [];
    if (userData.name && userData.name !== currentUser.name) changes.push('name');
    if (userData.email && userData.email !== currentUser.email) changes.push('email');
    if (userData.role && userData.role !== currentUser.role) changes.push('role');
    if (userData.password) changes.push('password');

    if (changes.length > 0) {
      await auditService.logResourceChange(
        req,
        'UPDATE',
        'user',
        user.id,
        user.name,
        'SUCCESS',
        {
          changes,
          previousRole: currentUser.role !== user.role ? currentUser.role : undefined,
          newRole: currentUser.role !== user.role ? user.role : undefined,
          email: user.email,
        }
      );
    }

    res.json({ success: true, data: user });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.status(500).json({ success: false, error: 'Failed to update user' });
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Get user info before deleting
    const user = await prisma.user.findUnique({
      where: { id },
      select: { name: true, email: true, role: true },
    });

    await prisma.user.delete({ where: { id } });

    // Audit log: User deleted
    if (user) {
      await auditService.logResourceChange(
        req,
        'DELETE',
        'user',
        id,
        user.name,
        'SUCCESS',
        {
          email: user.email,
          role: user.role,
        }
      );
    }

    res.json({ success: true });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.status(500).json({ success: false, error: 'Failed to delete user' });
  }
};

export const getFacilitators = async (_req: Request, res: Response) => {
  try {
    const facilitators = await prisma.facilitator.findMany({
      select: {
        id: true,
        qualifications: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        user: {
          name: 'asc',
        },
      },
    });

    // Transform the data to flatten the structure
    const facilitatorsData = facilitators.map(f => ({
      id: f.id, // This is now the Facilitator.id, not User.id
      name: f.user.name,
      email: f.user.email,
      skills: f.qualifications || [],
    }));

    res.json({
      success: true,
      data: facilitatorsData,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch facilitators' });
  }
};

/**
 * GDPR Article 15: Right to Access
 * Export all personal data for a user
 */
export const exportUserData = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Get comprehensive user data
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        facilitatorProfile: true,
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Query participant profile separately (match by email since no direct user relation)
    const participant = await prisma.participant.findUnique({
      where: { email: user.email },
      include: {
        cohorts: {
          include: {
            cohort: {
              include: {
                program: true,
              },
            },
          },
        },
      },
    });

    // Get audit logs for this user
    const auditLogs = await prisma.auditLog.findMany({
      where: { userId: id },
      orderBy: { timestamp: 'desc' },
      take: 100, // Last 100 events
    });

    // Construct comprehensive data export
    const exportData = {
      exportDate: new Date().toISOString(),
      exportType: 'GDPR Article 15 - Right to Access',
      personalData: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        ssoProvider: user.ssoProvider,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        lastLoginAt: user.lastLoginAt,
      },
      facilitatorProfile: user.facilitatorProfile ? {
        qualifications: user.facilitatorProfile.qualifications,
      } : null,
      participantProfile: participant ? {
        firstName: participant.firstName,
        lastName: participant.lastName,
        department: participant.department,
        location: participant.location,
        hireDate: participant.hireDate,
        status: participant.status,
        cohortEnrollments: participant.cohorts.map(cp => ({
          cohortName: cp.cohort.name,
          programName: cp.cohort.program.name,
          cohortStartDate: cp.cohort.startDate,
          cohortEndDate: cp.cohort.endDate,
          enrolledAt: cp.enrolledAt,
        })),
      } : null,
      activityHistory: auditLogs.map(log => ({
        timestamp: log.timestamp,
        eventType: log.eventType,
        action: log.action,
        outcome: log.outcome,
        resourceType: log.resourceType,
        ipAddress: log.ipAddress,
      })),
    };

    // Audit log: Data export
    await auditService.logBulkOperation(
      req,
      'EXPORT',
      'user_data',
      1,
      'SUCCESS'
    );

    res.json({
      success: true,
      data: exportData,
    });
  } catch (error) {
    console.error('Failed to export user data:', error);
    res.status(500).json({ success: false, error: 'Failed to export user data' });
  }
};

/**
 * GDPR Article 17: Right to be Forgotten
 * Anonymize user data while preserving referential integrity
 */
export const gdprDelete = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id },
      select: { email: true, name: true, role: true },
    });

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Anonymize user data (preserve ID for referential integrity)
    const anonymizedEmail = `deleted-${id}@anonymized.local`;
    const anonymizedName = `[Deleted User ${id.slice(0, 8)}]`;

    await prisma.$transaction(async (tx) => {
      // Anonymize user account
      await tx.user.update({
        where: { id },
        data: {
          email: anonymizedEmail,
          name: anonymizedName,
          password: null, // Remove password
          ssoProvider: null,
          ssoId: null,
        },
      });

      // Anonymize participant profile if exists (match by email)
      const participant = await tx.participant.findUnique({
        where: { email: user.email },
      });

      if (participant) {
        await tx.participant.update({
          where: { id: participant.id },
          data: {
            firstName: '[Deleted]',
            lastName: '[User]',
            email: anonymizedEmail,
            department: '[Deleted]',
            location: '[Deleted]',
          },
        });
      }

      // Anonymize audit logs for this user
      await tx.auditLog.updateMany({
        where: { userId: id },
        data: {
          userEmail: anonymizedEmail,
        },
      });
    });

    // Audit log: GDPR deletion
    await auditService.logResourceChange(
      req,
      'DELETE',
      'user',
      id,
      anonymizedName,
      'SUCCESS',
      {
        gdprDeletion: true,
        originalEmail: user.email,
        originalName: user.name,
      }
    );

    res.json({
      success: true,
      message: 'User data anonymized successfully',
    });
  } catch (error) {
    console.error('Failed to anonymize user data:', error);
    res.status(500).json({ success: false, error: 'Failed to anonymize user data' });
  }
};