import type {
  Student,
  AttendanceRecord,
  AttendanceSummary,
  AssessmentRecord,
  AssessmentSummary,
  AssessmentType,
  EngagementRecord,
  EngagementSummary,
  RiskAssessment,
  RiskLevel,
  Recommendation,
  RecommendationStatus,
  QueryStudentParams,
  PaginatedStudents,
} from './types';

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------

let uidCounter = 0;
function uid(prefix: string): string {
  uidCounter += 1;
  return `demo-${prefix}-${uidCounter}`;
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(items: T[]): T {
  return items[randomInt(0, items.length - 1)];
}

function daysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

function riskLevelFor(score: number): RiskLevel {
  if (score >= 0.66) return 'HIGH';
  if (score >= 0.33) return 'MEDIUM';
  return 'LOW';
}

// ---------------------------------------------------------------------------
// Fixed vocab so the sample data reads like a real cohort
// ---------------------------------------------------------------------------

const PROGRAMMES = [
  'BSc Computing',
  'BSc Data Science',
  'BEng Software Engineering',
  'MSc IT with Web Development',
];
const COURSES = ['CS101', 'CS204', 'DS301', 'SE210', 'IT450'];
const TERMS = ['Term 1', 'Term 2'];
const ASSESSMENT_TYPES: AssessmentType[] = [
  'QUIZ',
  'COURSEWORK',
  'EXAM',
  'PROJECT',
];

interface DemoDataset {
  students: Student[];
  attendance: Map<string, AttendanceRecord[]>;
  assessments: Map<string, AssessmentRecord[]>;
  engagement: Map<string, EngagementRecord[]>;
  risk: Map<string, RiskAssessment[]>;
  recommendations: Map<string, Recommendation[]>;
}

function buildStudent(index: number, riskiness: number): Student {
  const id = uid('student');
  const student: Student = {
    id,
    externalId: `STU${1000 + index}`,
    programme: pick(PROGRAMMES),
    cohortYear: pick([2023, 2024, 2025]),
    sourceDataset: pick(['UCI', 'OULAD']),
    createdAt: daysAgo(200),
    updatedAt: daysAgo(1),
  };

  return student;
}

function buildAttendance(studentId: string, riskiness: number): AttendanceRecord[] {
  const records: AttendanceRecord[] = [];
  for (let i = 4; i >= 0; i -= 1) {
    const scheduled = randomInt(8, 14);
    // Higher "riskiness" trends toward lower attendance over time.
    const trendFactor = 1 - riskiness * (0.5 - i * 0.06);
    const attended = Math.max(
      0,
      Math.min(scheduled, Math.round(scheduled * trendFactor * randomInt(80, 100)) / 100),
    );
    const attendanceRate = scheduled === 0 ? 0 : Math.round((attended / scheduled) * 10000) / 100;
    records.push({
      id: uid('attendance'),
      studentId,
      courseCode: pick(COURSES),
      term: pick(TERMS),
      sessionsScheduled: scheduled,
      sessionsAttended: Math.round(attended),
      attendanceRate,
      recordedAt: daysAgo(i * 14),
      createdAt: daysAgo(i * 14),
    });
  }
  return records;
}

function buildAssessments(studentId: string, riskiness: number): AssessmentRecord[] {
  const records: AssessmentRecord[] = [];
  for (let i = 5; i >= 0; i -= 1) {
    const maxScore = pick([20, 50, 100]);
    const trendFactor = 1 - riskiness * (0.55 - i * 0.05);
    const score = Math.max(
      0,
      Math.min(maxScore, Math.round(maxScore * trendFactor * (randomInt(75, 100) / 100))),
    );
    records.push({
      id: uid('assessment'),
      studentId,
      courseCode: pick(COURSES),
      term: pick(TERMS),
      type: pick(ASSESSMENT_TYPES),
      score,
      maxScore,
      weight: pick([1, 1, 2, 3]),
      submittedAt: daysAgo(i * 12),
      createdAt: daysAgo(i * 12),
    });
  }
  return records;
}

function buildEngagement(studentId: string, riskiness: number): EngagementRecord[] {
  const records: EngagementRecord[] = [];
  for (let i = 3; i >= 0; i -= 1) {
    const trendFactor = 1 - riskiness * (0.6 - i * 0.08);
    const periodStart = daysAgo((i + 1) * 21);
    const periodEnd = daysAgo(i * 21);
    records.push({
      id: uid('engagement'),
      studentId,
      courseCode: pick(COURSES),
      term: pick(TERMS),
      periodStart,
      periodEnd,
      vleClicks: Math.max(0, Math.round(randomInt(40, 220) * trendFactor)),
      loginCount: Math.max(0, Math.round(randomInt(5, 30) * trendFactor)),
      forumPosts: Math.max(0, Math.round(randomInt(0, 12) * trendFactor)),
      resourceAccessCount: Math.max(0, Math.round(randomInt(3, 25) * trendFactor)),
      createdAt: periodEnd,
    });
  }
  return records;
}

function buildRiskAssessments(
  student: Student,
  riskiness: number,
): RiskAssessment[] {
  const records: RiskAssessment[] = [];
  const runs = 4;
  for (let i = runs - 1; i >= 0; i -= 1) {
    // Small run-to-run jitter around the student's underlying riskiness.
    const jitter = (Math.random() - 0.5) * 0.15;
    const trendShift = riskiness > 0.5 ? i * 0.03 : -i * 0.03; // older runs drift away from current
    const classicalScore = Math.min(0.98, Math.max(0.02, riskiness + jitter + trendShift));
    const deepScore = Math.min(0.98, Math.max(0.02, riskiness + jitter * 0.7 + trendShift));
    const predictedAt = daysAgo(i * 15);

    records.push({
      id: uid('risk'),
      studentId: student.id,
      student,
      modelType: 'CLASSICAL_ML',
      modelVersion: 'demo-v1',
      riskScore: Math.round(classicalScore * 10000) / 10000,
      riskLevel: riskLevelFor(classicalScore),
      contributingFactors: {
        attendanceRate: Math.round((1 - classicalScore) * 100),
        assessmentScore: Math.round((1 - classicalScore * 0.9) * 100),
        engagement: Math.round((1 - classicalScore * 0.8) * 100),
      },
      predictedAt,
      createdAt: predictedAt,
    });
    records.push({
      id: uid('risk'),
      studentId: student.id,
      student,
      modelType: 'DEEP_LEARNING',
      modelVersion: 'demo-v1',
      riskScore: Math.round(deepScore * 10000) / 10000,
      riskLevel: riskLevelFor(deepScore),
      contributingFactors: {
        attendanceRate: Math.round((1 - deepScore) * 100),
        assessmentScore: Math.round((1 - deepScore * 0.9) * 100),
        engagement: Math.round((1 - deepScore * 0.8) * 100),
      },
      predictedAt,
      createdAt: predictedAt,
    });
  }
  // Newest first, matching the real backend's ordering.
  return records.sort(
    (a, b) => new Date(b.predictedAt).getTime() - new Date(a.predictedAt).getTime(),
  );
}

function buildRecommendations(
  student: Student,
  latestRisk: RiskAssessment | undefined,
): Recommendation[] {
  if (!latestRisk) return [];
  const recs: Recommendation[] = [];

  if (latestRisk.riskLevel === 'HIGH') {
    recs.push({
      id: uid('rec'),
      studentId: student.id,
      student,
      riskAssessmentId: latestRisk.id,
      type: 'EARLY_WARNING',
      title: 'Attendance and engagement have both dropped sharply',
      message:
        'This student\u2019s attendance rate and VLE engagement have declined over the last three recorded periods. Recommend a check-in meeting within the next week.',
      status: pick<RecommendationStatus>(['PENDING', 'PENDING', 'ACKNOWLEDGED']),
      createdAt: daysAgo(3),
      updatedAt: daysAgo(1),
    });
  } else if (latestRisk.riskLevel === 'MEDIUM') {
    recs.push({
      id: uid('rec'),
      studentId: student.id,
      student,
      riskAssessmentId: latestRisk.id,
      type: 'GUIDANCE',
      title: 'Assessment scores trending below cohort average',
      message:
        'Recent coursework scores are below the programme average. Suggest sharing revision resources and flagging optional drop-in sessions.',
      status: pick<RecommendationStatus>(['PENDING', 'SENT', 'RESOLVED']),
      createdAt: daysAgo(6),
      updatedAt: daysAgo(2),
    });
  } else if (Math.random() > 0.6) {
    recs.push({
      id: uid('rec'),
      studentId: student.id,
      student,
      riskAssessmentId: latestRisk.id,
      type: 'GUIDANCE',
      title: 'On track — light-touch check-in recommended next term',
      message:
        'No concerning trends detected. A routine check-in next term is sufficient.',
      status: 'RESOLVED',
      createdAt: daysAgo(20),
      updatedAt: daysAgo(18),
      resolvedAt: daysAgo(18),
    });
  }

  return recs;
}

function buildDataset(): DemoDataset {
  const students: Student[] = [];
  const attendance = new Map<string, AttendanceRecord[]>();
  const assessments = new Map<string, AssessmentRecord[]>();
  const engagement = new Map<string, EngagementRecord[]>();
  const risk = new Map<string, RiskAssessment[]>();
  const recommendations = new Map<string, Recommendation[]>();

  const STUDENT_COUNT = 24;
  for (let i = 0; i < STUDENT_COUNT; i += 1) {
    // Roughly 20% high risk, 30% medium, 50% low — a believable cohort spread.
    const roll = Math.random();
    const riskiness = roll < 0.2 ? randomInt(70, 95) / 100 : roll < 0.5 ? randomInt(40, 65) / 100 : randomInt(2, 35) / 100;

    const student = buildStudent(i, riskiness);
    students.push(student);
    attendance.set(student.id, buildAttendance(student.id, riskiness));
    assessments.set(student.id, buildAssessments(student.id, riskiness));
    engagement.set(student.id, buildEngagement(student.id, riskiness));
    const riskHistory = buildRiskAssessments(student, riskiness);
    risk.set(student.id, riskHistory);
    recommendations.set(
      student.id,
      buildRecommendations(student, riskHistory[0]),
    );
  }

  return { students, attendance, assessments, engagement, risk, recommendations };
}

// Built once per browser tab/session so numbers stay stable while you click
// around, and reset naturally on a full page reload.
let dataset: DemoDataset | null = null;
function getDataset(): DemoDataset {
  if (!dataset) {
    dataset = buildDataset();
  }
  return dataset;
}

function delay<T>(value: T, ms = 350): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

// ---------------------------------------------------------------------------
// Public mock API — mirrors the shape of lib/api.ts
// ---------------------------------------------------------------------------

export const mockStudentsApi = {
  list(params: QueryStudentParams = {}): Promise<PaginatedStudents> {
    const { students } = getDataset();
    let filtered = students;
    if (params.programme) {
      filtered = filtered.filter((s) =>
        s.programme?.toLowerCase().includes(params.programme!.toLowerCase()),
      );
    }
    if (params.cohortYear) {
      filtered = filtered.filter((s) => s.cohortYear === params.cohortYear);
    }
    const page = params.page ?? 1;
    const limit = params.limit ?? 25;
    const start = (page - 1) * limit;
    return delay({
      data: filtered.slice(start, start + limit),
      total: filtered.length,
    });
  },
  get(id: string): Promise<Student> {
    const student = getDataset().students.find((s) => s.id === id);
    if (!student) return Promise.reject(new Error('Student not found in demo data.'));
    return delay(student);
  },
};

export const mockAttendanceApi = {
  listByStudent(studentId: string): Promise<AttendanceRecord[]> {
    return delay(getDataset().attendance.get(studentId) ?? []);
  },
  summary(studentId: string): Promise<AttendanceSummary> {
    const records = getDataset().attendance.get(studentId) ?? [];
    const totalSessionsScheduled = records.reduce((s, r) => s + r.sessionsScheduled, 0);
    const totalSessionsAttended = records.reduce((s, r) => s + r.sessionsAttended, 0);
    const averageAttendanceRate =
      totalSessionsScheduled === 0
        ? 0
        : Math.round((totalSessionsAttended / totalSessionsScheduled) * 10000) / 100;
    return delay({ averageAttendanceRate, totalSessionsScheduled, totalSessionsAttended });
  },
};

export const mockAssessmentsApi = {
  listByStudent(studentId: string): Promise<AssessmentRecord[]> {
    return delay(getDataset().assessments.get(studentId) ?? []);
  },
  summary(studentId: string): Promise<AssessmentSummary> {
    const records = getDataset().assessments.get(studentId) ?? [];
    const totalWeight = records.reduce((s, r) => s + r.weight, 0);
    const weightedSum = records.reduce(
      (s, r) => s + (r.score / r.maxScore) * r.weight,
      0,
    );
    const weightedAveragePercentage =
      totalWeight === 0 ? 0 : Math.round((weightedSum / totalWeight) * 10000) / 100;
    return delay({ weightedAveragePercentage, assessmentCount: records.length });
  },
};

export const mockEngagementApi = {
  listByStudent(studentId: string): Promise<EngagementRecord[]> {
    return delay(getDataset().engagement.get(studentId) ?? []);
  },
  summary(studentId: string): Promise<EngagementSummary> {
    const records = getDataset().engagement.get(studentId) ?? [];
    return delay(
      records.reduce(
        (totals, r) => ({
          totalVleClicks: totals.totalVleClicks + r.vleClicks,
          totalLoginCount: totals.totalLoginCount + r.loginCount,
          totalForumPosts: totals.totalForumPosts + r.forumPosts,
          totalResourceAccessCount: totals.totalResourceAccessCount + r.resourceAccessCount,
        }),
        { totalVleClicks: 0, totalLoginCount: 0, totalForumPosts: 0, totalResourceAccessCount: 0 },
      ),
    );
  },
};

export const mockRiskAssessmentApi = {
  listByStudent(studentId: string): Promise<RiskAssessment[]> {
    return delay(getDataset().risk.get(studentId) ?? []);
  },
  run(studentId: string): Promise<RiskAssessment[]> {
    const ds = getDataset();
    const student = ds.students.find((s) => s.id === studentId);
    if (!student) return Promise.reject(new Error('Student not found in demo data.'));
    const existing = ds.risk.get(studentId) ?? [];
    const previousScore = existing[0]?.riskScore ?? 0.4;
    // Simulate a fresh prediction, nudged slightly from the last one.
    const nudged = Math.min(0.98, Math.max(0.02, previousScore + (Math.random() - 0.5) * 0.2));
    const now = new Date().toISOString();
    const fresh: RiskAssessment[] = [
      {
        id: uid('risk'),
        studentId,
        student,
        modelType: 'CLASSICAL_ML',
        modelVersion: 'demo-v1',
        riskScore: Math.round(nudged * 10000) / 10000,
        riskLevel: riskLevelFor(nudged),
        contributingFactors: { attendanceRate: 60, assessmentScore: 55, engagement: 50 },
        predictedAt: now,
        createdAt: now,
      },
      {
        id: uid('risk'),
        studentId,
        student,
        modelType: 'DEEP_LEARNING',
        modelVersion: 'demo-v1',
        riskScore: Math.round(nudged * 10000) / 10000,
        riskLevel: riskLevelFor(nudged),
        contributingFactors: { attendanceRate: 58, assessmentScore: 53, engagement: 49 },
        predictedAt: now,
        createdAt: now,
      },
    ];
    ds.risk.set(studentId, [...fresh, ...existing]);
    return delay(fresh, 700);
  },
  atRisk(riskLevel: RiskLevel = 'HIGH'): Promise<RiskAssessment[]> {
    const ds = getDataset();
    const latestPerStudent = ds.students
      .map((s) => ds.risk.get(s.id)?.[0])
      .filter((r): r is RiskAssessment => Boolean(r));
    return delay(latestPerStudent.filter((r) => r.riskLevel === riskLevel));
  },
};

export const mockRecommendationsApi = {
  listByStudent(studentId: string): Promise<Recommendation[]> {
    return delay(getDataset().recommendations.get(studentId) ?? []);
  },
  generateForStudent(studentId: string): Promise<Recommendation[]> {
    const ds = getDataset();
    const student = ds.students.find((s) => s.id === studentId);
    const latestRisk = ds.risk.get(studentId)?.[0];
    if (!student) return Promise.reject(new Error('Student not found in demo data.'));
    const fresh = buildRecommendations(student, latestRisk).map((r) => ({
      ...r,
      id: uid('rec'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
    const existing = ds.recommendations.get(studentId) ?? [];
    ds.recommendations.set(studentId, [...fresh, ...existing]);
    return delay(fresh, 600);
  },
  pendingEarlyWarnings(): Promise<Recommendation[]> {
    const ds = getDataset();
    const all = ds.students.flatMap((s) => ds.recommendations.get(s.id) ?? []);
    return delay(
      all.filter((r) => r.type === 'EARLY_WARNING' && r.status === 'PENDING'),
    );
  },
  updateStatus(id: string, status: RecommendationStatus): Promise<Recommendation> {
    const ds = getDataset();
    for (const [studentId, recs] of ds.recommendations) {
      const index = recs.findIndex((r) => r.id === id);
      if (index !== -1) {
        const updated: Recommendation = {
          ...recs[index],
          status,
          updatedAt: new Date().toISOString(),
          resolvedAt: status === 'RESOLVED' ? new Date().toISOString() : recs[index].resolvedAt,
        };
        const next = [...recs];
        next[index] = updated;
        ds.recommendations.set(studentId, next);
        return delay(updated);
      }
    }
    return Promise.reject(new Error('Recommendation not found in demo data.'));
  },
};
