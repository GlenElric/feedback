import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import api from '../utils/api'

function RatingInput({ value, onChange }) {
  const [hover, setHover] = useState(0)
  return (
    <div style={{ display: 'flex', gap: '0.4rem' }}>
      {[1, 2, 3, 4, 5].map(n => (
        <button
          type="button"
          key={n}
          onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          style={{
            width: '40px', height: '40px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid',
            borderColor: (hover >= n || value >= n) ? 'var(--white)' : 'var(--color-border-light)',
            background: (hover >= n || value >= n) ? 'var(--white)' : 'transparent',
            color: (hover >= n || value >= n) ? 'var(--black)' : 'var(--gray-500)',
            fontSize: '0.85rem', fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          {n}
        </button>
      ))}
    </div>
  )
}

export default function FillForm() {
  const { formId } = useParams()

  const [form, setForm] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [answers, setAnswers] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [startTime] = useState(Date.now())

  useEffect(() => { fetchForm() }, [formId])

  const fetchForm = async () => {
    try {
      const res = await api.get(`/public/forms/${formId}`)
      setForm(res.data)
      const defaults = {}
      for (const q of res.data.questions) {
        defaults[q.question_id] = q.question_type === 'rating' ? 0 : ''
      }
      setAnswers(defaults)
    } catch (err) {
      const detail = err.response?.data?.detail
      setError(typeof detail === 'string' ? detail : 'Form not found or no longer accepting responses.')
    } finally { setLoading(false) }
  }

  const updateAnswer = (questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    for (const q of form.questions) {
      const val = answers[q.question_id]
      if (q.is_required) {
        if (val === '' || val === null || val === undefined || (q.question_type === 'rating' && val === 0)) {
          setError(`Please answer: "${q.question_text}"`)
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
          .map(q => ({ question_id: q.question_id, answer_value: answers[q.question_id] })),
      }
      await api.post(`/public/forms/${formId}/responses`, payload)
      setSubmitted(true)
    } catch (err) {
      const detail = err.response?.data?.detail
      setError(typeof detail === 'string' ? detail : 'Submission failed. Please try again.')
    } finally { setSubmitting(false) }
  }

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div style={{ textAlign: 'center' }}>
          <div className="skeleton" style={{ width: '240px', height: '24px', margin: '0 auto 0.75rem' }}></div>
          <div className="skeleton" style={{ width: '160px', height: '14px', margin: '0 auto' }}></div>
        </div>
      </div>
    )
  }

  // Error – form not found
  if (!form && error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="fade-in" style={{ textAlign: 'center', maxWidth: '400px', padding: '2rem' }}>
          <h2 style={{ marginBottom: '0.75rem' }}>Unavailable</h2>
          <p style={{ color: 'var(--gray-500)', fontSize: '0.9rem' }}>{error}</p>
        </div>
      </div>
    )
  }

  // Success
  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="fade-in" style={{ textAlign: 'center', maxWidth: '420px', padding: '2rem' }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '50%',
            border: '2px solid var(--gray-300)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.5rem', fontSize: '1.4rem', color: 'var(--gray-300)',
          }}>✓</div>
          <h2 style={{ marginBottom: '0.5rem' }}>Thank you</h2>
          <p style={{ color: 'var(--gray-500)', fontSize: '0.95rem', marginBottom: '2rem' }}>
            Your response has been recorded.
          </p>
          <button className="btn btn-secondary" onClick={() => window.location.reload()}>
            Submit another
          </button>
        </div>
      </div>
    )
  }

  // Form
  return (
    <div className="min-h-screen" style={{ paddingTop: '3rem', paddingBottom: '4rem' }}>
      <div className="container" style={{ maxWidth: '600px' }}>
        {/* Header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <h1 style={{ marginBottom: '0.4rem' }}>{form.title}</h1>
          {form.description && (
            <p style={{ color: 'var(--gray-400)', fontSize: '0.95rem', marginBottom: '0.4rem' }}>{form.description}</p>
          )}
          <p style={{ fontSize: '0.75rem', color: 'var(--gray-600)' }}>
            * indicates required
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {form.questions
            .sort((a, b) => a.order_index - b.order_index)
            .map((q, idx) => (
              <div key={q.question_id} className="fade-in" style={{
                marginBottom: '2rem',
                paddingBottom: '2rem',
                borderBottom: idx < form.questions.length - 1 ? '1px solid var(--color-border)' : 'none',
                animationDelay: `${idx * 50}ms`,
              }}>
                <label style={{
                  display: 'block', fontWeight: 500, marginBottom: '0.85rem',
                  fontSize: '0.95rem', lineHeight: 1.5, color: 'var(--gray-200)',
                }}>
                  {q.question_text}
                  {q.is_required && <span style={{ color: 'var(--gray-500)', marginLeft: '4px' }}>*</span>}
                </label>

                {/* Short text */}
                {q.question_type === 'text' && (
                  <input
                    type="text" className="form-input"
                    placeholder="Your answer…"
                    value={answers[q.question_id] || ''}
                    onChange={e => updateAnswer(q.question_id, e.target.value)}
                  />
                )}

                {/* Long text */}
                {q.question_type === 'textarea' && (
                  <textarea
                    className="form-input"
                    placeholder="Your answer…"
                    rows={4} style={{ resize: 'vertical' }}
                    value={answers[q.question_id] || ''}
                    onChange={e => updateAnswer(q.question_id, e.target.value)}
                  />
                )}

                {/* Rating */}
                {q.question_type === 'rating' && (
                  <RatingInput
                    value={answers[q.question_id] || 0}
                    onChange={val => updateAnswer(q.question_id, val)}
                  />
                )}

                {/* Yes / No */}
                {q.question_type === 'yes_no' && (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {['Yes', 'No'].map(opt => (
                      <button
                        type="button" key={opt}
                        onClick={() => updateAnswer(q.question_id, opt)}
                        style={{
                          padding: '0.5rem 1.5rem',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid',
                          borderColor: answers[q.question_id] === opt ? 'var(--white)' : 'var(--color-border-light)',
                          background: answers[q.question_id] === opt ? 'var(--white)' : 'transparent',
                          color: answers[q.question_id] === opt ? 'var(--black)' : 'var(--gray-400)',
                          fontSize: '0.85rem', fontWeight: 500,
                          cursor: 'pointer', transition: 'all 0.15s ease',
                        }}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}

                {/* Multiple choice */}
                {q.question_type === 'multiple_choice' && q.options && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {q.options.map((opt, i) => (
                      <label key={i} style={{
                        display: 'flex', alignItems: 'center', gap: '0.6rem',
                        cursor: 'pointer', padding: '0.55rem 0.85rem',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid',
                        borderColor: answers[q.question_id] === opt ? 'var(--white)' : 'var(--color-border)',
                        background: answers[q.question_id] === opt ? 'rgba(255,255,255,0.05)' : 'transparent',
                        transition: 'all 0.15s ease',
                        fontSize: '0.9rem', color: 'var(--gray-300)',
                      }}>
                        <div style={{
                          width: '16px', height: '16px', borderRadius: '50%',
                          border: '1.5px solid',
                          borderColor: answers[q.question_id] === opt ? 'var(--white)' : 'var(--gray-600)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0,
                        }}>
                          {answers[q.question_id] === opt && (
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--white)' }} />
                          )}
                        </div>
                        <input
                          type="radio" name={`q_${q.question_id}`}
                          value={opt} checked={answers[q.question_id] === opt}
                          onChange={() => updateAnswer(q.question_id, opt)}
                          style={{ display: 'none' }}
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                )}

                {/* Dropdown */}
                {q.question_type === 'dropdown' && q.options && (
                  <select
                    className="form-input"
                    value={answers[q.question_id] || ''}
                    onChange={e => updateAnswer(q.question_id, e.target.value)}
                  >
                    <option value="">Select…</option>
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
              padding: '0.75rem 1rem', marginBottom: '1.5rem',
              border: '1px solid rgba(220,38,38,0.2)',
              borderRadius: 'var(--radius-md)',
              color: '#f87171', fontSize: '0.85rem',
              background: 'rgba(220,38,38,0.05)',
            }}>
              {error}
            </div>
          )}

          <button type="submit" className="btn btn-primary" disabled={submitting}
            style={{ padding: '0.7rem 2rem' }}
          >
            {submitting ? 'Submitting…' : 'Submit'}
          </button>
        </form>
      </div>
    </div>
  )
}
