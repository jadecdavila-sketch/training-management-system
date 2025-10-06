import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';

export const getAll = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;

    const [programs, total] = await Promise.all([
      prisma.program.findMany({
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          cohorts: {
            include: {
              schedules: true,
            },
          },
          sessions: true,
        },
      }),
      prisma.program.count(),
    ]);

    res.json({
      success: true,
      data: programs,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error('Failed to fetch programs:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch programs' });
  }
};

export const getById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const program = await prisma.program.findUnique({
      where: { id },
      include: {
        cohorts: {
          include: {
            schedules: {
              include: {
                session: true,
              },
            },
          },
        },
        sessions: true,
      },
    });

    if (!program) {
      return res.status(404).json({ success: false, error: 'Program not found' });
    }

    res.json({ success: true, data: program });
  } catch (error) {
    console.error('Failed to fetch program:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch program' });
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    console.log('Received program creation request:', JSON.stringify(req.body, null, 2));

    const {
      programName,
      region,
      description,
      email,
      sessions,
      scheduledSessions,
      numberOfCohorts,
      cohortDetails,
      facilitatorAssignments,
      locationAssignments,
      originalFormData,
    } = req.body;

    // Calculate total duration
    let totalDuration = 1;
    if (scheduledSessions.length > 0) {
      const firstStart = new Date(scheduledSessions[0].startTime);
      const lastEnd = new Date(scheduledSessions[scheduledSessions.length - 1].endTime);
      totalDuration = Math.ceil((lastEnd.getTime() - firstStart.getTime()) / (1000 * 60 * 60 * 24 * 7));
    } else if (cohortDetails && cohortDetails.length > 0 && cohortDetails[0].startDate && cohortDetails[0].endDate) {
      const cohortStart = new Date(cohortDetails[0].startDate);
      const cohortEnd = new Date(cohortDetails[0].endDate);
      if (!isNaN(cohortStart.getTime()) && !isNaN(cohortEnd.getTime())) {
        totalDuration = Math.ceil((cohortEnd.getTime() - cohortStart.getTime()) / (1000 * 60 * 60 * 24 * 7));
      }
    }
    totalDuration = Math.max(1, totalDuration); // Ensure at least 1 week

    // Create program with nested sessions and cohorts
    const program = await prisma.program.create({
      data: {
        name: programName,
        description: description || '',
        duration: totalDuration,
        objectives: [], // Can be populated later if needed
        formData: originalFormData || req.body, // Store the original (pre-transformation) form data for editing
        sessions: {
          create: sessions.map((session: any, index: number) => ({
            title: session.name,
            description: session.description || '',
            duration: session.duration || 60,
            materials: [], // Can be populated later
            order: index,
          })),
        },
        cohorts: {
          create: cohortDetails.map((cohort: any) => {
            console.log('Processing cohort:', cohort);

            // Parse and validate start date
            const startDate = cohort.startDate ? new Date(cohort.startDate) : new Date();
            if (isNaN(startDate.getTime())) {
              console.error('Invalid start date for cohort:', cohort);
              throw new Error(`Invalid start date for cohort ${cohort.name}`);
            }

            // Calculate end date from scheduled sessions if not provided
            let endDate: Date;
            if (cohort.endDate) {
              endDate = new Date(cohort.endDate);
              if (isNaN(endDate.getTime())) {
                console.error('Invalid end date for cohort:', cohort);
                throw new Error(`Invalid end date for cohort ${cohort.name}`);
              }
            } else if (scheduledSessions.length > 0) {
              // Use the last scheduled session's end time
              endDate = new Date(scheduledSessions[scheduledSessions.length - 1].endTime);
            } else {
              // Default to 12 weeks after start date
              endDate = new Date(startDate);
              endDate.setDate(endDate.getDate() + (12 * 7));
            }

            console.log('Cohort dates validated:', { name: cohort.name, startDate, endDate });

            return {
              name: cohort.name,
              startDate,
              endDate,
              capacity: cohort.maxParticipants || 20,
              status: 'scheduled',
            };
          }),
        },
      },
      include: {
        sessions: true,
        cohorts: true,
      },
    });

    // Create schedules for each cohort
    const createdSessions = program.sessions;
    const createdCohorts = program.cohorts;

    for (const cohort of createdCohorts) {
      for (const scheduledSession of scheduledSessions) {
        const session = createdSessions.find((s) => s.name === scheduledSession.sessionName);
        if (!session) continue;

        const facilitatorAssignment = facilitatorAssignments?.find(
          (fa: any) => fa.cohortId === cohort.name && fa.sessionId === scheduledSession.sessionId
        );

        const locationAssignment = locationAssignments?.find(
          (la: any) => la.cohortId === cohort.name && la.sessionId === scheduledSession.sessionId
        );

        await prisma.schedule.create({
          data: {
            cohortId: cohort.id,
            sessionId: session.id,
            startTime: new Date(scheduledSession.startTime),
            endTime: new Date(scheduledSession.endTime),
            facilitatorName: facilitatorAssignment?.facilitatorName,
            facilitatorEmail: facilitatorAssignment?.facilitatorEmail,
            locationName: locationAssignment?.locationName,
            locationType: locationAssignment?.locationType,
          },
        });
      }
    }

    res.status(201).json({ success: true, data: program });
  } catch (error: any) {
    console.error('Failed to create program:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta,
      stack: error.stack
    });
    res.status(500).json({
      success: false,
      error: 'Failed to create program',
      details: error.message
    });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { programName, region, description, email } = req.body;

    const program = await prisma.program.update({
      where: { id },
      data: {
        name: programName,
        region,
        description,
        contactEmail: email,
      },
      include: {
        sessions: true,
        cohorts: true,
      },
    });

    res.json({ success: true, data: program });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, error: 'Program not found' });
    }
    console.error('Failed to update program:', error);
    res.status(500).json({ success: false, error: 'Failed to update program' });
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.program.delete({ where: { id } });
    res.json({ success: true });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, error: 'Program not found' });
    }
    console.error('Failed to delete program:', error);
    res.status(500).json({ success: false, error: 'Failed to delete program' });
  }
};

export const archive = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const program = await prisma.program.update({
      where: { id },
      data: { archived: true },
      include: {
        sessions: true,
        cohorts: true,
      },
    });
    res.json({ success: true, data: program });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, error: 'Program not found' });
    }
    console.error('Failed to archive program:', error);
    res.status(500).json({ success: false, error: 'Failed to archive program' });
  }
};
