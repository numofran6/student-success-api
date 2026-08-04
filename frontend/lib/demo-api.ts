// Data source for demo mode only (NEXT_PUBLIC_DEMO_MODE=true) — every function
// here delegates straight to the in-memory mock data, no network involved.
// Real (non-demo) pages fetch server-side via lib/server/api.ts instead.
import {
  mockStudentsApi,
  mockAttendanceApi,
  mockAssessmentsApi,
  mockEngagementApi,
  mockRiskAssessmentApi,
  mockRecommendationsApi,
} from './mock-data';
import type {
  AssessmentRecord,
  AssessmentSummary,
  AttendanceRecord,
  AttendanceSummary,
  EngagementRecord,
  EngagementSummary,
  PaginatedStudents,
  Recommendation,
  RecommendationStatus,
  RiskAssessment,
  RiskLevel,
  Student,
  QueryStudentParams,
} from './types';

export const studentsApi = {
  list(params: QueryStudentParams = {}): Promise<PaginatedStudents> {
    return mockStudentsApi.list(params);
  },
  get(id: string): Promise<Student> {
    return mockStudentsApi.get(id);
  },
};

export const attendanceApi = {
  listByStudent(studentId: string): Promise<AttendanceRecord[]> {
    return mockAttendanceApi.listByStudent(studentId);
  },
  summary(studentId: string): Promise<AttendanceSummary> {
    return mockAttendanceApi.summary(studentId);
  },
};

export const assessmentsApi = {
  listByStudent(studentId: string): Promise<AssessmentRecord[]> {
    return mockAssessmentsApi.listByStudent(studentId);
  },
  summary(studentId: string): Promise<AssessmentSummary> {
    return mockAssessmentsApi.summary(studentId);
  },
};

export const engagementApi = {
  listByStudent(studentId: string): Promise<EngagementRecord[]> {
    return mockEngagementApi.listByStudent(studentId);
  },
  summary(studentId: string): Promise<EngagementSummary> {
    return mockEngagementApi.summary(studentId);
  },
};

export const riskAssessmentApi = {
  listByStudent(studentId: string): Promise<RiskAssessment[]> {
    return mockRiskAssessmentApi.listByStudent(studentId);
  },
  run(studentId: string): Promise<RiskAssessment[]> {
    return mockRiskAssessmentApi.run(studentId);
  },
  atRisk(riskLevel?: RiskLevel): Promise<RiskAssessment[]> {
    return mockRiskAssessmentApi.atRisk(riskLevel);
  },
};

export const recommendationsApi = {
  listByStudent(studentId: string): Promise<Recommendation[]> {
    return mockRecommendationsApi.listByStudent(studentId);
  },
  generateForStudent(studentId: string): Promise<Recommendation[]> {
    return mockRecommendationsApi.generateForStudent(studentId);
  },
  pendingEarlyWarnings(): Promise<Recommendation[]> {
    return mockRecommendationsApi.pendingEarlyWarnings();
  },
  updateStatus(id: string, status: RecommendationStatus): Promise<Recommendation> {
    return mockRecommendationsApi.updateStatus(id, status);
  },
};
