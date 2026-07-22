import { Link } from 'react-router-dom'

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero__inner">
        {/* Left column */}
        <div>
          <span className="eyebrow">
            <span className="pill">EBM 2.1</span>
            Certified Invoicing System for RRA
          </span>
          <h1>
            Run your <em>billing &amp; tax compliance</em> from one quiet dashboard.
          </h1>
          <p className="lead">
            VSDC Manager is the easiest way for Rwandan taxpayers to manage items,
            register sales, sign invoices, reconcile purchases and stay perfectly
            in sync with the Rwanda Revenue Authority — without ever leaving the browser.
          </p>
          <div className="hero__cta">
            <Link className="btn btn--primary btn--lg" to="/dashboard">
              Open the dashboard
              <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M13 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <Link className="btn btn--lg" to="/invoice">
              <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M9 13h6 M9 17h6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              See sample invoice
            </Link>
          </div>

          <div className="hero__trust">
            <div><strong>9,400+</strong>Invoices signed daily</div>
            <div><strong>1,250</strong>Active TINs onboarded</div>
            <div><strong>99.98%</strong>Uptime to RRA EBM 2.1</div>
          </div>
        </div>

        {/* Right column */}
        <div style={{ position: 'relative' }}>
          <div className="float-card float-1">
            <div className="icon-wrap ic-green">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <div className="label">Last invoice</div>
              <div className="value">Signed in 184 ms</div>
            </div>
          </div>

          <div className="float-card float-2">
            <div className="icon-wrap ic-blue">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 12 7 8l4 4 4-4 4 4M3 18l4-4 4 4 4-4 4 4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <div className="label">Today&apos;s VAT (B)</div>
              <div className="value">RWF 1,284,610</div>
            </div>
          </div>

          <div className="device">
            <div className="device__bar">
              <span className="dot r" /><span className="dot y" /><span className="dot g" />
              <span className="url">vsdc.local · /trnsSales/saveSales</span>
            </div>
            <div className="device__body" style={{ background: 'var(--ink-50)' }}>
              <MockReceipt />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function MockReceipt() {
  return (
    <div className="mock-recp">
      <div className="mock-recp__hd">
        <b>UMURAVA SUPERMARKET LTD</b>
        <span>TIN 999991130 · KN 4 Ave, Kigali</span>
      </div>
      <div className="mock-recp__line"><span>Coca-Cola 50cl × 6</span><span>3,000</span></div>
      <div className="mock-recp__line"><span>Bralirwa Mütze 65cl × 2</span><span>2,400</span></div>
      <div className="mock-recp__line"><span>Inyange milk 1L × 4</span><span>5,200</span></div>
      <div className="mock-recp__line"><span>Rice 25kg × 1</span><span>32,000</span></div>
      <div className="mock-recp__line" style={{ color: 'var(--ink-500)' }}>
        <span>Subtotal</span><span>42,600</span>
      </div>
      <div className="mock-recp__line" style={{ color: 'var(--ink-500)' }}>
        <span>VAT 18% (B)</span><span>6,498</span>
      </div>
      <div className="mock-recp__total"><span>TOTAL</span><span>RWF 42,600</span></div>
      <div className="mock-recp__sig">
        <div>SDC INFO</div>
        <div>SDC ID: SDC0010001</div>
        <div>Receipt #: 0142 / NS</div>
        <div>Internal data: G3RW-7BPA-9X12-0DE4</div>
        <div>Signature: 9F4C-7821-A0BB-2D45</div>
      </div>
      <div className="mock-recp__qr">
        <QRPlaceholder />
        <div style={{ fontSize: '10.5px', color: 'var(--ink-500)', lineHeight: 1.4 }}>
          Scan to verify on RRA EBM portal — invoice 9F4C-7821-A0BB-2D45 issued 16 May 2026 14:03 CAT.
        </div>
      </div>
      <div className="mock-recp__rra">— Rwanda Revenue Authority · EBM 2.1 —</div>
    </div>
  )
}

function QRPlaceholder() {
  return (
    <svg viewBox="0 0 60 60" aria-hidden="true">
      <rect width="60" height="60" fill="#fff" />
      <g fill="#0a1f3d">
        <rect x="2" y="2" width="14" height="14" /><rect x="44" y="2" width="14" height="14" />
        <rect x="2" y="44" width="14" height="14" /><rect x="6" y="6" width="6" height="6" fill="#fff" />
        <rect x="48" y="6" width="6" height="6" fill="#fff" /><rect x="6" y="48" width="6" height="6" fill="#fff" />
        <rect x="20" y="4" width="4" height="4" /><rect x="26" y="4" width="4" height="4" />
        <rect x="32" y="4" width="4" height="4" /><rect x="20" y="20" width="4" height="4" />
        <rect x="26" y="20" width="4" height="4" /><rect x="32" y="20" width="4" height="4" />
        <rect x="38" y="20" width="4" height="4" /><rect x="20" y="26" width="4" height="4" />
        <rect x="32" y="26" width="4" height="4" /><rect x="44" y="26" width="4" height="4" />
        <rect x="50" y="26" width="4" height="4" /><rect x="20" y="32" width="4" height="4" />
        <rect x="26" y="32" width="4" height="4" /><rect x="38" y="32" width="4" height="4" />
        <rect x="44" y="38" width="4" height="4" /><rect x="20" y="44" width="4" height="4" />
        <rect x="32" y="44" width="4" height="4" /><rect x="44" y="50" width="4" height="4" />
        <rect x="50" y="44" width="4" height="4" /><rect x="26" y="50" width="4" height="4" />
      </g>
    </svg>
  )
}
