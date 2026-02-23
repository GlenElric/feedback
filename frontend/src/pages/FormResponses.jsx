import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, ResponsiveContainer,
} from 'recharts'
import api from '../utils/api'

const MONO_COLORS = [
  '#e5e5e5', '#a3a3a3', '#737373', '#525252', '#404040',
  '#d4d4d4', '#8a8a8a', '#606060',
]

function StatCard({ label, value, sub }) {
  return (
    <div style={{ background: 'var(--color-bg)', padding: '1.5rem', textAlign: 'center' }}>
      <div style={{
        fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase',
        letterSpacing: '0.08em', color: 'var(--gray-500)', marginBottom: '0.35rem',
      }}>{label}</div>
      <div className="mono" style={{ fontSize: '1.75rem', fontWeight: 500, color: 'var(--gray-100)' }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: '0.7rem', color: 'var(--gray-600)', marginTop: '0.2rem' }}>{sub}</div>}
    </div>
  )
}

function RatingChart({ question }) {
  const data = [1, 2, 3, 4, 5].map(n => ({
    rating: `${n}`,
    count: question.distribution?.[n] || question.distribution?.[String(n)] || 0,
  }))

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '1.25rem' }}>
        <span className="mono" style={{ fontSize: '2rem', fontWeight: 600, color: 'var(--gray-100)' }}>
          {question.average || 0}
        </span>
        <span style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>
          / 5 avg • {question.total_answers} response{question.total_answers !== 1 ? 's' : ''}
        </span>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
          <XAxis dataKey="rating" tick={{ fill: 'var(--gray-500)', fontSize: 12 }} axisLine={{ stroke: 'var(--color-border)' }} tickLine={false} />
          <YAxis allowDecimals={false} tick={{ fill: 'var(--gray-600)', fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{
              background: 'var(--gray-900)', border: '1px solid var(--color-border)',
              borderRadius: '6px', color: 'var(--gray-200)', fontSize: '0.8rem',
            }}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]} fill="var(--gray-300)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

function DistributionChart({ question }) {
  const dist = question.distribution || {}
  const data = Object.entries(dist).map(([name, value]) => ({ name, value }))

  if (data.length === 0) {
    return <p style={{ fontSize: '0.85rem', color: 'var(--gray-600)' }}>No responses yet</p>
  }

  const total = data.reduce((s, d) => s + d.value, 0)

  return (
    <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'center' }}>
      <ResponsiveContainer width={180} height={180}>
        <PieChart>
          <Pie
            data={data} cx="50%" cy="50%"
            innerRadius={45} outerRadius={80}
            paddingAngle={2} dataKey="value" stroke="none"
          >
            {data.map((_, i) => <Cell key={i} fill={MONO_COLORS[i % MONO_COLORS.length]} />)}
          </Pie>
          <Tooltip
            contentStyle={{
              background: 'var(--gray-900)', border: '1px solid var(--color-border)',
              borderRadius: '6px', color: 'var(--gray-200)', fontSize: '0.8rem',
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1, minWidth: '140px' }}>
        {data.map((d, i) => (
          <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: '10px', height: '10px', borderRadius: '2px',
              background: MONO_COLORS[i % MONO_COLORS.length], flexShrink: 0,
            }} />
            <span style={{ flex: 1, fontSize: '0.85rem', color: 'var(--gray-300)' }}>{d.name}</span>
            <span className="mono" style={{ fontSize: '0.8rem', fontWeight: 500 }}>{d.value}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--gray-600)', minWidth: '35px', textAlign: 'right' }}>
              {total > 0 ? Math.round((d.value / total) * 100) : 0}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function TextResponses({ question }) {
  const responses = question.responses || []
  const [showAll, setShowAll] = useState(false)
  const visible = showAll ? responses : responses.slice(0, 5)

  if (responses.length === 0) {
    return <p style={{ fontSize: '0.85rem', color: 'var(--gray-600)' }}>No responses yet</p>
  }

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        {visible.map((text, i) => (
          <div key={i} style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: '0.65rem 0.85rem',
            fontSize: '0.85rem', lineHeight: 1.6, color: 'var(--gray-300)',
          }}>
            {typeof text === 'string' ? text : JSON.stringify(text)}
          </div>
        ))}
      </div>
      {responses.length > 5 && (
        <button className="btn btn-ghost btn-sm"
          style={{ marginTop: '0.5rem', color: 'var(--gray-400)' }}
          onClick={() => setShowAll(!showAll)}
        >
          {showAll ? 'Show less' : `Show all ${responses.length}`}
        </button>
      )}
    </div>
  )
}

function QuestionAnalytics({ question, index }) {
  const typeLabels = {
    rating: 'Rating', multiple_choice: 'Multiple Choice',
    yes_no: 'Yes / No', dropdown: 'Dropdown',
    text: 'Short Text', textarea: 'Long Text',
  }

  return (
    <div className="fade-in" style={{
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-lg)',
      padding: '1.5rem',
      animationDelay: `${index * 60}ms`,
      transition: 'border-color 0.2s',
    }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-border-heavy)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--color-border)'}
    >
      <div style={{ marginBottom: '1.25rem' }}>
        <h4 style={{ marginBottom: '0.2rem', fontSize: '0.95rem' }}>{question.question_text}</h4>
        <span style={{ fontSize: '0.7rem', color: 'var(--gray-600)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {typeLabels[question.question_type] || question.question_type} • {question.total_answers} answer{question.total_answers !== 1 ? 's' : ''}
        </span>
      </div>

      {question.question_type === 'rating' && <RatingChart question={question} />}
      {['multiple_choice', 'yes_no', 'dropdown'].includes(question.question_type) && <DistributionChart question={question} />}
      {['text', 'textarea'].includes(question.question_type) && <TextResponses question={question} />}
    </div>
  )
}


export default function FormResponses() {
  const { formId } = useParams()
  const navigate = useNavigate()

  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => { fetchAnalytics() }, [formId])

  const fetchAnalytics = async () => {
    try {
      const res = await api.get(`/forms/${formId}/analytics`)
      setAnalytics(res.data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load analytics.')
    } finally { setLoading(false) }
  }

  const formatTime = (s) => {
    if (!s) return '—'
    if (s < 60) return `${s}s`
    return `${Math.floor(s / 60)}m ${s % 60}s`
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div style={{ textAlign: 'center' }}>
          <div className="skeleton" style={{ width: '200px', height: '20px', margin: '0 auto 0.75rem' }}></div>
          <div className="skeleton" style={{ width: '140px', height: '14px', margin: '0 auto' }}></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="fade-in" style={{ textAlign: 'center', maxWidth: '400px', padding: '2rem' }}>
          <h2 style={{ marginBottom: '0.75rem' }}>Error</h2>
          <p style={{ color: 'var(--gray-500)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>{error}</p>
          <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>Dashboard</button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header style={{ borderBottom: '1px solid var(--color-border)', padding: '0.85rem 0' }}>
        <div className="container flex justify-between items-center">
          <span style={{ fontSize: '0.95rem', fontWeight: 600, letterSpacing: '-0.03em' }}>
            feedback<span style={{ color: 'var(--gray-600)' }}>.</span>
          </span>
          <button onClick={() => navigate('/dashboard')} className="btn btn-ghost btn-sm">
            ← Dashboard
          </button>
        </div>
      </header>

      <div className="container" style={{ maxWidth: '800px', paddingTop: '2.5rem', paddingBottom: '3rem' }}>
        <h1 style={{ marginBottom: '0.3rem' }}>{analytics.form_title}</h1>
        <p style={{ color: 'var(--gray-500)', fontSize: '0.9rem', marginBottom: '2.5rem' }}>
          Response analytics
        </p>

        {/* Stats grid */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1px', background: 'var(--color-border)',
          border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)',
          overflow: 'hidden', marginBottom: '2.5rem',
        }}>
          <StatCard label="Responses" value={analytics.total_responses} />
          <StatCard label="Questions" value={analytics.questions.length} />
          <StatCard label="Avg Time" value={formatTime(analytics.avg_completion_time)} sub="per respondent" />
        </div>

        {/* No responses */}
        {analytics.total_responses === 0 && (
          <div style={{
            textAlign: 'center', padding: '3rem 2rem',
            border: '1px dashed var(--color-border-light)',
            borderRadius: 'var(--radius-lg)',
          }}>
            <p style={{ color: 'var(--gray-400)', marginBottom: '1.5rem' }}>
              No responses yet. Share your form to start collecting feedback.
            </p>
            <button className="btn btn-primary"
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/form/${formId}`)
                alert('Share link copied!')
              }}
            >
              Copy share link
            </button>
          </div>
        )}

        {/* Questions */}
        {analytics.total_responses > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingBottom: '2rem' }}>
            <h6 style={{ marginBottom: '0' }}>Question Breakdown</h6>
            {analytics.questions.map((q, idx) => (
              <QuestionAnalytics key={q.question_id} question={q} index={idx} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
