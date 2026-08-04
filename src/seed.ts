import 'dotenv/config';
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Student } from './database/entities/student.entity';
import { AttendanceRecord } from './database/entities/attendance-record.entity';
import {
  AssessmentRecord,
  AssessmentType,
} from './database/entities/assessment-record.entity';
import { EngagementRecord } from './database/entities/engagement-record.entity';
import { RiskAssessment } from './database/entities/risk-assessment.entity';
import { Recommendation } from './database/entities/recommendation.entity';

const STUDENT_COUNT = 40;
const PROGRAMMES = [
  'BSc Computing',
  'BSc Information Technology',
  'BSc Software Engineering',
  'BSc Data Science',
];
const COHORT_YEARS = [2023, 2024, 2025];
const COURSE_CODES = ['CS101', 'CS204', 'CS310', 'CS415'];
const TERM = '2025-26 Semester 1';
const ASSESSMENT_TYPES = Object.values(AssessmentType);

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

function pick<T>(items: T[]): T {
  return items[randomInt(0, items.length - 1)];
}

function isoDateDaysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
}

async function seed() {
  const dataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    ssl:
      process.env.DATABASE_SSL === 'true'
        ? { rejectUnauthorized: false }
        : false,
    entities: [
      Student,
      AttendanceRecord,
      AssessmentRecord,
      EngagementRecord,
      RiskAssessment,
      Recommendation,
    ],
  });

  await dataSource.initialize();
  console.log('Connected to database. Seeding synthetic student data...');

  const studentRepo = dataSource.getRepository(Student);
  const attendanceRepo = dataSource.getRepository(AttendanceRecord);
  const assessmentRepo = dataSource.getRepository(AssessmentRecord);
  const engagementRepo = dataSource.getRepository(EngagementRecord);

  for (let i = 0; i < STUDENT_COUNT; i++) {
    // Each student has an underlying "engagement tier" (low/medium/high) that
    // biases every metric together, so the cohort has realistic correlated
    // clusters of struggling/average/thriving students rather than pure noise.
    const tier = pick(['low', 'medium', 'high'] as const);
    const tierBias = tier === 'low' ? 0 : tier === 'medium' ? 1 : 2;

    const student = await studentRepo.save(
      studentRepo.create({
        externalId: `STU${String(i + 1).padStart(4, '0')}`,
        programme: pick(PROGRAMMES),
        cohortYear: pick(COHORT_YEARS),
        sourceDataset: 'Synthetic',
      }),
    );

    for (const courseCode of COURSE_CODES.slice(
      0,
      randomInt(2, COURSE_CODES.length),
    )) {
      const sessionsScheduled = randomInt(10, 20);
      const attendanceFloor = 40 + tierBias * 20;
      const sessionsAttended = Math.min(
        sessionsScheduled,
        Math.round(
          (sessionsScheduled *
            randomInt(attendanceFloor, attendanceFloor + 30)) /
            100,
        ),
      );
      await attendanceRepo.save(
        attendanceRepo.create({
          studentId: student.id,
          courseCode,
          term: TERM,
          sessionsScheduled,
          sessionsAttended,
          attendanceRate:
            sessionsScheduled === 0
              ? 0
              : Math.round((sessionsAttended / sessionsScheduled) * 10000) /
                100,
          recordedAt: isoDateDaysAgo(randomInt(1, 30)),
        }),
      );

      for (let a = 0; a < randomInt(2, 4); a++) {
        const maxScore = 100;
        const scoreFloor = 35 + tierBias * 18;
        await assessmentRepo.save(
          assessmentRepo.create({
            studentId: student.id,
            courseCode,
            term: TERM,
            type: pick(ASSESSMENT_TYPES),
            score: randomFloat(scoreFloor, Math.min(100, scoreFloor + 35)),
            maxScore,
            weight: randomFloat(0.5, 1.5),
            submittedAt: isoDateDaysAgo(randomInt(1, 45)),
          }),
        );
      }

      await engagementRepo.save(
        engagementRepo.create({
          studentId: student.id,
          courseCode,
          term: TERM,
          periodStart: isoDateDaysAgo(30),
          periodEnd: isoDateDaysAgo(1),
          vleClicks: randomInt(tierBias * 60, tierBias * 60 + 120),
          loginCount: randomInt(2 + tierBias * 4, 8 + tierBias * 6),
          forumPosts: randomInt(0, 2 + tierBias * 3),
          resourceAccessCount: randomInt(tierBias * 10, tierBias * 10 + 40),
        }),
      );
    }
  }

  console.log(
    `Seeded ${STUDENT_COUNT} students with attendance, assessment, and engagement records.`,
  );
  await dataSource.destroy();
}

seed().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
