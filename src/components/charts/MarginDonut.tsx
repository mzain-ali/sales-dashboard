'use client'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { fmt } from '@/lib/aggregations'
interface Props { margin: number; cogs: number; vat: number; height?: number }
export default function MarginDonut({ margin, cogs, vat, height = 240 }: Props) {
  const data = [{ name: 'Margin', value: Math.round(margin) }, { name: 'COGS', value: Math.round(cogs) }, { name: 'VAT', value: Math.round(vat) }]
  const COLORS = ['#10B981', '#EF4444', '#0EA5E9']
  const total = margin + cogs + vat
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius="55%" outerRadius="80%" paddingAngle={2} dataKey="value">
          {data.map((_, i) => <Cell key={i} fill={COLORS[i] + '99'} stroke={COLORS[i]} strokeWidth={2} />)}
        </Pie>
        <Tooltip formatter={(v: any) => [`OMR ${fmt(v)} (${(v/total*100).toFixed(1)}%)`]} contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid var(--border)' }} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
      </PieChart>
    </ResponsiveContainer>
  )
}