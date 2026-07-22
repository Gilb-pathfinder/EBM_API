const CHECKLIST = [
  'All eight EBM 2.1 service categories implemented end-to-end.',
  '24-hour offline tolerance with automatic resync on reconnection.',
  'MRC-ready: cash registers and POS systems both supported.',
  'All RRA response codes (000–884) surfaced with human-readable hints.',
]

const codeStyle = { fontFamily: 'var(--font-mono)', fontSize: '11.5px' }

const BADGES = [
  {
    colorClass: 'ic-blue',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-12V5l-8-3-8 3v5c0 8 8 12 8 12z" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    title: 'RRA EBM 2.1',
    desc: 'Certified Invoicing System aligned with the March 2018 technical specification.',
  },
  {
    colorClass: 'ic-green',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12l5 5L21 4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    title: 'VSDC v1.0.5',
    desc: null,
    descJsx: <p>Latest spec including <code style={codeStyle}>prcOrdCd</code> and result codes 881–884.</p>,
  },
  {
    colorClass: 'ic-amber',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3" strokeLinecap="round"/></svg>,
    title: 'Real-time',
    desc: 'Median signature round-trip under 200 ms on a normal 4G connection.',
  },
  {
    colorClass: 'ic-violet',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4" strokeLinecap="round"/></svg>,
    title: 'Locally hosted',
    desc: 'The VSDC WAR sits on your own server — your sales data never leaves your premises.',
  },
]

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
      <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function Compliance() {
  return (
    <section className="sec compliance" id="compliance">
      <div className="inner">
        <div>
          <span className="eyebrow">RRA compliance, by default</span>
          <h2>Built strictly to the VSDC v1.0.5 specification.</h2>
          <p>Every endpoint, every code list, every required attribute. The VSDC WAR runs locally; we just give you a clean way to drive it.</p>
          <ul className="check-list">
            {CHECKLIST.map((item) => (
              <li key={item}>
                <span className="ck"><CheckIcon /></span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="badge-grid">
          {BADGES.map((badge) => (
            <div key={badge.title} className="badge">
              <div className="top">
                <div className={`ic ${badge.colorClass}`}>{badge.icon}</div>
                <h4>{badge.title}</h4>
              </div>
              {badge.descJsx ?? <p>{badge.desc}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
