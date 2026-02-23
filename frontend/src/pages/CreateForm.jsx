import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'

const QUESTION_TYPES = [
  { value: 'text', label: 'Short Text', icon: '✏️' },
  { value: 'textarea', label: 'Long Text', icon: '📝' },
  { value: 'multiple_choice', label: 'Multiple Choice', icon: '🔘' },
  { value: 'rating', label: 'Rating (1-5)', icon: '⭐' },
  { value: 'yes_no', label: 'Yes / No', icon: '✅' },
  { value: 'dropdown', label: 'Dropdown', icon: '📋' },
]

function QuestionCard({ question, index, onUpdate, onRemove, totalCount }) {
  const typeInfo = QUESTION_TYPES.find(t => t.value === question.question_type) || QUESTION_TYPES[0]

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
    <div className="card fade-in" style={{ position: 'relative', borderLeft: '3px solid var(--color-primary)' }}>
      {/* Question number badge */}
      <div style={{
        position: 'absolute', top: '-12px', left: '16px',
        background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
        color: 'white', borderRadius: '20px', padding: '2px 14px',
        fontSize: '0.8rem', fontWeight: '600',
      }}>
        Q{index + 1}
      </div>

      <div style={{ marginTop: '8px' }}>
        {/* Question text */}
        <div className="form-group">
          <label className="form-label">Question Text</label>
          <input
            type="text"
            className="form-input"
            placeholder="Enter your question..."
            value={question.question_text}
            onChange={e => onUpdate({ ...question, question_text: e.target.value })}
          />
        </div>

        {/* Type + Required row */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          <div style={{ flex: '1 1 200px' }}>
            <label className="form-label">Answer Type</label>
            <select
              className="form-input"
              value={question.question_type}
              onChange={e => {
                const newType = e.target.value
                const opts = ['multiple_choice', 'dropdown'].includes(newType)
                  ? (question.options && question.options.length ? question.options : ['Option 1', 'Option 2'])
                  : null
                onUpdate({ ...question, question_type: newType, options: opts })
              }}
            >
              {QUESTION_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.icon} {t.label}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.75rem' }}>
            <label style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              cursor: 'pointer', padding: '0.6rem 0',
              color: 'var(--color-text-secondary)', fontSize: '0.9rem',
            }}>
              <input
                type="checkbox"
                checked={question.is_required}
                onChange={e => onUpdate({ ...question, is_required: e.target.checked })}
                style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary)' }}
              />
              Required
            </label>
          </div>
        </div>

        {/* Options editor for multiple choice / dropdown */}
        {needsOptions && (
          <div style={{
            background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)',
            padding: '1rem', marginBottom: '1rem',
          }}>
            <label className="form-label" style={{ marginBottom: '0.75rem' }}>Options</label>
            {(question.options || []).map((opt, optIdx) => (
              <div key={optIdx} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                <span style={{ color: 'var(--color-text-tertiary)', fontSize: '0.85rem', minWidth: '20px' }}>
                  {optIdx + 1}.
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
                    type="button"
                    onClick={() => removeOption(optIdx)}
                    className="btn btn-ghost"
                    style={{ padding: '0.4rem 0.6rem', color: 'var(--color-error)', fontSize: '1.1rem' }}
                    title="Remove option"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={addOption} className="btn btn-ghost" style={{
              marginTop: '0.25rem', fontSize: '0.85rem', color: 'var(--color-primary-light)',
            }}>
              + Add Option
            </button>
          </div>
        )}

        {/* Rating preview */}
        {question.question_type === 'rating' && (
          <div style={{
            background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)',
            padding: '1rem', marginBottom: '1rem', display: 'flex', gap: '0.5rem',
          }}>
            {[1, 2, 3, 4, 5].map(n => (
              <span key={n} style={{
                fontSize: '1.5rem', opacity: 0.5, cursor: 'default',
              }}>⭐</span>
            ))}
          </div>
        )}

        {/* Remove question */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          {totalCount > 1 && (
            <button
              type="button"
              onClick={onRemove}
              className="btn btn-ghost"
              style={{ color: 'var(--color-error)', fontSize: '0.85rem' }}
            >
              Remove Question
            </button>
          )}
        </div>
      </div>
    </div>
  )
}


export default function CreateForm() {
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    title: '',
    description: '',
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

    // Basic validation
    if (!formData.title.trim()) {
      setError('Please enter a form title.')
      return
    }
    const validQuestions = questions.filter(q => q.question_text.trim())
    if (validQuestions.length === 0) {
      setError('Please add at least one question with text.')
      return
    }

    setSaving(true)
    try {
      const payload = {
        ...formData,
        questions: validQuestions,
      }
      await api.post('/forms/', payload)
      navigate('/dashboard')
    } catch (err) {
      const detail = err.response?.data?.detail
      setError(typeof detail === 'string' ? detail : 'Failed to create form. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div style={{
        borderBottom: '1px solid var(--color-border)',
        padding: '1rem 0', marginBottom: '2rem',
      }}>
        <div className="container flex justify-between items-center">
          <h2>Feedback Platform</h2>
          <button onClick={() => navigate('/dashboard')} className="btn btn-ghost">
            ← Back to Dashboard
          </button>
        </div>
      </div>

      <div className="container" style={{ maxWidth: '800px' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1>Create New Form</h1>
          <p className="text-muted">Design your feedback form by adding questions below.</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* ─── Form metadata ─── */}
          <div className="card" style={{ marginBottom: '2rem' }}>
            <h4 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.3rem' }}>📄</span> Form Details
            </h4>

            <div className="form-group">
              <label className="form-label">Title *</label>
              <input
                type="text"
                className="form-input"
                placeholder='e.g. "Event Satisfaction Survey"'
                value={formData.title}
                onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-input"
                placeholder="Briefly describe what this form is about..."
                rows={3}
                style={{ resize: 'vertical' }}
                value={formData.description}
                onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>

            {/* Settings */}
            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
              <label style={{
                display: 'flex', alignItems: 'center', gap: '0.6rem',
                cursor: 'pointer', color: 'var(--color-text-secondary)', fontSize: '0.9rem',
              }}>
                <input
                  type="checkbox"
                  checked={formData.allow_anonymous}
                  onChange={e => setFormData(prev => ({ ...prev, allow_anonymous: e.target.checked }))}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary)' }}
                />
                Allow anonymous responses
              </label>
              <label style={{
                display: 'flex', alignItems: 'center', gap: '0.6rem',
                cursor: 'pointer', color: 'var(--color-text-secondary)', fontSize: '0.9rem',
              }}>
                <input
                  type="checkbox"
                  checked={formData.allow_multiple_submissions}
                  onChange={e => setFormData(prev => ({ ...prev, allow_multiple_submissions: e.target.checked }))}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary)' }}
                />
                Allow multiple submissions
              </label>
            </div>
          </div>

          {/* ─── Questions ─── */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.3rem' }}>❓</span> Questions
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {questions.map((q, idx) => (
                <QuestionCard
                  key={idx}
                  question={q}
                  index={idx}
                  totalCount={questions.length}
                  onUpdate={updated => updateQuestion(idx, updated)}
                  onRemove={() => removeQuestion(idx)}
                />
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={addQuestion}
            className="btn btn-secondary"
            style={{ width: '100%', justifyContent: 'center', padding: '0.9rem', marginBottom: '2rem' }}
          >
            + Add Question
          </button>

          {/* ─── Error message ─── */}
          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.1)', border: '1px solid var(--color-error)',
              borderRadius: 'var(--radius-md)', padding: '0.85rem 1rem',
              color: 'var(--color-error)', marginBottom: '1.5rem', fontSize: '0.9rem',
            }}>
              {error}
            </div>
          )}

          {/* ─── Submit ─── */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', paddingBottom: '3rem' }}>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="btn btn-ghost"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
              style={{ fontSize: '1rem', padding: '0.75rem 2.5rem' }}
            >
              {saving ? 'Creating...' : 'Create Form'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
