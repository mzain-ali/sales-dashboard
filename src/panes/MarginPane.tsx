'use client'
import { useMemo } from 'react'
import { useDashboardStore } from '@/store/dashboardStore'
import { getFilteredItems, aggregateParts, omr, pct, mColor, mClass } from '@/lib/aggregations'
import Card from '@/components/ui/Card'
import CardHeader from '@/components/ui/CardHeader'
import Badge from '@/components/ui/Badge'
import MarginDonut from '@/components/charts/MarginDonut'
import DailyMarginLine from '@/components/charts/DailyMarginLine'
import styles from './Pane.module.css'

export default function MarginPane() {
  const { months, activeMonth, dateRange, crossFilter, openModal } = useDashboardStore()
  const data = months[activeMonth]
  const items = useMemo(() => data ? getFilteredItems(data, dateRange, crossFilter) : [], [data, dateRange, crossFilter])
  const parts = useMemo(() => aggregateParts(items).filter(p=>p.rev>0).map(p=>({...p,mPct:p.marg/p.rev*100})).sort((a,b)=>b.mPct-a.mPct), [items])
  const totRev=items.reduce((s,r)=>s+r.tot,0), totMarg=items.reduce((s,r)=>s+r.marg,0), totCOGS=items.reduce((s,r)=>s+r.cogs,0), totVAT=items.reduce((s,r)=>s+r.vat,0)
  const mPct=totRev?totMarg/totRev*100:0
  if (!data) return null
  return (
    <div className={styles.pane}>
      <div className={styles.g3} style={{marginBottom:12}}>
        {[{l:'Gross Margin %',v:pct(mPct),c:'#4F46E5'},{l:'Total COGS',v:omr(totCOGS),c:'#EF4444'},{l:'VAT Collected',v:omr(totVAT),c:'#0EA5E9'}].map(k=>(
          <Card key={k.l}><div style={{padding:'14px 16px'}}><div style={{fontSize:10,fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',color:'var(--text-muted)',marginBottom:6}}>{k.l}</div><div style={{fontFamily:'Plus Jakarta Sans,sans-serif',fontSize:22,fontWeight:800,color:k.c,letterSpacing:'-.03em'}}>{k.v}</div></div></Card>
        ))}
      </div>
      <div className={styles.g2}>
        <Card clickable onClick={() => openModal('marg-split')}><CardHeader title="Revenue Composition" subtitle="Margin vs COGS vs VAT" badge={<Badge>Split</Badge>} /><div style={{padding:'16px 20px'}}><MarginDonut margin={totMarg} cogs={totCOGS} vat={totVAT} /></div></Card>
        <Card><CardHeader title="Daily Margin %" subtitle="Profitability trend" badge={<Badge variant="purple">Daily</Badge>} /><div style={{padding:'16px 20px'}}><DailyMarginLine items={items} /></div></Card>
      </div>
      <div className={styles.g1}>
        <Card><CardHeader title="Margin % — All Parts" subtitle="Sorted by profitability · red = below 10%" badge={<Badge variant="red">Risk view</Badge>} />
          <div style={{padding:'12px 20px',maxHeight:380,overflowY:'auto'}}>
            {parts.map(p=>(
              <div key={p.name} style={{display:'flex',alignItems:'center',gap:8,padding:'7px 0',borderBottom:'1px solid var(--surface-2)'}}>
                <div style={{fontSize:11,fontWeight:500,color:'var(--text-primary)',width:180,flexShrink:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}} title={p.name}>{p.name}</div>
                <div style={{flex:1,height:7,background:'var(--border)',borderRadius:4,overflow:'hidden',cursor:'pointer'}} onClick={() => openModal('parts-marg')}><div style={{height:'100%',width:`${Math.min(Math.max(p.mPct,0),100)}%`,background:mColor(p.mPct),borderRadius:4,transition:'width 1s cubic-bezier(.4,0,.2,1)'}} /></div>
                <div className="mono" style={{fontSize:10,fontWeight:500,width:40,textAlign:'right',flexShrink:0,color:mColor(p.mPct)}}>{pct(p.mPct)}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}