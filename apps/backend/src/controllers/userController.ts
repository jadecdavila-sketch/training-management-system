import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import bcrypt from 'bcrypt';

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
    await prisma.user.delete({ where: { id } });
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