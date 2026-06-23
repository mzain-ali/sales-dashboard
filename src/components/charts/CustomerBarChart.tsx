'use client'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { CHART_COLORS } from '@/lib/types'
import { fmt } from '@/lib/aggregations'
interface DataItem { name: string; value: number }
interface Props { data: DataItem[]; height?: number; isMargin?: boolean; onBarClick?: (name: string) => void; activeFilter?: string | null }
export default function CustomerBarChart({ data, height = 260, isMargin, onBarClick, activeFilter }: Props) {
  const fmt2 = isMargin ? (v: number) => `${v.toFixed(1)}%` : (v: number) => `OMR ${fmt(v)}`
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,.05)" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 10, fill: '#94A3B8' }} tickFormatter={isMargin ? v => v+'%' : v => fmt(v)} />
        <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#64748B' }} width={120} />
        <Tooltip formatter={(v: any) => fmt2(v)} contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid var(--border)' }} />
        <Bar dataKey="value" radius={[0,4,4,0]} barSize={16} onClick={(d: any) => onBarClick?.(d.name)} cursor={onBarClick ? 'pointer' : undefined}>
          {data.map((entry, i) => {
            const dimmed = activeFilter && activeFilter !== entry.name
            const col = isMargin ? (entry.value >= 50 ? '#10B98199' : entry.value >= 25 ? '#F59E0B99' : '#EF444499') : CHART_COLORS[i % CHART_COLORS.length] + 'BB'
            return <Cell key={i} fill={dimmed ? '#E2E8F0' : col} />
          })}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}