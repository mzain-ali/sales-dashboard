import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { MonthData, DashboardSettings, DateRange, ActiveFilter } from './types'
import { aggregateCustomers, aggregateParts, computeKPIs, fmt, omr } from './aggregations'
import { computeAlerts } from '@/panes/AlertsPane'

export function exportToPDF(
  months: Record<string, MonthData>,
  activeMonth: string,
  dateRange: DateRange,
  crossFilter: ActiveFilter,
  settings: DashboardSettings
) {
  const data = months[activeMonth]
  if (!data) return

  const doc = new jsPDF()

  // Primary Theme Color: Deep Indigo/Navy
  const primaryColor = [31, 27, 75]
  const accentColor = [79, 70, 229]

  // Header Banner
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2])
  doc.rect(0, 0, 210, 30, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(22)
  doc.text('HMI Parts', 15, 18)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  doc.setTextColor(200, 200, 255)
  doc.text('SALES INTELLIGENCE REPORT', 15, 24)

  // Report Date & Active Month
  doc.setFontSize(10)
  doc.setTextColor(255, 255, 255)
  doc.text(`Month: ${activeMonth}`, 150, 15)
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 150, 21)

  let y = 40

  // 1. KPI Summary Section
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2])
  doc.text('Key Performance Indicators', 15, y)
  y += 6

  const kpis = computeKPIs(data.items, data.invoices)

  autoTable(doc, {
    startY: y,
    head: [['Revenue (OMR)', 'Margin %', 'Total Profit (OMR)', 'Invoices', 'Avg Order Value (OMR)']],
    body: [[
      omr(kpis.totRev),
      `${kpis.mPct.toFixed(1)}%`,
      omr(kpis.totMarg),
      fmt(kpis.totInv),
      omr(kpis.aov)
    ]],
    theme: 'grid',
    headStyles: { fillColor: accentColor as [number, number, number], textColor: [255, 255, 255], fontStyle: 'bold' },
    bodyStyles: { fontStyle: 'bold', fontSize: 10, halign: 'center' },
  })

  y = (doc as any).lastAutoTable.finalY + 15

  // 2. Top Customers (Top 10)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2])
  doc.text('Top 10 Customers by Revenue', 15, y)
  y += 6

  const topCusts = aggregateCustomers(data.items).slice(0, 10)
  const custTableData = topCusts.map((c, i) => [
    i + 1,
    c.name,
    fmt(c.qty),
    omr(c.rev),
    omr(c.marg),
    `${(c.rev ? (c.marg / c.rev * 100) : 0).toFixed(1)}%`
  ])

  autoTable(doc, {
    startY: y,
    head: [['#', 'Customer Name', 'Qty Sold', 'Revenue', 'Margin', 'Margin %']],
    body: custTableData,
    theme: 'striped',
    headStyles: { fillColor: primaryColor as [number, number, number], textColor: [255, 255, 255], fontStyle: 'bold' },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
      2: { halign: 'right' },
      3: { halign: 'right' },
      4: { halign: 'right' },
      5: { halign: 'right' }
    }
  })

  y = (doc as any).lastAutoTable.finalY + 15

  // Add Page break for Page 2
  doc.addPage()

  // Header on Page 2
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2])
  doc.rect(0, 0, 210, 15, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('HMI Parts - Sales Intelligence Report (Cont.)', 15, 10)

  y = 25

  // 3. Top Parts (Top 10)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2])
  doc.text('Top 10 Parts by Revenue', 15, y)
  y += 6

  const topParts = aggregateParts(data.items).slice(0, 10)
  const partTableData = topParts.map((p, i) => [
    i + 1,
    p.partNo || '—',
    p.name,
    omr(p.avgUnitPrice),
    fmt(p.qty),
    omr(p.rev),
    `${(p.rev ? (p.marg / p.rev * 100) : 0).toFixed(1)}%`
  ])

  autoTable(doc, {
    startY: y,
    head: [['#', 'Part No', 'Part Name', 'Unit Price', 'Qty Sold', 'Revenue', 'Margin %']],
    body: partTableData,
    theme: 'striped',
    headStyles: { fillColor: primaryColor as [number, number, number], textColor: [255, 255, 255], fontStyle: 'bold' },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
      3: { halign: 'right' },
      4: { halign: 'right' },
      5: { halign: 'right' },
      6: { halign: 'right' }
    }
  })

  y = (doc as any).lastAutoTable.finalY + 15

  // 4. Alerts & Diagnostic Warnings
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2])
  doc.text('System Alerts & Diagnostics', 15, y)
  y += 10

  const alerts = computeAlerts(months, activeMonth, dateRange, crossFilter, settings)

  alerts.forEach(alert => {
    let bulletColor = [16, 185, 129] // Green for 'good'
    if (alert.type === 'danger') {
      bulletColor = [239, 68, 68] // Red
    } else if (alert.type === 'warn') {
      bulletColor = [245, 158, 11] // Amber
    }

    doc.setFillColor(bulletColor[0], bulletColor[1], bulletColor[2])
    doc.circle(18, y - 1.5, 2, 'F')

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(bulletColor[0], bulletColor[1], bulletColor[2])
    doc.text(alert.title, 24, y - 0.5)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(80, 80, 80)
    
    const splitBody = doc.splitTextToSize(alert.body, 170)
    doc.text(splitBody, 24, y + 4.5)

    y += 10 + (splitBody.length * 4)
  })

  // Save the PDF document
  doc.save(`HMI-Parts-Report-${activeMonth}.pdf`)
}
