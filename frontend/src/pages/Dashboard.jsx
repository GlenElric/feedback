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

  useEffect(() => { fetchForms() }, [])

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

  const handleLogout = () => { logout(); navigate('/login') }

  const handleDeleteForm = async (formId) => {
    if (!window.confirm('Delete this form and all its responses? This cannot be undone.')) return
    try {
      await api.delete(`/forms/${formId}`)
      setForms(prev => prev.filter(f => f.form_id !== formId))
    } catch { alert('Failed to delete form.') }
  }

  const handleToggleActive = async (form) => {
    try {
      await api.put(`/forms/${form.form_id}`, { is_active: !form.is_active })
      setForms(prev => prev.map(f => f.form_id === form.form_id ? { ...f, is_active: !f.is_active } : f))
    } catch { alert('Failed to update form status.') }
  }

  const handleShare = (formId) => {
    const link = `${window.location.origin}/form/${formId}`
    navigator.clipboard.writeText(link).then(() => {
      setCopiedId(formId)
      setTimeout(() => setCopiedId(null), 2000)
    })
  }

  const totalForms = forms.length
  const activeForms = forms.filter(f => f.is_active).length
  const totalResponses = forms.reduce((sum, f) => sum + (f.response_count || 0), 0)

  return (
    <div className="min-h-screen">
      {/* ── Header ── */}
      <header style={{
        borderBottom: '1px solid var(--color-border)',
        padding: '0.85rem 0',
      }}>
        <div className="container flex justify-between items-center">
          <span style={{ fontSize: '0.95rem', fontWeight: 600, letterSpacing: '-0.03em' }}>
            feedback<span style={{ color: 'var(--gray-600)' }}>.</span>
          </span>
          <div className="flex gap-sm items-center">
            <span style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>
              {user?.full_name || user?.email}
            </span>
            <button onClick={handleLogout} className="btn btn-ghost btn-sm">Logout</button>
          </div>
        </div>
      </header>

      <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '3rem' }}>
        {/* ── Title row ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2.5rem' }}>
          <div>
            <h1 style={{ marginBottom: '0.3rem' }}>Dashboard</h1>
            <p style={{ color: 'var(--gray-500)', fontSize: '0.9rem', marginBottom: 0 }}>
              Manage your forms and view responses
            </p>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/create-form')}
          >
            + New form
          </button>
        </div>

        {/* ── Stats ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1px',
          background: 'var(--color-border)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          marginBottom: '2.5rem',
        }}>
          {[
            { label: 'Total Forms', value: totalForms },
            { label: 'Responses', value: totalResponses },
            { label: 'Active', value: activeForms },
          ].map((s, i) => (
            <div key={i} style={{ background: 'var(--color-bg)', padding: '1.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--gray-500)', marginBottom: '0.3rem' }}>
                {s.label}
              </div>
              <div className="mono" style={{ fontSize: '1.75rem', fontWeight: 500, color: 'var(--gray-100)' }}>
                {s.value}
              </div>
            </div>
          ))}
        </div>

        {/* ── Loading ── */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <div className="skeleton" style={{ width: '200px', height: '20px', margin: '0 auto 0.75rem' }}></div>
            <div className="skeleton" style={{ width: '140px', height: '14px', margin: '0 auto' }}></div>
          </div>
        )}

        {/* ── Error ── */}
        {error && (
          <div style={{
            padding: '0.75rem 1rem',
            border: '1px solid rgba(220,38,38,0.2)',
            borderRadius: 'var(--radius-md)',
            color: '#f87171', fontSize: '0.85rem',
            background: 'rgba(220,38,38,0.05)',
            marginBottom: '1.5rem',
          }}>
            {error}
          </div>
        )}

        {/* ── Empty state ── */}
        {!loading && forms.length === 0 && (
          <div className="fade-in" style={{
            textAlign: 'center', padding: '4rem 2rem',
            border: '1px dashed var(--color-border-light)',
            borderRadius: 'var(--radius-lg)',
          }}>
            <p style={{ fontSize: '0.95rem', color: 'var(--gray-400)', marginBottom: '1.5rem' }}>
              No forms yet. Create your first one to start collecting feedback.
            </p>
            <button
              className="btn btn-primary"
              onClick={() => navigate('/create-form')}
            >
              + Create form
            </button>
          </div>
        )}

        {/* ── Forms list ── */}
        {!loading && forms.length > 0 && (
          <div>
            <h6 style={{ marginBottom: '1rem' }}>Your Forms</h6>
            <div style={{
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
            }}>
              {forms.map((form, idx) => (
                <div
                  key={form.form_id}
                  className="fade-in"
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '1.25rem 1.5rem',
                    borderTop: idx > 0 ? '1px solid var(--color-border)' : 'none',
                    flexWrap: 'wrap', gap: '1rem',
                    transition: 'background 0.15s ease',
                    animationDelay: `${idx * 40}ms`,
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  {/* Left */}
                  <div style={{ flex: '1 1 280px', minWidth: 0 }}>
                    <div className="flex items-center gap-sm" style={{ marginBottom: '0.25rem' }}>
                      <h4 style={{ marginBottom: 0, fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {form.title}
                      </h4>
                      <span className={`badge ${form.is_active ? 'badge-active' : 'badge-inactive'}`}>
                        {form.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    {form.description && (
                      <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', marginBottom: '0.3rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {form.description}
                      </p>
                    )}
                    <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.75rem', color: 'var(--gray-600)' }}>
                      <span>{form.question_count || 0} questions</span>
                      <span>{form.response_count || 0} responses</span>
                      <span>{new Date(form.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Right – actions */}
                  <div className="flex gap-xs" style={{ flexShrink: 0 }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => handleShare(form.form_id)}>
                      {copiedId === form.form_id ? '✓ Copied' : 'Share'}
                    </button>
                    <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/forms/${form.form_id}/responses`)}>
                      Results
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={() => handleToggleActive(form)}>
                      {form.is_active ? 'Pause' : 'Resume'}
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDeleteForm(form.form_id)}>
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
