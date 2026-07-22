import { useState, useEffect, useCallback } from 'react'
import AdminShell from '../../components/layout/AdminShell'
import { adminApi } from '../../api/admin'
import { logActivity } from '../../hooks/useActivityLog'

// ── Constants ──────────────────────────────────────────────────────────────
const PER_PAGE = 5

const AVATAR_COLORS = [
  { bg: 'var(--brand-100)', color: 'var(--brand-700)' },
  { bg: '#dcfce7',          color: 'var(--ok)' },
  { bg: '#fef3c7',          color: '#b45309' },
  { bg: '#ede9fe',          color: '#6d28d9' },
  { bg: '#cffafe',          color: '#0e7490' },
  { bg: '#ffe4e6',          color: '#be123c' },
]

const EMPTY = {
  branchId: '', tin: '', branchName: '', isHeadquarter: 'N',
  provinceName: '', districtName: '', sectorName: '', locationDescription: '',
  managerName: '', managerPhone: '', managerEmail: '',
  branchStatusCode: '', userId: '',
}

// ── Helpers ────────────────────────────────────────────────────────────────
function avatarColor(str) {
  let h = 0
  for (let i = 0; i < (str || '').length; i++) h = (h * 31 + str.charCodeAt(i)) & 0xffff
  return AVATAR_COLORS[h % AVATAR_COLORS.length]
}

function getPageNums(cur, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  if (cur <= 4)        return [1, 2, 3, 4, 5, '…', total]
  if (cur >= total - 3) return [1, '…', total-4, total-3, total-2, total-1, total]
  return [1, '…', cur-1, cur, cur+1, '…', total]
}

function useUsers() {
  const [users, setUsers] = useState([])
  useEffect(() => {
    adminApi.listUsers(1, 100).then(res => {
      const data = res?.data ?? res ?? []
      setUsers(Array.isArray(data) ? data : data?.data ?? [])
    }).catch(() => {})
  }, [])
  return users
}

// ── Icons ──────────────────────────────────────────────────────────────────
const IcoPlus    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
const IcoSearch  = () => <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3" strokeLinecap="round"/></svg>
const IcoBack    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
const IcoEdit    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
const IcoTrash   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
const IcoRefresh = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
const IcoMap     = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>

// ── Main component ─────────────────────────────────────────────────────────
export default function AdminBranches() {
  const allUsers = useUsers()
  const [branches, setBranches] = useState([])
  const [meta,     setMeta]     = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)
  const [tinFilter, setTinFilter] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [tab,      setTab]      = useState('List') // 'List' | 'Add' | 'Edit'

  const [form,     setForm]     = useState(EMPTY)
  const [saving,   setSaving]   = useState(false)
  const [saveErr,  setSaveErr]  = useState(null)
  const [saveOk,   setSaveOk]   = useState(false)

  const load = useCallback(async (page = 1) => {
    setLoading(true); setError(null)
    try {
      const res = await adminApi.listBranches(page, tinFilter, PER_PAGE)
      const data = res?.data ?? res ?? []
      setBranches(Array.isArray(data) ? data : data?.data ?? [])
      setMeta(res?.meta ?? null)
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }, [tinFilter])

  useEffect(() => { load(1) }, [load])

  // ── Actions ───────────────────────────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault(); setSaveErr(null); setSaving(true); setSaveOk(false)
    try {
      if (tab === 'Edit') {
        await adminApi.updateBranch(form.id, form)
        logActivity({ action: 'UPDATE_BRANCH', category: 'Branches', summary: `Updated branch "${form.branchName || form.branchId}"` })
      } else {
        await adminApi.createBranch(form)
        logActivity({ action: 'CREATE_BRANCH', category: 'Branches', summary: `Created branch "${form.branchName}" (TIN: ${form.tin})` })
      }
      setSaveOk(true); setForm(EMPTY); load(meta?.currentPage || 1)
      setTimeout(() => { setSaveOk(false); setTab('List') }, 2000)
    } catch (err) {
      setSaveErr(err.data?.errors?.[0]?.message || err.message)
    } finally { setSaving(false) }
  }

  async function handleDelete(id) {
    if (!window.confirm('Are you sure you want to delete this branch? This action cannot be undone.')) return
    try {
      await adminApi.deleteBranch(id)
      logActivity({ action: 'DELETE_BRANCH', category: 'Branches', summary: `Deleted branch ID: ${id}` })
      load(meta?.currentPage || 1)
    } catch (err) {
      alert(err.message)
    }
  }

  // ── Navigation ────────────────────────────────────────────────────────────
  function openAdd() { setTab('Add'); setForm(EMPTY); setSaveErr(null); setSaveOk(false) }
  function openEdit(b) {
    setForm({ ...b })
    setTab('Edit')
    setSaveErr(null)
    setSaveOk(false)
  }
  function backToList() { setTab('List') }

  // ── Derived ───────────────────────────────────────────────────────────────
  const hq    = branches.filter(b => b.isHeadquarter === 'Y').length
  const sub   = branches.filter(b => b.isHeadquarter !== 'Y').length
  const tins  = new Set(branches.map(b => b.tin)).size
  
  const totalPages  = meta ? (meta.lastPage ?? Math.ceil(meta.total / (meta.perPage || PER_PAGE))) : 1
  const currentPage = meta?.page ?? meta?.currentPage ?? 1
  const total       = meta?.total ?? branches.length

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <AdminShell>
      <div className="page">
        
        {/* ── Header ── */}
        <div className="page-head">
          <div>
            <div className="crumbs">
              <span>Admin</span><span>›</span>
              {tab === 'List' ? (
                <span>Branches</span>
              ) : (
                <>
                  <span style={{ cursor: 'pointer', color: 'var(--brand-600)' }} onClick={backToList}>Branches</span>
                  <span>›</span>
                  <span>{tab === 'Add' ? 'Add new branch' : 'Edit branch'}</span>
                </>
              )}
            </div>
            <h1>{tab === 'Add' ? 'Add new branch' : tab === 'Edit' ? 'Edit branch details' : 'Branch Management'}</h1>
          </div>
          <div className="page-head__actions">
            {tab === 'List' ? (
              <>
                <button className="icon-btn" title="Refresh" onClick={() => load(currentPage)}><IcoRefresh /></button>
                <button className="btn btn--primary" onClick={openAdd}>
                  <IcoPlus /> Add Branch
                </button>
              </>
            ) : (
              <button className="btn" onClick={backToList}>
                <IcoBack /> Back to list
              </button>
            )}
          </div>
        </div>

        {/* ── KPIs (List only) ── */}
        {tab === 'List' && (
          <div className="kpi-grid" style={{ marginBottom: 20 }}>
            {[
              { label: 'Total Branches', value: total, sub: 'registered', color: '' },
              { label: 'Headquarters',    value: hq,    sub: 'HQ locations', color: 'var(--ok)' },
              { label: 'Sub-Branches',    value: sub,   sub: 'outlets', color: 'var(--brand-600)' },
              { label: 'Unique TINs',     value: tins,  sub: 'taxpayers', color: '' },
            ].map(s => (
              <div key={s.label} className="kpi">
                <div className="kpi__label">{s.label}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
                  <span style={{ fontSize: 24, fontWeight: 700, color: s.color || 'var(--ink-900)' }}>{s.value}</span>
                  <span style={{ fontSize: 12, color: 'var(--ink-500)' }}>{s.sub}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════
            LIST VIEW
        ═══════════════════════════════════════════════════ */}
        {tab === 'List' && (
          <div className="card">
            <div className="filterbar">
              <div className="field" style={{ flex: 1 }}>
                <IcoSearch />
                <input
                  placeholder="Filter by TIN…"
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && setTinFilter(searchInput)}
                />
                {searchInput && searchInput !== tinFilter && (
                   <button className="btn btn--sm btn--primary" onClick={() => setTinFilter(searchInput)}>Go</button>
                )}
                {tinFilter && (
                   <button className="btn btn--sm" onClick={() => { setTinFilter(''); setSearchInput('') }}>✕ Clear</button>
                )}
              </div>
              <button className="btn btn--sm">Export CSV</button>
            </div>

            <div className="table-wrap">
              {error && <div className="settings-error" style={{ margin: 16 }}>{error}</div>}
              {loading ? (
                <div style={{ padding: 60, textAlign: 'center', color: 'var(--ink-400)' }}>
                  <div className="spinner" style={{ marginBottom: 12 }} />
                  <div>Loading branches…</div>
                </div>
              ) : branches.length === 0 ? (
                <div style={{ padding: 80, textAlign: 'center', color: 'var(--ink-500)' }}>
                  <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 6 }}>No branches found</div>
                  <div style={{ fontSize: 13 }}>Try adjusting your filters or add a new branch.</div>
                </div>
              ) : (
                <table className="data data--hover">
                  <thead>
                    <tr>
                      <th style={{ width: 240 }}>Branch</th>
                      <th style={{ width: 140 }}>TIN</th>
                      <th style={{ width: 100 }}>Type</th>
                      <th>Location</th>
                      <th style={{ width: 180 }}>Manager</th>
                      <th style={{ width: 120 }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {branches.map((b, i) => {
                      const { bg, color } = avatarColor(b.branchId || b.id)
                      return (
                        <tr key={b.id || i}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                              <div style={{ width: 34, height: 34, borderRadius: 10, background: bg, color, display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 12 }}>
                                {b.branchId}
                              </div>
                              <div>
                                <div style={{ fontWeight: 700, color: 'var(--ink-900)' }}>{b.branchName || 'Untitled Branch'}</div>
                                <div style={{ fontSize: 11.5, color: 'var(--ink-500)' }}>ID: {b.branchId}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 500 }}>{b.tin}</td>
                          <td>
                            {b.isHeadquarter === 'Y' 
                              ? <span className="chip chip--ok">HQ</span> 
                              : <span className="chip chip--brand">Branch</span>}
                          </td>
                          <td style={{ fontSize: 13, color: 'var(--ink-600)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                               <IcoMap />
                               <span>{[b.districtName, b.provinceName].filter(Boolean).join(', ') || '—'}</span>
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--ink-400)', marginTop: 2 }}>{b.locationDescription}</div>
                          </td>
                          <td>
                            <div style={{ fontSize: 13, fontWeight: 500 }}>{b.managerName || '—'}</div>
                            <div style={{ fontSize: 11, color: 'var(--ink-500)' }}>{b.managerPhone}</div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button className="icon-btn icon-btn--sm" title="Edit" onClick={() => openEdit(b)}><IcoEdit /></button>
                              <button className="icon-btn icon-btn--sm icon-btn--danger" title="Delete" onClick={() => handleDelete(b.id)}><IcoTrash /></button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination */}
            {!loading && totalPages > 1 && (
              <div className="pagination" style={{ padding: '12px 20px', borderTop: '1px solid var(--ink-100)' }}>
                <span style={{ fontSize: 13, color: 'var(--ink-500)' }}>
                  Showing {((currentPage-1)*(meta?.perPage||PER_PAGE))+1}–{Math.min(currentPage*(meta?.perPage||PER_PAGE), total)} of {total} branches
                </span>
                <div className="pages">
                  <button onClick={() => load(currentPage - 1)} disabled={currentPage <= 1}>‹</button>
                  {getPageNums(currentPage, totalPages).map((p, i) => (
                    typeof p === 'number'
                      ? <button key={i} className={p === currentPage ? 'is-active' : ''} onClick={() => load(p)}>{p}</button>
                      : <button key={i} disabled style={{ border: 'none', background: 'none' }}>{p}</button>
                  ))}
                  <button onClick={() => load(currentPage + 1)} disabled={currentPage >= totalPages}>›</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════
            ADD / EDIT FORM
        ═══════════════════════════════════════════════════ */}
        {(tab === 'Add' || tab === 'Edit') && (
          <div className="card" style={{ width: '100%' }}>
            <div className="card__head">
              <div>
                <h3 style={{ margin: 0 }}>{tab === 'Add' ? 'Register New Branch' : 'Modify Branch Information'}</h3>
                <p style={{ margin: '2px 0 0', fontSize: 12.5, color: 'var(--ink-500)' }}>Define branch identity, tax details, and location</p>
              </div>
              {saveOk && <span className="chip chip--ok">Changes saved successfully ✓</span>}
            </div>
            <form onSubmit={handleSubmit}>
              <div className="card__body" style={{ padding: '24px 32px' }}>
                {saveErr && <div className="settings-error" style={{ marginBottom: 24 }}>{saveErr}</div>}
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px 32px' }}>
                  
                  <div className="form-group">
                    <label className="form-label">Branch ID <span style={{ color: 'var(--err)' }}>*</span></label>
                    <input className="form-input input--mono" required placeholder="00" maxLength={2} disabled={tab === 'Edit'}
                      value={form.branchId} onChange={e => setForm({...form, branchId: e.target.value})} />
                    <span className="form-hint">2 characters (e.g. 00, 01, 02)</span>
                  </div>

                  <div className="form-group">
                    <label className="form-label">TIN <span style={{ color: 'var(--err)' }}>*</span></label>
                    <input className="form-input input--mono" required placeholder="999909100" disabled={tab === 'Edit'}
                      value={form.tin} onChange={e => setForm({...form, tin: e.target.value})} />
                    <span className="form-hint">Taxpayer Identification Number</span>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Branch Name</label>
                    <input className="form-input" placeholder="Main Store / Downtown Branch"
                      value={form.branchName} onChange={e => setForm({...form, branchName: e.target.value})} />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Headquarter?</label>
                    <select className="form-input" value={form.isHeadquarter} onChange={e => setForm({...form, isHeadquarter: e.target.value})}>
                      <option value="Y">Yes (HQ)</option>
                      <option value="N">No (Sub-branch)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Device User</label>
                    <select className="form-input" value={form.userId} onChange={e => setForm({...form, userId: e.target.value})}>
                      <option value="">— Unlinked —</option>
                      {allUsers.map(u => (
                        <option key={u.id} value={u.id}>{u.fullName || u.email} ({u.tin})</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Status Code</label>
                    <input className="form-input" placeholder="Active"
                      value={form.branchStatusCode} onChange={e => setForm({...form, branchStatusCode: e.target.value})} />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Province</label>
                    <input className="form-input" placeholder="Kigali City"
                      value={form.provinceName} onChange={e => setForm({...form, provinceName: e.target.value})} />
                  </div>

                  <div className="form-group">
                    <label className="form-label">District</label>
                    <input className="form-input" placeholder="Gasabo"
                      value={form.districtName} onChange={e => setForm({...form, districtName: e.target.value})} />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Sector</label>
                    <input className="form-input" placeholder="Remera"
                      value={form.sectorName} onChange={e => setForm({...form, sectorName: e.target.value})} />
                  </div>

                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="form-label">Location Description</label>
                    <input className="form-input" placeholder="KG 100 St, Building B, Room 4"
                      value={form.locationDescription} onChange={e => setForm({...form, locationDescription: e.target.value})} />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Manager Name</label>
                    <input className="form-input" placeholder="John Doe"
                      value={form.managerName} onChange={e => setForm({...form, managerName: e.target.value})} />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Manager Phone</label>
                    <input className="form-input" placeholder="0788XXXXXX"
                      value={form.managerPhone} onChange={e => setForm({...form, managerPhone: e.target.value})} />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Manager Email</label>
                    <input className="form-input" type="email" placeholder="manager@email.com"
                      value={form.managerEmail} onChange={e => setForm({...form, managerEmail: e.target.value})} />
                  </div>

                </div>
              </div>
              
              <div className="card__foot" style={{ padding: '20px 32px', display: 'flex', gap: 12, background: 'var(--ink-50)' }}>
                <button type="submit" className="btn btn--primary btn--lg" disabled={saving}>
                  {saving ? 'Processing…' : tab === 'Add' ? 'Register Branch' : 'Update Branch'}
                </button>
                <button type="button" className="btn btn--lg" onClick={backToList}>Cancel</button>
                {tab === 'Add' && (
                  <button type="button" className="btn btn--lg btn--ghost" style={{ marginLeft: 'auto' }} onClick={() => setForm(EMPTY)}>Reset</button>
                )}
              </div>
            </form>
          </div>
        )}

      </div>
    </AdminShell>
  )
}
