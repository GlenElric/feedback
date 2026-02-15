import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div style={{ 
        borderBottom: '1px solid var(--color-border)', 
        padding: '1rem 0',
        marginBottom: '2rem'
      }}>
        <div className="container flex justify-between items-center">
          <h2>Feedback Platform</h2>
          <div className="flex gap-md items-center">
            <span className="text-muted">Welcome, {user?.full_name || user?.email}</span>
            <button onClick={handleLogout} className="btn btn-ghost">
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="container">
        <div style={{ marginBottom: '2rem' }}>
          <h1>Dashboard</h1>
          <p className="text-muted">Manage your feedback forms and view responses</p>
        </div>

        {/* Quick Stats */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '1.5rem',
          marginBottom: '3rem'
        }}>
          <div className="card">
            <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>
              Total Forms
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '600' }}>0</div>
          </div>
          
          <div className="card">
            <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>
              Total Responses
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '600' }}>0</div>
          </div>
          
          <div className="card">
            <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>
              Active Forms
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '600' }}>0</div>
          </div>
        </div>

        {/* Create Form CTA */}
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
          <h3 style={{ marginBottom: '1rem' }}>Create Your First Form</h3>
          <p className="text-muted" style={{ marginBottom: '2rem', maxWidth: '500px', margin: '0 auto 2rem' }}>
            Get started by creating a feedback form. Choose from templates or build your own from scratch.
          </p>
          <button className="btn btn-primary" style={{ fontSize: '1rem', padding: '0.75rem 2rem' }}>
            Create New Form
          </button>
        </div>

        {/* Recent Forms (Empty State) */}
        <div style={{ marginTop: '3rem' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>Recent Forms</h3>
          <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
            <p className="text-muted">No forms yet. Create your first form to get started!</p>
          </div>
        </div>
      </div>
    </div>
  )
}
