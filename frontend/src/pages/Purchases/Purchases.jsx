import { useState, useEffect, useCallback } from 'react'
import AppShell from '../../components/layout/AppShell'
import { operatorApi } from '../../api/operator'
import { logActivity } from '../../hooks/useActivityLog'
import { useApp } from '../../context/AppContext'

const PER_PAGE = 10
const PAYMENT_TYPES = [
  { v: '01', l: 'Cash' }, { v: '02', l: 'Credit' }, { v: '03', l: 'Cash / Credit' },
  { v: '04', l: 'Bank Cheque' }, { v: '05', l: 'Debit / Credit Card' },
  { v: '06', l: 'Mobile Money' }, { v: '07', l: 'Other' },
]

function statusInfo(p) {
  if (p.isConfirmed) return { label: 'Confirmed', cls: 'chip--ok' }
  if (p.isRejected)  return { label: 'Cancelled', cls: 'chip--err' }
  return                    { label: 'Pending',   cls: 'chip--warn', pending: true }
}

export default function Purchases() {
  const [items,      setItems]      = useState([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(null)
  const [page,       setPage]       = useState(1)
  const [total,      setTotal]      = useState(0)
  const [lastPage,   setLastPage]   = useState(1)

  // KPIs
  const [stats, setStats] = useState({ total: 0, pending: 0, confirmed: 0 })

  // Confirmation state
  const [activePurchase, setActivePurchase] = useState(null)
  const [confirmItems,    setConfirmItems]    = useState([])
  const [saving,          setSaving]          = useState(false)
  const [confirmErr,      setConfirmErr]      = useState(null)

  const load = useCallback(async (p = page) => {
    setLoading(true); setError(null)
    try {
      const res = await operatorApi.listPurchases(p, PER_PAGE)
      const data = res?.purchases?.data || res?.data || []
      setItems(data)
      setTotal(res?.purchases?.meta?.total || data.length)
      setLastPage(res?.purchases?.meta?.lastPage || 1)
      
      // Stats
      const confirmed = data.filter(x => x.isConfirmed).length
      const pending   = data.filter(x => !x.isConfirmed && !x.isRejected).length
      setStats({ total: data.length, pending, confirmed })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => { load() }, [load])

  function openConfirm(p) {
    setActivePurchase(p)
    const items = p.items?.data ?? []
    setConfirmItems(items.map(item => ({
      sequenceNo:            item.sequenceNo,
      name:                  item.name || '',
      insuranceApplicableYn: 'N',
    })))
    setConfirmErr(null)
  }

  async function handleConfirm(e) {
    e.preventDefault(); setConfirmErr(null); setSaving(true)
    try {
      await operatorApi.savePurchase({
        purchaseId: activePurchase.id,
        isConfirm:  true,
        items: confirmItems.map(item => ({
          sequenceNo:            item.sequenceNo,
          insuranceApplicableYn: item.insuranceApplicableYn,
        })),
      })
      logActivity({ action: 'CONFIRM_PURCHASE', category: 'Procurement', summary: `Confirmed purchase from ${activePurchase.supplierName}` })
      setActivePurchase(null); load()
    } catch (err) {
      setConfirmErr(err.data?.errors?.[0]?.message || err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleReject(p) {
    if (!window.confirm('Are you sure you want to REJECT this purchase? This will notify the supplier.')) return
    try {
      await operatorApi.savePurchase({ purchaseId: p.id, isConfirm: false })
      logActivity({ action: 'REJECT_PURCHASE', category: 'Procurement', summary: `Rejected purchase from ${p.supplierName}` })
      load()
    } catch (err) {
      alert(err.message)
    }
  }

  return (
    <AppShell>
      <div className="page">
        <div className="page-head">
          <div>
            <div className="crumbs"><span>Workspace</span><span>›</span><span>Procurement</span></div>
            <h1>Local Purchases</h1>
          </div>
          <div className="page-head__actions">
            <button className="btn btn--primary" onClick={() => load(1)} disabled={loading}>
              <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {loading ? 'Syncing...' : 'Sync from RRA'}
            </button>
          </div>
        </div>

        <div className="kpi-grid">
          <div className="kpi">
            <div className="kpi__label">Purchases Sync</div>
            <div className="kpi__value">{stats.total}</div>
            <span className="kpi__sub">Total invoices found</span>
          </div>
          <div className="kpi">
            <div className="kpi__label">Pending My Confirmation</div>
            <div className="kpi__value">{stats.pending}</div>
            <span className="kpi__delta kpi__delta--warn">Needs action</span>
          </div>
          <div className="kpi">
            <div className="kpi__label">Confirmed</div>
            <div className="kpi__value">{stats.confirmed}</div>
            <span className="kpi__delta kpi__delta--up">Successfully added</span>
          </div>
        </div>

        <div className="card">
          <div className="card__head">
            <h3>Supply Chain Invoices</h3>
          </div>
          <div className="table-wrap">
            {loading ? (
              <div style={{ padding: 60, textAlign: 'center' }}><div className="spinner-sm" style={{ margin: '0 auto 10px' }} />Checking for new invoices...</div>
            ) : items.length === 0 ? (
              <div style={{ padding: 80, textAlign: 'center', color: 'var(--ink-400)' }}>
                 <div style={{ fontWeight: 600, color: 'var(--ink-600)' }}>No Purchase Invoices</div>
                 <div style={{ fontSize: 13 }}>Sync with RRA to pull invoices issued by your suppliers.</div>
              </div>
            ) : (
              <table className="data">
                <thead>
                  <tr>
                    <th>Supplier Name</th>
                    <th>Supplier TIN</th>
                    <th>Invoice No</th>
                    <th className="num">Total Amount</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {items.map((p, idx) => {
                    const status = statusInfo(p)
                    return (
                      <tr key={p.id || idx}>
                        <td style={{ fontWeight: 600 }}>{p.supplierName || '—'}</td>
                        <td className="mono">{p.supplierTin || '—'}</td>
                        <td className="mono">{p.supplierInvoiceNo || '—'}</td>
                        <td className="num" style={{ fontWeight: 700 }}>{Number(p.totalAmount || 0).toLocaleString()} RWF</td>
                        <td style={{ color: 'var(--ink-500)', fontSize: 13 }}>{p.saleDate ? new Date(p.saleDate).toLocaleDateString() : '—'}</td>
                        <td><span className={`chip ${status.cls}`}>{status.label}</span></td>
                        <td>
                          {status.pending && (
                            <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                              <button className="btn btn--sm btn--primary" onClick={() => openConfirm(p)}>Confirm</button>
                              <button className="btn btn--sm btn--ghost btn--danger" onClick={() => handleReject(p)}>Reject</button>
                            </div>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
          <div className="card__foot" style={{ display: 'flex', justifyContent: 'center', padding: 12, borderTop: '1px solid var(--ink-100)' }}>
             <div className="pagination">
                <button className="btn btn--sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</button>
                <span style={{ fontSize: 13, color: 'var(--ink-500)' }}>Page <b>{page}</b> of {lastPage}</span>
                <button className="btn btn--sm" disabled={page >= lastPage} onClick={() => setPage(p => p + 1)}>Next</button>
             </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {activePurchase && (
        <div className="modal-backdrop" onClick={() => setActivePurchase(null)}>
          <div className="modal" style={{ maxWidth: 700, borderRadius: 20 }} onClick={e => e.stopPropagation()}>
            <div className="modal__head" style={{ padding: '24px 32px', background: 'var(--ink-900)', color: '#fff' }}>
              <div>
                <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '.1em', opacity: 0.7, marginBottom: 4 }}>Purchase Confirmation</div>
                <h3 style={{ margin: 0 }}>Invoice #{activePurchase.supplierInvoiceNo}</h3>
              </div>
              <button className="modal__close" onClick={() => setActivePurchase(null)} style={{ color: '#fff' }}>
                 <svg viewBox="0 0 20 20" fill="currentColor" width="20" height="20"><path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"/></svg>
              </button>
            </div>
            <div className="modal__body" style={{ padding: 32 }}>
               <div style={{ background: 'var(--ink-50)', border: '1px solid var(--ink-200)', borderRadius: 12, padding: 20, marginBottom: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 11, color: 'var(--ink-400)', textTransform: 'uppercase', display: 'block', marginBottom: 2 }}>Supplier</label>
                    <div style={{ fontWeight: 700 }}>{activePurchase.supplierName}</div>
                    <div style={{ fontSize: 12, color: 'var(--ink-500)' }}>TIN: {activePurchase.supplierTin}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <label style={{ fontSize: 11, color: 'var(--ink-400)', textTransform: 'uppercase', display: 'block', marginBottom: 2 }}>Amount Payable</label>
                    <div style={{ fontWeight: 800, fontSize: 20, color: 'var(--brand-700)' }}>{Number(activePurchase.totalAmount || 0).toLocaleString()} RWF</div>
                  </div>
               </div>

               {confirmErr && <div className="settings-error" style={{ marginBottom: 20 }}>{confirmErr}</div>}

               <form onSubmit={handleConfirm}>
                  <div style={{ marginBottom: 24 }}>
                    <h4 style={{ fontSize: 13, marginBottom: 12, color: 'var(--ink-800)' }}>Map Items & Insurance Status</h4>
                    <div className="table-wrap" style={{ border: '1px solid var(--ink-200)', borderRadius: 10 }}>
                      <table className="data" style={{ fontSize: 13 }}>
                        <thead>
                          <tr>
                            <th>Seq</th>
                            <th>Item Name</th>
                            <th style={{ width: 160 }}>Insurance Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {confirmItems.map((item, idx) => (
                            <tr key={idx}>
                              <td className="mono">{item.sequenceNo}</td>
                              <td style={{ fontWeight: 600 }}>{item.name}</td>
                              <td>
                                <select className="form-input form-input--sm" value={item.insuranceApplicableYn} 
                                  onChange={e => setConfirmItems(list => list.map((x, j) => j === idx ? { ...x, insuranceApplicableYn: e.target.value } : x))}>
                                  <option value="N">No Insurance</option>
                                  <option value="Y">Insurance Applied</option>
                                </select>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', borderTop: '1px solid var(--ink-100)', paddingTop: 24 }}>
                    <button type="button" className="btn btn--lg btn--ghost" onClick={() => setActivePurchase(null)}>Back</button>
                    <button type="button" className="btn btn--lg btn--danger" onClick={() => handleReject(activePurchase)}>Reject Purchase</button>
                    <button type="submit" className="btn btn--lg btn--primary" style={{ padding: '0 40px' }} disabled={saving}>
                       {saving ? 'Confirming...' : 'Confirm & Accept Stock'}
                    </button>
                  </div>
               </form>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  )
}
