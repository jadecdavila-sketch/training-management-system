import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { CreateLocationDto, UpdateLocationDto } from '@tms/shared';

export const getAll = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;
    const type = req.query.type as string;

    const where = type ? { type } : {};

    const [locations, total] = await Promise.all([
      prisma.location.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { name: 'asc' },
      }),
      prisma.location.count({ where }),
    ]);

    res.json({
      success: true,
      data: locations,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch locations' });
  }
};

export const getById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const location = await prisma.location.findUnique({ where: { id } });

    if (!location) {
      return res.status(404).json({ success: false, error: 'Location not found' });
    }

    res.json({ success: true, data: location });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch location' });
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    const data: CreateLocationDto = req.body;
    
    const location = await prisma.location.create({
      data: {
        ...data,
        equipment: data.equipment || [],
      },
    });

    res.status(201).json({ success: true, data: location });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create location' });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data: UpdateLocationDto = req.body;

    const location = await prisma.location.update({
      where: { id },
      data,
    });

    res.json({ success: true, data: location });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, error: 'Location not found' });
    }
    res.status(500).json({ success: false, error: 'Failed to update location' });
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.location.delete({ where: { id } });
    res.json({ success: true });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, error: 'Location not found' });
    }
    res.status(500).json({ success: false, error: 'Failed to delete location' });
  }
};