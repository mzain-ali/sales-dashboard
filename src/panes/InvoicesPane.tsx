'use client'
import { useMemo } from 'react'
import { useDashboardStore } from '@/store/dashboardStore'
import { getFilteredItems, aggregateInvoices, omr } from '@/lib/aggregations'
import Card from '@/components/ui/Card'
import CardHeader from '@/components/ui/CardHeader'
import Badge from '@/components/ui/Badge'
import InvoiceTable from '@/components/tables/InvoiceTable'
import KpiCard from '@/components/overview/KpiCard'
import paneStyles from './Pane.module.css'
import gridStyles from '@/components/overview/KpiGrid.module.css'

export default function InvoicesPane() {
  const { months, activeMonth, dateRange, crossFilter } = useDashboardStore()
  const data = months[activeMonth]

  const kpis = useMemo(() => {
    if (!data) return null
    const items = getFilteredItems(data, dateRange, crossFilter)
    const invoices = aggregateInvoices(items)
    
    const count = invoices.length
    const revenues = invoices.map(inv => inv.rev)
    const largest = count ? Math.max(...revenues) : 0
    const totalRev = invoices.reduce((s, inv) => s + inv.rev, 0)
    const avg = count ? totalRev / count : 0
    
    const zeroMarginCount = invoices.filter(inv => inv.marg <= 0).length
    const zeroMarginPct = count ? (zeroMarginCount / count) * 100 : 0

    return {
      count,
      largest,
      avg,
      zeroMarginCount,
      zeroMarginPct
    }
  }, [data, dateRange, crossFilter])

  if (!data || !kpis) return null

  return (
    <div className={paneStyles.pane}>
      <div className={gridStyles.grid} style={{ marginBottom: 16 }}>
        <KpiCard
          label="Total Invoices"
          value={kpis.count.toString()}
          sub="Issued in active range"
          arc={100}
          color="#F59E0B"
        />
        <KpiCard
          label="Largest Invoice"
          value={omr(kpis.largest)}
          sub="Single highest order value"
          arc={100}
          color="#4F46E5"
        />
        <KpiCard
          label="Average Invoice"
          value={omr(kpis.avg)}
          sub="Avg order value per bill"
          arc={100}
          color="#7C3AED"
        />
        <KpiCard
          label="Zero Margin Invoices"
          value={kpis.zeroMarginCount.toString()}
          sub={`${kpis.zeroMarginPct.toFixed(1)}% of all invoices`}
          arc={kpis.zeroMarginPct}
          color="#EF4444"
          chip={kpis.zeroMarginCount > 0 ? { text: 'Warning', variant: 'amber' } : undefined}
        />
      </div>

      <div className={paneStyles.g1}>
        <Card>
          <CardHeader
            title="All Invoices"
            subtitle="Search, sort, filter, or click any invoice to see customer details"
            badge={<Badge>Invoices List</Badge>}
          />
          <InvoiceTable />
        </Card>
      </div>
    </div>
  )
}
