import { redirect } from 'next/navigation';
import { getSessionKey } from './session';
import type {
  ApiErrorPayload,
  AssessmentRecord,
  AssessmentSummary,
  AttendanceRecord,
  AttendanceSummary,
  CurrentUser,
  EngagementRecord,
  EngagementSummary,
  PaginatedStudents,
  Recommendation,
  RecommendationStatus,
  RiskAssessment,
  RiskLevel,
  Student,
  QueryStudentParams,
} from '@/lib/types';

const API_URL = process.env.API_URL ?? 'http://localhost:4001';

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const sessionKey = getSessionKey();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string> | undefined),
  };
  if (sessionKey) {
    headers.Authorization = `Bearer ${sessionKey}`;
  }

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers,
      cache: 'no-store',
    });
  } catch {
    throw new ApiError(
      0,
      'Could not reach the Student Success API. Check that the backend is running and API_URL is correct.',
    );
  }

  if (!response.ok) {
    if (response.status === 401) {
      // Stale or expired session token — bounce to the login screen instead
      // of surfacing a raw 500.
      redirect('/login');
    }
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

// ---- Auth ----------------------------------------------------------------

export interface AuthResult {
  token: string;
  user: CurrentUser;
}

async function authRequest(
  path: string,
  body: Record<string, string>,
): Promise<AuthResult | { error: string }> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      cache: 'no-store',
    });
  } catch {
    return {
      error:
        'Could not reach the Student Success API. Check that the backend is running and API_URL is correct.',
    };
  }

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const message = Array.isArray(payload?.message)
      ? payload.message.join(', ')
      : payload?.message ?? 'Something went wrong. Please try again.';
    return { error: message };
  }
  return payload as AuthResult;
}

export function signup(dto: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}): Promise<AuthResult | { error: string }> {
  return authRequest('/auth/signup', dto);
}

export function login(dto: {
  email: string;
  password: string;
}): Promise<AuthResult | { error: string }> {
  return authRequest('/auth/login', dto);
}

export function getCurrentUser(): Promise<CurrentUser> {
  return request<CurrentUser>('/auth/me');
}

// ---- Students -------------------------------------------------------------

export function getStudents(params: QueryStudentParams = {}): Promise<PaginatedStudents> {
  const qs = toQueryString({
    programme: params.programme,
    cohortYear: params.cohortYear,
    page: params.page,
    limit: params.limit,
  });
  return request<PaginatedStudents>(`/students${qs}`);
}

export function getStudent(id: string): Promise<Student> {
  return request<Student>(`/students/${id}`);
}

// ---- Attendance -----------------------------------------------------------

export function getAttendanceByStudent(studentId: string): Promise<AttendanceRecord[]> {
  return request<AttendanceRecord[]>(`/students/${studentId}/attendance-records`);
}

export function getAttendanceSummary(studentId: string): Promise<AttendanceSummary> {
  return request<AttendanceSummary>(`/students/${studentId}/attendance-summary`);
}

// ---- Assessments ------------------------------------------------------------

export function getAssessmentsByStudent(studentId: string): Promise<AssessmentRecord[]> {
  return request<AssessmentRecord[]>(`/students/${studentId}/assessment-records`);
}

export function getAssessmentSummary(studentId: string): Promise<AssessmentSummary> {
  return request<AssessmentSummary>(`/students/${studentId}/assessment-summary`);
}

// ---- Engagement -------------------------------------------------------------

export function getEngagementByStudent(studentId: string): Promise<EngagementRecord[]> {
  return request<EngagementRecord[]>(`/students/${studentId}/engagement-records`);
}

export function getEngagementSummary(studentId: string): Promise<EngagementSummary> {
  return request<EngagementSummary>(`/students/${studentId}/engagement-summary`);
}

// ---- Risk assessment ----------------------------------------------------------

export function getRiskAssessmentsByStudent(studentId: string): Promise<RiskAssessment[]> {
  return request<RiskAssessment[]>(`/students/${studentId}/risk-assessments`);
}

export function runRiskAssessment(studentId: string): Promise<RiskAssessment[]> {
  return request<RiskAssessment[]>(`/students/${studentId}/risk-assessments`, {
    method: 'POST',
  });
}

export function getAtRiskAssessments(riskLevel?: RiskLevel): Promise<RiskAssessment[]> {
  const qs = toQueryString({ riskLevel });
  return request<RiskAssessment[]>(`/risk-assessments/at-risk${qs}`);
}

// ---- Recommendations ----------------------------------------------------------

export function getRecommendationsByStudent(studentId: string): Promise<Recommendation[]> {
  return request<Recommendation[]>(`/students/${studentId}/recommendations`);
}

export function generateRecommendations(studentId: string): Promise<Recommendation[]> {
  return request<Recommendation[]>(`/students/${studentId}/recommendations`, {
    method: 'POST',
  });
}

export function getPendingEarlyWarnings(): Promise<Recommendation[]> {
  return request<Recommendation[]>('/recommendations/early-warnings');
}

export function updateRecommendationStatus(
  id: string,
  status: RecommendationStatus,
): Promise<Recommendation> {
  return request<Recommendation>(`/recommendations/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}
