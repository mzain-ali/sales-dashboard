'use client'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { CHART_COLORS } from '@/lib/types'
import { fmt } from '@/lib/aggregations'
interface Props { data: { month: string; value: number }[]; formatter?: (v: number) => string; height?: number }
export default function CompareBarChart({ data, formatter, height = 240 }: Props) {
  const fmtFn = formatter || ((v: number) => `OMR ${fmt(v)}`)
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,.05)" vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94A3B8' }} />
        <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} tickFormatter={v => fmtFn(v)} />
        <Tooltip formatter={(v: any) => fmtFn(v)} contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid var(--border)' }} />
        <Bar dataKey="value" radius={[4,4,0,0]}>
          {data.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length] + '99'} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}