import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@tms.com' },
    update: {},
    create: {
      email: 'admin@tms.com',
      name: 'Admin User',
      role: 'ADMIN',
      password: adminPassword,
    },
  });

  // Create 10 facilitators with various skill sets
  const facilitators = [
    {
      email: 'sarah.johnson@tms.com',
      name: 'Sarah Johnson',
      skills: ['Leadership Development', 'Team Building', 'Change Management', 'Performance Management'],
    },
    {
      email: 'michael.chen@tms.com',
      name: 'Michael Chen',
      skills: ['Technical Skills', 'Project Management', 'Process Improvement', 'Time Management'],
    },
    {
      email: 'emily.rodriguez@tms.com',
      name: 'Emily Rodriguez',
      skills: ['Safety Training', 'Compliance Training', 'Onboarding', 'Diversity & Inclusion'],
    },
    {
      email: 'david.kumar@tms.com',
      name: 'David Kumar',
      skills: ['Communication', 'Customer Service', 'Sales Training', 'Team Building'],
    },
    {
      email: 'lisa.thompson@tms.com',
      name: 'Lisa Thompson',
      skills: ['Leadership Development', 'Change Management', 'Communication', 'Performance Management'],
    },
    {
      email: 'james.williams@tms.com',
      name: 'James Williams',
      skills: ['Technical Skills', 'Safety Training', 'Compliance Training', 'Process Improvement'],
    },
    {
      email: 'maria.garcia@tms.com',
      name: 'Maria Garcia',
      skills: ['Onboarding', 'Diversity & Inclusion', 'Team Building', 'Communication'],
    },
    {
      email: 'robert.anderson@tms.com',
      name: 'Robert Anderson',
      skills: ['Project Management', 'Leadership Development', 'Time Management', 'Process Improvement'],
    },
    {
      email: 'jennifer.lee@tms.com',
      name: 'Jennifer Lee',
      skills: ['Customer Service', 'Communication', 'Sales Training', 'Performance Management'],
    },
    {
      email: 'christopher.brown@tms.com',
      name: 'Christopher Brown',
      skills: ['Technical Skills', 'Project Management', 'Leadership Development', 'Change Management'],
    },
  ];

  for (const facilitator of facilitators) {
    await prisma.user.upsert({
      where: { email: facilitator.email },
      update: {},
      create: {
        email: facilitator.email,
        name: facilitator.name,
        role: 'FACILITATOR',
        password: adminPassword,
        facilitatorProfile: {
          create: {
            qualifications: facilitator.skills,
          },
        },
      },
    });
  }

  // Create sample participants
  const participants = await Promise.all([
    prisma.participant.upsert({
      where: { email: 'john.doe@company.com' },
      update: {},
      create: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@company.com',
        jobTitle: 'Engineer',
        department: 'Engineering',
        location: 'New York',
        hireDate: new Date('2023-01-15'),
        status: 'active',
      },
    }),
    prisma.participant.upsert({
      where: { email: 'jane.smith@company.com' },
      update: {},
      create: {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@company.com',
        jobTitle: 'Marketing Manager',
        department: 'Marketing',
        location: 'San Francisco',
        hireDate: new Date('2023-03-20'),
        status: 'active',
      },
    }),
  ]);

  // Create sample locations
  const locations = await Promise.all([
    prisma.location.upsert({
      where: { id: 'location-1' },
      update: {},
      create: {
        id: 'location-1',
        name: 'Main Conference Room',
        address: '123 Main St, New York, NY',
        capacity: 50,
        equipment: ['Projector', 'Whiteboard', 'Video Conference'],
        type: 'physical',
      },
    }),
    prisma.location.upsert({
      where: { id: 'location-2' },
      update: {},
      create: {
        id: 'location-2',
        name: 'Zoom Virtual Room',
        capacity: 100,
        equipment: ['Screen Share', 'Breakout Rooms'],
        type: 'virtual',
      },
    }),
  ]);

  console.log('Database seeded successfully!');
  console.log('Admin credentials: admin@tms.com / admin123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });