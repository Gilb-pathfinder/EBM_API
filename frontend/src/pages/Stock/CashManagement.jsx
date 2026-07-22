import { useState, useCallback, useEffect } from 'react'
import AppShell from '../../components/layout/AppShell'
import { operatorApi } from '../../api/operator'
import { logActivity } from '../../hooks/useActivityLog'

const EMPTY_DEPOSIT = { amount: '', reason: 'Opening float' }
const EMPTY_WITHDRAWAL = { amount: '', reason: '' }

export default function CashManagement() {
  const [depositForm,   setDepositForm]   = useState(EMPTY_DEPOSIT)
  const [depositSaving, setDepositSaving] = useState(false)
  const [depositErr,    setDepositErr]    = useState(null)
  const [depositOk,     setDepositOk]     = useState(false)

  const [withdrawalForm,   setWithdrawalForm]   = useState(EMPTY_WITHDRAWAL)
  const [withdrawalSaving, setWithdrawalSaving] = useState(false)
  const [withdrawalErr,    setWithdrawalErr]    = useState(null)
  const [withdrawalOk,     setWithdrawalOk]     = useState(false)

  const [cashList,        setCashList]        = useState([])
  const [cashListLoading, setCashListLoading] = useState(false)
  const [cashListDate,    setCashListDate]    = useState(new Date().toISOString().slice(0, 10))

  const loadCashList = useCallback(async () => {
    setCashListLoading(true)
    try {
      const res = await operatorApi.cashList(cashListDate)
      setCashList(Array.isArray(res) ? res : res?.data ?? [])
    } catch { setCashList([]) }
    finally { setCashListLoading(false) }
  }, [cashListDate])

  useEffect(() => { loadCashList() }, [loadCashList])

  async function handleDeposit(e) {
    e.preventDefault(); setDepositErr(null); setDepositSaving(true); setDepositOk(false)
    try {
      await operatorApi.deposit({ amount: Number(depositForm.amount), description: depositForm.reason || undefined })
      logActivity({ action: 'CASH_DEPOSIT', category: 'System', summary: `Opening deposit of ${Number(depositForm.amount).toLocaleString()} RWF` })
      setDepositOk(true); setDepositForm(EMPTY_DEPOSIT); loadCashList()
      setTimeout(() => setDepositOk(false), 5000)
    } catch (err) { setDepositErr(err.data?.errors?.[0]?.message || err.message) }
    finally { setDepositSaving(false) }
  }

  async function handleWithdrawal(e) {
    e.preventDefault(); setWithdrawalErr(null); setWithdrawalSaving(true); setWithdrawalOk(false)
    try {
      await operatorApi.withdrawal({ amount: Number(withdrawalForm.amount), description: withdrawalForm.reason || undefined })
      logActivity({ action: 'CASH_WITHDRAWAL', category: 'System', summary: `Withdrawal of ${Number(withdrawalForm.amount).toLocaleString()} RWF` })
      setWithdrawalOk(true); setWithdrawalForm(EMPTY_WITHDRAWAL); loadCashList()
      setTimeout(() => setWithdrawalOk(false), 5000)
    } catch (err) { setWithdrawalErr(err.data?.errors?.[0]?.message || err.message) }
    finally { setWithdrawalSaving(false) }
  }

  return (
    <AppShell>
      <div className="page">
        <div className="page-head">
          <div>
            <div className="crumbs"><span>Workspace</span><span>›</span><span>Finance</span></div>
            <h1>Cash Management</h1>
          </div>
        </div>

        <div className="kpi-grid">
           <div className="kpi">
              <div className="kpi__label">Cash Flow Total</div>
              <div className="kpi__value">{cashList.reduce((acc, curr) => acc + Number(curr.amount), 0).toLocaleString()} RWF</div>
              <span className="kpi__sub">Total movements for today</span>
           </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
          <div className="card">
            <div className="card__head"><h3>Opening Deposit</h3></div>
            <div className="card__body">
              {depositErr && <div className="settings-error" style={{ marginBottom: 16 }}>{depositErr}</div>}
              {depositOk  && <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: 12, color: 'var(--ok)', marginBottom: 16 }}>✓ Registered successfully</div>}
              <form onSubmit={handleDeposit}>
                 <div className="form-group">
                   <label className="form-label">Amount (RWF)</label>
                   <input className="form-input mono" type="number" required value={depositForm.amount} onChange={e => setDepositForm({...depositForm, amount: e.target.value})} />
                 </div>
                 <div className="form-group">
                   <label className="form-label">Description</label>
                   <input className="form-input" value={depositForm.reason} onChange={e => setDepositForm({...depositForm, reason: e.target.value})} />
                 </div>
                 <button type="submit" className="btn btn--primary btn--block" disabled={depositSaving}>{depositSaving ? 'Registering...' : 'Register Deposit'}</button>
              </form>
            </div>
          </div>

          <div className="card">
            <div className="card__head"><h3>Cash Withdrawal</h3></div>
            <div className="card__body">
              {withdrawalErr && <div className="settings-error" style={{ marginBottom: 16 }}>{withdrawalErr}</div>}
              {withdrawalOk  && <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: 12, color: 'var(--ok)', marginBottom: 16 }}>✓ Registered successfully</div>}
              <form onSubmit={handleWithdrawal}>
                 <div className="form-group">
                   <label className="form-label">Amount (RWF)</label>
                   <input className="form-input mono" type="number" required value={withdrawalForm.amount} onChange={e => setWithdrawalForm({...withdrawalForm, amount: e.target.value})} />
                 </div>
                 <div className="form-group">
                   <label className="form-label">Description</label>
                   <input className="form-input" value={withdrawalForm.reason} onChange={e => setWithdrawalForm({...withdrawalForm, reason: e.target.value})} />
                 </div>
                 <button type="submit" className="btn btn--primary btn--block" disabled={withdrawalSaving}>{withdrawalSaving ? 'Registering...' : 'Register Withdrawal'}</button>
              </form>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card__head">
            <h3>Recent Movements</h3>
            <input type="date" className="form-input form-input--sm" style={{ width: 140 }} value={cashListDate} onChange={e => setCashListDate(e.target.value)} />
          </div>
          <div className="table-wrap">
            {cashList.length === 0 ? (
               <div style={{ padding: 60, textAlign: 'center', color: 'var(--ink-400)' }}>No movements found for this date.</div>
            ) : (
              <table className="data">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th className="num">Amount (RWF)</th>
                    <th>Description</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {cashList.map((m, i) => (
                    <tr key={i}>
                      <td><span className={`chip ${m.movementType === 'DEPOSIT' ? 'chip--ok' : 'chip--warn'}`}>{m.movementType}</span></td>
                      <td className="num" style={{ fontWeight: 700 }}>{Number(m.amount || 0).toLocaleString()}</td>
                      <td>{m.description || '—'}</td>
                      <td className="mono" style={{ fontSize: 12 }}>{new Date(m.createdAt).toLocaleTimeString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
