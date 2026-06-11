// Seed script for Judoclub Michigami database
// Run with: npx prisma db seed  (from project root)
// Or: tsx prisma/seed.ts

import { PrismaClient, BeltLevel, EventType } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding Judoclub Michigami database...')

  // Check if already seeded
  const userCount = await prisma.user.count()
  if (userCount > 0) {
    console.log('⚠️  Database already has data. Skipping seed.')
    return
  }

  // Hash default admin password
  const adminPasswordHash = await bcrypt.hash('admin123', 12)

  // ---------------------------------------------------------------------------
  // Create default admin user
  // ---------------------------------------------------------------------------
  console.log('  Creating admin user...')
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@judoclubmichigami.nl',
      passwordHash: adminPasswordHash,
      name: 'Robert Dingenouts',
      role: 'ADMIN',
      currentBelt: 'Zwart_1',
    },
  })

  // Create admin member profile
  await prisma.member.create({
    data: {
      userId: adminUser.id,
      firstName: 'Robert',
      lastName: 'Dingenouts',
      email: 'admin@judoclubmichigami.nl',
      currentBelt: 'Zwart_1',
      joinDate: new Date('2010-01-01'),
    },
  })

  // ---------------------------------------------------------------------------
  // Create sample student user
  // ---------------------------------------------------------------------------
  console.log('  Creating sample student...')
  const studentUser = await prisma.user.create({
    data: {
      email: 'student@example.com',
      name: 'Test Student',
      role: 'MEMBER',
      currentBelt: 'GEEL',
    },
  })

  const studentMember = await prisma.member.create({
    data: {
      userId: studentUser.id,
      firstName: 'Test',
      lastName: 'Student',
      email: 'student@example.com',
      dateOfBirth: new Date('2015-06-15'),
      currentBelt: 'GEEL',
      joinDate: new Date('2024-01-15'),
    },
  })

  // ---------------------------------------------------------------------------
  // Create sample techniques (subset for seeding)
  // ---------------------------------------------------------------------------
  console.log('  Creating sample techniques...')
  const techniques = [
    { nameJa: 'Ō-goshi', nameNl: 'Grote heup', category: 'koshi-waza', mainCategory: 'nage-waza', order: 1 },
    { nameJa: 'Seoi-nage', nameNl: 'Schoudergooi', category: 'koshi-waza', mainCategory: 'nage-waza', order: 2 },
    { nameJa: 'Osae-komi-waza', nameNl: 'Fixeer technieken', category: 'osae-waza', mainCategory: 'katame-waza', order: 3 },
    { nameJa: 'Kata-guruma', nameNl: 'Schouderkar', category: 'kata-waza', mainCategory: 'nage-waza', forbidden: true, order: 4 },
    { nameJa: 'De-ashi-harai', nameNl: 'Voetveeg', category: 'ashi-waza', mainCategory: 'nage-waza', order: 5 },
  ]

  for (const tech of techniques) {
    await prisma.technique.create({ data: tech })
  }

  // ---------------------------------------------------------------------------
  // Create sample exam attempt (student passed yellow belt)
  // ---------------------------------------------------------------------------
  console.log('  Creating sample exam attempt...')
  const examAttempt = await prisma.examAttempt.create({
    data: {
      memberId: studentMember.id,
      userId: studentUser.id,
      beltLevel: 'GEEL',
      status: 'COMPLETED_PASSED',
      examDate: new Date('2024-06-15'),
      examiner: 'Robert Dingenouts',
      overallScore: 85,
      notes: 'Goede vooruitgang! Vooral Ō-goshi is sterk.',
    },
  })

  // Add exam results per technique
  await prisma.examResult.createMany({
    data: [
      { attemptId: examAttempt.id, techniqueName: 'Ō-goshi', category: 'koshi-waza', passed: true, score: 9, feedback: 'Mooie uitvoering' },
      { attemptId: examAttempt.id, techniqueName: 'Seoi-nage', category: 'koshi-waza', passed: true, score: 8, feedback: 'Goed, meer balans nodig' },
      { attemptId: examAttempt.id, techniqueName: 'Osae-komi-waza', category: 'osae-waza', passed: true, score: 8, feedback: 'Stevige greep' },
      { attemptId: examAttempt.id, techniqueName: 'De-ashi-harai', category: 'ashi-waza', passed: false, score: 5, feedback: 'Oefen meer timing' },
    ],
  })

  // ---------------------------------------------------------------------------
  // Create diploma for passed exam
  // ---------------------------------------------------------------------------
  console.log('  Creating diploma...')
  const verificationCode = `JCM-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`

  await prisma.diploma.create({
    data: {
      type: 'BELT_EXAM',
      title: 'Examen Gele Band Geslaagd',
      description: 'Test Student heeft het examen voor de gele band succesvol afgelegd.',
      recipientId: studentMember.id,
      userId: studentUser.id,
      beltLevel: 'GEEL',
      examAttemptId: examAttempt.id,
      verificationCode,
    },
  })

  // ---------------------------------------------------------------------------
  // Create course progress (Cursus Japans)
  // ---------------------------------------------------------------------------
  console.log('  Creating course progress...')
  await prisma.courseProgress.create({
    data: {
      memberId: studentMember.id,
      userId: studentUser.id,
      courseName: 'japanese_white',
      beltLevel: 'WIT',
      lessonsCompleted: 10,
      lessonsTotal: 10,
      quizScores: JSON.stringify([
        { lessonId: 'l1', score: 90, timestamp: new Date().toISOString() },
        { lessonId: 'l2', score: 85, timestamp: new Date().toISOString() },
      ]),
      overallScore: 87.5,
      isPassed: true,
      isUnlocked: true,
      wordsLearned: 25,
      wordsTotal: 30,
      wordsQuizScore: 83,
      lastActivityAt: new Date(),
    },
  })

  // Yellow belt course (in progress)
  await prisma.courseProgress.create({
    data: {
      memberId: studentMember.id,
      userId: studentUser.id,
      courseName: 'japanese_yellow',
      beltLevel: 'GEEL',
      lessonsCompleted: 3,
      lessonsTotal: 10,
      overallScore: 75,
      isPassed: false,
      isUnlocked: true, // Unlocked because white belt passed
      wordsLearned: 8,
      wordsTotal: 35,
      wordsQuizScore: 70,
      lastActivityAt: new Date(),
    },
  })

  // Orange belt course (locked - needs yellow belt pass)
  await prisma.courseProgress.create({
    data: {
      memberId: studentMember.id,
      userId: studentUser.id,
      courseName: 'japanese_orange',
      beltLevel: 'ORANJE',
      lessonsCompleted: 0,
      lessonsTotal: 12,
      isPassed: false,
      isUnlocked: false, // Locked until yellow belt passed
    },
  })

  // ---------------------------------------------------------------------------
  // Create sample events
  // ---------------------------------------------------------------------------
  console.log('  Creating sample events...')
  const today = new Date()
  await prisma.event.createMany({
    data: [
      {
        title: 'Judo training - volwassenen',
        date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3, 20, 0),
        time: '20:00-21:30',
        type: 'LESSON',
        location: 'Judoclub Michigami, Steenbergen',
        emoji: '🥋',
      },
      {
        title: 'Judo training - jeugd',
        date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, 18, 30),
        time: '18:30-19:45',
        type: 'LESSON',
        location: 'Judoclub Michigami, Steenbergen',
        emoji: '🥋',
      },
    ],
  })

  console.log('✅ Seed completed successfully!')
  console.log(`   - 2 users (1 admin, 1 student)`)
  console.log(`   - 2 member profiles`)
  console.log(`   - ${techniques.length} techniques`)
  console.log(`   - 1 exam attempt with 4 results`)
  console.log(`   - 1 diploma`)
  console.log(`   - 3 course progress entries (Cursus Japans)`)
  console.log(`   - 2 events`)
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
