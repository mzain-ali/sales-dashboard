'use client'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { computeInvoiceBuckets } from '@/lib/aggregations'
import type { InvoiceData } from '@/lib/types'
export default function InvoiceDistChart({ invoices, height = 200 }: { invoices: InvoiceData[]; height?: number }) {
  const data = computeInvoiceBuckets(invoices).map(b => ({ label: b.label, Count: b.count }))
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,.05)" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#94A3B8' }} />
        <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} />
        <Tooltip formatter={(v: any) => `${v} invoices`} contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid var(--border)' }} />
        <Bar dataKey="Count" fill="#F59E0B80" radius={[4,4,0,0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}