import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'

const QUESTION_TYPES = [
  { value: 'text',            label: 'Short Text' },
  { value: 'textarea',        label: 'Long Text' },
  { value: 'multiple_choice', label: 'Multiple Choice' },
  { value: 'rating',          label: 'Rating (1–5)' },
  { value: 'yes_no',          label: 'Yes / No' },
  { value: 'dropdown',        label: 'Dropdown' },
]

function QuestionCard({ question, index, onUpdate, onRemove, totalCount }) {
  const handleOptionChange = (optIdx, value) => {
    const newOptions = [...(question.options || [])]
    newOptions[optIdx] = value
    onUpdate({ ...question, options: newOptions })
  }

  const addOption = () => {
    const newOptions = [...(question.options || []), `Option ${(question.options?.length || 0) + 1}`]
    onUpdate({ ...question, options: newOptions })
  }

  const removeOption = (optIdx) => {
    const newOptions = (question.options || []).filter((_, i) => i !== optIdx)
    onUpdate({ ...question, options: newOptions })
  }

  const needsOptions = ['multiple_choice', 'dropdown'].includes(question.question_type)

  return (
    <div className="fade-in" style={{
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-lg)',
      padding: '1.5rem',
      position: 'relative',
      transition: 'border-color 0.2s ease',
      animationDelay: `${index * 50}ms`,
    }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-border-heavy)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--color-border)'}
    >
      {/* Number */}
      <span className="mono" style={{
        position: 'absolute', top: '-10px', left: '16px',
        background: 'var(--color-bg)',
        padding: '0 8px',
        fontSize: '0.7rem', color: 'var(--gray-500)',
        fontWeight: 600,
      }}>
        {String(index + 1).padStart(2, '0')}
      </span>

      {/* Question text */}
      <div className="form-group">
        <input
          type="text"
          className="form-input"
          placeholder="Enter your question…"
          value={question.question_text}
          onChange={e => onUpdate({ ...question, question_text: e.target.value })}
          style={{ fontSize: '0.95rem', fontWeight: 500 }}
        />
      </div>

      {/* Type + Required */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem', alignItems: 'center' }}>
        <div style={{ flex: '1 1 180px' }}>
          <select
            className="form-input"
            value={question.question_type}
            onChange={e => {
              const newType = e.target.value
              const opts = ['multiple_choice', 'dropdown'].includes(newType)
                ? (question.options?.length ? question.options : ['Option 1', 'Option 2'])
                : null
              onUpdate({ ...question, question_type: newType, options: opts })
            }}
            style={{ fontSize: '0.85rem' }}
          >
            {QUESTION_TYPES.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        <label style={{
          display: 'flex', alignItems: 'center', gap: '0.4rem',
          cursor: 'pointer', color: 'var(--gray-400)', fontSize: '0.85rem',
          userSelect: 'none',
        }}>
          <input
            type="checkbox"
            checked={question.is_required}
            onChange={e => onUpdate({ ...question, is_required: e.target.checked })}
            style={{ accentColor: 'var(--white)' }}
          />
          Required
        </label>
      </div>

      {/* Options editor */}
      {needsOptions && (
        <div style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem', marginBottom: '1rem',
        }}>
          <label className="form-label" style={{ marginBottom: '0.6rem' }}>Options</label>
          {(question.options || []).map((opt, optIdx) => (
            <div key={optIdx} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.4rem', alignItems: 'center' }}>
              <span className="mono" style={{ color: 'var(--gray-600)', fontSize: '0.75rem', minWidth: '18px' }}>
                {optIdx + 1}
              </span>
              <input
                type="text"
                className="form-input"
                value={opt}
                onChange={e => handleOptionChange(optIdx, e.target.value)}
                style={{ flex: 1 }}
              />
              {(question.options || []).length > 2 && (
                <button
                  type="button" onClick={() => removeOption(optIdx)}
                  className="btn btn-ghost btn-sm"
                  style={{ color: 'var(--gray-500)', padding: '0.3rem 0.5rem' }}
                >×</button>
              )}
            </div>
          ))}
          <button type="button" onClick={addOption}
            className="btn btn-ghost btn-sm"
            style={{ marginTop: '0.25rem', color: 'var(--gray-400)' }}
          >
            + Add option
          </button>
        </div>
      )}

      {/* Rating preview */}
      {question.question_type === 'rating' && (
        <div style={{
          display: 'flex', gap: '0.3rem', padding: '0.75rem 0',
        }}>
          {[1, 2, 3, 4, 5].map(n => (
            <div key={n} style={{
              width: '32px', height: '32px', borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-border-light)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.75rem', color: 'var(--gray-500)',
            }}>
              {n}
            </div>
          ))}
        </div>
      )}

      {/* Remove */}
      {totalCount > 1 && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
          <button type="button" onClick={onRemove}
            className="btn btn-danger btn-sm"
          >
            Remove
          </button>
        </div>
      )}
    </div>
  )
}


export default function CreateForm() {
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    title: '', description: '',
    allow_anonymous: true,
    allow_multiple_submissions: false,
  })

  const [questions, setQuestions] = useState([
    { question_text: '', question_type: 'text', is_required: false, options: null, order_index: 0 },
  ])

  const updateQuestion = (idx, updated) => {
    setQuestions(prev => prev.map((q, i) => i === idx ? { ...updated, order_index: i } : q))
  }
  const removeQuestion = (idx) => {
    setQuestions(prev => prev.filter((_, i) => i !== idx).map((q, i) => ({ ...q, order_index: i })))
  }
  const addQuestion = () => {
    setQuestions(prev => [
      ...prev,
      { question_text: '', question_type: 'text', is_required: false, options: null, order_index: prev.length },
    ])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!formData.title.trim()) { setError('Please enter a form title.'); return }
    const validQuestions = questions.filter(q => q.question_text.trim())
    if (validQuestions.length === 0) { setError('Add at least one question.'); return }

    setSaving(true)
    try {
      await api.post('/forms/', { ...formData, questions: validQuestions })
      navigate('/dashboard')
    } catch (err) {
      const detail = err.response?.data?.detail
      setError(typeof detail === 'string' ? detail : 'Failed to create form.')
    } finally { setSaving(false) }
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

      <div className="container" style={{ maxWidth: '680px', paddingTop: '2.5rem', paddingBottom: '3rem' }}>
        <h1 style={{ marginBottom: '0.3rem' }}>New form</h1>
        <p style={{ color: 'var(--gray-500)', fontSize: '0.9rem', marginBottom: '2.5rem' }}>
          Configure your form and add questions below.
        </p>

        <form onSubmit={handleSubmit}>
          {/* ── Form details ── */}
          <div style={{
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.5rem',
            marginBottom: '2rem',
          }}>
            <h6 style={{ marginBottom: '1.25rem' }}>Details</h6>

            <div className="form-group">
              <label className="form-label">Title *</label>
              <input
                type="text" className="form-input"
                placeholder='e.g. "Workshop Feedback Survey"'
                value={formData.title}
                onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-input"
                placeholder="What is this form about?"
                rows={3} style={{ resize: 'vertical' }}
                value={formData.description}
                onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
              {[
                { key: 'allow_anonymous', label: 'Anonymous responses' },
                { key: 'allow_multiple_submissions', label: 'Multiple submissions' },
              ].map(s => (
                <label key={s.key} style={{
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                  cursor: 'pointer', color: 'var(--gray-400)', fontSize: '0.85rem',
                  userSelect: 'none',
                }}>
                  <input
                    type="checkbox"
                    checked={formData[s.key]}
                    onChange={e => setFormData(prev => ({ ...prev, [s.key]: e.target.checked }))}
                    style={{ accentColor: 'var(--white)' }}
                  />
                  {s.label}
                </label>
              ))}
            </div>
          </div>

          {/* ── Questions ── */}
          <h6 style={{ marginBottom: '1rem' }}>Questions</h6>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '1.25rem' }}>
            {questions.map((q, idx) => (
              <QuestionCard
                key={idx} question={q} index={idx}
                totalCount={questions.length}
                onUpdate={updated => updateQuestion(idx, updated)}
                onRemove={() => removeQuestion(idx)}
              />
            ))}
          </div>

          <button type="button" onClick={addQuestion}
            className="btn btn-secondary"
            style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', marginBottom: '2rem' }}
          >
            + Add question
          </button>

          {/* Error */}
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

          {/* Submit */}
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', paddingBottom: '2rem' }}>
            <button type="button" onClick={() => navigate('/dashboard')} className="btn btn-ghost">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Creating…' : 'Create form'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
