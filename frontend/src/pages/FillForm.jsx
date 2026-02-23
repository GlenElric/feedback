import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../utils/api'

function RatingInput({ value, onChange }) {
  const [hover, setHover] = useState(0)
  return (
    <div style={{ display: 'flex', gap: '0.35rem' }}>
      {[1, 2, 3, 4, 5].map(n => (
        <span
          key={n}
          onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          style={{
            fontSize: '2rem',
            cursor: 'pointer',
            transition: 'transform 150ms ease, filter 150ms ease',
            transform: (hover >= n || value >= n) ? 'scale(1.15)' : 'scale(1)',
            filter: (hover >= n || value >= n) ? 'none' : 'grayscale(1) opacity(0.35)',
          }}
        >
          ⭐
        </span>
      ))}
    </div>
  )
}

export default function FillForm() {
  const { formId } = useParams()
  const navigate = useNavigate()

  const [form, setForm] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [answers, setAnswers] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [startTime] = useState(Date.now())

  useEffect(() => {
    fetchForm()
  }, [formId])

  const fetchForm = async () => {
    try {
      const res = await api.get(`/public/forms/${formId}`)
      setForm(res.data)
      // Pre-populate default values
      const defaults = {}
      for (const q of res.data.questions) {
        if (q.question_type === 'yes_no') defaults[q.question_id] = ''
        else if (q.question_type === 'rating') defaults[q.question_id] = 0
        else if (q.question_type === 'multiple_choice') defaults[q.question_id] = ''
        else defaults[q.question_id] = ''
      }
      setAnswers(defaults)
    } catch (err) {
      const detail = err.response?.data?.detail
      setError(typeof detail === 'string' ? detail : 'Form not found or is no longer accepting responses.')
    } finally {
      setLoading(false)
    }
  }

  const updateAnswer = (questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validate required questions
    for (const q of form.questions) {
      const val = answers[q.question_id]
      if (q.is_required) {
        if (val === '' || val === null || val === undefined || (q.question_type === 'rating' && val === 0)) {
          setError(`Please answer the required question: "${q.question_text}"`)
          return
        }
      }
    }

    setSubmitting(true)
    try {
      const completionTime = Math.round((Date.now() - startTime) / 1000)
      const payload = {
        is_anonymous: true,
        completion_time: completionTime,
        answers: form.questions
          .filter(q => {
            const val = answers[q.question_id]
            return val !== '' && val !== null && val !== undefined && !(q.question_type === 'rating' && val === 0)
          })
          .map(q => ({
            question_id: q.question_id,
            answer_value: answers[q.question_id],
          })),
      }
      await api.post(`/public/forms/${formId}/responses`, payload)
      setSubmitted(true)
    } catch (err) {
      const detail = err.response?.data?.detail
      setError(typeof detail === 'string' ? detail : 'Failed to submit. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // ─── Loading state ───
  if (loading) {
    return (
      <div className="min-h-screen" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="skeleton" style={{ width: '300px', height: '32px', margin: '0 auto 1rem' }}></div>
          <div className="skeleton" style={{ width: '200px', height: '18px', margin: '0 auto' }}></div>
        </div>
      </div>
    )
  }

  // ─── Error state ───
  if (!form && error) {
    return (
      <div className="min-h-screen" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="card" style={{ textAlign: 'center', padding: '3rem', maxWidth: '500px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚫</div>
          <h3 style={{ marginBottom: '1rem' }}>Form Unavailable</h3>
          <p className="text-muted">{error}</p>
        </div>
      </div>
    )
  }

  // ─── Success state ───
  if (submitted) {
    return (
      <div className="min-h-screen" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="card fade-in" style={{ textAlign: 'center', padding: '3rem', maxWidth: '520px' }}>
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--color-success), hsl(142, 71%, 55%))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.5rem', fontSize: '2.5rem',
          }}>
            ✓
          </div>
          <h2 style={{ marginBottom: '0.75rem' }}>Thank You!</h2>
          <p className="text-muted" style={{ marginBottom: '2rem', fontSize: '1.05rem' }}>
            Your feedback has been submitted successfully. We really appreciate you taking the time!
          </p>
          <button className="btn btn-primary" onClick={() => window.location.reload()}>
            Submit Another Response
          </button>
        </div>
      </div>
    )
  }

  // ─── Form filling UI ───
  return (
    <div className="min-h-screen" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
      <div className="container" style={{ maxWidth: '700px' }}>
        {/* Form header */}
        <div className="card" style={{
          marginBottom: '1.5rem',
          borderTop: '4px solid var(--color-primary)',
          padding: '2rem',
        }}>
          <h1 style={{ marginBottom: '0.5rem', fontSize: '1.85rem' }}>{form.title}</h1>
          {form.description && (
            <p className="text-muted" style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>{form.description}</p>
          )}
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-tertiary)', marginBottom: 0 }}>
            Fields marked with <span style={{ color: 'var(--color-error)' }}>*</span> are required
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Questions */}
          {form.questions
            .sort((a, b) => a.order_index - b.order_index)
            .map((q, idx) => (
              <div key={q.question_id} className="card fade-in" style={{
                marginBottom: '1rem', padding: '1.5rem',
                animationDelay: `${idx * 60}ms`,
              }}>
                <label style={{
                  display: 'block', fontWeight: '500', marginBottom: '1rem',
                  fontSize: '1rem', lineHeight: '1.5',
                }}>
                  {q.question_text}
                  {q.is_required && <span style={{ color: 'var(--color-error)', marginLeft: '4px' }}>*</span>}
                </label>

                {/* ── Short text ── */}
                {(q.question_type === 'text') && (
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Your answer..."
                    value={answers[q.question_id] || ''}
                    onChange={e => updateAnswer(q.question_id, e.target.value)}
                  />
                )}

                {/* ── Long text ── */}
                {(q.question_type === 'textarea') && (
                  <textarea
                    className="form-input"
                    placeholder="Your answer..."
                    rows={4}
                    style={{ resize: 'vertical' }}
                    value={answers[q.question_id] || ''}
                    onChange={e => updateAnswer(q.question_id, e.target.value)}
                  />
                )}

                {/* ── Rating ── */}
                {q.question_type === 'rating' && (
                  <RatingInput
                    value={answers[q.question_id] || 0}
                    onChange={val => updateAnswer(q.question_id, val)}
                  />
                )}

                {/* ── Yes / No ── */}
                {q.question_type === 'yes_no' && (
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    {['Yes', 'No'].map(opt => (
                      <label key={opt} style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        cursor: 'pointer', padding: '0.6rem 1.2rem',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid',
                        borderColor: answers[q.question_id] === opt ? 'var(--color-primary)' : 'var(--color-border)',
                        background: answers[q.question_id] === opt ? 'rgba(99,102,241,0.1)' : 'transparent',
                        transition: 'all 150ms ease',
                      }}>
                        <input
                          type="radio"
                          name={`q_${q.question_id}`}
                          value={opt}
                          checked={answers[q.question_id] === opt}
                          onChange={() => updateAnswer(q.question_id, opt)}
                          style={{ accentColor: 'var(--color-primary)' }}
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                )}

                {/* ── Multiple choice ── */}
                {q.question_type === 'multiple_choice' && q.options && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {q.options.map((opt, i) => (
                      <label key={i} style={{
                        display: 'flex', alignItems: 'center', gap: '0.6rem',
                        cursor: 'pointer', padding: '0.6rem 1rem',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid',
                        borderColor: answers[q.question_id] === opt ? 'var(--color-primary)' : 'var(--color-border)',
                        background: answers[q.question_id] === opt ? 'rgba(99,102,241,0.1)' : 'transparent',
                        transition: 'all 150ms ease',
                      }}>
                        <input
                          type="radio"
                          name={`q_${q.question_id}`}
                          value={opt}
                          checked={answers[q.question_id] === opt}
                          onChange={() => updateAnswer(q.question_id, opt)}
                          style={{ accentColor: 'var(--color-primary)' }}
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                )}

                {/* ── Dropdown ── */}
                {q.question_type === 'dropdown' && q.options && (
                  <select
                    className="form-input"
                    value={answers[q.question_id] || ''}
                    onChange={e => updateAnswer(q.question_id, e.target.value)}
                  >
                    <option value="">Select an option...</option>
                    {q.options.map((opt, i) => (
                      <option key={i} value={opt}>{opt}</option>
                    ))}
                  </select>
                )}
              </div>
            ))
          }

          {/* Error */}
          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.1)', border: '1px solid var(--color-error)',
              borderRadius: 'var(--radius-md)', padding: '0.85rem 1rem',
              color: 'var(--color-error)', marginBottom: '1rem', fontSize: '0.9rem',
            }}>
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
            style={{ fontSize: '1rem', padding: '0.85rem 2.5rem' }}
          >
            {submitting ? 'Submitting...' : 'Submit'}
          </button>
        </form>
      </div>
    </div>
  )
}
