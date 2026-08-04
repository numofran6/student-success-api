'use client';

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import {
  CHART_AXIS_LINE,
  CHART_AXIS_TICK,
  CHART_COLORS,
  CHART_TOOLTIP_STYLE,
} from '@/lib/chart-colors';

export function EngagementBarChart({
  data,
}: {
  data: { period: string; clicks: number; logins: number; forum: number }[];
}) {
  return (
    <div className="h-56" aria-hidden="true">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
          <XAxis dataKey="period" tick={CHART_AXIS_TICK} axisLine={CHART_AXIS_LINE} tickLine={false} />
          <YAxis tick={CHART_AXIS_TICK} axisLine={CHART_AXIS_LINE} tickLine={false} />
          <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
          <Bar dataKey="clicks" fill={CHART_COLORS.series.clicks} name="VLE clicks" radius={[4, 4, 0, 0]} />
          <Bar dataKey="logins" fill={CHART_COLORS.series.logins} name="Logins" radius={[4, 4, 0, 0]} />
          <Bar dataKey="forum" fill={CHART_COLORS.series.forum} name="Forum posts" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
