import * as XLSX from 'xlsx'
import type { MonthData, SalesItem, DailyData, CustomerData, PartData, InvoiceData, RepData, Weekday } from './types'

function parseDate(s: string): Date | null {
  if (!s) return null
  const d = new Date(s)
  return isNaN(d.getTime()) ? null : d
}

export function parseWorkbook(buffer: ArrayBuffer): MonthData {
  const wb = XLSX.read(buffer, { type: 'array', cellDates: true })
  const sheetName = wb.SheetNames[0]
  const ws = wb.Sheets[sheetName]
  return parseSheet(ws, sheetName)
}

export function parseSheet(ws: XLSX.WorkSheet, monthName: string): MonthData {
  const raw = XLSX.utils.sheet_to_json<string[]>(ws, { header: 1, raw: false, dateNF: 'yyyy-mm-dd' }) as string[][]

  let hr = -1
  for (let i = 0; i < raw.length; i++) {
    const r = raw[i] || []
    if (r.some(c => String(c || '').toUpperCase().includes('DATE')) &&
        r.some(c => {
          const s = String(c || '').toUpperCase()
          return s.includes('ITEM') || s.includes('DESCRIPTION') || s.includes('DESC')
        })) {
      hr = i; break
    }
  }
  if (hr < 0) hr = 1

  const hds = raw[hr].map(h => String(h || '').toUpperCase().trim())

  const iBILL = hds.findIndex(h =>
    (h.includes('INVOICE') && !h.includes('LINE') && !h.includes('PARTNER') && !h.includes('DATE'))
    || (h.includes('INVOICE') && (h.includes('NUMBER') || h.includes('NO')) && !h.includes('PART') && !h.includes('DATE') && !h.includes('PARTNER'))
    || h.includes('BILL NO')
    || h === 'INVOICE'
  )
  const iDATE = hds.findIndex(h => h.includes('DATE'))
  const iCUST = hds.findIndex(h =>
    h.includes('PARTNER') || h.includes('CUST') || h.includes('CLIENT')
  )
  const iITEM = hds.findIndex(h =>
    h.includes('DESCRIPTION') || h.includes('DESC') || h.includes('ITEM')
  )
  const iPARTNO = hds.findIndex(h =>
    h.includes('PART NUMBER') || h.includes('PART NO') || h.includes('PART/NUMBER')
  )
  const iOWNREF = hds.findIndex(h =>
    h.includes('OWN REFERENCE') || h.includes('OWN REF')
  )
  const iQTY = hds.findIndex(h =>
    h.includes('QUANTITY') || h.includes('QTY') || h.includes('UNITS')
  )
  const iUNITPRICE = hds.findIndex(h =>
    h.includes('UNIT PRICE') || h.includes('UNIT/PRICE')
  )
  const iVAT = hds.findIndex(h =>
    h.includes('VAT') || h.includes('TAX')
  )
  const iTOT = hds.findIndex(h =>
    h.includes('WITHOUT VAT') || h.includes('EX VAT') || h.includes('EX-VAT')
    || (h.includes('TOTAL') && !h.includes('WITH') && !h.includes('COST') && !h.includes('VAT'))
  )
  const iCOGS = hds.findIndex(h =>
    h.includes('TOTALCOST') || h.includes('TOTAL COST') || h.includes('TOTAL/COST')
  )
  const iCOSTUNIT = hds.findIndex(h =>
    (h.includes('COST') && !h.includes('TOTAL') && !h.includes('COGS'))
    || h.includes('PRODUCT/COST')
  )
  const iMAR = hds.findIndex(h =>
    h.includes('MARGIN') && !h.includes('MARGIN %')
  )
  const iDELIV = hds.findIndex(h =>
    h.includes('DELIVERY') || h.includes('DO ') || h.includes('DELIVERY ORDER')
  )
  const iREP = hds.findIndex(h =>
    h.includes('REP') || h.includes('SALESPERSON') || h.includes('STAFF')
  )

  console.log('Parser column mapping indices:', {
    iBILL, iDATE, iCUST, iITEM, iPARTNO, iOWNREF, iQTY, iUNITPRICE, iVAT, iTOT, iCOGS, iCOSTUNIT, iMAR, iDELIV, iREP
  })

  const D: MonthData = {
    month: monthName, items: [], daily: {}, custs: {}, parts: {}, reps: {}, invoices: [],
    totRev: 0, totMarg: 0, totCOGS: 0, totVAT: 0, totInv: 0, uCusts: 0, uParts: 0,
  }

  let lDate = '', lBill = '', lCust = ''

  for (let i = hr + 1; i < raw.length; i++) {
    const r = raw[i] || []

    if (r[iDATE] && String(r[iDATE]).trim()) lDate = String(r[iDATE]).trim()
    if (r[iBILL] && String(r[iBILL]).trim()) lBill = String(r[iBILL]).trim()
    if (r[iCUST] && String(r[iCUST]).trim()) lCust = String(r[iCUST]).trim()

    const item = String(r[iITEM] || '').trim()
    if (!item || item.length < 2) continue
    if (item.toUpperCase() === 'DESCRIPTION' || item.toUpperCase() === 'ITEM') continue

    const tot = parseFloat(r[iTOT]) || 0
    if (tot <= 0) continue

    const qty = parseFloat(r[iQTY]) || 0
    const marg = parseFloat(r[iMAR]) || 0
    const cogs = parseFloat(r[iCOGS]) || 0
    const vat = parseFloat(r[iVAT]) || 0
    const rep = iREP >= 0 ? String(r[iREP] || '').trim() : ''

    // Optional new fields
    const partNo    = iPARTNO >= 0   ? String(r[iPARTNO]   || '').trim() : ''
    const ownRef    = iOWNREF >= 0   ? String(r[iOWNREF]   || '').trim() : ''
    const unitPrice = iUNITPRICE >= 0 ? parseFloat(r[iUNITPRICE]) || 0  : 0
    const costUnit  = iCOSTUNIT >= 0  ? parseFloat(r[iCOSTUNIT])  || 0  : 0
    const delivOrder = iDELIV >= 0   ? String(r[iDELIV]    || '').trim() : ''

    const dt = parseDate(lDate)
    const day = dt ? dt.getDate() : 0
    const wdMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const weekday = dt ? wdMap[dt.getDay()] as Weekday : ''

    const si: SalesItem = {
      date: lDate, day, weekday, bill: lBill, cust: lCust,
      item, qty, tot, marg, cogs, vat, rep,
      partNo, ownRef, unitPrice, costUnit, delivOrder
    }
    D.items.push(si)

    if (day) {
      if (!D.daily[day]) D.daily[day] = { day, rev: 0, marg: 0, cogs: 0, invs: new Set() }
      D.daily[day].rev += tot; D.daily[day].marg += marg; D.daily[day].cogs += cogs
      if (lBill) D.daily[day].invs.add(lBill)
    }

    const ck = lCust || 'Unknown'
    if (!D.custs[ck]) D.custs[ck] = { name: ck, rev: 0, marg: 0, cogs: 0, qty: 0, invs: new Set(), lines: [], lastDate: '' }
    D.custs[ck].rev += tot; D.custs[ck].marg += marg; D.custs[ck].cogs += cogs; D.custs[ck].qty += qty
    D.custs[ck].lastDate = lDate > (D.custs[ck].lastDate || '') ? lDate : D.custs[ck].lastDate
    if (lBill) D.custs[ck].invs.add(lBill)
    D.custs[ck].lines.push(si)

    if (!D.parts[item]) D.parts[item] = { name: item, rev: 0, marg: 0, cogs: 0, qty: 0, partNo: partNo || '', ownRef: ownRef || '', avgUnitPrice: 0 }
    D.parts[item].rev += tot; D.parts[item].marg += marg; D.parts[item].cogs += cogs; D.parts[item].qty += qty
    if (!D.parts[item].partNo && partNo) D.parts[item].partNo = partNo
    if (!D.parts[item].ownRef && ownRef) D.parts[item].ownRef = ownRef

    if (rep) {
      if (!D.reps[rep]) D.reps[rep] = { name: rep, rev: 0, marg: 0, invs: new Set() }
      D.reps[rep].rev += tot; D.reps[rep].marg += marg
      if (lBill) D.reps[rep].invs.add(lBill)
    }

    D.totVAT += vat
  }

  const im: Record<string, InvoiceData> = {}
  D.items.forEach(r => {
    if (!r.bill) return
    if (!im[r.bill]) im[r.bill] = { bill: r.bill, cust: r.cust, date: r.date, rev: 0, marg: 0, items: 0, delivOrder: r.delivOrder || '' }
    im[r.bill].rev += r.tot; im[r.bill].marg += r.marg; im[r.bill].items++
    if (!im[r.bill].delivOrder && r.delivOrder) {
      im[r.bill].delivOrder = r.delivOrder
    }
  })
  D.invoices = Object.values(im)
  D.totRev = D.items.reduce((s, r) => s + r.tot, 0)
  D.totMarg = D.items.reduce((s, r) => s + r.marg, 0)
  D.totCOGS = D.items.reduce((s, r) => s + r.cogs, 0)
  D.totInv = D.invoices.length
  D.uCusts = Object.keys(D.custs).length
  D.uParts = Object.keys(D.parts).length

  Object.values(D.parts).forEach(p => {
    p.avgUnitPrice = p.qty ? p.rev / p.qty : 0
  })

  return D
}
