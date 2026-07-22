import { useState, useEffect, useCallback, useRef } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import ReactCountryFlag from 'react-country-flag'
import BrandMark from '../ui/BrandMark'
import { useApp } from '../../context/AppContext'
import { logActivity } from '../../hooks/useActivityLog'

const NAV_ITEMS = [
  {
    to: '/dashboard', label: 'Dashboard',
    icon: <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>,
  },
  {
    to: '/items', label: 'Items',
    icon: <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" strokeLinecap="round" /></svg>,
  },
  {
    to: '/invoice', label: 'Invoices',
    icon: <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6M9 13h6M9 17h4" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  },
  {
    to: '/procurement', label: 'Purchase Operations',
    icon: <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 7h18l-2 13H5L3 7z M8 7V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v3" strokeLinecap="round" strokeLinejoin="round" /></svg>,
    children: [
      { to: '/purchases', label: 'Local Purchases' },
      { to: '/imports', label: 'Import Items' },
    ]
  },
  {
    to: '/stock-mgmt', label: 'Stock Management',
    icon: <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" strokeLinecap="round" strokeLinejoin="round"/><polyline points="3.27 6.96 12 12.01 20.73 6.96" strokeLinecap="round" strokeLinejoin="round"/><line x1="12" y1="22.08" x2="12" y2="12" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    children: [
      { to: '/stock/list',     label: 'Inventory Status' },
      { to: '/stock/batch',    label: 'Batch Operations' },
      { to: '/stock/cash',     label: 'Cash Management' },
      { to: '/stock/training', label: 'Training Mode' },
    ]
  },
  {
    to: '/customers', label: 'Customers',
    icon: <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="8" r="4" /><path d="M3 21a6 6 0 0 1 12 0M16 3.13a4 4 0 0 1 0 7.75M21 21a6 6 0 0 0-3.5-5.45" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  },
  {
    to: '/insurances', label: 'Insurances',
    icon: <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  },
  {
    to: '/branch-users', label: 'Branch Users', sub: 'Operations',
    icon: <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="8" r="4" /><path d="M3 21a6 6 0 0 1 12 0" strokeLinecap="round" /><path d="M16 11h6M19 8v6" strokeLinecap="round" /></svg>,
  },
  {
    to: '/reports', label: 'Reporting', sub: 'Operations',
    icon: <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" strokeLinecap="round" strokeLinejoin="round" /></svg>,
    children: [
      { to: '/reports/x', label: 'X-Report' },
      { to: '/reports/daily', label: 'Daily Report' },
      { to: '/reports/period', label: 'Period Report' },
      { to: '/reports/plu', label: 'PLU Report' },
      { to: '/reports/ej', label: 'Electronic Journal' },
      { to: '/reports/stock', label: 'Stock Movement' },
      { to: '/reports/purchases', label: 'Purchases Report' },
    ]
  },
  {
    to: '/notices', label: 'Notices', sub: 'Operations',
    icon: <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  },
]

const LANGUAGES = [
  { code: 'en', label: 'English', countryCode: 'GB' },
  { code: 'fr', label: 'Français', countryCode: 'FR' },
  { code: 'rw', label: 'Kinyarwanda', countryCode: 'RW' },
]

export default function AppShell({ children }) {
  const { user, logout, vsdcStatus } = useApp()
  const navigate = useNavigate()

  const [collapsed, setCollapsed] = useState(false)
  const [theme, setTheme] = useState(() => localStorage.getItem('op-theme') || 'light')
  const [lang, setLang] = useState(() => localStorage.getItem('op-lang') || 'en')
  const [langOpen, setLangOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const profileRef = useRef(null)

  // Apply theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('op-theme', theme)
  }, [theme])

  // Track fullscreen
  useEffect(() => {
    function onFsChange() { setIsFullscreen(!!document.fullscreenElement) }
    document.addEventListener('fullscreenchange', onFsChange)
    return () => document.removeEventListener('fullscreenchange', onFsChange)
  }, [])

  // Close lang dropdown on outside click
  const closeLang = useCallback((e) => {
    if (!e.target.closest('.lang-picker')) setLangOpen(false)
  }, [])
  useEffect(() => {
    if (langOpen) document.addEventListener('mousedown', closeLang)
    return () => document.removeEventListener('mousedown', closeLang)
  }, [langOpen, closeLang])

  // Close profile dropdown on outside click
  useEffect(() => {
    function handler(e) { if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  function handleLogout() {
    logActivity({ action: 'SIGN_OUT', category: 'Auth', summary: 'Operator ' + displayUser.name + ' signed out' });
    logout();
    navigate('/login', { replace: true });
  }

  function toggleTheme() {
    const next = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    logActivity({ action: 'CHANGE_THEME', category: 'System', summary: 'Switched UI theme to ' + next + ' mode' })
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => { })
    } else {
      document.exitFullscreen().catch(() => { })
    }
  }

  function selectLang(code) {
    const l = LANGUAGES.find(x => x.code === code)
    setLang(code)
    localStorage.setItem('op-lang', code)
    setLangOpen(false)
    logActivity({ action: 'CHANGE_LANGUAGE', category: 'System', summary: `Changed interface language to ${l?.label || code}` })
  }

  const currentLang = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0]

  const displayUser = user || {
    name: 'Operator', role: 'Device Operator', initials: 'OP',
    tin: '—', branch: '—', device: '—', isTrainingMode: false,
  }

  const [openGroups, setOpenGroups] = useState(() => {
    // Open group if active child exists
    const path = window.location.pathname
    const group = NAV_ITEMS.find(n => n.children?.some(c => path.startsWith(c.to)))
    return group ? [group.to] : []
  })

  function toggleGroup(to) {
    setOpenGroups(prev => prev.includes(to) ? prev.filter(x => x !== to) : [...prev, to])
  }

  return (
    <div className={`app operator-app${collapsed ? ' sidebar-collapsed' : ''}${theme === 'dark' ? ' theme-dark' : ''}`}>

      {/* ── SIDEBAR ── */}
      <aside className="sidebar">
        <div className="sidebar__brand">
          <BrandMark size={38} />
          {!collapsed && (
            <div className="sidebar__brand-text">
              <div className="brand-name">VSDC Manager</div>
              <div className="brand-sub">EBM 2.1</div>
            </div>
          )}
        </div>

        {!collapsed && <div className="sidebar__section">Operations</div>}

        <nav className="nav">
          {NAV_ITEMS.map(item => {
            if (item.children && !collapsed) {
              const isOpen = openGroups.includes(item.to)
              const hasActiveChild = item.children.some(c => window.location.pathname.startsWith(c.to))
              return (
                <div key={item.to} className={`nav__group${isOpen ? ' is-open' : ''}${hasActiveChild ? ' has-active' : ''}`}>
                  <button className="nav__item nav__item--group" onClick={() => toggleGroup(item.to)}>
                    {item.icon}
                    <div className="nav__item-text">
                      <span className="nav__item-label">{item.label}</span>
                      <span className="nav__item-sub">{item.sub}</span>
                    </div>
                    <svg className="nav__group-chevron" viewBox="0 0 16 16" fill="none" width="12" height="12">
                      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <div className="nav__children">
                    {item.children.map(child => (
                      <NavLink key={child.to} to={child.to} className={({ isActive }) => `nav__child${isActive ? ' is-active' : ''}`}>
                        {child.label}
                      </NavLink>
                    ))}
                  </div>
                </div>
              )
            }

            return (
              <NavLink
                key={item.to}
                to={item.to}
                title={collapsed ? item.label : undefined}
                className={({ isActive }) => `nav__item${isActive ? ' is-active' : ''}${collapsed ? ' nav__item--icon' : ''}`}
              >
                {item.icon}
                {!collapsed && (
                  <div className="nav__item-text">
                    <span className="nav__item-label">{item.label}</span>
                    <span className="nav__item-sub">{item.sub}</span>
                  </div>
                )}
              </NavLink>
            )
          })}
        </nav>

        <div className="sidebar__device" style={{ marginTop: 'auto' }}>
          <div className="device-card">
            {!collapsed ? (
              <>
                <div className="device-card__row">
                  <span>VSDC status</span>
                  <b className={`device-card__pulse${vsdcStatus === 'offline' ? ' device-card__pulse--offline' : vsdcStatus === 'checking' ? ' device-card__pulse--checking' : ''}`}>
                    {vsdcStatus === 'online' ? 'Online' : vsdcStatus === 'offline' ? 'Offline' : '…'}
                  </b>
                </div>
                <div className="device-card__row">
                  <span>TIN</span>
                  <b style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5 }}>{displayUser.tin}</b>
                </div>
                <div className="device-card__row">
                  <span>Branch</span>
                  <b style={{ fontSize: 11.5 }}>{displayUser.branch}</b>
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '4px 0' }}>
                <span className="device-card__pulse" style={{ fontSize: 10 }}>●</span>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main className="main">
        <div className="topbar">

          {/* Sidebar collapse toggle */}
          <button
            className="icon-btn"
            onClick={() => setCollapsed(c => !c)}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6" strokeLinecap="round" />
              <line x1="3" y1="12" x2="21" y2="12" strokeLinecap="round" />
              <line x1="3" y1="18" x2="21" y2="18" strokeLinecap="round" />
            </svg>
          </button>

          {/* Search */}
          <div className="search">
            <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" strokeLinecap="round" />
            </svg>
            <input placeholder="Search items, invoices, TINs…" aria-label="Search" />
            <span className="kbd">⌘K</span>
          </div>

          {displayUser.isTrainingMode && (
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: '#92400e', background: '#fef3c7', border: '1px solid #f59e0b', padding: '3px 10px', borderRadius: 999, whiteSpace: 'nowrap' }}>
              Training Mode
            </span>
          )}

          <div className="topbar__actions">

            {/* Fullscreen */}
            <button className="icon-btn" title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'} onClick={toggleFullscreen}>
              {isFullscreen ? (
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M8 3v3a2 2 0 0 1-2 2H3M21 8h-3a2 2 0 0 1-2-2V3M3 16h3a2 2 0 0 1 2 2v3M16 21v-3a2 2 0 0 1 2-2h3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>

            {/* Language picker */}
            <div className="lang-picker">
              <button className="icon-btn" title="Language" onClick={() => setLangOpen(o => !o)}>
                <ReactCountryFlag
                  countryCode={currentLang.countryCode}
                  svg
                  style={{ width: 22, height: 16, borderRadius: 2 }}
                  title={currentLang.label}
                />
              </button>
              {langOpen && (
                <div className="lang-dropdown">
                  {LANGUAGES.map(l => (
                    <button
                      key={l.code}
                      className={`lang-dropdown__item${lang === l.code ? ' is-active' : ''}`}
                      onClick={() => selectLang(l.code)}
                      title={l.label}
                    >
                      <ReactCountryFlag
                        countryCode={l.countryCode}
                        svg
                        style={{ width: 26, height: 19, borderRadius: 2 }}
                        title={l.label}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Dark / light toggle */}
            <button className="icon-btn" title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'} onClick={toggleTheme}>
              {theme === 'dark' ? (
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="5" />
                  <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" strokeLinecap="round" />
                </svg>
              ) : (
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>

            {/* Notifications */}
            <button className="icon-btn" title="Notifications">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="dot" />
            </button>

            {/* User pill with dropdown */}
            <div className="profile-menu" ref={profileRef}>
              <button
                className="user-pill user-pill--btn"
                onClick={() => setProfileOpen(o => !o)}
                aria-expanded={profileOpen}
              >
                <div className="avatar">{displayUser.initials}</div>
                <div>
                  <div className="user-pill__name">{displayUser.name}</div>
                  <div className="user-pill__role">{displayUser.role}</div>
                </div>
                <svg viewBox="0 0 16 16" fill="none" width="12" height="12" style={{ marginLeft: 4, color: 'var(--ink-400)', flexShrink: 0 }}>
                  <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {profileOpen && (
                <div className="profile-dropdown">
                  <NavLink to="/settings" className="profile-dropdown__item" onClick={() => setProfileOpen(false)}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
                      <circle cx="12" cy="12" r="3" />
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Settings
                  </NavLink>
                  <NavLink to="/activity" className="profile-dropdown__item" onClick={() => setProfileOpen(false)}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
                      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2M9 12h6M9 16h4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Activity Log
                  </NavLink>
                  <div className="profile-dropdown__divider" />
                  <button className="profile-dropdown__item profile-dropdown__item--danger" onClick={handleLogout}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Sign out
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>

        {children}
      </main>
    </div>
  )
}
