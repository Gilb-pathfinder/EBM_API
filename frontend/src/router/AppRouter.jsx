import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from '../components/layout/ProtectedRoute'
import Landing        from '../pages/Landing/Landing'
import Login          from '../pages/Login/Login'
import AdminDashboard   from '../pages/Admin/AdminDashboard'
import AdminUsers       from '../pages/Admin/AdminUsers'
import AdminBranches    from '../pages/Admin/AdminBranches'
import AdminTaxConfig   from '../pages/Admin/AdminTaxConfig'
import AdminTools       from '../pages/Admin/AdminTools'
import AdminActivityLog from '../pages/Admin/AdminActivityLog'
import AdminSettings    from '../pages/Admin/AdminSettings'
import Dashboard   from '../pages/Dashboard/Dashboard'
import Items       from '../pages/Items/Items'
import Invoice     from '../pages/Invoice/Invoice'
import NewInvoice  from '../pages/Invoice/NewInvoice'
import Purchases   from '../pages/Purchases/Purchases'
import Imports     from '../pages/Imports/Imports'
import Stock       from '../pages/Stock/Stock'
import StockBatch    from '../pages/Stock/StockBatch'
import StockMaster   from '../pages/Stock/StockMaster'
import InventoryList from '../pages/Stock/InventoryList'
import CashManagement from '../pages/Stock/CashManagement'
import TrainingMode  from '../pages/Stock/TrainingMode'
import Settings    from '../pages/Settings/Settings'
import Activity    from '../pages/Activity/Activity'
import Customers    from '../pages/Customers/Customers'
import Insurances   from '../pages/Insurances/Insurances'
import BranchUsers  from '../pages/BranchUsers/BranchUsers'
import XReport from '../pages/Reports/XReport'
import DailyReport from '../pages/Reports/DailyReport'
import PeriodReport from '../pages/Reports/PeriodReport'
import PluReport from '../pages/Reports/PluReport'
import EjReport from '../pages/Reports/EjReport'
import StockReport from '../pages/Reports/StockReport'
import PurchasesReport from '../pages/Reports/PurchasesReport'
import Notices      from '../pages/Notices/Notices'

function AdminApp() {
  return (
    <ProtectedRoute adminOnly>
      <Routes>
        <Route path="/dashboard" element={<AdminDashboard />} />
        <Route path="/branches"  element={<AdminBranches />} />
        <Route path="/users"     element={<AdminUsers />} />
        <Route path="/tax"       element={<AdminTaxConfig />} />
        <Route path="/tools"     element={<AdminTools />} />
        <Route path="/logs"      element={<AdminActivityLog />} />
        <Route path="/settings"  element={<AdminSettings />} />
        <Route path="*"          element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    </ProtectedRoute>
  )
}

function OperatorApp() {
  return (
    <ProtectedRoute>
      <Routes>
        <Route path="/dashboard"  element={<Dashboard />} />
        <Route path="/items"      element={<Items />} />
        <Route path="/invoice"     element={<Invoice />} />
        <Route path="/invoice/new" element={<NewInvoice />} />
        <Route path="/purchases"  element={<Purchases />} />
        <Route path="/imports"    element={<Imports />} />
        <Route path="/stock"          element={<Stock />} />
        <Route path="/stock/batch"    element={<StockBatch />} />
        <Route path="/stock/count"    element={<StockMaster />} />
        <Route path="/stock/list"     element={<InventoryList />} />
        <Route path="/stock/cash"     element={<CashManagement />} />
        <Route path="/stock/training" element={<TrainingMode />} />
        <Route path="/customers"  element={<Customers />} />
        <Route path="/insurances"   element={<Insurances />} />
        <Route path="/branch-users" element={<BranchUsers />} />
        <Route path="/settings"     element={<Settings />} />
        <Route path="/activity"   element={<Activity />} />
        <Route path="/reports/x"         element={<XReport />} />
        <Route path="/reports/daily"     element={<DailyReport />} />
        <Route path="/reports/period"    element={<PeriodReport />} />
        <Route path="/reports/plu"       element={<PluReport />} />
        <Route path="/reports/ej"        element={<EjReport />} />
        <Route path="/reports/stock"     element={<StockReport />} />
        <Route path="/reports/purchases" element={<PurchasesReport />} />
        <Route path="/reports"           element={<Navigate to="/reports/x" replace />} />
        <Route path="/notices"    element={<Notices />} />
        <Route path="*"           element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </ProtectedRoute>
  )
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"        element={<Landing />} />
        <Route path="/login"   element={<Login />} />
        <Route path="/admin/*" element={<AdminApp />} />
        <Route path="/*"       element={<OperatorApp />} />
      </Routes>
    </BrowserRouter>
  )
}
