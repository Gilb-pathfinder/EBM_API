import { Link } from 'react-router-dom'
import BrandMark from '../ui/BrandMark'

export default function Footer() {
  return (
    <footer id="docs">
      <div className="inner">
        <div className="footer-brand">
          <div className="lnav__brand">
            <BrandMark size={32} />
            <span className="brand-name" style={{ color: 'var(--ink-900)' }}>VSDC Manager</span>
          </div>
          <p>An independent management UI for RRA-approved Virtual Sales Data Controllers. Not affiliated with the Rwanda Revenue Authority.</p>
        </div>

        <div>
          <h5>Product</h5>
          <ul>
            <li><Link to="/dashboard">Dashboard</Link></li>
            <li><Link to="/items">Items</Link></li>
            <li><Link to="/invoice">Invoices</Link></li>
            <li><Link to="/purchases">Purchases</Link></li>
            <li><Link to="/stock">Stock</Link></li>
          </ul>
        </div>

        <div>
          <h5>Compliance</h5>
          <ul>
            <li><a href="#">VSDC v1.0.5 spec</a></li>
            <li><a href="#">EBM 2.1 reference</a></li>
            <li><a href="#">Response codes</a></li>
            <li><a href="#">Item classification</a></li>
          </ul>
        </div>

        <div>
          <h5>Support</h5>
          <ul>
            <li><a href="#">Onboarding guide</a></li>
            <li><a href="#">Status page</a></li>
            <li><a href="#">Contact us</a></li>
            <li><a href="#">Changelog</a></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© 2026 VSDC Manager · Kigali, Rwanda</span>
        <span>v1.0.5 · Last sync 02 May 2026, 14:03 CAT</span>
      </div>
    </footer>
  )
}
