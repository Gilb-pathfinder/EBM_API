import { useState, useEffect } from 'react'
import AdminShell from '../../components/layout/AdminShell'
import { logActivity } from '../../hooks/useActivityLog'

/* ── helpers ── */
function Section({ title, subtitle, children }) {
  return (
    <div className="card" style={{ marginBottom: 20 }}>
      <div className="card__head">
        <div>
          <h3 style={{ margin: 0 }}>{title}</h3>
          {subtitle && <p style={{ margin: '2px 0 0', fontSize: 12.5, color: 'var(--ink-500)' }}>{subtitle}</p>}
        </div>
      </div>
      <div className="card__body">{children}</div>
    </div>
  )
}

function SettingRow({ label, sub, children }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '13px 0', borderBottom: '1px solid var(--ink-100)',
    }}>
      <div>
        <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink-800)' }}>{label}</div>
        {sub && <div style={{ fontSize: 12, color: 'var(--ink-500)', marginTop: 2 }}>{sub}</div>}
      </div>
      <div style={{ flexShrink: 0, marginLeft: 24 }}>{children}</div>
    </div>
  )
}

function Toggle({ value, onChange }) {
  return (
    <button
      onClick={() => onChange(!value)}
      style={{
        width: 44, height: 24, borderRadius: 999, border: 'none', cursor: 'pointer',
        background: value ? 'var(--brand-600)' : 'var(--ink-300)',
        position: 'relative', transition: 'background .2s',
        flexShrink: 0,
      }}
    >
      <span style={{
        position: 'absolute', top: 3, left: value ? 23 : 3,
        width: 18, height: 18, borderRadius: '50%', background: '#fff',
        transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,.2)',
      }} />
    </button>
  )
}

function SaveBtn({ saving, saved, onClick }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 16 }}>
      <button className="btn btn--primary" onClick={onClick} disabled={saving}>
        {saving ? 'Saving…' : 'Save changes'}
      </button>
      {saved && <span className="chip chip--ok">✓ Saved</span>}
    </div>
  )
}

/* ── default state loaded from localStorage ── */
function load(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback } catch { return fallback }
}
function save(key, val) { localStorage.setItem(key, JSON.stringify(val)) }

export default function AdminSettings() {

  /* ── General ── */
  const [general, setGeneral] = useState(() => load('settings_general', {
    systemName:   'VSDC Manager',
    supportEmail: 'support@vsdc.rw',
    timezone:     'Africa/Kigali',
    dateFormat:   'DD/MM/YYYY',
    currency:     'RWF',
    language:     'en',
  }))
  const [genSaving, setGenSaving] = useState(false)
  const [genSaved,  setGenSaved]  = useState(false)

  /* ── Appearance ── */
  const [appearance, setAppearance] = useState(() => load('settings_appearance', {
    theme:          localStorage.getItem('admin-theme') || 'light',
    sidebarCollapsed: false,
    compactMode:    false,
    showSubLabels:  true,
    accentColor:    '#1d4ed8',
  }))
  const [appSaving, setAppSaving] = useState(false)
  const [appSaved,  setAppSaved]  = useState(false)

  /* ── Notifications ── */
  const [notif, setNotif] = useState(() => load('settings_notif', {
    emailAlerts:    true,
    loginAlerts:    true,
    errorAlerts:    true,
    weeklyReport:   false,
    browserPush:    false,
    alertEmail:     '',
  }))
  const [notifSaving, setNotifSaving] = useState(false)
  const [notifSaved,  setNotifSaved]  = useState(false)

  /* ── Security ── */
  const [security, setSecurity] = useState(() => load('settings_security', {
    sessionTimeout:   30,
    requireMfa:       false,
    ipWhitelist:      '',
    maxLoginAttempts: 5,
    passwordExpiry:   90,
    auditLog:         true,
  }))
  const [secSaving, setSecSaving] = useState(false)
  const [secSaved,  setSecSaved]  = useState(false)

  /* ── API / Integration ── */
  const [api, setApi] = useState(() => load('settings_api', {
    ebmBaseUrl:    'https://ebm.rra.gov.rw/api',
    apiTimeout:    30,
    retryAttempts: 3,
    webhookUrl:    '',
    webhookSecret: '',
    enableWebhook: false,
  }))
  const [apiSaving, setApiSaving] = useState(false)
  const [apiSaved,  setApiSaved]  = useState(false)

  /* ── Backup ── */
  const [backup, setBackup] = useState(() => load('settings_backup', {
    autoBackup:     true,
    backupFrequency:'daily',
    retentionDays:  30,
    lastBackup:     null,
  }))
  const [backupSaving, setBackupSaving] = useState(false)
  const [backupSaved,  setBackupSaved]  = useState(false)

  /* ── save helpers ── */
  function saveSection(key, val, setSaving, setSaved, logMsg) {
    setSaving(true)
    setTimeout(() => {
      save(key, val)
      setSaving(false)
      setSaved(true)
      logActivity({ action: 'UPDATE_SETTINGS', category: 'System', summary: logMsg })
      setTimeout(() => setSaved(false), 2500)
    }, 600)
  }

  /* ── active tab ── */
  const TABS = ['General', 'Appearance', 'Notifications', 'Security', 'API & Integration', 'Backup']
  const [tab, setTab] = useState('General')

  return (
    <AdminShell>
      <div className="page">
        <div className="page-head">
          <div>
            <div className="crumbs"><span>Admin</span><span>›</span><span>Settings</span></div>
            <h1>Settings</h1>
          </div>
        </div>

        {/* Tab bar */}
        <div className="tab-bar" style={{ marginBottom: 24, display: 'flex' }}>
          {TABS.map(t => (
            <button key={t} className={tab === t ? 'is-active' : ''} onClick={() => setTab(t)}>{t}</button>
          ))}
        </div>

        {/* ── GENERAL ── */}
        {tab === 'General' && (
          <Section title="General Settings" subtitle="Basic system configuration">
            <SettingRow label="System Name" sub="Displayed in the browser title and emails">
              <input className="form-input form-input--sm" style={{ width: 220 }}
                value={general.systemName}
                onChange={e => setGeneral(g => ({ ...g, systemName: e.target.value }))} />
            </SettingRow>
            <SettingRow label="Support Email" sub="Used for system notifications and alerts">
              <input className="form-input form-input--sm" style={{ width: 220 }} type="email"
                value={general.supportEmail}
                onChange={e => setGeneral(g => ({ ...g, supportEmail: e.target.value }))} />
            </SettingRow>
            <SettingRow label="Timezone" sub="All timestamps displayed in this timezone">
              <select className="form-input form-input--sm" style={{ width: 200 }}
                value={general.timezone}
                onChange={e => setGeneral(g => ({ ...g, timezone: e.target.value }))}>
                <option value="Africa/Kigali">Africa/Kigali (CAT)</option>
                <option value="UTC">UTC</option>
                <option value="Europe/Paris">Europe/Paris (CET)</option>
                <option value="America/New_York">America/New_York (EST)</option>
              </select>
            </SettingRow>
            <SettingRow label="Date Format" sub="How dates are displayed across the system">
              <select className="form-input form-input--sm" style={{ width: 160 }}
                value={general.dateFormat}
                onChange={e => setGeneral(g => ({ ...g, dateFormat: e.target.value }))}>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </SettingRow>
            <SettingRow label="Currency" sub="Default currency for all monetary values">
              <select className="form-input form-input--sm" style={{ width: 120 }}
                value={general.currency}
                onChange={e => setGeneral(g => ({ ...g, currency: e.target.value }))}>
                <option value="RWF">RWF</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </SettingRow>
            <SettingRow label="Default Language" sub="Interface language for new sessions">
              <select className="form-input form-input--sm" style={{ width: 160 }}
                value={general.language}
                onChange={e => setGeneral(g => ({ ...g, language: e.target.value }))}>
                <option value="en">English</option>
                <option value="fr">Français</option>
                <option value="rw">Kinyarwanda</option>
              </select>
            </SettingRow>
            <SaveBtn saving={genSaving} saved={genSaved}
              onClick={() => saveSection('settings_general', general, setGenSaving, setGenSaved, 'Updated general settings')} />
          </Section>
        )}

        {/* ── APPEARANCE ── */}
        {tab === 'Appearance' && (
          <Section title="Appearance" subtitle="Customize the look and feel of the admin console">
            <SettingRow label="Theme" sub="Light or dark mode for the admin console">
              <select className="form-input form-input--sm" style={{ width: 140 }}
                value={appearance.theme}
                onChange={e => {
                  setAppearance(a => ({ ...a, theme: e.target.value }))
                  document.documentElement.setAttribute('data-theme', e.target.value)
                  localStorage.setItem('admin-theme', e.target.value)
                }}>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </SettingRow>
            <SettingRow label="Compact Mode" sub="Reduce padding and spacing for denser layouts">
              <Toggle value={appearance.compactMode}
                onChange={v => setAppearance(a => ({ ...a, compactMode: v }))} />
            </SettingRow>
            <SettingRow label="Show Nav Sub-labels" sub="Show 'Summary' / 'Management' labels on sidebar links">
              <Toggle value={appearance.showSubLabels}
                onChange={v => setAppearance(a => ({ ...a, showSubLabels: v }))} />
            </SettingRow>
            <SettingRow label="Accent Color" sub="Primary brand color used for buttons and highlights">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <input type="color" value={appearance.accentColor}
                  onChange={e => setAppearance(a => ({ ...a, accentColor: e.target.value }))}
                  style={{ width: 36, height: 30, border: '1px solid var(--ink-300)', borderRadius: 6, cursor: 'pointer', padding: 2 }} />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-600)' }}>{appearance.accentColor}</span>
              </div>
            </SettingRow>
            <SaveBtn saving={appSaving} saved={appSaved}
              onClick={() => saveSection('settings_appearance', appearance, setAppSaving, setAppSaved, 'Updated appearance settings')} />
          </Section>
        )}

        {/* ── NOTIFICATIONS ── */}
        {tab === 'Notifications' && (
          <Section title="Notifications" subtitle="Control when and how you receive system alerts">
            <SettingRow label="Email Alerts" sub="Send email notifications for critical system events">
              <Toggle value={notif.emailAlerts} onChange={v => setNotif(n => ({ ...n, emailAlerts: v }))} />
            </SettingRow>
            <SettingRow label="Login Alerts" sub="Notify on every admin login">
              <Toggle value={notif.loginAlerts} onChange={v => setNotif(n => ({ ...n, loginAlerts: v }))} />
            </SettingRow>
            <SettingRow label="Error Alerts" sub="Notify when API errors or sync failures occur">
              <Toggle value={notif.errorAlerts} onChange={v => setNotif(n => ({ ...n, errorAlerts: v }))} />
            </SettingRow>
            <SettingRow label="Weekly Summary Report" sub="Receive a weekly digest of system activity">
              <Toggle value={notif.weeklyReport} onChange={v => setNotif(n => ({ ...n, weeklyReport: v }))} />
            </SettingRow>
            <SettingRow label="Browser Push Notifications" sub="Show desktop notifications in the browser">
              <Toggle value={notif.browserPush} onChange={v => setNotif(n => ({ ...n, browserPush: v }))} />
            </SettingRow>
            <SettingRow label="Alert Email Address" sub="Where to send system alert emails">
              <input className="form-input form-input--sm" style={{ width: 240 }} type="email"
                placeholder="admin@company.rw"
                value={notif.alertEmail}
                onChange={e => setNotif(n => ({ ...n, alertEmail: e.target.value }))} />
            </SettingRow>
            <SaveBtn saving={notifSaving} saved={notifSaved}
              onClick={() => saveSection('settings_notif', notif, setNotifSaving, setNotifSaved, 'Updated notification settings')} />
          </Section>
        )}

        {/* ── SECURITY ── */}
        {tab === 'Security' && (
          <Section title="Security" subtitle="Authentication, access control, and session management">
            <SettingRow label="Session Timeout" sub="Automatically log out after inactivity (minutes)">
              <input className="form-input form-input--sm input--mono" style={{ width: 80 }} type="number" min={5} max={480}
                value={security.sessionTimeout}
                onChange={e => setSecurity(s => ({ ...s, sessionTimeout: Number(e.target.value) }))} />
            </SettingRow>
            <SettingRow label="Require MFA" sub="Enforce two-factor authentication for all admin logins">
              <Toggle value={security.requireMfa} onChange={v => setSecurity(s => ({ ...s, requireMfa: v }))} />
            </SettingRow>
            <SettingRow label="Max Login Attempts" sub="Lock account after this many failed attempts">
              <input className="form-input form-input--sm input--mono" style={{ width: 80 }} type="number" min={1} max={20}
                value={security.maxLoginAttempts}
                onChange={e => setSecurity(s => ({ ...s, maxLoginAttempts: Number(e.target.value) }))} />
            </SettingRow>
            <SettingRow label="Password Expiry" sub="Force password reset after this many days (0 = never)">
              <input className="form-input form-input--sm input--mono" style={{ width: 80 }} type="number" min={0} max={365}
                value={security.passwordExpiry}
                onChange={e => setSecurity(s => ({ ...s, passwordExpiry: Number(e.target.value) }))} />
            </SettingRow>
            <SettingRow label="IP Whitelist" sub="Comma-separated IPs allowed to access admin (leave blank for all)">
              <input className="form-input form-input--sm input--mono" style={{ width: 280 }}
                placeholder="192.168.1.1, 10.0.0.0/24"
                value={security.ipWhitelist}
                onChange={e => setSecurity(s => ({ ...s, ipWhitelist: e.target.value }))} />
            </SettingRow>
            <SettingRow label="Audit Log" sub="Keep a full audit trail of all admin actions">
              <Toggle value={security.auditLog} onChange={v => setSecurity(s => ({ ...s, auditLog: v }))} />
            </SettingRow>
            <SaveBtn saving={secSaving} saved={secSaved}
              onClick={() => saveSection('settings_security', security, setSecSaving, setSecSaved, 'Updated security settings')} />
          </Section>
        )}

        {/* ── API & INTEGRATION ── */}
        {tab === 'API & Integration' && (
          <Section title="API & Integration" subtitle="EBM server connection and webhook configuration">
            <SettingRow label="EBM Base URL" sub="RRA EBM 2.1 API endpoint">
              <input className="form-input form-input--sm input--mono" style={{ width: 320 }}
                value={api.ebmBaseUrl}
                onChange={e => setApi(a => ({ ...a, ebmBaseUrl: e.target.value }))} />
            </SettingRow>
            <SettingRow label="API Timeout" sub="Request timeout in seconds">
              <input className="form-input form-input--sm input--mono" style={{ width: 80 }} type="number" min={5} max={120}
                value={api.apiTimeout}
                onChange={e => setApi(a => ({ ...a, apiTimeout: Number(e.target.value) }))} />
            </SettingRow>
            <SettingRow label="Retry Attempts" sub="Number of retries on failed API calls">
              <input className="form-input form-input--sm input--mono" style={{ width: 80 }} type="number" min={0} max={10}
                value={api.retryAttempts}
                onChange={e => setApi(a => ({ ...a, retryAttempts: Number(e.target.value) }))} />
            </SettingRow>
            <SettingRow label="Enable Webhook" sub="Send event payloads to an external URL">
              <Toggle value={api.enableWebhook} onChange={v => setApi(a => ({ ...a, enableWebhook: v }))} />
            </SettingRow>
            {api.enableWebhook && (
              <>
                <SettingRow label="Webhook URL" sub="POST endpoint that receives event payloads">
                  <input className="form-input form-input--sm input--mono" style={{ width: 320 }}
                    placeholder="https://your-server.com/webhook"
                    value={api.webhookUrl}
                    onChange={e => setApi(a => ({ ...a, webhookUrl: e.target.value }))} />
                </SettingRow>
                <SettingRow label="Webhook Secret" sub="Used to sign payloads (HMAC-SHA256)">
                  <input className="form-input form-input--sm input--mono" style={{ width: 240 }}
                    type="password" placeholder="••••••••••••"
                    value={api.webhookSecret}
                    onChange={e => setApi(a => ({ ...a, webhookSecret: e.target.value }))} />
                </SettingRow>
              </>
            )}
            <SaveBtn saving={apiSaving} saved={apiSaved}
              onClick={() => saveSection('settings_api', api, setApiSaving, setApiSaved, 'Updated API & integration settings')} />
          </Section>
        )}

        {/* ── BACKUP ── */}
        {tab === 'Backup' && (
          <Section title="Backup & Data" subtitle="Automated backup schedule and data retention">
            <SettingRow label="Automatic Backups" sub="Periodically back up system configuration and logs">
              <Toggle value={backup.autoBackup} onChange={v => setBackup(b => ({ ...b, autoBackup: v }))} />
            </SettingRow>
            <SettingRow label="Backup Frequency" sub="How often automatic backups run">
              <select className="form-input form-input--sm" style={{ width: 160 }}
                value={backup.backupFrequency}
                onChange={e => setBackup(b => ({ ...b, backupFrequency: e.target.value }))}>
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </SettingRow>
            <SettingRow label="Retention Period" sub="How many days to keep backup files">
              <input className="form-input form-input--sm input--mono" style={{ width: 80 }} type="number" min={1} max={365}
                value={backup.retentionDays}
                onChange={e => setBackup(b => ({ ...b, retentionDays: Number(e.target.value) }))} />
            </SettingRow>
            <SettingRow label="Last Backup" sub="When the most recent backup was created">
              <span style={{ fontSize: 13, color: 'var(--ink-500)', fontFamily: 'var(--font-mono)' }}>
                {backup.lastBackup ? new Date(backup.lastBackup).toLocaleString() : 'Never'}
              </span>
            </SettingRow>
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button className="btn btn--primary"
                onClick={() => {
                  const now = new Date().toISOString()
                  setBackup(b => ({ ...b, lastBackup: now }))
                  save('settings_backup', { ...backup, lastBackup: now })
                  logActivity({ action: 'MANUAL_BACKUP', category: 'System', summary: 'Admin triggered manual backup' })
                }}>
                Run Backup Now
              </button>
              <SaveBtn saving={backupSaving} saved={backupSaved}
                onClick={() => saveSection('settings_backup', backup, setBackupSaving, setBackupSaved, 'Updated backup settings')} />
            </div>
          </Section>
        )}
      </div>
    </AdminShell>
  )
}
