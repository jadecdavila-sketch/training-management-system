import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { auditService } from '../services/auditService.js';

export const update = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { facilitatorId, locationId, startTime, endTime } = req.body;

    // Get current schedule state for audit comparison
    const currentSchedule = await prisma.schedule.findUnique({
      where: { id },
      include: {
        session: true,
        cohort: true,
        facilitator: { include: { user: true } },
        location: true,
      },
    });

    if (!currentSchedule) {
      return res.status(404).json({ success: false, error: 'Schedule not found' });
    }

    const updateData: any = {};
    const changes: string[] = [];

    // Allow explicitly setting to null (unassigning)
    if (facilitatorId !== undefined) {
      updateData.facilitatorId = facilitatorId || null;
      if (facilitatorId !== currentSchedule.facilitatorId) {
        changes.push(facilitatorId ? 'facilitator_assigned' : 'facilitator_unassigned');
      }
    }

    if (locationId !== undefined) {
      updateData.locationId = locationId || null;
      if (locationId !== currentSchedule.locationId) {
        changes.push(locationId ? 'location_assigned' : 'location_unassigned');
      }
    }

    if (startTime) {
      updateData.startTime = new Date(startTime);
      if (new Date(startTime).getTime() !== currentSchedule.startTime.getTime()) {
        changes.push('start_time_changed');
      }
    }

    if (endTime) {
      updateData.endTime = new Date(endTime);
      if (new Date(endTime).getTime() !== currentSchedule.endTime.getTime()) {
        changes.push('end_time_changed');
      }
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

    // Audit log: Schedule updated
    if (changes.length > 0) {
      await auditService.logResourceChange(
        req,
        'UPDATE',
        'schedule',
        schedule.id,
        `${currentSchedule.cohort.name} - ${currentSchedule.session.title}`,
        'SUCCESS',
        {
          changes,
          cohortId: currentSchedule.cohortId,
          sessionId: currentSchedule.sessionId,
          previousFacilitator: currentSchedule.facilitator?.user.email,
          newFacilitator: schedule.facilitator?.user.email,
          previousLocation: currentSchedule.location?.name,
          newLocation: schedule.location?.name,
        }
      );
    }

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
