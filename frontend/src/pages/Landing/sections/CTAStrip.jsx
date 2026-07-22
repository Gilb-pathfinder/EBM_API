import { Link } from 'react-router-dom'

export default function CTAStrip() {
  return (
    <div className="cta-strip" id="pricing">
      <div>
        <h2>Get your VSDC online before tea time.</h2>
        <p>
          Already have RRA approval? Drop the WAR on your server, log in here, and we&apos;ll walk
          you through device initialization, code sync and your first signed receipt — usually under
          30 minutes.
        </p>
      </div>
      <div className="btns">
        <Link className="btn btn--white btn--lg" to="/dashboard">Open dashboard</Link>
        <a className="btn btn--outline-w btn--lg" href="#docs">Read the docs</a>
      </div>
    </div>
  )
}
