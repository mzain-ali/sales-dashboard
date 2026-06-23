'use client'
import { useMemo } from 'react'
import { motion } from 'motion/react'
import { useDashboardStore } from '@/store/dashboardStore'
import { getFilteredItems, aggregateCustomers, aggregateParts, aggregateDaily, omr, pct, fmt } from '@/lib/aggregations'
import styles from './Pane.module.css'

interface Alert { type:'danger'|'warn'|'good'; title:string; body:string; val:string; color:string; bg:string; modal:string }

export function computeAlerts(months: any, activeMonth: string, dateRange: any, crossFilter: any, settings: any): Alert[] {
  const data = months[activeMonth]; if (!data) return []
  const items = getFilteredItems(data, dateRange, crossFilter)
  const custs = aggregateCustomers(items); const parts = aggregateParts(items); const daily = aggregateDaily(items)
  const totRev=items.reduce((s,r)=>s+r.tot,0), totMarg=items.reduce((s,r)=>s+r.marg,0)
  const mPct=totRev?totMarg/totRev*100:0
  const top=custs[0]; const conc=totRev&&top?top.rev/totRev*100:0
  const zeroM=parts.filter(p=>p.rev>0&&p.marg/p.rev*100<1)
  const lowM=parts.filter(p=>p.rev>0&&p.marg/p.rev*100>=1&&p.marg/p.rev*100<settings.lowMarginItemPct)
  const best=daily.reduce((m,d)=>d.rev>m.rev?d:m,{rev:0,day:0} as any)
  const highPC=custs.filter(c=>c.rev>100&&c.rev?c.marg/c.rev*100>=70:false)
  const invMap: Record<string,any>={}; items.forEach(r=>{ if(!r.bill)return; if(!invMap[r.bill])invMap[r.bill]={rev:0}; invMap[r.bill].rev+=r.tot })
  const invoices=Object.values(invMap); const smallInv=invoices.filter((i:any)=>i.rev<settings.smallInvoiceOMR).length
  const alerts: Alert[] = []
  if(conc>settings.concentrationWarnPct) alerts.push({type:'danger',title:'High revenue concentration',body:`${top?.name} = ${pct(conc)} of revenue (${omr(top?.rev||0)}). Single-customer risk.`,val:`${pct(conc)} from 1 customer`,color:'var(--red)',bg:'var(--red-light)',modal:'top-custs'})
  if(zeroM.length>0) alerts.push({type:'danger',title:`${zeroM.length} items at zero margin`,body:`No profit on: ${zeroM.slice(0,3).map(p=>p.name).join(', ')}${zeroM.length>3?'…':''}. Review pricing.`,val:`${zeroM.length} zero-margin parts`,color:'var(--red)',bg:'var(--red-light)',modal:'parts-marg'})
  if(lowM.length>0) alerts.push({type:'warn',title:`${lowM.length} parts below ${settings.lowMarginItemPct}% margin`,body:`${lowM.length} items have thin margins. Intentional or error?`,val:`${lowM.length} low-margin parts`,color:'var(--amber)',bg:'var(--amber-light)',modal:'parts-marg'})
  alerts.push({type:mPct>settings.marginWarnPct?'good':'warn',title:mPct>settings.marginWarnPct?'Healthy gross margin':'Margin below target',body:`${pct(mPct)} overall. Target: ${settings.marginWarnPct}%+`,val:`${pct(mPct)} gross margin`,color:mPct>settings.marginWarnPct?'var(--green)':'var(--amber)',bg:mPct>settings.marginWarnPct?'var(--green-light)':'var(--amber-light)',modal:'marg-split'})
  if(invoices.length>0&&smallInv/invoices.length>settings.smallInvoicePct/100) alerts.push({type:'warn',title:'Most invoices are small',body:`${pct(smallInv/invoices.length*100)} of orders are under OMR ${settings.smallInvoiceOMR}. Consider minimum order value.`,val:`${fmt(smallInv)} small invoices`,color:'var(--amber)',bg:'var(--amber-light)',modal:'inv-dist'})
  
  // Dormant customer alert
  const sortedMonths = Object.keys(months).sort()
  const activeIdx = sortedMonths.indexOf(activeMonth)
  const prevMonthName = activeIdx > 0 ? sortedMonths[activeIdx - 1] : null
  if (prevMonthName) {
    const prevCusts = Object.keys(months[prevMonthName].custs)
    const currCusts = new Set(Object.keys(data.custs))
    const dormant = prevCusts.filter(name => !currCusts.has(name))
    const ratio = prevCusts.length ? dormant.length / prevCusts.length : 0
    if (ratio > 0.20) {
      alerts.push({
        type: 'warn',
        title: 'Dormant accounts warning',
        body: `${dormant.length} out of ${prevCusts.length} customers from last month (${pct(ratio * 100)}) have not ordered this month yet.`,
        val: `${dormant.length} dormant accounts`,
        color: 'var(--amber)',
        bg: 'var(--amber-light)',
        modal: 'top-custs',
      })
    }
  }

  if(best.day>0) alerts.push({type:'good',title:`Best day: Day ${best.day}`,body:`${omr(best.rev)} in a single day with ${pct(best.rev>0?(daily.find(d=>d.day===best.day)?.marg||0)/best.rev*100:0)} margin.`,val:omr(best.rev),color:'var(--accent)',bg:'var(--accent-light)',modal:'daily-rev'})
  if(highPC.length>0) alerts.push({type:'good',title:`${highPC.length} high-margin customers`,body:`${highPC.slice(0,3).map(c=>c.name).join(', ')}${highPC.length>3?'…':''} — 70%+ margin.`,val:`${highPC.length} premium accounts`,color:'var(--green)',bg:'var(--green-light)',modal:'top-custs'})
  return alerts
}

const container = { hidden:{opacity:0}, show:{opacity:1,transition:{staggerChildren:.07}} }
const item = { hidden:{opacity:0,y:16}, show:{opacity:1,y:0} }

export default function AlertsPane() {
  const { months, activeMonth, dateRange, crossFilter, settings, openModal } = useDashboardStore()
  const alerts = useMemo(() => computeAlerts(months, activeMonth, dateRange, crossFilter, settings), [months, activeMonth, dateRange, crossFilter, settings])
  const iconPath = (t: string) => t==='danger'?'<path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>':t==='warn'?'<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>':'<polyline points="20 6 9 17 4 12"/>'
  return (
    <div className={styles.pane}>
      <motion.div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10}} variants={container} initial="hidden" animate="show">
        {alerts.map((a,i)=>(
          <motion.div key={i} variants={item} onClick={()=>openModal(a.modal)}
            style={{background:'var(--bg)',border:`1px solid var(--border)`,borderLeft:`4px solid ${a.color}`,borderRadius:'var(--radius)',padding:16,cursor:'pointer',transition:'all .15s'}}
            whileHover={{y:-2,boxShadow:'var(--shadow-md)'}}>
            <div style={{width:32,height:32,borderRadius:7,display:'flex',alignItems:'center',justifyContent:'center',background:a.bg,marginBottom:10}}>
              <svg viewBox="0 0 24 24" style={{width:15,height:15,stroke:a.color,fill:'none',strokeWidth:2,strokeLinecap:'round'}} dangerouslySetInnerHTML={{__html:iconPath(a.type)}} />
            </div>
            <div style={{fontSize:12,fontWeight:700,color:'var(--text-primary)',marginBottom:4,fontFamily:'Plus Jakarta Sans,sans-serif'}}>{a.title}</div>
            <div style={{fontSize:11,color:'var(--text-muted)',lineHeight:1.55}}>{a.body}</div>
            <div style={{fontFamily:'Plus Jakarta Sans,sans-serif',fontSize:18,fontWeight:800,color:a.color,marginTop:8,letterSpacing:'-.03em'}}>{a.val}</div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}