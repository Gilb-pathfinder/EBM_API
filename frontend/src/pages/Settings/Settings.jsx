import { useState, useEffect } from 'react'
import AppShell from '../../components/layout/AppShell'
import { configApi } from '../../api/config'
import { authApi } from '../../api/auth'
import { operatorApi } from '../../api/operator'
import { useApp } from '../../context/AppContext'
import { logActivity } from '../../hooks/useActivityLog'

const PROFILE_FIELDS = [
  { label: 'Full Name',    name: 'fullName',     type: 'text' },
  { label: 'Phone Number', name: 'phoneNumber',  type: 'text' },
  { label: 'Address',      name: 'address',      type: 'text' },
  { label: 'Image URL',    name: 'imageLink',    type: 'text' },
]

const TAX_TYPE_INFO = [
  {
    code: 'A', name: 'Exempt', defaultRate: 0, divider: 1,
    description: 'VAT-exempt goods. No VAT charged, no VAT input credit. Applied to items RRA designates as basic necessities.',
    examples: ['Medicines', 'Basic food (rice, maize)', 'Fresh milk', 'Financial services', 'Education'],
  },
  {
    code: 'B', name: 'Standard VAT', defaultRate: 18, divider: 1.18,
    description: 'Standard 18% VAT rate. The divider (1.18) extracts the tax portion from a VAT-inclusive price. Applies to most goods and commercial services.',
    examples: ['Beverages', 'Electronics', 'Clothing', 'Restaurant services', 'Manufactured goods'],
  },
  {
    code: 'C', name: 'Zero-rated', defaultRate: 0, divider: 1,
    description: 'Zero-rated but VAT-registered. Rate is 0% however the business can still claim VAT input credits on purchases. Different from Exempt (A).',
    examples: ['Exports', 'Some agricultural inputs', 'International transport'],
  },
  {
    code: 'D', name: 'Non-VAT / Export', defaultRate: 0, divider: 1,
    description: 'Used for non-VAT taxpayers or goods subject to export duty. No VAT applied. EBM tracks these separately from C-type.',
    examples: ['Non-VAT registered sales', 'Specific export goods', 'Special duty items'],
  },
]

const API_PORT = import.meta.env.VITE_API_PORT || '8000'

export default function Settings() {
  const { rawUser, refreshUser } = useApp()

  const [initStatus, setInitStatus] = useState('idle') // idle | loading | done | error
  const [initError,  setInitError]  = useState('')

  const [infoRefreshing, setInfoRefreshing] = useState(false)

  const [profileForm,    setProfileForm]    = useState({})
  const [profileSaving,  setProfileSaving]  = useState(false)
  const [profileErr,     setProfileErr]     = useState(null)
  const [profileSaved,   setProfileSaved]   = useState(false)

  const [mrcForm,   setMrcForm]   = useState({ mrc: '', sdcId: '' })
  const [mrcSaving, setMrcSaving] = useState(false)
  const [mrcErr,    setMrcErr]    = useState(null)
  const [mrcSaved,  setMrcSaved]  = useState(false)

  // Seed profile form once rawUser loads
  useEffect(() => {
    if (rawUser && Object.keys(profileForm).length === 0) {
      setProfileForm({
        fullName:    rawUser.fullName    || '',
        phoneNumber: rawUser.phoneNumber || '',
        address:     rawUser.address     || '',
        imageLink:   rawUser.imageLink   || '',
      })
    }
  }, [rawUser])

  async function handleRefreshInfo() {
    setInfoRefreshing(true)
    try { await refreshUser() } catch { /* ignore */ }
    finally { setInfoRefreshing(false) }
  }

  async function handleInit() {
    setInitStatus('loading')
    setInitError('')
    try {
      await authApi.initDevice()
      await refreshUser()
      setInitStatus('done')
    } catch (err) {
      setInitError(err.message || 'Initialization failed.')
      setInitStatus('error')
    }
  }

  async function handleProfileSave(e) {
    e.preventDefault()
    setProfileErr(null); setProfileSaved(false); setProfileSaving(true)
    try {
      const payload = {}
      PROFILE_FIELDS.forEach(({ name }) => {
        if (profileForm[name] !== undefined && profileForm[name] !== '') payload[name] = profileForm[name]
      })
      await authApi.editUser(payload)
      await refreshUser()
      setProfileSaved(true)
      setTimeout(() => setProfileSaved(false), 3000)
    } catch (err) {
      setProfileErr(err.data?.errors?.[0]?.message || err.message)
    } finally { setProfileSaving(false) }
  }

  async function handleMrcSave(e) {
    e.preventDefault()
    setMrcErr(null); setMrcSaved(false); setMrcSaving(true)
    try {
      await authApi.updateMrc({ mrc: mrcForm.mrc, sdcId: mrcForm.sdcId })
      await refreshUser()
      setMrcSaved(true)
      setMrcForm({ mrc: '', sdcId: '' })
      setTimeout(() => setMrcSaved(false), 3000)
    } catch (err) {
      setMrcErr(err.data?.errors?.[0]?.message || err.message)
    } finally { setMrcSaving(false) }
  }

  const [syncStatus, setSyncStatus] = useState('idle')
  const [syncResult, setSyncResult] = useState(null)
  const [syncErr,    setSyncErr]    = useState(null)

  async function handleSyncCodes() {
    setSyncStatus('loading'); setSyncErr(null); setSyncResult(null)
    try {
      const count = await operatorApi.syncClassificationCodes()
      setSyncResult(count)
      setSyncStatus('done')
      logActivity({ action: 'SYNC_CLASSIFICATIONS', category: 'Settings', summary: `Classification codes synced (${count} codes updated)` })
    } catch (err) {
      setSyncErr(err.message || 'Sync failed')
      setSyncStatus('error')
    }
  }

  const [codesId,      setCodesId]      = useState('')
  const [codesData,    setCodesData]    = useState(null)
  const [codesLoading, setCodesLoading] = useState(false)
  const [codesErr,     setCodesErr]     = useState(null)

  async function loadBranchCodes(e) {
    e.preventDefault()
    if (!codesId.trim()) return
    setCodesLoading(true); setCodesErr(null); setCodesData(null)
    try {
      const data = await operatorApi.branchCodes(codesId.trim())
      setCodesData(data)
    } catch (err) {
      setCodesErr(err.message)
    } finally { setCodesLoading(false) }
  }

  const [taxes,   setTaxes]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    configApi.list()
      .then(data => setTaxes(Array.isArray(data) ? data : data?.data ?? []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <AppShell title="Settings">
      <div className="page">
        <div className="page-head">
          <div>
            <div className="crumbs"><span>Home</span><span>›</span><span>Settings</span></div>
            <h1>Settings</h1>
          </div>
        </div>

        <div style={{ display: 'grid', gap: 20, maxWidth: 860 }}>

          {/* EBM Connection */}
          <div className="card">
            <div className="card__head">
              <h3>EBM Connection</h3>
              <span className="chip chip--ok">Connected</span>
            </div>
            <div className="card__body">
              <table className="settings-table">
                <tbody>
                  <SettingRow label="API Server Port"    value={API_PORT} mono />
                  <SettingRow label="EBM API Version"    value="2.1" />
                  <SettingRow label="Specification"      value="VSDC v1.0.5 (RRA EBM 2.1)" />
                </tbody>
              </table>
            </div>
          </div>

          {/* Device Info */}
          {rawUser && (
            <div className="card">
              <div className="card__head">
                <h3>Device Info</h3>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  {rawUser.sdcId
                    ? <span className="chip chip--ok">Initialized</span>
                    : <span className="chip chip--warn">Not Initialized</span>
                  }
                  {rawUser.isTrainingMode && <span className="chip chip--warn">Training Mode</span>}
                  <button className="btn btn--sm" onClick={handleRefreshInfo} disabled={infoRefreshing} style={{ marginLeft: 4 }}>
                    {infoRefreshing ? 'Refreshing…' : 'Refresh'}
                  </button>
                </div>
              </div>
              <div className="card__body">
                <table className="settings-table">
                  <tbody>
                    <SettingRow label="Taxpayer Name" value={rawUser.taxPayerName} />
                    <SettingRow label="TIN"           value={rawUser.tin}            mono />
                    <SettingRow label="Serial No"     value={rawUser.serialNo}       mono />
                    <SettingRow label="SDC ID"        value={rawUser.sdcId || '—'}   mono />
                    <SettingRow label="MRC"           value={rawUser.mrc  || '—'}    mono />
                    <SettingRow label="Branch"        value={rawUser.branchName || rawUser.branchId || '—'} />
                    <SettingRow label="Training Mode" value={rawUser.isTrainingMode ? 'Active' : 'Off'} />
                  </tbody>
                </table>

                {!rawUser.sdcId && (
                  <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--ink-200)' }}>
                    {initError && (
                      <div style={{ fontSize: 13, color: '#dc2626', marginBottom: 10 }}>{initError}</div>
                    )}
                    <button
                      className="btn btn--primary btn--sm"
                      onClick={handleInit}
                      disabled={initStatus === 'loading'}
                    >
                      {initStatus === 'loading' ? (
                        <>
                          <svg className="spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
                            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round"/>
                          </svg>
                          Initializing…
                        </>
                      ) : 'Initialize Device'}
                    </button>
                    <p style={{ marginTop: 8, fontSize: 12, color: 'var(--ink-500)' }}>
                      Registers this device with the RRA EBM server and syncs item classifications.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Edit Profile */}
          {rawUser && (
            <div className="card">
              <div className="card__head">
                <h3>Edit Profile</h3>
              </div>
              <div className="card__body">
                {profileErr && <div className="settings-error" style={{ marginBottom: 14 }}>{profileErr}</div>}
                {profileSaved && (
                  <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '9px 13px', marginBottom: 14, fontSize: 13, color: '#15803d' }}>
                    ✓ Profile updated successfully
                  </div>
                )}
                <form onSubmit={handleProfileSave}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
                    {PROFILE_FIELDS.map(({ label, name, type }) => (
                      <div className="form-group" key={name}>
                        <label className="form-label" htmlFor={`pf-${name}`}>{label}</label>
                        <input
                          id={`pf-${name}`}
                          type={type}
                          className="form-input"
                          value={profileForm[name] ?? ''}
                          onChange={e => setProfileForm(f => ({ ...f, [name]: e.target.value }))}
                          placeholder={name === 'imageLink' ? 'https://…' : ''}
                        />
                      </div>
                    ))}
                  </div>
                  <button type="submit" className="btn btn--primary btn--sm" style={{ marginTop: 4 }} disabled={profileSaving}>
                    {profileSaving ? 'Saving…' : 'Save Profile'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* EBM Credentials */}
          {rawUser && (
            <div className="card">
              <div className="card__head">
                <h3>EBM Credentials</h3>
              </div>
              <div className="card__body">
                <p style={{ margin: '0 0 14px', fontSize: 13, color: 'var(--ink-500)', lineHeight: 1.5 }}>
                  Update the MRC and SDC ID used to communicate with the RRA EBM server. Only change these if you have received new credentials from the device or sandbox.
                </p>
                {mrcErr && <div className="settings-error" style={{ marginBottom: 14 }}>{mrcErr}</div>}
                {mrcSaved && (
                  <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '9px 13px', marginBottom: 14, fontSize: 13, color: '#15803d' }}>
                    ✓ EBM credentials updated
                  </div>
                )}
                <form onSubmit={handleMrcSave}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
                    <div className="form-group">
                      <label className="form-label" htmlFor="mrc-mrc">New MRC</label>
                      <input
                        id="mrc-mrc"
                        className="form-input input--mono"
                        placeholder={rawUser.mrc ? `Current: ${rawUser.mrc}` : 'New MRC value'}
                        value={mrcForm.mrc}
                        onChange={e => setMrcForm(f => ({ ...f, mrc: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="mrc-sdcid">New SDC ID</label>
                      <input
                        id="mrc-sdcid"
                        className="form-input input--mono"
                        placeholder={rawUser.sdcId ? `Current: ${rawUser.sdcId}` : 'New SDC ID'}
                        value={mrcForm.sdcId}
                        onChange={e => setMrcForm(f => ({ ...f, sdcId: e.target.value }))}
                        required
                      />
                    </div>
                  </div>
                  <button type="submit" className="btn btn--primary btn--sm" style={{ marginTop: 4 }} disabled={mrcSaving}>
                    {mrcSaving ? 'Updating…' : 'Update Credentials'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Classification Codes Sync */}
          <div className="card">
            <div className="card__head">
              <h3>Classification Codes</h3>
            </div>
            <div className="card__body">
              <p style={{ margin: '0 0 14px', fontSize: 13, color: 'var(--ink-500)', lineHeight: 1.5 }}>
                Pull the latest item classification codes (HS codes) from the RRA EBM server and update the local database. Run this before creating new items if you suspect codes are outdated.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button
                  className="btn btn--primary btn--sm"
                  onClick={handleSyncCodes}
                  disabled={syncStatus === 'loading'}
                >
                  {syncStatus === 'loading' ? 'Syncing…' : 'Sync Codes'}
                </button>
                {syncStatus === 'done' && (
                  <span className="chip chip--ok">
                    ✓ {syncResult > 0 ? `${syncResult} codes updated` : 'Already up to date'}
                  </span>
                )}
                {syncStatus === 'error' && (
                  <span style={{ fontSize: 13, color: 'var(--err)' }}>{syncErr}</span>
                )}
              </div>
            </div>
          </div>

          {/* Branch Reference Data */}
          <div className="card">
            <div className="card__head">
              <h3>Branch Reference Data</h3>
            </div>
            <div className="card__body">
              <p style={{ margin: '0 0 14px', fontSize: 13, color: 'var(--ink-500)', lineHeight: 1.5 }}>
                Load tax types, item classifications, and payment types registered for a branch from the EBM server.
              </p>
              <form onSubmit={loadBranchCodes} style={{ display: 'flex', gap: 8, alignItems: 'flex-end', marginBottom: 14 }}>
                <div className="form-group" style={{ margin: 0, flex: '0 0 180px' }}>
                  <label className="form-label" htmlFor="codes-branch">Branch ID</label>
                  <input
                    id="codes-branch"
                    className="form-input form-input--sm input--mono"
                    placeholder={rawUser?.branchId || '00'}
                    value={codesId}
                    onChange={e => setCodesId(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn btn--primary btn--sm" disabled={codesLoading}>
                  {codesLoading ? 'Loading…' : 'Load Codes'}
                </button>
              </form>
              {codesErr && <div className="settings-error" style={{ marginBottom: 12 }}>{codesErr}</div>}
              {codesData && (
                <div style={{ display: 'grid', gap: 12 }}>
                  {Object.entries(codesData).map(([key, val]) => {
                    const items = Array.isArray(val) ? val : null
                    return (
                      <div key={key}>
                        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--ink-400)', marginBottom: 6 }}>
                          {key} {items && <span style={{ color: 'var(--ink-300)', fontWeight: 400 }}>({items.length})</span>}
                        </div>
                        {items ? (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                            {items.slice(0, 20).map((item, i) => (
                              <span key={i} className="chip chip--plain" style={{ fontSize: 11, fontFamily: 'var(--font-mono)' }}>
                                {item.cd || item.code || item.id || JSON.stringify(item)}
                                {(item.name || item.cdNm) && <span style={{ color: 'var(--ink-500)', marginLeft: 4 }}>{item.name || item.cdNm}</span>}
                              </span>
                            ))}
                            {items.length > 20 && <span className="chip chip--plain" style={{ fontSize: 11 }}>+{items.length - 20} more</span>}
                          </div>
                        ) : (
                          <code style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--ink-600)' }}>{JSON.stringify(val)}</code>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Tax Type Reference */}
          <div className="card">
            <div className="card__head">
              <h3>VAT & Tax Types</h3>
              <span className="chip chip--plain" style={{ fontSize: 12 }}>Read-only · Set by RRA</span>
            </div>
            <div className="card__body">
              <p style={{ margin: '0 0 16px', fontSize: 13, color: 'var(--ink-500)', lineHeight: 1.6 }}>
                These tax types are defined by RRA and apply to every item you register and every receipt you issue.
                You must assign the correct type to each item — the classification code suggests the right type automatically.
              </p>
              {error && <div className="settings-error" style={{ marginBottom: 12 }}>{error}</div>}
              {loading ? (
                <div style={{ color: 'var(--ink-500)', padding: '8px 0' }}>Loading…</div>
              ) : (
                <div style={{ display: 'grid', gap: 10 }}>
                  {TAX_TYPE_INFO.map(info => {
                    const live = taxes.find(t => (t.taxType || t.type) === info.code)
                    const rate = live ? live.rate : info.defaultRate
                    const active = live ? live.isActive : true
                    return (
                      <div key={info.code} style={{
                        display: 'flex', gap: 14, alignItems: 'flex-start',
                        padding: '12px 14px', borderRadius: 10,
                        border: `1px solid ${active ? 'var(--ink-200)' : 'var(--ink-100)'}`,
                        background: active ? 'var(--surface)' : 'var(--ink-50)',
                        opacity: active ? 1 : 0.55,
                      }}>
                        <span className={`tax-chip tax-${info.code}`} style={{ flexShrink: 0, marginTop: 2 }}>
                          {info.code}
                        </span>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                            <span style={{ fontWeight: 600, fontSize: 13.5 }}>{info.name}</span>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--brand-700)', fontWeight: 700 }}>
                              {rate}%
                            </span>
                            {!active && <span className="chip chip--err" style={{ fontSize: 11 }}>Inactive</span>}
                          </div>
                          <div style={{ fontSize: 12.5, color: 'var(--ink-500)', lineHeight: 1.5 }}>
                            {info.description}
                          </div>
                          <div style={{ marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                            {info.examples.map(ex => (
                              <span key={ex} style={{ fontSize: 11, background: 'var(--ink-100)', borderRadius: 4, padding: '2px 6px', color: 'var(--ink-600)' }}>
                                {ex}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div style={{ fontSize: 11, color: 'var(--ink-400)', marginBottom: 2 }}>Divider</div>
                          <code style={{ fontSize: 12, fontFamily: 'var(--font-mono)' }}>
                            {live?.divider ?? info.divider}
                          </code>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
              <div style={{ marginTop: 14, padding: '10px 14px', borderRadius: 8, background: 'var(--ink-50)', border: '1px solid var(--ink-200)', fontSize: 12.5, color: 'var(--ink-500)' }}>
                <strong style={{ color: 'var(--ink-700)' }}>Note on IPL & TL:</strong> Insurance Premium Levy (IPL) and Tourism Levy (TL) are additional levies on top of VAT.
                They are set per item using <code style={{ fontSize: 11 }}>iplCatCd</code> and <code style={{ fontSize: 11 }}>tlCatCd</code> fields when registering an item.
                Contact your admin to update tax rates if RRA issues a rate change.
              </div>
            </div>
          </div>

        </div>
      </div>
    </AppShell>
  )
}

function SettingRow({ label, value, mono }) {
  return (
    <tr>
      <td style={{ padding: '8px 0', color: 'var(--ink-500)', fontSize: 13, width: 180, verticalAlign: 'top' }}>{label}</td>
      <td style={{ padding: '8px 0 8px 16px', fontWeight: 500 }}>
        {mono
          ? <code style={{ fontFamily: 'var(--font-mono)', fontSize: 12.5, background: 'var(--ink-100)', padding: '2px 6px', borderRadius: 5 }}>{value || '—'}</code>
          : <span>{value || '—'}</span>
        }
      </td>
    </tr>
  )
}
