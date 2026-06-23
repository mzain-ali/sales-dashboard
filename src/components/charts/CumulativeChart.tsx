'use client'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { aggregateDaily } from '@/lib/aggregations'
import { fmt } from '@/lib/aggregations'
import type { SalesItem } from '@/lib/types'
export default function CumulativeChart({ items, height = 200 }: { items: SalesItem[]; height?: number }) {
  const daily = aggregateDaily(items)
  let cum = 0
  const data = daily.map(d => ({ day: `D${d.day}`, Revenue: (cum += d.rev, Math.round(cum)) }))
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data}>
        <defs><linearGradient id="green-grad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10B981" stopOpacity={0.15}/><stop offset="95%" stopColor="#10B981" stopOpacity={0}/></linearGradient></defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,.05)" vertical={false} />
        <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#94A3B8' }} />
        <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} tickFormatter={v => 'OMR '+fmt(v)} />
        <Tooltip formatter={(v: any) => `OMR ${fmt(v)}`} contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid var(--border)' }} />
        <Area type="monotone" dataKey="Revenue" stroke="#10B981" strokeWidth={2.5} fill="url(#green-grad)" dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  )
}