'use client';

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import {
  CHART_AXIS_LINE,
  CHART_AXIS_TICK,
  CHART_COLORS,
  CHART_TOOLTIP_STYLE,
} from '@/lib/chart-colors';

export function RiskDistributionChart({
  low,
  medium,
  high,
}: {
  low: number;
  medium: number;
  high: number;
}) {
  const data = [
    { level: 'Low', count: low, fill: CHART_COLORS.risk.low },
    { level: 'Medium', count: medium, fill: CHART_COLORS.risk.medium },
    { level: 'High', count: high, fill: CHART_COLORS.risk.high },
  ];

  return (
    <div className="h-64" aria-hidden="true">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
          <XAxis dataKey="level" tick={CHART_AXIS_TICK} axisLine={CHART_AXIS_LINE} tickLine={false} />
          <YAxis allowDecimals={false} tick={CHART_AXIS_TICK} axisLine={CHART_AXIS_LINE} tickLine={false} />
          <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
          <Bar dataKey="count" radius={[6, 6, 0, 0]}>
            {data.map((entry) => (
              <Cell key={entry.level} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
