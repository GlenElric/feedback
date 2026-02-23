import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(formData.email, formData.password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid credentials. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ padding: '2rem' }}>
      <div className="fade-in" style={{ maxWidth: '380px', width: '100%' }}>

        {/* Logo & back */}
        <div style={{ marginBottom: '2.5rem' }}>
          <Link to="/" style={{
            fontSize: '0.8rem', color: 'var(--gray-500)',
            textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
            transition: 'color 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--white)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--gray-500)'}
          >
            ← Back
          </Link>
        </div>

        <h1 style={{ fontSize: '1.6rem', marginBottom: '0.4rem' }}>Welcome back</h1>
        <p style={{ color: 'var(--gray-500)', fontSize: '0.9rem', marginBottom: '2rem' }}>
          Sign in to your account
        </p>

        {error && (
          <div style={{
            padding: '0.75rem 1rem', marginBottom: '1.5rem',
            border: '1px solid rgba(220,38,38,0.2)',
            borderRadius: 'var(--radius-md)',
            color: '#f87171', fontSize: '0.85rem',
            background: 'rgba(220,38,38,0.05)',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              type="email" id="email" name="email"
              className="form-input"
              value={formData.email} onChange={handleChange}
              required placeholder="you@example.com"
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              type="password" id="password" name="password"
              className="form-input"
              value={formData.password} onChange={handleChange}
              required placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit" className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', marginTop: '0.5rem' }}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--gray-500)', fontSize: '0.85rem', marginBottom: 0 }}>
            Don't have an account?{' '}
            <Link to="/register" style={{
              color: 'var(--gray-200)', textDecoration: 'none',
              borderBottom: '1px solid var(--gray-700)',
              paddingBottom: '1px',
            }}>
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
