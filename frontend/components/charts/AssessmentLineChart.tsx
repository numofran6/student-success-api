'use client';

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export function AssessmentLineChart({
  data,
}: {
  data: { date: string; percentage: number }[];
}) {
  return (
    <div className="h-56" aria-hidden="true">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#DED5BF" />
          <XAxis dataKey="date" tick={{ fill: '#5B5548', fontSize: 11 }} axisLine={{ stroke: '#DED5BF' }} tickLine={false} />
          <YAxis unit="%" tick={{ fill: '#5B5548', fontSize: 11 }} axisLine={{ stroke: '#DED5BF' }} tickLine={false} />
          <Tooltip contentStyle={{ background: '#FFFDF8', border: '1px solid #DED5BF', borderRadius: 3, fontSize: 12 }} />
          <Line type="monotone" dataKey="percentage" stroke="#C08A2E" strokeWidth={2} dot={{ r: 3 }} name="Score %" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
