'use client';

import { useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Sparkles, RefreshCw, Check, CheckCheck } from 'lucide-react';
import {
  studentsApi,
  attendanceApi,
  assessmentsApi,
  engagementApi,
  riskAssessmentApi,
  recommendationsApi,
} from '@/lib/api';
import { useApi } from '@/lib/use-api';
import { KpiCard } from '@/components/KpiCard';
import { RiskBadge } from '@/components/RiskBadge';
import { StatusPill } from '@/components/StatusPill';
import { Button } from '@/components/ui/button';
import { LoadingState, ErrorState, EmptyState } from '@/components/StatusStates';
import { DataDisclosure } from '@/components/DataDisclosure';
import {
  formatDate,
  formatDateTime,
  formatPercent,
  ASSESSMENT_TYPE_LABEL,
} from '@/lib/format';
import type { RecommendationStatus } from '@/lib/types';

async function loadStudent(id: string) {
  const [
    student,
    attendanceRecords,
    attendanceSummary,
    assessmentRecords,
    assessmentSummary,
    engagementRecords,
    engagementSummary,
    riskAssessments,
    recommendations,
  ] = await Promise.all([
    studentsApi.get(id),
    attendanceApi.listByStudent(id),
    attendanceApi.summary(id),
    assessmentsApi.listByStudent(id),
    assessmentsApi.summary(id),
    engagementApi.listByStudent(id),
    engagementApi.summary(id),
    riskAssessmentApi.listByStudent(id),
    recommendationsApi.listByStudent(id),
  ]);
  return {
    student,
    attendanceRecords,
    attendanceSummary,
    assessmentRecords,
    assessmentSummary,
    engagementRecords,
    engagementSummary,
    riskAssessments,
    recommendations,
  };
}

export default function StudentDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const { data, loading, error, refetch } = useApi(() => loadStudent(id), [id]);
  const [runningRisk, setRunningRisk] = useState(false);
  const [generatingRecs, setGeneratingRecs] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  async function handleRunRiskAssessment() {
    setActionError(null);
    setRunningRisk(true);
    try {
      await riskAssessmentApi.run(id);
      refetch();
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : 'Could not run the risk assessment.',
      );
    } finally {
      setRunningRisk(false);
    }
  }

  async function handleGenerateRecommendations() {
    setActionError(null);
    setGeneratingRecs(true);
    try {
      await recommendationsApi.generateForStudent(id);
      refetch();
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : 'Could not generate recommendations.',
      );
    } finally {
      setGeneratingRecs(false);
    }
  }

  async function handleStatusChange(
    recommendationId: string,
    status: RecommendationStatus,
  ) {
    setActionError(null);
    try {
      await recommendationsApi.updateStatus(recommendationId, status);
      refetch();
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : 'Could not update the recommendation.',
      );
    }
  }

  if (loading) return <LoadingState label="Loading student profile…" />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;
  if (!data) return null;

  const {
    student,
    attendanceRecords,
    attendanceSummary,
    assessmentRecords,
    assessmentSummary,
    engagementRecords,
    engagementSummary,
    riskAssessments,
    recommendations,
  } = data;

  const classicalHistory = riskAssessments
    .filter((r) => r.modelType === 'CLASSICAL_ML')
    .slice()
    .reverse();
  const deepHistory = riskAssessments
    .filter((r) => r.modelType === 'DEEP_LEARNING')
    .slice()
    .reverse();
  const latestClassical = classicalHistory[classicalHistory.length - 1];
  const latestDeep = deepHistory[deepHistory.length - 1];

  const attendanceChartData = attendanceRecords
    .slice()
    .reverse()
    .map((r) => ({
      date: formatDate(r.recordedAt),
      rate: Number(r.attendanceRate),
    }));

  const assessmentChartData = assessmentRecords
    .slice()
    .reverse()
    .map((r) => ({
      date: formatDate(r.submittedAt),
      percentage: Math.round((Number(r.score) / Number(r.maxScore)) * 1000) / 10,
      label: `${ASSESSMENT_TYPE_LABEL[r.type]} · ${r.courseCode}`,
    }));

  const engagementChartData = engagementRecords
    .slice()
    .reverse()
    .map((r) => ({
      period: formatDate(r.periodStart),
      clicks: r.vleClicks,
      logins: r.loginCount,
      forum: r.forumPosts,
    }));

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-wide text-ink-faint">
            Student profile
          </p>
          <h1 className="mt-1 font-display text-3xl font-semibold text-ink">
            {student.externalId}
          </h1>
          <p className="mt-1 font-sans text-sm text-ink-soft">
            {student.programme ?? 'Programme not recorded'}
            {student.cohortYear ? ` · Cohort ${student.cohortYear}` : ''} · Source:{' '}
            {student.sourceDataset}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleGenerateRecommendations}
            disabled={generatingRecs}
          >
            <Sparkles /> {generatingRecs ? 'Generating…' : 'Generate recommendations'}
          </Button>
          <Button type="button" onClick={handleRunRiskAssessment} disabled={runningRisk}>
            <RefreshCw /> {runningRisk ? 'Running…' : 'Run risk assessment'}
          </Button>
        </div>
      </header>

      {actionError && <ErrorState message={actionError} />}

      <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Attendance rate"
          value={formatPercent(attendanceSummary.averageAttendanceRate)}
          hint={`${attendanceSummary.totalSessionsAttended}/${attendanceSummary.totalSessionsScheduled} sessions`}
        />
        <KpiCard
          label="Weighted assessment score"
          value={formatPercent(assessmentSummary.weightedAveragePercentage)}
          hint={`${assessmentSummary.assessmentCount} assessments`}
        />
        <KpiCard
          label="VLE engagement"
          value={String(engagementSummary.totalVleClicks)}
          hint={`${engagementSummary.totalLoginCount} logins · ${engagementSummary.totalForumPosts} forum posts`}
        />
        <div className="rounded-card border border-line bg-surface p-4 shadow-card">
          <dt className="font-sans text-xs font-medium uppercase tracking-wide text-ink-faint">
            Current risk
          </dt>
          <dd className="mt-2 flex flex-col gap-1.5">
            {latestClassical ? (
              <div className="flex items-center gap-2">
                <span className="font-mono text-[0.65rem] text-ink-faint">ML</span>
                <RiskBadge level={latestClassical.riskLevel} />
              </div>
            ) : (
              <span className="font-sans text-xs text-ink-faint">No classical assessment</span>
            )}
            {latestDeep ? (
              <div className="flex items-center gap-2">
                <span className="font-mono text-[0.65rem] text-ink-faint">DL</span>
                <RiskBadge level={latestDeep.riskLevel} />
              </div>
            ) : (
              <span className="font-sans text-xs text-ink-faint">No deep learning assessment</span>
            )}
          </dd>
        </div>
      </dl>

      <section aria-labelledby="attendance-heading">
        <h2 id="attendance-heading" className="font-display text-xl font-semibold text-ink">
          Attendance
        </h2>
        <div className="mt-3 rounded-card border border-line bg-surface p-4 shadow-card">
          {attendanceChartData.length === 0 ? (
            <EmptyState title="No attendance records yet" />
          ) : (
            <>
              <div className="h-56" aria-hidden="true">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={attendanceChartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#DED5BF" />
                    <XAxis dataKey="date" tick={{ fill: '#5B5548', fontSize: 11 }} axisLine={{ stroke: '#DED5BF' }} tickLine={false} />
                    <YAxis unit="%" tick={{ fill: '#5B5548', fontSize: 11 }} axisLine={{ stroke: '#DED5BF' }} tickLine={false} />
                    <Tooltip contentStyle={{ background: '#FFFDF8', border: '1px solid #DED5BF', borderRadius: 3, fontSize: 12 }} />
                    <Line type="monotone" dataKey="rate" stroke="#2F6F62" strokeWidth={2} dot={{ r: 3 }} name="Attendance rate" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <DataDisclosure
                caption="Attendance rate over time"
                columns={['Date', 'Attendance rate (%)']}
                rows={attendanceChartData.map((d) => [d.date, d.rate])}
              />
            </>
          )}
        </div>
      </section>

      <section aria-labelledby="assessments-heading">
        <h2 id="assessments-heading" className="font-display text-xl font-semibold text-ink">
          Assessments
        </h2>
        <div className="mt-3 rounded-card border border-line bg-surface p-4 shadow-card">
          {assessmentChartData.length === 0 ? (
            <EmptyState title="No assessment records yet" />
          ) : (
            <>
              <div className="h-56" aria-hidden="true">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={assessmentChartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#DED5BF" />
                    <XAxis dataKey="date" tick={{ fill: '#5B5548', fontSize: 11 }} axisLine={{ stroke: '#DED5BF' }} tickLine={false} />
                    <YAxis unit="%" tick={{ fill: '#5B5548', fontSize: 11 }} axisLine={{ stroke: '#DED5BF' }} tickLine={false} />
                    <Tooltip contentStyle={{ background: '#FFFDF8', border: '1px solid #DED5BF', borderRadius: 3, fontSize: 12 }} />
                    <Line type="monotone" dataKey="percentage" stroke="#C08A2E" strokeWidth={2} dot={{ r: 3 }} name="Score %" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <DataDisclosure
                caption="Assessment scores over time"
                columns={['Date', 'Assessment', 'Score (%)']}
                rows={assessmentChartData.map((d) => [d.date, d.label, d.percentage])}
              />
            </>
          )}
        </div>
      </section>

      <section aria-labelledby="engagement-heading">
        <h2 id="engagement-heading" className="font-display text-xl font-semibold text-ink">
          Engagement
        </h2>
        <div className="mt-3 rounded-card border border-line bg-surface p-4 shadow-card">
          {engagementChartData.length === 0 ? (
            <EmptyState title="No engagement records yet" />
          ) : (
            <>
              <div className="h-56" aria-hidden="true">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={engagementChartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#DED5BF" />
                    <XAxis dataKey="period" tick={{ fill: '#5B5548', fontSize: 11 }} axisLine={{ stroke: '#DED5BF' }} tickLine={false} />
                    <YAxis tick={{ fill: '#5B5548', fontSize: 11 }} axisLine={{ stroke: '#DED5BF' }} tickLine={false} />
                    <Tooltip contentStyle={{ background: '#FFFDF8', border: '1px solid #DED5BF', borderRadius: 3, fontSize: 12 }} />
                    <Bar dataKey="clicks" fill="#2F6F62" name="VLE clicks" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="logins" fill="#6E8B5E" name="Logins" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="forum" fill="#C08A2E" name="Forum posts" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <DataDisclosure
                caption="Engagement activity by period"
                columns={['Period', 'VLE clicks', 'Logins', 'Forum posts']}
                rows={engagementChartData.map((d) => [d.period, d.clicks, d.logins, d.forum])}
              />
            </>
          )}
        </div>
      </section>

      <section aria-labelledby="recommendations-heading">
        <h2 id="recommendations-heading" className="font-display text-xl font-semibold text-ink">
          Recommendations
        </h2>
        <div className="mt-3 space-y-3">
          {recommendations.length === 0 ? (
            <EmptyState
              title="No recommendations yet"
              description="Use “Generate recommendations” above to create guidance based on the latest risk assessment."
            />
          ) : (
            recommendations.map((rec) => (
              <div
                key={rec.id}
                className="rounded-card border border-line bg-surface p-4 shadow-card"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-mono text-[0.65rem] uppercase tracking-wide text-ink-faint">
                      {rec.type === 'EARLY_WARNING' ? 'Early warning' : 'Guidance'} · {formatDateTime(rec.createdAt)}
                    </p>
                    <h3 className="mt-0.5 font-display text-base font-semibold text-ink">
                      {rec.title}
                    </h3>
                  </div>
                  <StatusPill status={rec.status} />
                </div>
                <p className="mt-2 font-sans text-sm text-ink-soft">{rec.message}</p>
                <div className="mt-3 flex gap-2">
                  {rec.status === 'PENDING' && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusChange(rec.id, 'ACKNOWLEDGED')}
                    >
                      <Check /> Acknowledge
                    </Button>
                  )}
                  {rec.status !== 'RESOLVED' && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusChange(rec.id, 'RESOLVED')}
                    >
                      <CheckCheck /> Mark resolved
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
