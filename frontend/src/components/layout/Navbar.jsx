import { Link } from 'react-router-dom'
import { useActiveSection } from '../../hooks/useActiveSection'
import BrandMark from '../ui/BrandMark'

const NAV_LINKS = [
  { label: 'Features', href: '#features', id: 'features' },
  { label: 'How it works', href: '#workflow', id: 'workflow' },
  { label: 'Compliance', href: '#compliance', id: 'compliance' },
  { label: 'Pricing', href: '#pricing', id: 'pricing' },
  { label: 'Docs', href: '#docs', id: 'docs' },
]

export default function Navbar() {
  const activeId = useActiveSection()

  return (
    <header className="lnav">
      <div className="lnav__inner">
        <Link className="lnav__brand" to="/">
          <BrandMark size={32} />
          <span>
            <span className="brand-name">VSDC Manager</span>
          </span>
        </Link>

        <nav className="lnav__links">
          {NAV_LINKS.map((link) => (
            <a
              key={link.id}
              href={link.href}
              style={
                activeId === link.id
                  ? { color: 'var(--brand-700)', borderBottomColor: 'var(--brand-700)' }
                  : {}
              }
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="lnav__cta">
          <Link className="btn btn--ghost btn--sm" to="/dashboard">Sign in</Link>
          <Link className="btn btn--primary btn--sm" to="/dashboard">
            Open dashboard
            <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M13 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </div>
    </header>
  )
}
