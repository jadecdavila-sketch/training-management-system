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

  // Delete existing locations first to ensure clean seed
  await prisma.location.deleteMany({});

  // Create sample locations with various types and capacities
  const locations = await Promise.all([
    // Conference Rooms (various sizes)
    prisma.location.upsert({
      where: { id: 'location-1' },
      update: {
        name: 'Executive Boardroom',
        address: '123 Main St, Building A, Floor 5',
        capacity: 16,
        equipment: ['Video Conference', 'Smart Board', 'Premium Audio', '4K Display'],
        type: 'Conference Room',
      },
      create: {
        id: 'location-1',
        name: 'Executive Boardroom',
        address: '123 Main St, Building A, Floor 5',
        capacity: 16,
        equipment: ['Video Conference', 'Smart Board', 'Premium Audio', '4K Display'],
        type: 'Conference Room',
      },
    }),
    prisma.location.upsert({
      where: { id: 'location-2' },
      update: {},
      create: {
        id: 'location-2',
        name: 'Conference Room A',
        address: '123 Main St, Building C, Floor 3',
        capacity: 30,
        equipment: ['Video Conference', 'Smart Board', 'Projector', 'Microphones'],
        type: 'Conference Room',
      },
    }),
    prisma.location.upsert({
      where: { id: 'location-3' },
      update: {},
      create: {
        id: 'location-3',
        name: 'Conference Room B',
        address: '123 Main St, Building C, Floor 3',
        capacity: 24,
        equipment: ['Projector', 'Whiteboard', 'Video Conference'],
        type: 'Conference Room',
      },
    }),
    // Auditoriums (large capacity)
    prisma.location.upsert({
      where: { id: 'location-4' },
      update: {},
      create: {
        id: 'location-4',
        name: 'Main Auditorium',
        address: '123 Main St, Building C, Floor 1',
        capacity: 200,
        equipment: ['Stage', 'Projector', 'Sound System', 'Lighting', 'Recording Equipment'],
        type: 'Auditorium',
      },
    }),
    prisma.location.upsert({
      where: { id: 'location-5' },
      update: {},
      create: {
        id: 'location-5',
        name: 'Small Auditorium',
        address: '123 Main St, Building B, Floor 2',
        capacity: 80,
        equipment: ['Projector', 'Sound System', 'Microphones'],
        type: 'Auditorium',
      },
    }),
    // Training Rooms (medium capacity)
    prisma.location.upsert({
      where: { id: 'location-6' },
      update: {},
      create: {
        id: 'location-6',
        name: 'Training Room A',
        address: '123 Main St, Building A, Floor 2',
        capacity: 20,
        equipment: ['Projector', 'Whiteboard', 'Desks', 'Chairs'],
        type: 'Training Room',
      },
    }),
    prisma.location.upsert({
      where: { id: 'location-7' },
      update: {},
      create: {
        id: 'location-7',
        name: 'Training Room B',
        address: '123 Main St, Building A, Floor 2',
        capacity: 25,
        equipment: ['Smart Board', 'Video Conference', 'Desks', 'Chairs'],
        type: 'Training Room',
      },
    }),
    prisma.location.upsert({
      where: { id: 'location-8' },
      update: {},
      create: {
        id: 'location-8',
        name: 'Training Room C',
        address: '123 Main St, Building B, Floor 3',
        capacity: 18,
        equipment: ['Projector', 'Whiteboard', 'Desks'],
        type: 'Training Room',
      },
    }),
    // Workshop Spaces
    prisma.location.upsert({
      where: { id: 'location-9' },
      update: {},
      create: {
        id: 'location-9',
        name: 'Innovation Workshop',
        address: '123 Main St, Building D, Floor 1',
        capacity: 35,
        equipment: ['Interactive Displays', 'Collaboration Tools', 'Video Conference', 'Whiteboards'],
        type: 'Workshop Space',
      },
    }),
    prisma.location.upsert({
      where: { id: 'location-10' },
      update: {},
      create: {
        id: 'location-10',
        name: 'Collaboration Hub',
        address: '123 Main St, Building B, Floor 2',
        capacity: 40,
        equipment: ['Multiple Whiteboards', 'Flexible Seating', 'Projector', 'Video Conference'],
        type: 'Workshop Space',
      },
    }),
    prisma.location.upsert({
      where: { id: 'location-11' },
      update: {},
      create: {
        id: 'location-11',
        name: 'Factory Floor Training Area',
        address: 'Manufacturing Plant, Bay 3',
        capacity: 15,
        equipment: ['Safety Equipment', 'Whiteboard', 'Mobile Chairs'],
        type: 'Workshop Space',
      },
    }),
    // Meeting Rooms (small capacity)
    prisma.location.upsert({
      where: { id: 'location-12' },
      update: {},
      create: {
        id: 'location-12',
        name: 'Meeting Room 1',
        address: '123 Main St, Building A, Floor 3',
        capacity: 8,
        equipment: ['TV Monitor', 'Whiteboard', 'Conference Phone'],
        type: 'Meeting Room',
      },
    }),
    prisma.location.upsert({
      where: { id: 'location-13' },
      update: {},
      create: {
        id: 'location-13',
        name: 'Meeting Room 2',
        address: '123 Main St, Building A, Floor 4',
        capacity: 6,
        equipment: ['TV Monitor', 'Whiteboard'],
        type: 'Meeting Room',
      },
    }),
    prisma.location.upsert({
      where: { id: 'location-14' },
      update: {},
      create: {
        id: 'location-14',
        name: 'Meeting Room 3',
        address: '123 Main St, Building B, Floor 1',
        capacity: 10,
        equipment: ['TV Monitor', 'Whiteboard', 'Video Conference'],
        type: 'Meeting Room',
      },
    }),
    // Classrooms
    prisma.location.upsert({
      where: { id: 'location-15' },
      update: {},
      create: {
        id: 'location-15',
        name: 'Classroom A',
        address: '123 Main St, Building B, Floor 1',
        capacity: 30,
        equipment: ['Projector', 'Whiteboard', 'Sound System', 'Desks', 'Chairs'],
        type: 'Classroom',
      },
    }),
    prisma.location.upsert({
      where: { id: 'location-16' },
      update: {},
      create: {
        id: 'location-16',
        name: 'Classroom B',
        address: '123 Main St, Building A, Floor 3',
        capacity: 25,
        equipment: ['Smart Board', 'Desks', 'Chairs'],
        type: 'Classroom',
      },
    }),
    prisma.location.upsert({
      where: { id: 'location-17' },
      update: {},
      create: {
        id: 'location-17',
        name: 'Small Classroom',
        address: '123 Main St, Building A, Floor 4',
        capacity: 15,
        equipment: ['Whiteboard', 'Desks', 'Chairs'],
        type: 'Classroom',
      },
    }),
    // Virtual Rooms (high capacity)
    prisma.location.upsert({
      where: { id: 'location-18' },
      update: {},
      create: {
        id: 'location-18',
        name: 'Zoom Virtual Room 1',
        capacity: 100,
        equipment: ['Screen Share', 'Breakout Rooms', 'Recording'],
        type: 'Virtual',
      },
    }),
    prisma.location.upsert({
      where: { id: 'location-19' },
      update: {},
      create: {
        id: 'location-19',
        name: 'Microsoft Teams Room 1',
        capacity: 100,
        equipment: ['Screen Share', 'Breakout Rooms', 'Recording', 'Live Captions'],
        type: 'Virtual',
      },
    }),
    prisma.location.upsert({
      where: { id: 'location-20' },
      update: {},
      create: {
        id: 'location-20',
        name: 'Zoom Virtual Room 2',
        capacity: 50,
        equipment: ['Screen Share', 'Breakout Rooms', 'Recording'],
        type: 'Virtual',
      },
    }),
    prisma.location.upsert({
      where: { id: 'location-21' },
      update: {},
      create: {
        id: 'location-21',
        name: 'Google Meet Room',
        capacity: 75,
        equipment: ['Screen Share', 'Recording', 'Live Q&A'],
        type: 'Virtual',
      },
    }),
    prisma.location.upsert({
      where: { id: 'location-22' },
      update: {},
      create: {
        id: 'location-22',
        name: 'Webex Virtual Room',
        capacity: 100,
        equipment: ['Screen Share', 'Breakout Rooms', 'Recording', 'Polling'],
        type: 'Virtual',
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