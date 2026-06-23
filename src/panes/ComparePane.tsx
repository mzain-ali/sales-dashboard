import { useMemo, useState } from 'react'
import { useDashboardStore } from '@/store/dashboardStore'
import { computeRetention, omr, pct, fmt, computeCustomerTrend, computePartTrend } from '@/lib/aggregations'
import Card from '@/components/ui/Card'
import CardHeader from '@/components/ui/CardHeader'
import Badge from '@/components/ui/Badge'
import CompareBarChart from '@/components/charts/CompareBarChart'
import EmptyState from '@/components/ui/EmptyState'
import styles from './Pane.module.css'

export default function ComparePane() {
  const { months } = useDashboardStore()
  const [showChurned, setShowChurned] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showRetained, setShowRetained] = useState(false)
  const [trendTab, setTrendTab] = useState<'customer' | 'part'>('customer')
  const [selectedCust, setSelectedCust] = useState('')
  const [selectedPart, setSelectedPart] = useState('')

  const sorted = Object.keys(months).sort()

  const allCustomerNames = useMemo(() => {
    const names = new Set<string>()
    Object.values(months).forEach(m => {
      Object.keys(m.custs).forEach(name => names.add(name))
    })
    return Array.from(names).sort()
  }, [months])

  const allPartNames = useMemo(() => {
    const names = new Set<string>()
    Object.values(months).forEach(m => {
      Object.keys(m.parts).forEach(name => names.add(name))
    })
    return Array.from(names).sort()
  }, [months])

  const custTrendData = useMemo(() => {
    if (!selectedCust) return null
    return computeCustomerTrend(months, sorted, selectedCust)
  }, [selectedCust, sorted, months])

  const partTrendData = useMemo(() => {
    if (!selectedPart) return null
    return computePartTrend(months, sorted, selectedPart)
  }, [selectedPart, sorted, months])

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

      <div className={styles.g3} style={{marginBottom:16}}>
        {/* Churned Customers Collapsible */}
        <Card>
          <div style={{padding:'12px 16px'}}>
            <div onClick={() => setShowChurned(!showChurned)} style={{display:'flex',alignItems:'center',justifyContent:'space-between',cursor:'pointer',userSelect:'none'}}>
              <div>
                <div style={{fontSize:10,fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',color:'var(--text-muted)'}}>Churned Customers List</div>
                <div style={{fontSize:11,color:'var(--text-muted)',marginTop:2}}>Customers from {sorted[sorted.length-2]} who did not purchase in {sorted[sorted.length-1]}</div>
              </div>
              <div style={{color:'var(--text-muted)',transform:showChurned?'rotate(180deg)':'rotate(0deg)',transition:'transform .2s',display:'flex',alignItems:'center'}}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </div>
            </div>
            {showChurned && (
              <div style={{marginTop:12,borderTop:'1px solid var(--border)',paddingTop:10,maxHeight:220,overflowY:'auto'}}>
                {retention.churned.length === 0 ? (
                  <div style={{padding:'8px 0',textAlign:'center',color:'var(--text-muted)',fontSize:11}}>No churned customers</div>
                ) : (
                  <table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}>
                    <tbody>
                      {retention.churned
                        .map(n => ({ name: n, rev: prev.custs[n]?.rev || 0 }))
                        .sort((a,b) => b.rev - a.rev)
                        .map(c => (
                          <tr key={c.name} style={{borderBottom:'1px solid var(--surface-2)'}}>
                            <td style={{padding:'6px 0',color:'var(--text-secondary)'}}>{c.name}</td>
                            <td className="mono" style={{padding:'6px 0',textAlign:'right',color:'var(--red)',fontWeight:500}}>-{omr(c.rev)}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        </Card>

        {/* New Customers Collapsible */}
        <Card>
          <div style={{padding:'12px 16px'}}>
            <div onClick={() => setShowNew(!showNew)} style={{display:'flex',alignItems:'center',justifyContent:'space-between',cursor:'pointer',userSelect:'none'}}>
              <div>
                <div style={{fontSize:10,fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',color:'var(--text-muted)'}}>New Customers List</div>
                <div style={{fontSize:11,color:'var(--text-muted)',marginTop:2}}>First-time buyers in {sorted[sorted.length-1]} compared to {sorted[sorted.length-2]}</div>
              </div>
              <div style={{color:'var(--text-muted)',transform:showNew?'rotate(180deg)':'rotate(0deg)',transition:'transform .2s',display:'flex',alignItems:'center'}}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </div>
            </div>
            {showNew && (
              <div style={{marginTop:12,borderTop:'1px solid var(--border)',paddingTop:10,maxHeight:220,overflowY:'auto'}}>
                {retention.newCustomers.length === 0 ? (
                  <div style={{padding:'8px 0',textAlign:'center',color:'var(--text-muted)',fontSize:11}}>No new customers</div>
                ) : (
                  <table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}>
                    <tbody>
                      {retention.newCustomers
                        .map(n => ({ name: n, rev: curr.custs[n]?.rev || 0 }))
                        .sort((a,b) => b.rev - a.rev)
                        .map(c => (
                          <tr key={c.name} style={{borderBottom:'1px solid var(--surface-2)'}}>
                            <td style={{padding:'6px 0',color:'var(--text-secondary)'}}>{c.name}</td>
                            <td className="mono" style={{padding:'6px 0',textAlign:'right',color:'var(--green)',fontWeight:600}}>+{omr(c.rev)}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        </Card>

        {/* Retained Customers Collapsible */}
        <Card>
          <div style={{padding:'12px 16px'}}>
            <div onClick={() => setShowRetained(!showRetained)} style={{display:'flex',alignItems:'center',justifyContent:'space-between',cursor:'pointer',userSelect:'none'}}>
              <div>
                <div style={{fontSize:10,fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',color:'var(--text-muted)'}}>Retained Customers List</div>
                <div style={{fontSize:11,color:'var(--text-muted)',marginTop:2}}>Active buyers in both months (shown with {sorted[sorted.length-1]} revenue)</div>
              </div>
              <div style={{color:'var(--text-muted)',transform:showRetained?'rotate(180deg)':'rotate(0deg)',transition:'transform .2s',display:'flex',alignItems:'center'}}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </div>
            </div>
            {showRetained && (
              <div style={{marginTop:12,borderTop:'1px solid var(--border)',paddingTop:10,maxHeight:220,overflowY:'auto'}}>
                {retention.retained.length === 0 ? (
                  <div style={{padding:'8px 0',textAlign:'center',color:'var(--text-muted)',fontSize:11}}>No retained customers</div>
                ) : (
                  <table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}>
                    <tbody>
                      {retention.retained
                        .map(n => ({ name: n, rev: curr.custs[n]?.rev || 0 }))
                        .sort((a,b) => b.rev - a.rev)
                        .map(c => (
                          <tr key={c.name} style={{borderBottom:'1px solid var(--surface-2)'}}>
                            <td style={{padding:'6px 0',color:'var(--text-secondary)'}}>{c.name}</td>
                            <td className="mono" style={{padding:'6px 0',textAlign:'right',color:'var(--text-primary)',fontWeight:500}}>{omr(c.rev)}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        </Card>
      </div>
      <div className={styles.g2}>
        <Card><CardHeader title="Revenue by Month" badge={<Badge>MoM</Badge>} /><div style={{padding:'16px 20px'}}><CompareBarChart data={revData} /></div></Card>
        <Card><CardHeader title="Margin % by Month" badge={<Badge variant="green">Margin</Badge>} /><div style={{padding:'16px 20px'}}><CompareBarChart data={margData} formatter={v=>v+'%'} /></div></Card>
        <Card><CardHeader title="Invoice Count" badge={<Badge variant="amber">Volume</Badge>} /><div style={{padding:'16px 20px'}}><CompareBarChart data={invData} formatter={v=>fmt(v)} /></div></Card>
        <Card><CardHeader title="Avg Order Value" badge={<Badge variant="purple">AOV</Badge>} /><div style={{padding:'16px 20px'}}><CompareBarChart data={aovData} /></div></Card>
      </div>

      <div className={styles.g1} style={{ marginTop: 16 }}>
        <Card>
          <div style={{ padding: '16px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                  <button
                    onClick={() => setTrendTab('customer')}
                    style={{
                      padding: '4px 12px',
                      borderRadius: 20,
                      border: 'none',
                      background: trendTab === 'customer' ? 'var(--accent-light)' : 'transparent',
                      color: trendTab === 'customer' ? 'var(--accent)' : 'var(--text-muted)',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    Customer Trend
                  </button>
                  <button
                    onClick={() => setTrendTab('part')}
                    style={{
                      padding: '4px 12px',
                      borderRadius: 20,
                      border: 'none',
                      background: trendTab === 'part' ? 'var(--accent-light)' : 'transparent',
                      color: trendTab === 'part' ? 'var(--accent)' : 'var(--text-muted)',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    Part Trend
                  </button>
                </div>
                <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  {trendTab === 'customer'
                    ? 'Select a customer to visualize their individual revenue, margin, and order frequency trends.'
                    : 'Select a part to track monthly unit sales, revenue, and gross profit margin percentage.'}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)' }}>
                  {trendTab === 'customer' ? 'Track Customer:' : 'Track Part:'}
                </span>
                {trendTab === 'customer' ? (
                  <select
                    value={selectedCust}
                    onChange={e => setSelectedCust(e.target.value)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 8,
                      border: '1px solid var(--border)',
                      background: 'var(--surface)',
                      color: 'var(--text-primary)',
                      fontSize: 12,
                      fontWeight: 500,
                      outline: 'none',
                      cursor: 'pointer',
                      minWidth: 200,
                      maxWidth: 300,
                    }}
                  >
                    <option value="">-- Select Customer --</option>
                    {allCustomerNames.map(name => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                ) : (
                  <select
                    value={selectedPart}
                    onChange={e => setSelectedPart(e.target.value)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 8,
                      border: '1px solid var(--border)',
                      background: 'var(--surface)',
                      color: 'var(--text-primary)',
                      fontSize: 12,
                      fontWeight: 500,
                      outline: 'none',
                      cursor: 'pointer',
                      minWidth: 200,
                      maxWidth: 300,
                    }}
                  >
                    <option value="">-- Select Part --</option>
                    {allPartNames.map(name => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {trendTab === 'customer' ? (
              selectedCust && custTrendData ? (
                <>
                  <div className={styles.g2} style={{ marginBottom: 16 }}>
                    <Card>
                      <CardHeader title="Revenue Trend" subtitle={`${selectedCust}`} badge={<Badge variant="amber">Revenue</Badge>} />
                      <div style={{ padding: '16px 20px' }}>
                        <CompareBarChart data={custTrendData.map(d => ({ month: d.month, value: Math.round(d.rev) }))} />
                      </div>
                    </Card>
                    <Card>
                      <CardHeader title="Margin % Trend" subtitle={`${selectedCust}`} badge={<Badge variant="green">Profitability</Badge>} />
                      <div style={{ padding: '16px 20px' }}>
                        <CompareBarChart data={custTrendData.map(d => ({ month: d.month, value: d.mPct }))} formatter={v => v + '%'} />
                      </div>
                    </Card>
                  </div>

                  <div style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: 8 }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                      <thead>
                        <tr style={{ background: 'var(--surface)' }}>
                          {['Month', 'Revenue Bought', 'Margin Contribution', 'Margin %', 'Invoice Count', 'Avg Invoice Value'].map(h => (
                            <th key={h} style={{ padding: '9px 12px', textAlign: 'left', fontSize: 10, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-muted)', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {custTrendData.map(d => {
                          const avgInv = d.invs ? d.rev / d.invs : 0
                          return (
                            <tr key={d.month}>
                              <td style={{ padding: '9px 12px', borderBottom: '1px solid var(--surface-2)', fontWeight: 700 }}>{d.month}</td>
                              <td className="mono" style={{ padding: '9px 12px', borderBottom: '1px solid var(--surface-2)', color: 'var(--text-secondary)' }}>{omr(d.rev)}</td>
                              <td className="mono" style={{ padding: '9px 12px', borderBottom: '1px solid var(--surface-2)', color: 'var(--text-secondary)' }}>{omr(d.marg)}</td>
                              <td style={{ padding: '9px 12px', borderBottom: '1px solid var(--surface-2)' }}>
                                <span className={`badge badge-${d.mPct >= 50 ? 'green' : d.mPct >= 25 ? 'amber' : 'red'}`}>{pct(d.mPct)}</span>
                              </td>
                              <td className="mono" style={{ padding: '9px 12px', borderBottom: '1px solid var(--surface-2)', color: 'var(--text-secondary)' }}>{d.invs}</td>
                              <td className="mono" style={{ padding: '9px 12px', borderBottom: '1px solid var(--surface-2)', color: 'var(--text-secondary)' }}>{omr(avgInv)}</td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', background: 'var(--surface)', borderRadius: 12, border: '1px dashed var(--border)' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 8, opacity: 0.6, display: 'inline-block' }}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>No Customer Selected</div>
                  <div style={{ fontSize: 11, marginTop: 2 }}>Please select a customer from the dropdown above to view historical trend metrics.</div>
                </div>
              )
            ) : (
              selectedPart && partTrendData ? (
                <>
                  <div className={styles.g2} style={{ marginBottom: 16 }}>
                    <Card>
                      <CardHeader title="Revenue Trend" subtitle={`${selectedPart}`} badge={<Badge variant="amber">Revenue</Badge>} />
                      <div style={{ padding: '16px 20px' }}>
                        <CompareBarChart data={partTrendData.map(d => ({ month: d.month, value: Math.round(d.rev) }))} />
                      </div>
                    </Card>
                    <Card>
                      <CardHeader title="Margin % Trend" subtitle={`${selectedPart}`} badge={<Badge variant="green">Profitability</Badge>} />
                      <div style={{ padding: '16px 20px' }}>
                        <CompareBarChart data={partTrendData.map(d => ({ month: d.month, value: d.mPct }))} formatter={v => v + '%'} />
                      </div>
                    </Card>
                  </div>

                  <div style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: 8 }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                      <thead>
                        <tr style={{ background: 'var(--surface)' }}>
                          {['Month', 'Qty Sold', 'Revenue', 'Margin Contribution', 'Margin %'].map(h => (
                            <th key={h} style={{ padding: '9px 12px', textAlign: 'left', fontSize: 10, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-muted)', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {partTrendData.map(d => {
                          return (
                            <tr key={d.month}>
                              <td style={{ padding: '9px 12px', borderBottom: '1px solid var(--surface-2)', fontWeight: 700 }}>{d.month}</td>
                              <td className="mono" style={{ padding: '9px 12px', borderBottom: '1px solid var(--surface-2)', color: 'var(--text-secondary)' }}>{fmt(d.qty)}</td>
                              <td className="mono" style={{ padding: '9px 12px', borderBottom: '1px solid var(--surface-2)', color: 'var(--text-secondary)' }}>{omr(d.rev)}</td>
                              <td className="mono" style={{ padding: '9px 12px', borderBottom: '1px solid var(--surface-2)', color: 'var(--text-secondary)' }}>{omr(d.marg)}</td>
                              <td style={{ padding: '9px 12px', borderBottom: '1px solid var(--surface-2)' }}>
                                <span className={`badge badge-${d.mPct >= 50 ? 'green' : d.mPct >= 25 ? 'amber' : 'red'}`}>{pct(d.mPct)}</span>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', background: 'var(--surface)', borderRadius: 12, border: '1px dashed var(--border)' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 8, opacity: 0.6, display: 'inline-block' }}><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>No Part Selected</div>
                  <div style={{ fontSize: 11, marginTop: 2 }}>Please select a part from the dropdown above to view historical trend metrics.</div>
                </div>
              )
            )}
          </div>
        </Card>
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