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

export function EngagementBarChart({
  data,
}: {
  data: { period: string; clicks: number; logins: number; forum: number }[];
}) {
  return (
    <div className="h-56" aria-hidden="true">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
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
  );
}
