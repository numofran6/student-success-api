'use client';

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import {
  CHART_AXIS_LINE,
  CHART_AXIS_TICK,
  CHART_COLORS,
  CHART_TOOLTIP_STYLE,
} from '@/lib/chart-colors';

export function AttendanceLineChart({ data }: { data: { date: string; rate: number }[] }) {
  return (
    <div className="h-56" aria-hidden="true">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
          <XAxis dataKey="date" tick={CHART_AXIS_TICK} axisLine={CHART_AXIS_LINE} tickLine={false} />
          <YAxis unit="%" tick={CHART_AXIS_TICK} axisLine={CHART_AXIS_LINE} tickLine={false} />
          <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
          <Line
            type="monotone"
            dataKey="rate"
            stroke={CHART_COLORS.primary}
            strokeWidth={2.5}
            dot={{ r: 3, fill: CHART_COLORS.primary, strokeWidth: 0 }}
            activeDot={{ r: 5 }}
            name="Attendance rate"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
