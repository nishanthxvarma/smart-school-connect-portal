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
  const teacherHash = await bcrypt.hash('teacher123', 10);
  const parentHash = await bcrypt.hash('parent123', 10);
  const studentHash = await bcrypt.hash('student123', 10);

  // 2. Create Users
  const users = [
    {
      id: '60d5ec388f6e2a2c148e0001',
      email: 'admin@school.gov.in',
      username: 'admin',
      passwordHash: adminHash,
      name: 'Dr. Rajendra Prasad (Admin)',
      role: 'ADMIN',
    },
    {
      id: '60d5ec388f6e2a2c148e0002',
      email: 'teacher@school.gov.in',
      username: 'teacher',
      passwordHash: teacherHash,
      name: 'Smt. Lakshmi Devi (Teacher)',
      role: 'TEACHER',
    },
    {
      id: '60d5ec388f6e2a2c148e0003',
      email: 'teacher2@school.gov.in',
      username: 'teacher2',
      passwordHash: teacherHash,
      name: 'Shri Rajesh Kumar (Science Teacher)',
      role: 'TEACHER',
    },
    {
      id: '60d5ec388f6e2a2c148e0004',
      email: 'parent@school.gov.in',
      username: 'parent',
      passwordHash: parentHash,
      name: 'Shri Ramesh Singh (Parent)',
      role: 'PARENT',
    },
    {
      id: '60d5ec388f6e2a2c148e0005',
      email: 'student@school.gov.in',
      username: 'student',
      passwordHash: studentHash,
      name: 'Aditya Singh (Student)',
      role: 'STUDENT',
    },
    {
      id: '60d5ec388f6e2a2c148e0006',
      email: 'student2@school.gov.in',
      username: 'student2',
      passwordHash: studentHash,
      name: 'Neha Singh (Student)',
      role: 'STUDENT',
    },
  ];

  for (const u of users) {
    await prisma.user.create({ data: u });
  }
  console.log('Created Users.');

  // 3. Create Teachers
  const teacher1 = await prisma.teacher.create({
    data: {
      id: '60d5ec388f6e2a2c148e0007',
      userId: '60d5ec388f6e2a2c148e0002',
      employeeId: 'TCH-2026-001',
      subjectSpecialty: 'Mathematics & English',
      phone: '+91 9876543210',
    },
  });

  const teacher2 = await prisma.teacher.create({
    data: {
      id: '60d5ec388f6e2a2c148e0008',
      userId: '60d5ec388f6e2a2c148e0003',
      employeeId: 'TCH-2026-002',
      subjectSpecialty: 'General Science',
      phone: '+91 8765432109',
    },
  });
  console.log('Created Teachers.');

  // 4. Create Parent Profile
  const parentProfile = await prisma.parent.create({
    data: {
      id: '60d5ec388f6e2a2c148e0009',
      userId: '60d5ec388f6e2a2c148e0004',
      phone: '+91 7654321098',
      address: 'Quarter No. 42, Sector-4, R.K. Puram, New Delhi',
    },
  });
  console.log('Created Parent.');

  // 5. Create Classes
  const class10A = await prisma.class.create({
    data: {
      id: '60d5ec388f6e2a2c148e0010',
      name: 'Class 10-A',
      teacherId: '60d5ec388f6e2a2c148e0007', // Led by Laxmi Devi
    },
  });

  const class9A = await prisma.class.create({
    data: {
      id: '60d5ec388f6e2a2c148e0011',
      name: 'Class 9-A',
      teacherId: '60d5ec388f6e2a2c148e0008', // Led by Rajesh Kumar
    },
  });
  console.log('Created Classes.');

  // 6. Create Students
  const student1 = await prisma.student.create({
    data: {
      id: '60d5ec388f6e2a2c148e0012',
      userId: '60d5ec388f6e2a2c148e0005',
      rollNumber: 'ROLL-10A-01',
      classId: '60d5ec388f6e2a2c148e0010',
      parentId: '60d5ec388f6e2a2c148e0009',
    },
  });

  const student2 = await prisma.student.create({
    data: {
      id: '60d5ec388f6e2a2c148e0013',
      userId: '60d5ec388f6e2a2c148e0006',
      rollNumber: 'ROLL-10A-02',
      classId: '60d5ec388f6e2a2c148e0010',
      parentId: '60d5ec388f6e2a2c148e0009',
    },
  });
  console.log('Created Students.');

  // 7. Create Notices
  const notices = [
    {
      title: 'Summer Vacation Announcement',
      content: 'The school will remain closed for summer vacation from June 20, 2026, to July 15, 2026. Online remedial classes for Board students will continue as scheduled.',
      category: 'HOLIDAY',
      publishDate: new Date('2026-06-10'),
      isPublished: true,
      createdById: '60d5ec388f6e2a2c148e0001',
    },
    {
      title: 'First Terminal Examinations Date Sheet',
      content: 'The First Terminal Examinations for classes 6 to 10 will begin on July 25, 2026. The detailed date sheet is uploaded on the student portal.',
      category: 'EXAMINATION',
      publishDate: new Date('2026-06-12'),
      isPublished: true,
      createdById: '60d5ec388f6e2a2c148e0001',
    },
    {
      title: 'Urgent Parent-Teacher Meeting (PTM)',
      content: 'An all-class Parent-Teacher Meeting is scheduled for Saturday, June 18, 2026, from 9:00 AM to 12:30 PM to discuss results and terminal exam syllabus.',
      category: 'PARENT_MEETING',
      publishDate: new Date('2026-06-14'),
      isPublished: true,
      createdById: '60d5ec388f6e2a2c148e0002',
    },
    {
      title: 'Water Pipeline Repairs - Temporary Disturbance',
      content: 'The drinking water pipeline is undergoing maintenance. Students are requested to bring water bottles for the next two days.',
      category: 'EMERGENCY',
      publishDate: new Date('2026-06-15'),
      isPublished: true,
      createdById: '60d5ec388f6e2a2c148e0001',
    },
  ];

  for (const n of notices) {
    await prisma.notice.create({ data: n });
  }
  console.log('Created Notices.');

  // 8. Create Events
  const events = [
    {
      title: 'Annual Sports Day 2026',
      description: 'Annual Track and Field events will be conducted at the main school playground. Awards will be presented by the Chief Education Officer.',
      date: new Date('2026-07-20T09:00:00.000Z'),
      createdById: '60d5ec388f6e2a2c148e0001',
    },
    {
      title: 'National Science Fair Exhibition',
      description: 'Students of classes 8 to 10 are invited to display working models and science posters. The theme is Sustainable Energy Technologies.',
      date: new Date('2026-08-05T10:00:00.000Z'),
      createdById: '60d5ec388f6e2a2c148e0001',
    },
    {
      title: 'Independence Day Celebration',
      description: 'Flag hoisting ceremony at 8:00 AM followed by patriotic songs, speech, and sweet distribution.',
      date: new Date('2026-08-15T08:00:00.000Z'),
      createdById: '60d5ec388f6e2a2c148e0001',
    },
  ];

  for (const ev of events) {
    await prisma.event.create({ data: ev });
  }
  console.log('Created Events.');

  // 9. Create Homework
  const homeworks = [
    {
      subject: 'Mathematics',
      classId: '60d5ec388f6e2a2c148e0010',
      description: 'Solve exercises 5.2 and 5.3 on Arithmetic Progression in your homework notebooks.',
      dueDate: new Date('2026-06-18T18:30:00.000Z'),
      createdById: '60d5ec388f6e2a2c148e0007',
    },
    {
      subject: 'English Grammar',
      classId: '60d5ec388f6e2a2c148e0010',
      description: 'Complete the worksheets on Active/Passive voice (sentences 1 to 20). Download attachment for worksheet.',
      dueDate: new Date('2026-06-19T18:30:00.000Z'),
      createdById: '60d5ec388f6e2a2c148e0007',
    },
    {
      subject: 'Physics',
      classId: '60d5ec388f6e2a2c148e0010',
      description: 'Draw ray diagrams for concave and convex mirrors showing positions for different object points.',
      dueDate: new Date('2026-06-20T18:30:00.000Z'),
      createdById: '60d5ec388f6e2a2c148e0008',
    },
  ];

  for (const hw of homeworks) {
    await prisma.homework.create({ data: hw });
  }
  console.log('Created Homework.');

  // 10. Create Resources
  const resources = [
    {
      title: 'Arithmetic Progression Video Lecture Link',
      category: 'YOUTUBE',
      fileUrl: 'https://youtube.com/watch?v=ap_tutorial_class10',
      classId: '60d5ec388f6e2a2c148e0010',
      subject: 'Mathematics',
      uploadedById: '60d5ec388f6e2a2c148e0007',
    },
    {
      title: 'Light Reflection & Refraction Notes PDF',
      category: 'PDF',
      fileUrl: '/uploads/resources/class10_light_notes.pdf',
      classId: '60d5ec388f6e2a2c148e0010',
      subject: 'Physics',
      uploadedById: '60d5ec388f6e2a2c148e0008',
    },
    {
      title: 'Pre-Board English Model Question Paper',
      category: 'WORKSHEET',
      fileUrl: '/uploads/resources/english_sample_paper.pdf',
      classId: '60d5ec388f6e2a2c148e0010',
      subject: 'English',
      uploadedById: '60d5ec388f6e2a2c148e0007',
    },
  ];

  for (const r of resources) {
    await prisma.resource.create({ data: r });
  }
  console.log('Created Resources.');

  // 11. Create Attendance (Aditya and Neha - last 5 days)
  const attendanceRecords = [];
  const dates = [
    new Date('2026-06-11'),
    new Date('2026-06-12'),
    new Date('2026-06-13'),
    new Date('2026-06-14'),
    new Date('2026-06-15'),
  ];

  // Student 1 (Aditya): 4 Present, 1 Late
  attendanceRecords.push({
    studentId: '60d5ec388f6e2a2c148e0012',
    date: dates[0],
    status: 'PRESENT',
    remarks: 'Punctual',
    markedById: '60d5ec388f6e2a2c148e0007',
  });
  attendanceRecords.push({
    studentId: '60d5ec388f6e2a2c148e0012',
    date: dates[1],
    status: 'PRESENT',
    remarks: 'Active participation',
    markedById: '60d5ec388f6e2a2c148e0007',
  });
  attendanceRecords.push({
    studentId: '60d5ec388f6e2a2c148e0012',
    date: dates[2],
    status: 'PRESENT',
    remarks: 'Good',
    markedById: '60d5ec388f6e2a2c148e0007',
  });
  attendanceRecords.push({
    studentId: '60d5ec388f6e2a2c148e0012',
    date: dates[3],
    status: 'LATE',
    remarks: 'Missed school bus',
    markedById: '60d5ec388f6e2a2c148e0007',
  });
  attendanceRecords.push({
    studentId: '60d5ec388f6e2a2c148e0012',
    date: dates[4],
    status: 'PRESENT',
    remarks: 'Good',
    markedById: '60d5ec388f6e2a2c148e0007',
  });

  // Student 2 (Neha): 3 Present, 2 Absent
  attendanceRecords.push({
    studentId: '60d5ec388f6e2a2c148e0013',
    date: dates[0],
    status: 'PRESENT',
    remarks: 'Good',
    markedById: '60d5ec388f6e2a2c148e0007',
  });
  attendanceRecords.push({
    studentId: '60d5ec388f6e2a2c148e0013',
    date: dates[1],
    status: 'ABSENT',
    remarks: 'Sick leave (fever)',
    markedById: '60d5ec388f6e2a2c148e0007',
  });
  attendanceRecords.push({
    studentId: '60d5ec388f6e2a2c148e0013',
    date: dates[2],
    status: 'ABSENT',
    remarks: 'Uninformed absence',
    markedById: '60d5ec388f6e2a2c148e0007',
  });
  attendanceRecords.push({
    studentId: '60d5ec388f6e2a2c148e0013',
    date: dates[3],
    status: 'PRESENT',
    remarks: 'Back to school',
    markedById: '60d5ec388f6e2a2c148e0007',
  });
  attendanceRecords.push({
    studentId: '60d5ec388f6e2a2c148e0013',
    date: dates[4],
    status: 'PRESENT',
    remarks: 'Good',
    markedById: '60d5ec388f6e2a2c148e0007',
  });

  for (const att of attendanceRecords) {
    await prisma.attendance.create({ data: att });
  }
  console.log('Created Attendance records.');

  // 12. Create Marks (Grades)
  const marks = [
    {
      studentId: '60d5ec388f6e2a2c148e0012', // Aditya
      subject: 'Mathematics',
      examName: 'First Unit Test',
      score: 85,
      maxScore: 100,
      remarks: 'Excellent analytical skills. Keep it up!',
      gradedById: '60d5ec388f6e2a2c148e0007',
    },
    {
      studentId: '60d5ec388f6e2a2c148e0012', // Aditya
      subject: 'Science',
      examName: 'First Unit Test',
      score: 78,
      maxScore: 100,
      remarks: 'Strong in chemistry concepts, needs improvement in physics diagrams.',
      gradedById: '60d5ec388f6e2a2c148e0008',
    },
    {
      studentId: '60d5ec388f6e2a2c148e0013', // Neha
      subject: 'Mathematics',
      examName: 'First Unit Test',
      score: 92,
      maxScore: 100,
      remarks: 'Outstanding score! Top performer in geometry section.',
      gradedById: '60d5ec388f6e2a2c148e0007',
    },
    {
      studentId: '60d5ec388f6e2a2c148e0013', // Neha
      subject: 'Science',
      examName: 'First Unit Test',
      score: 88,
      maxScore: 100,
      remarks: 'Excellent performance, very thorough responses.',
      gradedById: '60d5ec388f6e2a2c148e0008',
    },
  ];

  for (const m of marks) {
    await prisma.mark.create({ data: m });
  }
  console.log('Created Academic Marks.');

  // 13. Create Complaints (Community Infrastructure Issues)
  const complaints = [
    {
      title: 'Ceiling Fan Not Working in Room 12',
      description: 'The middle ceiling fan in Class 10-A classroom makes a clicking noise and does not rotate. It is very hot during mid-day.',
      category: 'FAN_NOT_WORKING',
      status: 'UNDER_REVIEW',
      reporterId: '60d5ec388f6e2a2c148e0004', // Parent Ramesh Singh
      photoUrl: '/uploads/issues/fan_broken.jpg',
      date: new Date('2026-06-12'),
    },
    {
      title: 'Water Cooler Filter Choked',
      description: 'The drinking water cooler near the staff room has muddy water coming out. The filter cartridge seems expired.',
      category: 'WATER_PROBLEM',
      status: 'IN_PROGRESS',
      reporterId: '60d5ec388f6e2a2c148e0005', // Student Aditya
      photoUrl: '/uploads/issues/water_cooler.jpg',
      date: new Date('2026-06-14'),
    },
    {
      title: 'Broken Bench in Chemistry Lab',
      description: 'The front bench on the right side of the chemistry lab has a loose wooden plank. It might cause injuries to students.',
      category: 'BROKEN_BENCH',
      status: 'SUBMITTED',
      reporterId: '60d5ec388f6e2a2c148e0005', // Student Aditya
      photoUrl: null,
      date: new Date('2026-06-15'),
    },
  ];

  for (const c of complaints) {
    await prisma.complaint.create({ data: c });
  }
  console.log('Created Complaints/Issues.');

  // 14. Create Appointments
  const appointments = [
    {
      parentId: '60d5ec388f6e2a2c148e0009', // Ramesh Singh
      teacherId: '60d5ec388f6e2a2c148e0007', // Lakshmi Devi
      purpose: 'Discuss Aditya\'s marks and general discipline issues.',
      preferredDate: new Date('2026-06-22T10:00:00.000Z'),
      status: 'APPROVED',
      remarks: 'Approved. Please meet in the staff room during 4th period (10:30 AM).',
    },
    {
      parentId: '60d5ec388f6e2a2c148e0009', // Ramesh Singh
      teacherId: '60d5ec388f6e2a2c148e0008', // Rajesh Kumar
      purpose: 'Discuss science exam performance and help tips.',
      preferredDate: new Date('2026-06-23T11:00:00.000Z'),
      status: 'PENDING',
    },
  ];

  for (const app of appointments) {
    await prisma.appointment.create({ data: app });
  }
  console.log('Created Appointments.');

  // 15. Create Achievements
  const achievements = [
    {
      studentId: '60d5ec388f6e2a2c148e0012', // Aditya
      title: 'Zonal Science Seminar Winner',
      description: 'Won First Prize in the Zonal level Science Seminar and Quiz competition held at District School Board.',
      category: 'ACADEMIC',
      certificateUrl: '/uploads/certificates/science_seminar.pdf',
      dateAwarded: new Date('2026-05-15'),
    },
    {
      studentId: '60d5ec388f6e2a2c148e0013', // Neha
      title: 'Inter-School 400m Gold Medalist',
      description: 'Secured Gold Medal in the girls 400m race at the annual District Athletic Meet.',
      category: 'SPORTS',
      certificateUrl: '/uploads/certificates/sports_gold.pdf',
      dateAwarded: new Date('2026-05-20'),
    },
  ];

  for (const ach of achievements) {
    await prisma.achievement.create({ data: ach });
  }
  console.log('Created Achievements.');

  // 16. Create Notifications
  const notifications = [
    {
      userId: '60d5ec388f6e2a2c148e0004', // Parent Ramesh
      title: 'New Homework Assigned',
      message: 'New Mathematics homework has been assigned for Class 10-A. Due Date: June 18, 2026.',
      type: 'HOMEWORK',
    },
    {
      userId: '60d5ec388f6e2a2c148e0005', // Student Aditya
      title: 'New Homework Assigned',
      message: 'Solve AP exercises 5.2 and 5.3. Due Date: June 18, 2026.',
      type: 'HOMEWORK',
    },
    {
      userId: '60d5ec388f6e2a2c148e0004', // Parent Ramesh
      title: 'Meeting Request Approved',
      message: 'Your meeting request with Smt. Lakshmi Devi has been APPROVED for June 22, 2026.',
      type: 'APPOINTMENT',
    },
    {
      userId: '60d5ec388f6e2a2c148e0001', // Admin
      title: 'New School Issue Reported',
      message: 'Broken Bench in Chemistry Lab has been reported by Aditya Singh.',
      type: 'COMPLAINT',
    },
  ];

  for (const not of notifications) {
    await prisma.notification.create({ data: not });
  }
  console.log('Created Notifications.');

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
