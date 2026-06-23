'use client'
import { useMemo } from 'react'
import { useDashboardStore } from '@/store/dashboardStore'
import { getFilteredItems, aggregateInvoices } from '@/lib/aggregations'
import Card from '@/components/ui/Card'
import CardHeader from '@/components/ui/CardHeader'
import Badge from '@/components/ui/Badge'
import DailyRevenueChart from '@/components/charts/DailyRevenueChart'
import WeekdayHeatmap from '@/components/charts/WeekdayHeatmap'
import InvoiceDistChart from '@/components/charts/InvoiceDistChart'
import CumulativeChart from '@/components/charts/CumulativeChart'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { aggregateDaily } from '@/lib/aggregations'
import { fmt } from '@/lib/aggregations'
import styles from './Pane.module.css'

export default function RevenuePane() {
  const { months, activeMonth, dateRange, crossFilter, openModal } = useDashboardStore()
  const data = months[activeMonth]
  const items = useMemo(() => data ? getFilteredItems(data, dateRange, crossFilter) : [], [data, dateRange, crossFilter])
  const invoices = useMemo(() => aggregateInvoices(items), [items])
  const daily = useMemo(() => aggregateDaily(items), [items])
  const invPerDay = useMemo(() => { const m: Record<number,number>={}; invoices.forEach(inv=>{ const d=inv.date?new Date(inv.date).getDate():0; if(d) m[d]=(m[d]||0)+1 }); return m }, [invoices])
  const dayInvData = daily.map(d=>({ day:`D${d.day}`, Count: invPerDay[d.day]||0 }))
  if (!data) return null
  return (
    <div className={styles.pane}>
      <div className={styles.g1}>
        <Card>
          <CardHeader title="Daily Revenue · Margin · COGS" subtitle="Every day of the month" badge={<Badge>Full month</Badge>} />
          <div style={{padding:'16px 20px'}}><DailyRevenueChart items={items} height={260} /></div>
        </Card>
      </div>
      <div className={styles.g2}>
        <Card><CardHeader title="Weekday Performance" subtitle="Revenue by day of week" badge={<Badge variant="purple">Pattern</Badge>} /><div style={{padding:'16px 20px'}}><WeekdayHeatmap items={items} /></div></Card>
        <Card clickable onClick={() => openModal('inv-dist')}><CardHeader title="Invoice Size Distribution" subtitle="Order value buckets" badge={<Badge variant="amber">Distribution</Badge>} /><div style={{padding:'16px 20px'}}><InvoiceDistChart invoices={invoices} height={200} /></div></Card>
        <Card><CardHeader title="Cumulative Revenue" subtitle="Month-to-date build-up" badge={<Badge variant="green">Cumulative</Badge>} /><div style={{padding:'16px 20px'}}><CumulativeChart items={items} height={200} /></div></Card>
        <Card><CardHeader title="Daily Invoice Count" subtitle="Number of orders per day" badge={<Badge variant="sky">Volume</Badge>} />
          <div style={{padding:'16px 20px'}}>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={dayInvData}><CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,.05)" vertical={false}/><XAxis dataKey="day" tick={{fontSize:10,fill:'#94A3B8'}}/><YAxis tick={{fontSize:10,fill:'#94A3B8'}}/><Tooltip formatter={(v:any)=>`${v} invoices`} contentStyle={{fontSize:12,borderRadius:8,border:'1px solid var(--border)'}}/><Bar dataKey="Count" fill="#0EA5E965" radius={[3,3,0,0]}/></BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  )
}