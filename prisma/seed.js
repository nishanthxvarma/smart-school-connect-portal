const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing existing data...');
  try {
    // In MongoDB, we delete records from all collections
    await prisma.achievement.deleteMany({});
    await prisma.notification.deleteMany({});
    await prisma.mark.deleteMany({});
    await prisma.appointment.deleteMany({});
    await prisma.complaint.deleteMany({});
    await prisma.resource.deleteMany({});
    await prisma.event.deleteMany({});
    await prisma.notice.deleteMany({});
    await prisma.homework.deleteMany({});
    await prisma.attendance.deleteMany({});
    await prisma.student.deleteMany({});
    await prisma.class.deleteMany({});
    await prisma.parent.deleteMany({});
    await prisma.teacher.deleteMany({});
    await prisma.user.deleteMany({});
    console.log('Database cleared.');
  } catch (e) {
    console.log('Clear skipped or failed (probably empty database):', e.message);
  }

  console.log('Seeding database...');

  // 1. Password hashes
  const adminHash = await bcrypt.hash('admin123', 10);

  // 2. Create Users
  await prisma.user.create({
    data: {
      id: '60d5ec388f6e2a2c148e0001',
      email: 'admin@school.gov.in',
      username: 'admin',
      passwordHash: adminHash,
      name: 'System Admin',
      role: 'ADMIN',
    }
  });

  console.log('Created Admin User.');
  console.log('Database seeding complete!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
