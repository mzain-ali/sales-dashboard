'use client'
import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { aggregateDaily } from '@/lib/aggregations'
import { fmt } from '@/lib/aggregations'
import type { SalesItem } from '@/lib/types'
interface Props { items: SalesItem[]; height?: number }
export default function DailyRevenueChart({ items, height = 220 }: Props) {
  const data = useMemo(() => aggregateDaily(items).map(d => ({ day: `D${d.day}`, Revenue: Math.round(d.rev), Margin: Math.round(d.marg), COGS: Math.round(d.cogs) })), [items])
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} barGap={2}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,.05)" vertical={false} />
        <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#94A3B8' }} />
        <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} tickFormatter={v => 'OMR '+fmt(v)} />
        <Tooltip formatter={(v: any) => `OMR ${fmt(v)}`} contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid var(--border)' }} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Bar dataKey="Revenue" fill="#4F46E580" radius={[3,3,0,0]} />
        <Bar dataKey="Margin" fill="#10B98175" radius={[3,3,0,0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}