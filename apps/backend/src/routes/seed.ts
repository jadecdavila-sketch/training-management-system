import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import bcrypt from 'bcrypt';

const router = Router();

router.post('/run', async (_req, res) => {
  try {
    console.log('Seeding database...');

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    await prisma.user.upsert({
      where: { email: 'admin@tms.com' },
      update: {},
      create: {
        email: 'admin@tms.com',
        name: 'Admin User',
        role: 'ADMIN',
        password: adminPassword,
      },
    });

    // Create facilitators
    const facilitatorData = [
      { email: 'sarah.johnson@tms.com', name: 'Sarah Johnson', skills: ['Leadership Development', 'Team Building'] },
      { email: 'michael.chen@tms.com', name: 'Michael Chen', skills: ['Technical Skills', 'Project Management'] },
      { email: 'emily.rodriguez@tms.com', name: 'Emily Rodriguez', skills: ['Safety Training', 'Compliance Training'] },
    ];

    for (const fac of facilitatorData) {
      const password = await bcrypt.hash('password123', 10);
      const user = await prisma.user.upsert({
        where: { email: fac.email },
        update: {},
        create: {
          email: fac.email,
          name: fac.name,
          role: 'FACILITATOR',
          password,
        },
      });

      await prisma.facilitator.upsert({
        where: { userId: user.id },
        update: {},
        create: {
          userId: user.id,
          qualifications: fac.skills,
        },
      });
    }

    // Create locations
    const locations = [
      { name: 'Main Office - Room 101', type: 'Physical', capacity: 20, address: 'HQ Building, Floor 1', equipment: [] },
      { name: 'Main Office - Room 202', type: 'Physical', capacity: 15, address: 'HQ Building, Floor 2', equipment: [] },
      { name: 'Zoom Meeting Room', type: 'Virtual', capacity: 50, equipment: [] },
    ];

    for (const loc of locations) {
      // Check if location already exists
      const existing = await prisma.location.findFirst({
        where: { name: loc.name }
      });

      if (!existing) {
        await prisma.location.create({
          data: loc,
        });
      }
    }

    // Create sample participants
    const participants = [
      { firstName: 'John', lastName: 'Doe', email: 'john.doe@company.com', department: 'Engineering', jobTitle: 'Software Engineer', location: 'Seattle' },
      { firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@company.com', department: 'Marketing', jobTitle: 'Marketing Manager', location: 'Seattle' },
      { firstName: 'Bob', lastName: 'Johnson', email: 'bob.johnson@company.com', department: 'Sales', jobTitle: 'Sales Rep', location: 'Portland' },
      { firstName: 'Alice', lastName: 'Williams', email: 'alice.williams@company.com', department: 'HR', jobTitle: 'HR Specialist', location: 'Seattle' },
      { firstName: 'Charlie', lastName: 'Brown', email: 'charlie.brown@company.com', department: 'Engineering', jobTitle: 'Senior Engineer', location: 'Seattle' },
    ];

    for (const p of participants) {
      await prisma.participant.upsert({
        where: { email: p.email },
        update: {},
        create: {
          ...p,
          status: 'active',
        },
      });
    }

    res.json({
      success: true,
      message: 'Database seeded successfully',
      counts: {
        users: 4,
        facilitators: 3,
        locations: 3,
        participants: 5
      }
    });
  } catch (error: any) {
    console.error('Seed error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
