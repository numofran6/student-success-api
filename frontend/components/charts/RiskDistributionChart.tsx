'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export function RiskDistributionChart({
  low,
  medium,
  high,
}: {
  low: number;
  medium: number;
  high: number;
}) {
  return (
    <div className="h-64" aria-hidden="true">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={[
            { level: 'Low', count: low, fill: '#5C7A4E' },
            { level: 'Medium', count: medium, fill: '#C08A2E' },
            { level: 'High', count: high, fill: '#B5432F' },
          ]}
          margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#DED5BF" />
          <XAxis
            dataKey="level"
            tick={{ fill: '#5B5548', fontSize: 12 }}
            axisLine={{ stroke: '#DED5BF' }}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fill: '#5B5548', fontSize: 12 }}
            axisLine={{ stroke: '#DED5BF' }}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              background: '#FFFDF8',
              border: '1px solid #DED5BF',
              borderRadius: 3,
              fontSize: 12,
            }}
          />
          <Bar dataKey="count" radius={[3, 3, 0, 0]} fill="#2F6F62" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
