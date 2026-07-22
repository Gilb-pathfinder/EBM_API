import { Link } from 'react-router-dom'
import BrandMark from '../../../components/ui/BrandMark'
import Chip from '../../../components/ui/Chip'

const TAX_ROWS = [
  { name: 'Tax B (18%)', width: '78%', color: 'var(--brand-700)', value: 'RWF 1.28M' },
  { name: 'Tax C (0%)', width: '38%', color: 'var(--ok)', value: 'RWF 612K' },
  { name: 'Tax A (Exempt)', width: '22%', color: '#6d28d9', value: 'RWF 354K' },
  { name: 'Tax D (Non-VAT)', width: '12%', color: 'var(--warn)', value: 'RWF 192K' },
]

const RECENT = [
  { id: 'INV-0142', customer: 'Umurava Supermarket', tax: 'VAT B', amount: '42,600' },
  { id: 'INV-0141', customer: 'Walk-in customer', tax: 'VAT B', amount: '12,800' },
  { id: 'INV-0140', customer: 'Bralirwa Wholesale', tax: 'VAT C', amount: '218,000' },
  { id: 'INV-0139', customer: 'Intare Pharma', tax: 'VAT A', amount: '8,400' },
]

export default function Showcase() {
  return (
    <section className="showcase">
      <div className="showcase__inner">
        <div>
          <span className="eyebrow">Live operations</span>
          <h2 style={{ fontSize: '36px', lineHeight: 1.18, letterSpacing: '-.022em', margin: '14px 0', fontWeight: 800 }}>
            A dashboard your accountant can actually read on Monday morning.
          </h2>
          <p style={{ color: 'var(--ink-600)', fontSize: '15px', lineHeight: 1.6 }}>
            Tax type breakdown, top items, signed-vs-pending invoices, branch performance and the
            VSDC heartbeat — all in one calm screen designed for finance, not for engineers.
          </p>
          <div style={{ marginTop: '22px', display: 'flex', gap: '10px' }}>
            <Link className="btn btn--primary" to="/dashboard">Open dashboard</Link>
            <Link className="btn" to="/items">Browse items</Link>
          </div>
        </div>

        <div className="showcase__art">
          <div className="showcase__art-hd">
            <BrandMark size={26} />
            <b>Today · 02 May 2026</b>
            <Chip variant="ok" style={{ marginLeft: 'auto' }}>VSDC online</Chip>
          </div>

          <div className="ms-bar">
            {TAX_ROWS.map((row) => (
              <div key={row.name} className="stat-row">
                <span className="name">{row.name}</span>
                <span className="bar">
                  <i style={{ width: row.width, background: row.color }} />
                </span>
                <span className="v">{row.value}</span>
              </div>
            ))}
          </div>

          <div className="ms-recents">
            <h5>Last signed invoices</h5>
            {RECENT.map((inv) => (
              <div key={inv.id} className="row">
                <span className="id">{inv.id}</span>
                <span>{inv.customer}</span>
                <span>{inv.tax}</span>
                <span className="amt">{inv.amount}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
