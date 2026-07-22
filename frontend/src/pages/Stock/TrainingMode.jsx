import { useState } from 'react'
import AppShell from '../../components/layout/AppShell'
import { operatorApi } from '../../api/operator'
import { logActivity } from '../../hooks/useActivityLog'
import { useApp } from '../../context/AppContext'

export default function TrainingMode() {
  const { rawUser, refreshUser } = useApp()
  const [trainingStatus, setTrainingStatus] = useState(null)
  const [trainingLoading, setTrainingLoading] = useState(false)

  // Resolve current mode: use toggle result if available, otherwise read from live user profile
  const currentlyTraining = trainingStatus ? trainingStatus.isTrainingMode : (rawUser?.isTrainingMode || false)

  async function handleToggleTraining() {
    setTrainingLoading(true)
    try {
      const res = await operatorApi.toggleTraining()
      setTrainingStatus(res)
      await refreshUser()
      logActivity({ action: 'TOGGLE_TRAINING', category: 'System', summary: `Training mode ${res.isTrainingMode ? 'activated' : 'deactivated'}` })
    } catch (err) { alert(err.message) }
    finally { setTrainingLoading(false) }
  }

  return (
    <AppShell>
      <div className="page">
        <div className="page-head">
          <div>
            <div className="crumbs"><span>Workspace</span><span>›</span><span>System</span></div>
            <h1>Training Mode</h1>
          </div>
        </div>

        <div className="card" style={{ maxWidth: 640 }}>
           <div className="card__head"><h3>Simulator Controls</h3></div>
           <div className="card__body" style={{ padding: 32 }}>
              <div style={{ marginBottom: 24, padding: 20, borderRadius: 12, background: currentlyTraining ? '#fef3c7' : '#f0fdf4', border: `1px solid ${currentlyTraining ? '#fde68a' : '#bbf7d0'}` }}>
                <div style={{ fontWeight: 800, fontSize: 18, color: currentlyTraining ? '#92400e' : 'var(--ok)' }}>
                  {currentlyTraining ? 'Simulator Active' : 'Live Mode Active'}
                </div>
                {trainingStatus?.message && (
                  <div style={{ fontSize: 14, marginTop: 4, color: 'var(--ink-600)' }}>{trainingStatus.message}</div>
                )}
              </div>

              <div style={{ marginBottom: 32 }}>
                 <h4 style={{ marginBottom: 12 }}>What is Training Mode?</h4>
                 <ul style={{ color: 'var(--ink-600)', fontSize: 14, lineHeight: 1.6 }}>
                    <li>Issue **TS (Training Sales)** receipts that have no tax impact.</li>
                    <li>Test your integration without affecting your real RRA turnover.</li>
                    <li>Training data is kept separate from live fiscal data.</li>
                 </ul>
              </div>

              <button className={`btn btn--lg ${currentlyTraining ? 'btn--danger' : 'btn--primary'} btn--block`}
                onClick={handleToggleTraining} disabled={trainingLoading}>
                 {trainingLoading ? 'Toggling Simulator...' : currentlyTraining ? 'Disable Training Mode' : 'Enable Training Mode'}
              </button>
           </div>
        </div>
      </div>
    </AppShell>
  )
}
