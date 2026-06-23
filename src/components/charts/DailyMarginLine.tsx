'use client'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { aggregateDaily } from '@/lib/aggregations'
import type { SalesItem } from '@/lib/types'
export default function DailyMarginLine({ items, height = 220 }: { items: SalesItem[]; height?: number }) {
  const data = aggregateDaily(items).map(d => ({ day: `D${d.day}`, 'Margin %': d.rev > 0 ? +(d.marg / d.rev * 100).toFixed(1) : 0 }))
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        <defs><linearGradient id="pur-grad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#7C3AED" stopOpacity={0.1}/><stop offset="95%" stopColor="#7C3AED" stopOpacity={0}/></linearGradient></defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,.05)" vertical={false} />
        <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#94A3B8' }} />
        <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} tickFormatter={v => v+'%'} />
        <Tooltip formatter={(v: any) => `${v.toFixed(1)}%`} contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid var(--border)' }} />
        <Line type="monotone" dataKey="Margin %" stroke="#7C3AED" strokeWidth={2.5} dot={{ r: 3, fill: '#7C3AED' }} activeDot={{ r: 5 }} />
      </LineChart>
    </ResponsiveContainer>
  )
}