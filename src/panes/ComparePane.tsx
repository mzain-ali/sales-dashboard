'use client'
import { useMemo } from 'react'
import { useDashboardStore } from '@/store/dashboardStore'
import { computeRetention, omr, pct, fmt } from '@/lib/aggregations'
import Card from '@/components/ui/Card'
import CardHeader from '@/components/ui/CardHeader'
import Badge from '@/components/ui/Badge'
import CompareBarChart from '@/components/charts/CompareBarChart'
import EmptyState from '@/components/ui/EmptyState'
import styles from './Pane.module.css'

export default function ComparePane() {
  const { months } = useDashboardStore()
  const sorted = Object.keys(months).sort()
  if (sorted.length < 2) return <div className={styles.pane}><EmptyState title="Load at least 2 months to compare" body="Use the Add month button to upload more Excel files" /></div>
  const revData = sorted.map(m=>({ month:m, value:Math.round(months[m].totRev) }))
  const margData = sorted.map(m=>{ const D=months[m]; return { month:m, value:D.totRev?+(D.totMarg/D.totRev*100).toFixed(1):0 } })
  const invData = sorted.map(m=>({ month:m, value:months[m].totInv }))
  const aovData = sorted.map(m=>{ const D=months[m]; return { month:m, value:D.totInv?Math.round(D.totRev/D.totInv):0 } })
  const prev = months[sorted[sorted.length-2]], curr = months[sorted[sorted.length-1]]
  const retention = computeRetention(prev, curr)
  return (
    <div className={styles.pane}>
      <div className={styles.g2} style={{marginBottom:12}}>
        {[{l:'Revenue Growth',v:prev.totRev?`${((curr.totRev-prev.totRev)/prev.totRev*100).toFixed(1)}%`:'N/A',c:curr.totRev>=prev.totRev?'var(--green)':'var(--red)'},{l:'Margin Δ',v:pct((curr.totRev?curr.totMarg/curr.totRev*100:0)-(prev.totRev?prev.totMarg/prev.totRev*100:0),1),c:''},{l:'Retained Customers',v:`${retention.retained.length}`,c:''},{l:'New Customers',v:`${retention.newCustomers.length}`,c:'var(--green)'},{l:'Churned Customers',v:`${retention.churned.length}`,c:'var(--red)'},{l:'Retention Revenue',v:omr(retention.retentionRevenue),c:''}].map(k=>(
          <Card key={k.l}><div style={{padding:'12px 16px'}}><div style={{fontSize:10,fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',color:'var(--text-muted)',marginBottom:5}}>{k.l}</div><div style={{fontFamily:'Plus Jakarta Sans,sans-serif',fontSize:20,fontWeight:800,color:k.c||'var(--text-primary)',letterSpacing:'-.03em'}}>{k.v}</div></div></Card>
        ))}
      </div>
      <div className={styles.g2}>
        <Card><CardHeader title="Revenue by Month" badge={<Badge>MoM</Badge>} /><div style={{padding:'16px 20px'}}><CompareBarChart data={revData} /></div></Card>
        <Card><CardHeader title="Margin % by Month" badge={<Badge variant="green">Margin</Badge>} /><div style={{padding:'16px 20px'}}><CompareBarChart data={margData} formatter={v=>v+'%'} /></div></Card>
        <Card><CardHeader title="Invoice Count" badge={<Badge variant="amber">Volume</Badge>} /><div style={{padding:'16px 20px'}}><CompareBarChart data={invData} formatter={v=>fmt(v)} /></div></Card>
        <Card><CardHeader title="Avg Order Value" badge={<Badge variant="purple">AOV</Badge>} /><div style={{padding:'16px 20px'}}><CompareBarChart data={aovData} /></div></Card>
      </div>
      <div className={styles.g1}>
        <Card><CardHeader title="Month Summary" badge={<Badge>All months</Badge>} />
          <div style={{overflowX:'auto'}}>
            <table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}>
              <thead><tr style={{background:'var(--surface)'}}>{['Month','Revenue','Margin','Margin %','Invoices','AOV','Customers','Parts'].map(h=><th key={h} style={{padding:'9px 12px',textAlign:'left',fontSize:10,fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',color:'var(--text-muted)',borderBottom:'1px solid var(--border)',whiteSpace:'nowrap'}}>{h}</th>)}</tr></thead>
              <tbody>{sorted.map((m,i)=>{ const D=months[m]; const mp=D.totRev?D.totMarg/D.totRev*100:0; const aov=D.totInv?D.totRev/D.totInv:0; const prev2=sorted[i-1]?months[sorted[i-1]]:null; const delta=prev2?((D.totRev-prev2.totRev)/prev2.totRev*100):null; return (
                <tr key={m}><td style={{padding:'9px 12px',borderBottom:'1px solid var(--surface-2)',fontWeight:700}}>{m}</td>
                  <td className="mono" style={{padding:'9px 12px',borderBottom:'1px solid var(--surface-2)',color:'var(--text-secondary)'}}>{omr(D.totRev)}{delta!==null&&<span style={{fontSize:10,marginLeft:4,color:delta>=0?'var(--green)':'var(--red)'}}>{delta>=0?'▲':'▼'}{Math.abs(delta).toFixed(1)}%</span>}</td>
                  <td className="mono" style={{padding:'9px 12px',borderBottom:'1px solid var(--surface-2)',color:'var(--text-secondary)'}}>{omr(D.totMarg)}</td>
                  <td style={{padding:'9px 12px',borderBottom:'1px solid var(--surface-2)'}}><span className={`badge badge-${mp>=50?'green':mp>=25?'amber':'red'}`}>{pct(mp)}</span></td>
                  {[fmt(D.totInv),omr(aov),fmt(D.uCusts),fmt(D.uParts)].map((v,j)=><td key={j} className="mono" style={{padding:'9px 12px',borderBottom:'1px solid var(--surface-2)',color:'var(--text-secondary)'}}>{v}</td>)}
                </tr>) })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}