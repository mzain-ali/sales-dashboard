'use client'
import { useMemo } from 'react'
import { useDashboardStore } from '@/store/dashboardStore'
import { omr, pct, fmt, mColor } from '@/lib/aggregations'
import CustomerBarChart from '@/components/charts/CustomerBarChart'
import styles from './Modal.module.css'
export default function CustDrillModal({ custName }: { custName: string }) {
  const { months, activeMonth } = useDashboardStore()
  const data = months[activeMonth]
  const cust = data?.custs[custName]
  const parts = useMemo(() => {
    if (!cust) return []
    const m: Record<string,any> = {}
    cust.lines.forEach(l => { if (!m[l.item]) m[l.item]={name:l.item,rev:0,marg:0,qty:0}; m[l.item].rev+=l.tot; m[l.item].marg+=l.marg; m[l.item].qty+=l.qty })
    return Object.values(m).sort((a:any,b:any)=>b.rev-a.rev)
  }, [cust])
  const invs = useMemo(() => {
    if (!cust) return []
    const m: Record<string,any> = {}
    cust.lines.forEach(l => { if (!l.bill) return; if (!m[l.bill]) m[l.bill]={bill:l.bill,date:l.date,rev:0,marg:0,items:0}; m[l.bill].rev+=l.tot; m[l.bill].marg+=l.marg; m[l.bill].items++ })
    return Object.values(m).sort((a:any,b:any)=>b.rev-a.rev)
  }, [cust])
  if (!cust) return <p>Customer not found</p>
  const mp = cust.rev ? cust.marg / cust.rev * 100 : 0
  const chartData = parts.slice(0,10).map((p:any)=>({ name: p.name.substring(0,16), value: Math.round(p.rev) }))
  return (
    <>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8,marginBottom:16}}>
        {[{l:'Revenue',v:omr(cust.rev),c:''},{l:'Margin',v:omr(cust.marg),c:''},{l:'Margin %',v:pct(mp),c:mColor(mp)},{l:'Invoices',v:fmt(cust.invs.size),c:''}].map(k=>(
          <div key={k.l} className={styles.kpi}><div className={styles.kpiL}>{k.l}</div><div className={styles.kpiV} style={k.c?{color:k.c}:{}}>{k.v}</div></div>
        ))}
      </div>
      <div className={styles.ch}><CustomerBarChart data={chartData} height={220} /></div>
      <div className={styles.sectionLabel}>Parts Bought</div>
      <div className={styles.tw}><table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}>
        <thead><tr style={{background:'var(--surface)'}}>{['Part','Qty','Revenue','Margin %'].map(h=><th key={h} style={{padding:'8px 12px',textAlign:'left',fontSize:10,fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',color:'var(--text-muted)',borderBottom:'1px solid var(--border)'}}>{h}</th>)}</tr></thead>
        <tbody>{parts.map((p:any)=>{ const pm=p.rev?p.marg/p.rev*100:0; return <tr key={p.name}><td style={{padding:'8px 12px',borderBottom:'1px solid var(--surface-2)'}}>{p.name}</td><td className="mono" style={{padding:'8px 12px',borderBottom:'1px solid var(--surface-2)',color:'var(--text-secondary)'}}>{fmt(p.qty)}</td><td className="mono" style={{padding:'8px 12px',borderBottom:'1px solid var(--surface-2)',color:'var(--text-secondary)'}}>{omr(p.rev)}</td><td style={{padding:'8px 12px',borderBottom:'1px solid var(--surface-2)'}}><span className={`badge badge-${pm>=50?'green':pm>=25?'amber':'red'}`}>{pct(pm)}</span></td></tr>})}
        </tbody>
      </table></div>
      <div className={styles.sectionLabel}>Invoice History</div>
      <div className={styles.tw}><table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}>
        <thead><tr style={{background:'var(--surface)'}}>{['Invoice','Date','DO','Revenue','Margin %','Items'].map(h=><th key={h} style={{padding:'8px 12px',textAlign:'left',fontSize:10,fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',color:'var(--text-muted)',borderBottom:'1px solid var(--border)'}}>{h}</th>)}</tr></thead>
        <tbody>{invs.map((inv:any)=>{ const im=inv.rev?inv.marg/inv.rev*100:0; const doNum=cust.lines.find(l => l.bill === inv.bill)?.delivOrder || '—'; return <tr key={inv.bill}><td className="mono" style={{padding:'8px 12px',borderBottom:'1px solid var(--surface-2)'}}>{inv.bill}</td><td className="mono" style={{padding:'8px 12px',borderBottom:'1px solid var(--surface-2)',color:'var(--text-secondary)'}}>{inv.date||'—'}</td><td className="mono" style={{padding:'8px 12px',borderBottom:'1px solid var(--surface-2)',color:'var(--text-secondary)'}}>{doNum}</td><td className="mono" style={{padding:'8px 12px',borderBottom:'1px solid var(--surface-2)',color:'var(--text-secondary)'}}>{omr(inv.rev)}</td><td style={{padding:'8px 12px',borderBottom:'1px solid var(--surface-2)'}}><span className={`badge badge-${im>=50?'green':im>=25?'amber':'red'}`}>{pct(im)}</span></td><td className="mono" style={{padding:'8px 12px',borderBottom:'1px solid var(--surface-2)',color:'var(--text-secondary)'}}>{inv.items}</td></tr>})}
        </tbody>
      </table></div>
    </>
  )
}