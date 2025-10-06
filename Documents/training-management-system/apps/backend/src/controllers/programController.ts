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
              schedules: {
                include: {
                  session: true,
                  facilitator: {
                    include: {
                      user: true,
                    },
                  },
                  location: true,
                },
              },
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
                facilitator: {
                  include: {
                    user: true,
                  },
                },
                location: true,
              },
            },
            participants: {
              include: {
                participant: true,
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

    // Log schedules with their facilitator/location info for debugging
    if (program.cohorts && program.cohorts.length > 0 && program.cohorts[0].schedules) {
      console.log('Sample schedule data being returned:', JSON.stringify(program.cohorts[0].schedules[0], null, 2));
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

    // Create a mapping from original cohort IDs to created cohort database IDs
    const cohortIdMap = new Map();
    cohortDetails.forEach((originalCohort: any, index: number) => {
      cohortIdMap.set(originalCohort.id, createdCohorts[index].id);
    });

    console.log('Cohort ID mapping:', Array.from(cohortIdMap.entries()));
    console.log('Facilitator assignments:', facilitatorAssignments);
    console.log('Location assignments:', locationAssignments);

    for (const cohort of createdCohorts) {
      const originalCohortId = Array.from(cohortIdMap.entries()).find(([_, dbId]) => dbId === cohort.id)?.[0];

      for (const scheduledSession of scheduledSessions) {
        const session = createdSessions.find((s) => s.title === scheduledSession.sessionName);
        if (!session) {
          console.warn('Could not find session:', scheduledSession.sessionName, 'Available sessions:', createdSessions.map(s => s.title));
          continue;
        }

        const facilitatorAssignment = facilitatorAssignments?.find(
          (fa: any) => fa.cohortId === originalCohortId && fa.sessionId === scheduledSession.sessionId
        );

        const locationAssignment = locationAssignments?.find(
          (la: any) => la.cohortId === originalCohortId && la.sessionId === scheduledSession.sessionId
        );

        console.log(`Session ${scheduledSession.sessionName} for cohort ${cohort.name}:`, {
          facilitatorAssignment,
          locationAssignment
        });

        // Find facilitator if assigned (only lookup, don't create)
        let facilitatorId: string | undefined;
        if (facilitatorAssignment?.facilitatorEmail) {
          const existingFacilitator = await prisma.facilitator.findFirst({
            where: {
              user: {
                email: facilitatorAssignment.facilitatorEmail
              }
            }
          });

          if (existingFacilitator) {
            facilitatorId = existingFacilitator.id;
          } else {
            console.warn(`Facilitator not found for email: ${facilitatorAssignment.facilitatorEmail}`);
          }
        }

        // Find location if assigned (only lookup, don't create)
        let locationId: string | undefined;
        if (locationAssignment?.locationName) {
          const existingLocation = await prisma.location.findFirst({
            where: {
              name: locationAssignment.locationName
            }
          });

          if (existingLocation) {
            locationId = existingLocation.id;
          } else {
            console.warn(`Location not found: ${locationAssignment.locationName}`);
          }
        }

        const createdSchedule = await prisma.schedule.create({
          data: {
            cohortId: cohort.id,
            sessionId: session.id,
            startTime: new Date(scheduledSession.startTime),
            endTime: new Date(scheduledSession.endTime),
            facilitatorId,
            locationId,
          },
        });

        console.log(`Created schedule for ${scheduledSession.sessionName}:`, {
          facilitatorId,
          locationId,
          savedFacilitatorId: createdSchedule.facilitatorId,
          savedLocationId: createdSchedule.locationId
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
    const { programName, description, formData } = req.body;

    const updateData: any = {};
    if (programName) updateData.name = programName;
    if (description !== undefined) updateData.description = description;
    if (formData) updateData.formData = formData;

    const program = await prisma.program.update({
      where: { id },
      data: updateData,
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
    console.error('Update error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta,
    });
    res.status(500).json({
      success: false,
      error: 'Failed to update program',
      details: error.message
    });
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
