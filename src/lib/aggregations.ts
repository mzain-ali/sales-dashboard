import type { MonthData, SalesItem, DailyData, CustomerData, PartData, InvoiceData, ActiveFilter, DateRange, RetentionData } from './types'

export function getFilteredItems(data: MonthData, dateRange: DateRange, crossFilter: ActiveFilter): SalesItem[] {
  return data.items.filter(item => {
    if (item.day < dateRange.startDay || item.day > dateRange.endDay) return false
    if (crossFilter.type === 'customer' && item.cust !== crossFilter.value) return false
    if (crossFilter.type === 'part' && item.item !== crossFilter.value) return false
    return true
  })
}

export function aggregateDaily(items: SalesItem[]): DailyData[] {
  const map: Record<number, DailyData> = {}
  items.forEach(r => {
    if (!r.day) return
    if (!map[r.day]) map[r.day] = { day: r.day, rev: 0, marg: 0, cogs: 0, invs: new Set() }
    map[r.day].rev += r.tot; map[r.day].marg += r.marg; map[r.day].cogs += r.cogs
    if (r.bill) map[r.day].invs.add(r.bill)
  })
  return Object.values(map).sort((a, b) => a.day - b.day)
}

export function aggregateCustomers(items: SalesItem[]): CustomerData[] {
  const map: Record<string, CustomerData> = {}
  items.forEach(r => {
    const k = r.cust || 'Unknown'
    if (!map[k]) map[k] = { name: k, rev: 0, marg: 0, cogs: 0, qty: 0, invs: new Set(), lines: [] }
    map[k].rev += r.tot; map[k].marg += r.marg; map[k].cogs += r.cogs; map[k].qty += r.qty
    if (r.bill) map[k].invs.add(r.bill)
    map[k].lines.push(r)
  })
  return Object.values(map).sort((a, b) => b.rev - a.rev)
}

export function aggregateParts(items: SalesItem[]): PartData[] {
  const map: Record<string, PartData> = {}
  items.forEach(r => {
    if (!map[r.item]) map[r.item] = { name: r.item, rev: 0, marg: 0, cogs: 0, qty: 0 }
    map[r.item].rev += r.tot; map[r.item].marg += r.marg; map[r.item].cogs += r.cogs; map[r.item].qty += r.qty
  })
  return Object.values(map).sort((a, b) => b.rev - a.rev)
}

export function aggregateInvoices(items: SalesItem[]): InvoiceData[] {
  const map: Record<string, InvoiceData> = {}
  items.forEach(r => {
    if (!r.bill) return
    if (!map[r.bill]) map[r.bill] = { bill: r.bill, cust: r.cust, date: r.date, rev: 0, marg: 0, items: 0 }
    map[r.bill].rev += r.tot; map[r.bill].marg += r.marg; map[r.bill].items++
  })
  return Object.values(map).sort((a, b) => b.rev - a.rev)
}

export function computeKPIs(items: SalesItem[], invoices: InvoiceData[]) {
  const totRev = items.reduce((s, r) => s + r.tot, 0)
  const totMarg = items.reduce((s, r) => s + r.marg, 0)
  const totCOGS = items.reduce((s, r) => s + r.cogs, 0)
  const totVAT = items.reduce((s, r) => s + r.vat, 0)
  const totInv = invoices.length
  const aov = totInv ? totRev / totInv : 0
  const mPct = totRev ? totMarg / totRev * 100 : 0
  return { totRev, totMarg, totCOGS, totVAT, totInv, aov, mPct }
}

export function computeRetention(prev: MonthData, curr: MonthData): RetentionData {
  const prevNames = new Set(Object.keys(prev.custs))
  const currNames = new Set(Object.keys(curr.custs))
  const retained = [...currNames].filter(n => prevNames.has(n))
  const newCustomers = [...currNames].filter(n => !prevNames.has(n))
  const churned = [...prevNames].filter(n => !currNames.has(n))
  const retentionRevenue = retained.reduce((s, n) => s + (curr.custs[n]?.rev || 0), 0)
  return { retained, newCustomers, churned, retentionRevenue }
}

export function computeWeekdayMap(items: SalesItem[]) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const revMap: Record<string, number> = Object.fromEntries(days.map(d => [d, 0]))
  const cntMap: Record<string, number> = Object.fromEntries(days.map(d => [d, 0]))
  items.forEach(r => { if (r.weekday && revMap[r.weekday] !== undefined) { revMap[r.weekday] += r.tot; cntMap[r.weekday]++ } })
  return { revMap, cntMap }
}

export function computeInvoiceBuckets(invoices: InvoiceData[]) {
  const buckets = [0, 50, 100, 200, 500, 1000, 5000, Infinity]
  const labels = ['0–50', '50–100', '100–200', '200–500', '500–1k', '1k–5k', '5k+']
  const counts = Array(7).fill(0)
  const revenue = Array(7).fill(0)
  invoices.forEach(inv => {
    const i = buckets.findIndex((b, j) => inv.rev >= b && inv.rev < buckets[j + 1])
    if (i >= 0 && i < 7) { counts[i]++; revenue[i] += inv.rev }
  })
  return labels.map((label, i) => ({ label, count: counts[i], revenue: revenue[i] }))
}

export const fmt = (v: number) => v.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
export const omr = (v: number) => `OMR ${fmt(v)}`
export const pct = (v: number, d = 1) => `${Number(v).toFixed(d)}%`
export const mColor = (p: number) => p >= 50 ? 'var(--green)' : p >= 25 ? 'var(--amber)' : 'var(--red)'
export const mClass = (p: number) => p >= 50 ? 'green' : p >= 25 ? 'amber' : 'red'
