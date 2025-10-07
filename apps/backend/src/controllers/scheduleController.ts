import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';

export const update = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { facilitatorId, locationId, startTime, endTime } = req.body;

    const updateData: any = {};

    // Allow explicitly setting to null (unassigning)
    if (facilitatorId !== undefined) {
      updateData.facilitatorId = facilitatorId || null;
    }

    if (locationId !== undefined) {
      updateData.locationId = locationId || null;
    }

    if (startTime) {
      updateData.startTime = new Date(startTime);
    }

    if (endTime) {
      updateData.endTime = new Date(endTime);
    }

    const schedule = await prisma.schedule.update({
      where: { id },
      data: updateData,
      include: {
        session: true,
        facilitator: {
          include: {
            user: true,
          },
        },
        location: true,
      },
    });

    res.json({ success: true, data: schedule });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, error: 'Schedule not found' });
    }
    console.error('Failed to update schedule:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update schedule',
      details: error.message
    });
  }
};
