'use client'
import { useState, useMemo } from 'react'
import { useDashboardStore } from '@/store/dashboardStore'
import { getFilteredItems, omr } from '@/lib/aggregations'
import Card from '@/components/ui/Card'
import CardHeader from '@/components/ui/CardHeader'
import Badge from '@/components/ui/Badge'
import CustomerBarChart from '@/components/charts/CustomerBarChart'
import MarginBar from '@/components/ui/MarginBar'
import paneStyles from './Pane.module.css'
import tableStyles from '@/components/tables/DataTable.module.css'
import type { SalesItem } from '@/lib/types'

interface RepData {
  name: string
  rev: number
  marg: number
  invs: Set<string>
}

function aggregateReps(items: SalesItem[]): RepData[] {
  const map: Record<string, RepData> = {}
  items.forEach(r => {
    const k = r.rep
    if (!k) return
    if (!map[k]) map[k] = { name: k, rev: 0, marg: 0, invs: new Set() }
    map[k].rev += r.tot
    map[k].marg += r.marg
    if (r.bill) map[k].invs.add(r.bill)
  })
  return Object.values(map).sort((a, b) => b.rev - a.rev)
}

export default function RepPane() {
  const { months, activeMonth, dateRange, crossFilter } = useDashboardStore()
  const [q, setQ] = useState('')
  const [sort, setSort] = useState('rev')

  const data = months[activeMonth]
  
  const items = useMemo(() => data ? getFilteredItems(data, dateRange, crossFilter) : [], [data, dateRange, crossFilter])
  
  const reps = useMemo(() => {
    let list = aggregateReps(items)
    if (q) {
      list = list.filter(r => r.name.toLowerCase().includes(q.toLowerCase()))
    }
    list.sort((a, b) => {
      if (sort === 'marg') {
        const ma = a.rev ? a.marg / a.rev : 0
        const mb = b.rev ? b.marg / b.rev : 0
        return mb - ma
      }
      if (sort === 'inv') {
        return b.invs.size - a.invs.size
      }
      return b.rev - a.rev
    })
    return list
  }, [items, q, sort])

  const chartRev = useMemo(() => {
    return reps.slice(0, 15).map(r => ({ name: r.name, value: Math.round(r.rev) }))
  }, [reps])

  const chartMarg = useMemo(() => {
    return [...reps]
      .filter(r => r.rev > 100)
      .map(r => ({ name: r.name, value: +(r.marg / r.rev * 100).toFixed(1) }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 15)
  }, [reps])

  if (!data) return null

  return (
    <div className={paneStyles.pane}>
      <div className={paneStyles.g2}>
        <Card>
          <CardHeader title="Revenue by Sales Rep" subtitle="Top sellers" badge={<Badge variant="amber">Revenue</Badge>} />
          <div style={{ padding: '16px 20px' }}>
            <CustomerBarChart data={chartRev} height={260} />
          </div>
        </Card>
        <Card>
          <CardHeader title="Margin % by Sales Rep" subtitle="Most profitable reps" badge={<Badge variant="green">Profitability</Badge>} />
          <div style={{ padding: '16px 20px' }}>
            <CustomerBarChart data={chartMarg} isMargin height={260} />
          </div>
        </Card>
      </div>

      <div className={paneStyles.g1}>
        <Card>
          <CardHeader title="All Sales Reps" subtitle={`${Object.keys(data.reps || {}).length} reps found`} badge={<Badge>Full list</Badge>} />
          <div>
            <div className={tableStyles.fbar}>
              <div className={tableStyles.swrap}>
                <svg viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  className={tableStyles.sinp}
                  placeholder="Search sales rep…"
                  value={q}
                  onChange={e => setQ(e.target.value)}
                />
              </div>
              <select className={tableStyles.fsel} value={sort} onChange={e => setSort(e.target.value)}>
                <option value="rev">Revenue ↓</option>
                <option value="marg">Margin % ↓</option>
                <option value="inv">Invoices ↓</option>
              </select>
            </div>
            
            <div className={tableStyles.wrap}>
              <table className={tableStyles.table}>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Sales Rep</th>
                    <th>Revenue</th>
                    <th>Margin</th>
                    <th>Margin %</th>
                    <th>Invoices</th>
                    <th>Avg Invoice</th>
                  </tr>
                </thead>
                <tbody>
                  {reps.map((r, i) => {
                    const mp = r.rev ? (r.marg / r.rev) * 100 : 0
                    const ai = r.invs.size ? r.rev / r.invs.size : 0
                    return (
                      <tr key={r.name}>
                        <td className="mono" style={{ color: 'var(--text-subtle)' }}>{i + 1}</td>
                        <td>{r.name}</td>
                        <td className="mono">{omr(r.rev)}</td>
                        <td className="mono">{omr(r.marg)}</td>
                        <td>
                          <MarginBar value={mp} />
                        </td>
                        <td className="mono">{r.invs.size}</td>
                        <td className="mono">{omr(ai)}</td>
                      </tr>
                    )
                  })}
                  {reps.length === 0 && (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)' }}>
                        No sales reps found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
