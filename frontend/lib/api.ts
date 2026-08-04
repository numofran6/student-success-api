import { getApiKey } from './session';
import { DEMO_MODE } from './demo';
import {
  mockStudentsApi,
  mockAttendanceApi,
  mockAssessmentsApi,
  mockEngagementApi,
  mockRiskAssessmentApi,
  mockRecommendationsApi,
} from './mock-data';
import type {
  ApiErrorPayload,
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

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4001';

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function request<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const apiKey = getApiKey();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string> | undefined),
  };
  if (apiKey) {
    headers['x-api-key'] = apiKey;
  }

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, { ...init, headers });
  } catch {
    throw new ApiError(
      0,
      'Could not reach the Student Success API. Check that the backend is running and NEXT_PUBLIC_API_URL is correct.',
    );
  }

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const payload = (await response.json()) as ApiErrorPayload;
      message = Array.isArray(payload.message)
        ? payload.message.join(', ')
        : payload.message ?? message;
    } catch {
      // response body wasn't JSON; fall back to the generic message
    }
    throw new ApiError(response.status, message);
  }

  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
}

function toQueryString(params: Record<string, string | number | undefined>) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      search.set(key, String(value));
    }
  });
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

// ---- Auth (shared staff password) ---------------------------------------

export const authApi = {
  async verify(password: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/auth/session`, {
        headers: { 'x-api-key': password },
      });
      return response.ok;
    } catch {
      return false;
    }
  },
};

// ---- Students ----------------------------------------------------------

export const studentsApi = {
  list(params: QueryStudentParams = {}): Promise<PaginatedStudents> {
    if (DEMO_MODE) return mockStudentsApi.list(params);
    const qs = toQueryString({
      programme: params.programme,
      cohortYear: params.cohortYear,
      page: params.page,
      limit: params.limit,
    });
    return request<PaginatedStudents>(`/students${qs}`);
  },
  get(id: string): Promise<Student> {
    if (DEMO_MODE) return mockStudentsApi.get(id);
    return request<Student>(`/students/${id}`);
  },
  create(dto: {
    externalId: string;
    programme?: string;
    cohortYear?: number;
    sourceDataset?: string;
  }): Promise<Student> {
    return request<Student>('/students', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  },
  update(
    id: string,
    dto: Partial<{ programme: string; cohortYear: number }>,
  ): Promise<Student> {
    return request<Student>(`/students/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(dto),
    });
  },
  remove(id: string): Promise<void> {
    return request<void>(`/students/${id}`, { method: 'DELETE' });
  },
};

// ---- Attendance ----------------------------------------------------------

export const attendanceApi = {
  listByStudent(studentId: string): Promise<AttendanceRecord[]> {
    if (DEMO_MODE) return mockAttendanceApi.listByStudent(studentId);
    return request<AttendanceRecord[]>(
      `/students/${studentId}/attendance-records`,
    );
  },
  summary(studentId: string): Promise<AttendanceSummary> {
    if (DEMO_MODE) return mockAttendanceApi.summary(studentId);
    return request<AttendanceSummary>(
      `/students/${studentId}/attendance-summary`,
    );
  },
  create(dto: {
    studentId: string;
    courseCode: string;
    term: string;
    sessionsScheduled: number;
    sessionsAttended: number;
    recordedAt: string;
  }): Promise<AttendanceRecord> {
    return request<AttendanceRecord>('/attendance-records', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  },
};

// ---- Assessments ----------------------------------------------------------

export const assessmentsApi = {
  listByStudent(studentId: string): Promise<AssessmentRecord[]> {
    if (DEMO_MODE) return mockAssessmentsApi.listByStudent(studentId);
    return request<AssessmentRecord[]>(
      `/students/${studentId}/assessment-records`,
    );
  },
  summary(studentId: string): Promise<AssessmentSummary> {
    if (DEMO_MODE) return mockAssessmentsApi.summary(studentId);
    return request<AssessmentSummary>(
      `/students/${studentId}/assessment-summary`,
    );
  },
  create(dto: {
    studentId: string;
    courseCode: string;
    term: string;
    type: string;
    score: number;
    maxScore: number;
    weight?: number;
    submittedAt: string;
  }): Promise<AssessmentRecord> {
    return request<AssessmentRecord>('/assessment-records', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  },
};

// ---- Engagement ----------------------------------------------------------

export const engagementApi = {
  listByStudent(studentId: string): Promise<EngagementRecord[]> {
    if (DEMO_MODE) return mockEngagementApi.listByStudent(studentId);
    return request<EngagementRecord[]>(
      `/students/${studentId}/engagement-records`,
    );
  },
  summary(studentId: string): Promise<EngagementSummary> {
    if (DEMO_MODE) return mockEngagementApi.summary(studentId);
    return request<EngagementSummary>(
      `/students/${studentId}/engagement-summary`,
    );
  },
  create(dto: {
    studentId: string;
    courseCode: string;
    term: string;
    periodStart: string;
    periodEnd: string;
    vleClicks?: number;
    loginCount?: number;
    forumPosts?: number;
    resourceAccessCount?: number;
  }): Promise<EngagementRecord> {
    return request<EngagementRecord>('/engagement-records', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  },
};

// ---- Risk assessment ----------------------------------------------------------

export const riskAssessmentApi = {
  listByStudent(studentId: string): Promise<RiskAssessment[]> {
    if (DEMO_MODE) return mockRiskAssessmentApi.listByStudent(studentId);
    return request<RiskAssessment[]>(`/students/${studentId}/risk-assessments`);
  },
  run(studentId: string): Promise<RiskAssessment[]> {
    if (DEMO_MODE) return mockRiskAssessmentApi.run(studentId);
    return request<RiskAssessment[]>(
      `/students/${studentId}/risk-assessments`,
      { method: 'POST' },
    );
  },
  atRisk(riskLevel?: RiskLevel): Promise<RiskAssessment[]> {
    if (DEMO_MODE) return mockRiskAssessmentApi.atRisk(riskLevel);
    const qs = toQueryString({ riskLevel });
    return request<RiskAssessment[]>(`/risk-assessments/at-risk${qs}`);
  },
};

// ---- Recommendations ----------------------------------------------------------

export const recommendationsApi = {
  listByStudent(studentId: string): Promise<Recommendation[]> {
    if (DEMO_MODE) return mockRecommendationsApi.listByStudent(studentId);
    return request<Recommendation[]>(
      `/students/${studentId}/recommendations`,
    );
  },
  generateForStudent(studentId: string): Promise<Recommendation[]> {
    if (DEMO_MODE) return mockRecommendationsApi.generateForStudent(studentId);
    return request<Recommendation[]>(
      `/students/${studentId}/recommendations`,
      { method: 'POST' },
    );
  },
  pendingEarlyWarnings(): Promise<Recommendation[]> {
    if (DEMO_MODE) return mockRecommendationsApi.pendingEarlyWarnings();
    return request<Recommendation[]>('/recommendations/early-warnings');
  },
  updateStatus(
    id: string,
    status: RecommendationStatus,
  ): Promise<Recommendation> {
    if (DEMO_MODE) return mockRecommendationsApi.updateStatus(id, status);
    return request<Recommendation>(`/recommendations/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },
};
