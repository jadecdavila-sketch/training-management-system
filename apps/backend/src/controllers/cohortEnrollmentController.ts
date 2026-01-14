import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { auditService } from '../services/auditService.js';

const prisma = new PrismaClient();

export const moveParticipant = async (req: Request, res: Response) => {
  try {
    const { participantId, fromCohortId, toCohortId } = req.body;

    if (!participantId || !fromCohortId || !toCohortId) {
      return res.status(400).json({
        success: false,
        error: 'participantId, fromCohortId, and toCohortId are required',
      });
    }

    // Get participant and cohort details for audit logging
    const [participant, fromCohort, toCohort] = await Promise.all([
      prisma.participant.findUnique({ where: { id: participantId } }),
      prisma.cohort.findUnique({ where: { id: fromCohortId } }),
      prisma.cohort.findUnique({ where: { id: toCohortId } }),
    ]);

    if (!participant) {
      return res.status(404).json({ success: false, error: 'Participant not found' });
    }

    // Verify the participant exists in the source cohort
    const existingEnrollment = await prisma.cohortParticipant.findUnique({
      where: {
        cohortId_participantId: {
          cohortId: fromCohortId,
          participantId: participantId,
        },
      },
    });

    if (!existingEnrollment) {
      return res.status(404).json({
        success: false,
        error: 'Participant not found in source cohort',
      });
    }

    // Check if participant is already in target cohort
    const targetEnrollment = await prisma.cohortParticipant.findUnique({
      where: {
        cohortId_participantId: {
          cohortId: toCohortId,
          participantId: participantId,
        },
      },
    });

    if (targetEnrollment) {
      return res.status(400).json({
        success: false,
        error: 'Participant is already enrolled in the target cohort',
      });
    }

    // Perform the move in a transaction
    await prisma.$transaction(async (tx) => {
      // Remove from source cohort
      await tx.cohortParticipant.delete({
        where: {
          cohortId_participantId: {
            cohortId: fromCohortId,
            participantId: participantId,
          },
        },
      });

      // Add to target cohort
      await tx.cohortParticipant.create({
        data: {
          cohortId: toCohortId,
          participantId: participantId,
        },
      });
    });

    // Audit log: Participant moved between cohorts
    await auditService.logResourceChange(
      req,
      'UPDATE',
      'cohort_enrollment',
      participantId,
      `${participant.firstName} ${participant.lastName}`,
      'SUCCESS',
      {
        action: 'participant_moved',
        participantEmail: participant.email,
        fromCohort: fromCohort?.name,
        fromCohortId,
        toCohort: toCohort?.name,
        toCohortId,
      }
    );

    res.json({
      success: true,
      message: 'Participant moved successfully',
    });
  } catch (error: any) {
    console.error('Failed to move participant:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to move participant',
      details: error.message,
    });
  }
};

export const removeParticipant = async (req: Request, res: Response) => {
  try {
    const { participantId, cohortId } = req.body;

    if (!participantId || !cohortId) {
      return res.status(400).json({
        success: false,
        error: 'participantId and cohortId are required',
      });
    }

    // Get participant and cohort details for audit logging
    const [participant, cohort] = await Promise.all([
      prisma.participant.findUnique({ where: { id: participantId } }),
      prisma.cohort.findUnique({ where: { id: cohortId } }),
    ]);

    if (!participant) {
      return res.status(404).json({ success: false, error: 'Participant not found' });
    }

    // Verify the enrollment exists
    const existingEnrollment = await prisma.cohortParticipant.findUnique({
      where: {
        cohortId_participantId: {
          cohortId: cohortId,
          participantId: participantId,
        },
      },
    });

    if (!existingEnrollment) {
      return res.status(404).json({
        success: false,
        error: 'Participant not found in cohort',
      });
    }

    // Remove from cohort
    await prisma.cohortParticipant.delete({
      where: {
        cohortId_participantId: {
          cohortId: cohortId,
          participantId: participantId,
        },
      },
    });

    // Audit log: Participant removed from cohort
    await auditService.logResourceChange(
      req,
      'DELETE',
      'cohort_enrollment',
      participantId,
      `${participant.firstName} ${participant.lastName}`,
      'SUCCESS',
      {
        action: 'participant_removed',
        participantEmail: participant.email,
        cohort: cohort?.name,
        cohortId,
      }
    );

    res.json({
      success: true,
      message: 'Participant removed successfully',
    });
  } catch (error: any) {
    console.error('Failed to remove participant:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove participant',
      details: error.message,
    });
  }
};
