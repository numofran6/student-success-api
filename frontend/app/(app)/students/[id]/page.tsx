import { CalendarCheck, ClipboardList, Activity } from 'lucide-react';
import { DEMO_MODE } from '@/lib/demo';
import {
  getStudent,
  getAttendanceByStudent,
  getAttendanceSummary,
  getAssessmentsByStudent,
  getAssessmentSummary,
  getEngagementByStudent,
  getEngagementSummary,
  getRiskAssessmentsByStudent,
  getRecommendationsByStudent,
} from '@/lib/server/api';
import { KpiCard } from '@/components/KpiCard';
import { RiskBadge } from '@/components/RiskBadge';
import { RecommendationCard } from '@/components/RecommendationCard';
import { StudentHeader } from '@/components/students/StudentHeader';
import { EmptyState } from '@/components/StatusStates';
import { DataDisclosure } from '@/components/DataDisclosure';
import { AttendanceLineChart } from '@/components/charts/AttendanceLineChart';
import { AssessmentLineChart } from '@/components/charts/AssessmentLineChart';
import { EngagementBarChart } from '@/components/charts/EngagementBarChart';
import { formatDate, formatPercent, ASSESSMENT_TYPE_LABEL } from '@/lib/format';
import { updateRecommendationStatusAction } from '@/app/actions';
import { DemoStudentDetail } from './DemoStudentDetail';

export default async function StudentDetailPage({ params }: { params: { id: string } }) {
  if (DEMO_MODE) return <DemoStudentDetail id={params.id} />;

  const { id } = params;
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
    getStudent(id),
    getAttendanceByStudent(id),
    getAttendanceSummary(id),
    getAssessmentsByStudent(id),
    getAssessmentSummary(id),
    getEngagementByStudent(id),
    getEngagementSummary(id),
    getRiskAssessmentsByStudent(id),
    getRecommendationsByStudent(id),
  ]);

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
    .map((r) => ({ date: formatDate(r.recordedAt), rate: Number(r.attendanceRate) }));

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
      <StudentHeader student={student} />

      <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Attendance rate"
          value={formatPercent(attendanceSummary.averageAttendanceRate)}
          hint={`${attendanceSummary.totalSessionsAttended}/${attendanceSummary.totalSessionsScheduled} sessions`}
          icon={CalendarCheck}
        />
        <KpiCard
          label="Weighted assessment score"
          value={formatPercent(assessmentSummary.weightedAveragePercentage)}
          hint={`${assessmentSummary.assessmentCount} assessments`}
          icon={ClipboardList}
        />
        <KpiCard
          label="VLE engagement"
          value={String(engagementSummary.totalVleClicks)}
          hint={`${engagementSummary.totalLoginCount} logins · ${engagementSummary.totalForumPosts} forum posts`}
          icon={Activity}
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
              <AttendanceLineChart data={attendanceChartData} />
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
              <AssessmentLineChart data={assessmentChartData} />
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
              <EngagementBarChart data={engagementChartData} />
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
              <RecommendationCard
                key={rec.id}
                recommendation={rec}
                onStatusChange={updateRecommendationStatusAction}
              />
            ))
          )}
        </div>
      </section>
    </div>
  );
}
