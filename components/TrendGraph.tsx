"use client";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export type TrendData = {
  date: string;
  [key: string]: string | number; // e.g. "yes": 45, "no": 55, or "cand1": 30
};

interface TrendGraphProps {
  data: TrendData[];
  lines: { key: string; name: string; color: string }[];
  height?: number;
  hideAxis?: boolean;
}

export default function TrendGraph({ data, lines, height = 300, hideAxis = false }: TrendGraphProps) {
  if (!data || data.length === 0) {
    return (
      <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', background: 'var(--bg-secondary)', borderRadius: 8 }}>
        추이 데이터가 아직 없습니다.
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 10, right: 10, left: hideAxis ? 0 : -20, bottom: hideAxis ? 0 : 0 }}>
          {!hideAxis && <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />}
          {!hideAxis && (
            <XAxis 
              dataKey="date" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: 'var(--text-muted)', fontSize: 11 }} 
              dy={10}
            />
          )}
          {!hideAxis && (
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: 'var(--text-muted)', fontSize: 11 }} 
              domain={[0, 100]} 
              tickFormatter={(value) => `${value}%`}
            />
          )}
          <Tooltip 
            contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, boxShadow: 'var(--shadow-lg)', padding: '12px 16px' }}
            itemStyle={{ fontSize: 14, fontWeight: 700, padding: '2px 0' }}
            labelStyle={{ color: 'var(--text-secondary)', fontSize: 12, marginBottom: 8, fontWeight: 500 }}
            formatter={(value: any) => [`${value}%`, undefined]}
          />
          {lines.map((line) => (
            <Line 
              key={line.key}
              type="monotone" 
              dataKey={line.key} 
              name={line.name} 
              stroke={line.color} 
              strokeWidth={hideAxis ? 2 : 3} 
              dot={!hideAxis ? { r: 3, strokeWidth: 0, fill: line.color } : false} 
              activeDot={{ r: hideAxis ? 0 : 6, strokeWidth: 0 }} 
              animationDuration={1500}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
