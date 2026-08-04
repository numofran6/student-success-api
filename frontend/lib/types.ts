// Types mirror the NestJS backend entities in src/database/entities/*.
// Keep these in sync with the backend if fields change there.

export interface Student {
  id: string;
  externalId: string;
  programme?: string;
  cohortYear?: number;
  sourceDataset: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedStudents {
  data: Student[];
  total: number;
}

export interface QueryStudentParams {
  programme?: string;
  cohortYear?: number;
  page?: number;
  limit?: number;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  courseCode: string;
  term: string;
  sessionsScheduled: number;
  sessionsAttended: number;
  attendanceRate: number;
  recordedAt: string;
  createdAt: string;
}

export interface AttendanceSummary {
  averageAttendanceRate: number;
  totalSessionsScheduled: number;
  totalSessionsAttended: number;
}

export type AssessmentType = 'QUIZ' | 'COURSEWORK' | 'EXAM' | 'PROJECT';

export interface AssessmentRecord {
  id: string;
  studentId: string;
  courseCode: string;
  term: string;
  type: AssessmentType;
  score: number;
  maxScore: number;
  weight: number;
  submittedAt: string;
  createdAt: string;
}

export interface AssessmentSummary {
  weightedAveragePercentage: number;
  assessmentCount: number;
}

export interface EngagementRecord {
  id: string;
  studentId: string;
  courseCode: string;
  term: string;
  periodStart: string;
  periodEnd: string;
  vleClicks: number;
  loginCount: number;
  forumPosts: number;
  resourceAccessCount: number;
  createdAt: string;
}

export interface EngagementSummary {
  totalVleClicks: number;
  totalLoginCount: number;
  totalForumPosts: number;
  totalResourceAccessCount: number;
}

export type ModelType = 'CLASSICAL_ML' | 'DEEP_LEARNING';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface RiskAssessment {
  id: string;
  studentId: string;
  student?: Student;
  modelType: ModelType;
  modelVersion: string;
  riskScore: number;
  riskLevel: RiskLevel;
  contributingFactors?: Record<string, number>;
  predictedAt: string;
  createdAt: string;
}

export type RecommendationType = 'EARLY_WARNING' | 'GUIDANCE';
export type RecommendationStatus =
  | 'PENDING'
  | 'SENT'
  | 'ACKNOWLEDGED'
  | 'RESOLVED';

export interface Recommendation {
  id: string;
  studentId: string;
  student?: Student;
  riskAssessmentId?: string;
  type: RecommendationType;
  title: string;
  message: string;
  status: RecommendationStatus;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export interface ApiErrorPayload {
  statusCode: number;
  message: string | string[];
  error?: string;
}

export interface CurrentUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}
