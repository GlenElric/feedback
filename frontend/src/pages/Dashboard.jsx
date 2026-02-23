import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [forms, setForms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [copiedId, setCopiedId] = useState(null)

  useEffect(() => {
    fetchForms()
  }, [])

  const fetchForms = async () => {
    try {
      const response = await api.get('/forms/')
      setForms(response.data)
    } catch (err) {
      console.error('Failed to fetch forms:', err)
      setError('Failed to load forms.')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleDeleteForm = async (formId) => {
    if (!window.confirm('Are you sure you want to delete this form? This cannot be undone.')) return
    try {
      await api.delete(`/forms/${formId}`)
      setForms(prev => prev.filter(f => f.form_id !== formId))
    } catch (err) {
      alert('Failed to delete form.')
    }
  }

  const handleToggleActive = async (form) => {
    try {
      await api.put(`/forms/${form.form_id}`, { is_active: !form.is_active })
      setForms(prev => prev.map(f => f.form_id === form.form_id ? { ...f, is_active: !f.is_active } : f))
    } catch (err) {
      alert('Failed to update form status.')
    }
  }

  // Stats
  const totalForms = forms.length
  const activeForms = forms.filter(f => f.is_active).length
  const totalResponses = forms.reduce((sum, f) => sum + (f.response_count || 0), 0)

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div style={{
        borderBottom: '1px solid var(--color-border)',
        padding: '1rem 0', marginBottom: '2rem',
      }}>
        <div className="container flex justify-between items-center">
          <h2 style={{ marginBottom: 0 }}>Feedback Platform</h2>
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
        <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1>Dashboard</h1>
            <p className="text-muted" style={{ marginBottom: 0 }}>Manage your feedback forms and view responses</p>
          </div>
          <button
            className="btn btn-primary"
            style={{ fontSize: '1rem', padding: '0.75rem 1.75rem' }}
            onClick={() => navigate('/create-form')}
          >
            + Create New Form
          </button>
        </div>

        {/* Quick Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.5rem',
          marginBottom: '3rem',
        }}>
          <div className="card">
            <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>
              Total Forms
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '600' }}>{totalForms}</div>
          </div>
          <div className="card">
            <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>
              Total Responses
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '600' }}>{totalResponses}</div>
          </div>
          <div className="card">
            <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>
              Active Forms
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '600' }}>{activeForms}</div>
          </div>
        </div>

        {/* Loading / Error */}
        {loading && (
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <div className="skeleton" style={{ width: '200px', height: '24px', margin: '0 auto 1rem' }}></div>
            <div className="skeleton" style={{ width: '300px', height: '16px', margin: '0 auto' }}></div>
          </div>
        )}

        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.1)', border: '1px solid var(--color-error)',
            borderRadius: 'var(--radius-md)', padding: '0.85rem 1rem',
            color: 'var(--color-error)', marginBottom: '1.5rem', fontSize: '0.9rem',
          }}>
            {error}
          </div>
        )}

        {/* Empty state */}
        {!loading && forms.length === 0 && (
          <div className="card fade-in" style={{ textAlign: 'center', padding: '3rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
            <h3 style={{ marginBottom: '1rem' }}>Create Your First Form</h3>
            <p className="text-muted" style={{ marginBottom: '2rem', maxWidth: '500px', margin: '0 auto 2rem' }}>
              Get started by creating a feedback form. Choose from templates or build your own from scratch.
            </p>
            <button
              className="btn btn-primary"
              style={{ fontSize: '1rem', padding: '0.75rem 2rem' }}
              onClick={() => navigate('/create-form')}
            >
              Create New Form
            </button>
          </div>
        )}

        {/* Forms list */}
        {!loading && forms.length > 0 && (
          <div style={{ marginTop: '0.5rem' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>Your Forms</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {forms.map(form => (
                <div
                  key={form.form_id}
                  className="card fade-in"
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}
                >
                  <div style={{ flex: '1 1 300px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
                      <h4 style={{ marginBottom: 0 }}>{form.title}</h4>
                      <span style={{
                        fontSize: '0.7rem', fontWeight: '600', textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        padding: '3px 10px', borderRadius: '12px',
                        background: form.is_active
                          ? 'rgba(34,197,94,0.15)'
                          : 'rgba(239,68,68,0.15)',
                        color: form.is_active
                          ? 'var(--color-success)'
                          : 'var(--color-error)',
                      }}>
                        {form.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    {form.description && (
                      <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                        {form.description}
                      </p>
                    )}
                    <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.8rem', color: 'var(--color-text-tertiary)' }}>
                      <span>{form.question_count || 0} questions</span>
                      <span>{form.response_count || 0} responses</span>
                      <span>Created {new Date(form.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0, flexWrap: 'wrap' }}>
                    <button
                      className="btn btn-primary"
                      style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
                      onClick={() => {
                        const link = `${window.location.origin}/form/${form.form_id}`
                        navigator.clipboard.writeText(link).then(() => {
                          setCopiedId(form.form_id)
                          setTimeout(() => setCopiedId(null), 2000)
                        })
                      }}
                    >
                      {copiedId === form.form_id ? '✓ Copied!' : '🔗 Share'}
                    </button>
                    <button
                      className="btn btn-ghost"
                      style={{ fontSize: '0.85rem' }}
                      onClick={() => handleToggleActive(form)}
                      title={form.is_active ? 'Deactivate form' : 'Activate form'}
                    >
                      {form.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      className="btn btn-ghost"
                      style={{ fontSize: '0.85rem', color: 'var(--color-error)' }}
                      onClick={() => handleDeleteForm(form.form_id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
