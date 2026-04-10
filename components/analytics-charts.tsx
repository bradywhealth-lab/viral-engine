"use client";

import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type ViewsDatum = {
  day: string;
  ProfileA: number;
  ProfileB: number;
  ProfileC: number;
};

type EngagementDatum = {
  platform: string;
  engagement: number;
};

export function ViewsChart({ data }: { data: ViewsDatum[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid stroke="#27272a" strokeDasharray="3 3" />
        <XAxis dataKey="day" stroke="#71717a" />
        <YAxis stroke="#71717a" />
        <Tooltip />
        <Line type="monotone" dataKey="ProfileA" stroke="#f59e0b" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="ProfileB" stroke="#10b981" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="ProfileC" stroke="#8b5cf6" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function EngagementChart({ data }: { data: EngagementDatum[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid stroke="#27272a" strokeDasharray="3 3" />
        <XAxis dataKey="platform" stroke="#71717a" />
        <YAxis stroke="#71717a" />
        <Tooltip />
        <Bar dataKey="engagement" fill="#f97316" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
