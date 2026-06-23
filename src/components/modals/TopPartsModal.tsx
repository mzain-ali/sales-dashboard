'use client'
import { useMemo } from 'react'
import { useDashboardStore } from '@/store/dashboardStore'
import { getFilteredItems, aggregateParts, omr, pct, fmt } from '@/lib/aggregations'
import CustomerBarChart from '@/components/charts/CustomerBarChart'
import MarginBar from '@/components/ui/MarginBar'
import styles from './Modal.module.css'
export default function TopPartsModal({ type }: { type: string }) {
  const { months, activeMonth, dateRange, crossFilter } = useDashboardStore()
  const data = months[activeMonth]
  const items = useMemo(() => data ? getFilteredItems(data, dateRange, crossFilter) : [], [data, dateRange, crossFilter])
  const parts = useMemo(() => aggregateParts(items), [items])
  const isMarg = type === 'parts-marg'
  const byMarg = [...parts].filter(p => p.rev > 100).map(p => ({ ...p, mPct: p.rev ? p.marg / p.rev * 100 : 0 })).sort((a,b) => b.mPct - a.mPct)
  const displayed = isMarg ? byMarg : parts
  const chartData = isMarg ? byMarg.slice(0,14).map(p=>({ name: p.name.substring(0,16), value: +p.mPct.toFixed(1) })) : parts.slice(0,14).map(p=>({ name: p.name.substring(0,16), value: Math.round(p.rev) }))
  const totRev = items.reduce((s,r)=>s+r.tot,0)
  const zeroM = parts.filter(p=>p.rev>0&&p.marg/p.rev*100<1).length
  return (
    <>
      <div className={styles.kpiRow}>
        <div className={styles.kpi}><div className={styles.kpiL}>Total Parts</div><div className={styles.kpiV}>{displayed.length}</div></div>
        <div className={styles.kpi}><div className={styles.kpiL}>Zero Margin</div><div className={styles.kpiV} style={{color:'var(--red)'}}>{zeroM} parts</div></div>
        <div className={styles.kpi}><div className={styles.kpiL}>Top Part Share</div><div className={styles.kpiV}>{pct(totRev&&parts[0]?parts[0].rev/totRev*100:0)}</div></div>
      </div>
      <div className={styles.ch}><CustomerBarChart data={chartData} isMargin={isMarg} height={240} /></div>
      <div className={styles.tw}><table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}>
        <thead><tr style={{background:'var(--surface)'}}>{['#','Part','Unit Price','Qty','Revenue','Margin','Margin %'].map(h=><th key={h} style={{padding:'8px 12px',textAlign:'left',fontSize:10,fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',color:'var(--text-muted)',borderBottom:'1px solid var(--border)'}}>{h}</th>)}</tr></thead>
        <tbody>{displayed.slice(0,40).map((p,i)=>{ const mp=p.rev?p.marg/p.rev*100:0; const pp=p as any; return (
          <tr key={p.name}><td className="mono" style={{padding:'8px 12px',borderBottom:'1px solid var(--surface-2)',color:'var(--text-subtle)'}}>{i+1}</td>
            <td style={{padding:'8px 12px',borderBottom:'1px solid var(--surface-2)',maxWidth:200,overflow:'hidden',textOverflow:'ellipsis'}}>{p.name}</td>
            <td className="mono" style={{padding:'8px 12px',borderBottom:'1px solid var(--surface-2)',color:'var(--text-secondary)'}}>{omr(p.avgUnitPrice)}</td>
            <td className="mono" style={{padding:'8px 12px',borderBottom:'1px solid var(--surface-2)',color:'var(--text-secondary)'}}>{fmt(p.qty)}</td>
            {[omr(p.rev),omr(p.marg)].map((v,j)=><td key={j} className="mono" style={{padding:'8px 12px',borderBottom:'1px solid var(--surface-2)',color:'var(--text-secondary)'}}>{v}</td>)}
            <td style={{padding:'8px 12px',borderBottom:'1px solid var(--surface-2)'}}><MarginBar value={mp} /></td>
          </tr>)})}
        </tbody>
      </table></div>
    </>
  )
}