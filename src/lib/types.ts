export type Weekday = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun' | ''

export interface SalesItem {
  date: string
  day: number
  weekday: Weekday
  bill: string
  cust: string
  item: string
  qty: number
  tot: number
  marg: number
  cogs: number
  vat: number
  rep?: string
}

export interface DailyData {
  day: number
  rev: number
  marg: number
  cogs: number
  invs: Set<string>
}

export interface CustomerData {
  name: string
  rev: number
  marg: number
  cogs: number
  qty: number
  invs: Set<string>
  lines: SalesItem[]
}

export interface PartData {
  name: string
  rev: number
  marg: number
  cogs: number
  qty: number
}

export interface InvoiceData {
  bill: string
  cust: string
  date: string
  rev: number
  marg: number
  items: number
}

export interface RepData {
  name: string
  rev: number
  marg: number
  invs: Set<string>
}

export interface MonthData {
  month: string
  items: SalesItem[]
  daily: Record<number, DailyData>
  custs: Record<string, CustomerData>
  parts: Record<string, PartData>
  reps: Record<string, RepData>
  invoices: InvoiceData[]
  totRev: number
  totMarg: number
  totCOGS: number
  totVAT: number
  totInv: number
  uCusts: number
  uParts: number
}

export interface DashboardSettings {
  marginWarnPct: number
  concentrationWarnPct: number
  lowMarginItemPct: number
  smallInvoiceOMR: number
  smallInvoicePct: number
}

export interface ActiveFilter {
  type: 'customer' | 'part' | null
  value: string | null
}

export interface DateRange {
  startDay: number
  endDay: number
}

export interface Annotation {
  day: number
  note: string
}

export interface RetentionData {
  retained: string[]
  newCustomers: string[]
  churned: string[]
  retentionRevenue: number
}

export const CHART_COLORS = [
  '#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#7C3AED',
  '#0EA5E9', '#EC4899', '#14B8A6', '#F97316', '#84CC16',
  '#6366F1', '#22C55E',
]

export const DEFAULT_SETTINGS: DashboardSettings = {
  marginWarnPct: 35,
  concentrationWarnPct: 25,
  lowMarginItemPct: 10,
  smallInvoiceOMR: 50,
  smallInvoicePct: 60,
}
