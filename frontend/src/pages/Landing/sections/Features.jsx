const FEATURES = [
  {
    colorClass: 'ic-blue',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
      </svg>
    ),
    title: 'Item & product catalog',
    desc: 'Maintain SKUs with proper item classification, packaging unit, quantity unit and tax type — synced to the RRA item registry.',
    bullets: [
      '10-digit RRA item classification picker',
      'Tax types A / B / C / D auto-applied',
      'Group prices L1–L5 for tiered customers',
    ],
  },
  {
    colorClass: 'ic-green',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M9 13h6 M9 17h4" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Sales & invoice signing',
    desc: 'Build a basket, hit save, and the invoice comes back signed with internal data + signature data ready for the printed receipt.',
    bullets: [
      'Normal, Copy, Training & Proforma receipts',
      'Cash, card, mobile money, bank transfer',
      'One-click cancel / refund flows',
    ],
  },
  {
    colorClass: 'ic-amber',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 7h18l-2 13H5L3 7z M8 7V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v3" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Purchases & imports',
    desc: 'Pull purchase data your suppliers registered against your TIN, accept it, and merge customs declarations straight into your stock.',
    bullets: [
      'Auto-fetch from /trnsPurchase/selectTrnsPurchaseSales',
      'Customs declarations into items',
      'Buyer-side acceptance signatures',
    ],
  },
  {
    colorClass: 'ic-violet',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 12h4l3-9 4 18 3-9h4" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Stock & inventory',
    desc: 'Stock master and stock IO sequences are first-class. Adjust, transfer between branches and watch the safety quantity light up.',
    bullets: [],
  },
  {
    colorClass: 'ic-cyan',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="9" cy="8" r="4"/>
        <path d="M3 21a6 6 0 0 1 12 0M16 3.13a4 4 0 0 1 0 7.75M21 21a6 6 0 0 0-3.5-5.45" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Customers & branches',
    desc: 'Manage customer TINs, branch users and insurance partners (for pharmacies). Branch user accounts pushed via the EBM API.',
    bullets: [],
  },
  {
    colorClass: 'ic-rose',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 22s8-4 8-12V5l-8-3-8 3v5c0 8 8 12 8 12z" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Compliance, audited',
    desc: 'Every signed receipt is mirrored to RRA EBM 2.1 and kept locally for 24-hour offline tolerance with full audit trail and remote audit support.',
    bullets: [],
  },
]

export default function Features() {
  return (
    <section className="sec" id="features">
      <div className="inner">
        <div className="sec__hd">
          <span className="eyebrow">Built around the EBM 2.1 spec</span>
          <h2>Every endpoint, every code, neatly tucked behind a calm UI.</h2>
          <p>From device initialization to stock reconciliation, VSDC Manager covers the eight EBM 2.1 service categories and turns each one into a workflow your cashiers and accountants actually enjoy.</p>
        </div>

        <div className="feature-grid">
          {FEATURES.map((f) => (
            <div key={f.title} className="feature">
              <div className={`ic ${f.colorClass}`}>{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
              {f.bullets.length > 0 && (
                <ul>
                  {f.bullets.map((b) => <li key={b}>{b}</li>)}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
