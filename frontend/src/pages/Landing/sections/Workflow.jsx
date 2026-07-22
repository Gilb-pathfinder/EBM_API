const codeStyle = {
  fontFamily: 'var(--font-mono)',
  fontSize: '12px',
  background: 'var(--ink-100)',
  padding: '1px 5px',
  borderRadius: '4px',
}

export default function Workflow() {
  return (
    <section className="sec workflow" id="workflow">
      <div className="inner">
        <div className="sec__hd">
          <span className="eyebrow">From WAR file to printed receipt</span>
          <h2>Four steps, no surprises.</h2>
          <p>Once your VSDC WAR is deployed locally and the device is initialized, the rest is workflow — not engineering.</p>
        </div>

        <div className="flow-grid">
          <div className="step">
            <h4>Initialize device</h4>
            <p>
              Apply with RRA, deploy the WAR, then call{' '}
              <code style={codeStyle}>/initializer/selectInitInfo</code>{' '}
              with your TIN, branch ID and device serial. Keys are pulled from EBM and saved.
            </p>
          </div>
          <div className="step">
            <h4>Load codes &amp; items</h4>
            <p>Pull the standard code list, item classification, branch list and customer TINs. Register your products with their tax type and unit price.</p>
          </div>
          <div className="step">
            <h4>Register sales</h4>
            <p>Build a basket. Save the sales transaction, then save the invoice — VSDC returns the receipt number, internal data and signature.</p>
          </div>
          <div className="step">
            <h4>Reconcile &amp; report</h4>
            <p>Confirm purchases registered against your TIN, adjust stock IO, push the new stock master and you&apos;re balanced for the day.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
