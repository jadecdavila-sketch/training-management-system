import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { CreateParticipantDto, UpdateParticipantDto } from '@tms/shared';

export const getAll = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;
    const search = req.query.search as string;

    const where = search
      ? {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' as const } },
            { lastName: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [participants, total] = await Promise.all([
      prisma.participant.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: [
          { lastName: 'asc' },
          { firstName: 'asc' },
        ],
      }),
      prisma.participant.count({ where }),
    ]);

    res.json({
      success: true,
      data: participants,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch participants' });
  }
};

export const getById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const participant = await prisma.participant.findUnique({ where: { id } });

    if (!participant) {
      return res.status(404).json({ success: false, error: 'Participant not found' });
    }

    res.json({ success: true, data: participant });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch participant' });
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    const data: CreateParticipantDto = req.body;
    
    const participant = await prisma.participant.create({
      data: {
        ...data,
        hireDate: data.hireDate ? new Date(data.hireDate) : null,
      },
    });

    res.status(201).json({ success: true, data: participant });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ success: false, error: 'Email already exists' });
    }
    res.status(500).json({ success: false, error: 'Failed to create participant' });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data: UpdateParticipantDto = req.body;

    const participant = await prisma.participant.update({
      where: { id },
      data: {
        ...data,
        hireDate: data.hireDate ? new Date(data.hireDate) : undefined,
      },
    });

    res.json({ success: true, data: participant });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, error: 'Participant not found' });
    }
    res.status(500).json({ success: false, error: 'Failed to update participant' });
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.participant.delete({ where: { id } });
    res.json({ success: true });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, error: 'Participant not found' });
    }
    res.status(500).json({ success: false, error: 'Failed to delete participant' });
  }
};

export const importParticipants = async (req: Request, res: Response) => {
  try {
    const participants: CreateParticipantDto[] = req.body;

    const created = await prisma.participant.createMany({
      data: participants.map(p => ({
        ...p,
        hireDate: p.hireDate ? new Date(p.hireDate) : null,
      })),
      skipDuplicates: true,
    });

    res.status(201).json({ success: true, data: { count: created.count } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to import participants' });
  }
};