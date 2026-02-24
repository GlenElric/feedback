import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  LineChart, Line, AreaChart, Area,
  PieChart, Pie, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts'
import api from '../utils/api'

const MONO = ['#e5e5e5', '#a3a3a3', '#737373', '#525252', '#404040']

/* ──────────── Tiny reusable components ──────────── */

function StatBlock({ label, value, sub }) {
  return (
    <div style={{ background: 'var(--color-bg)', padding: '1.5rem', textAlign: 'center' }}>
      <div style={{ fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--gray-500)', marginBottom: '0.35rem' }}>
        {label}
      </div>
      <div className="mono" style={{ fontSize: '1.75rem', fontWeight: 500, color: 'var(--gray-100)' }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: '0.7rem', color: 'var(--gray-600)', marginTop: '0.2rem' }}>{sub}</div>}
    </div>
  )
}

function Section({ title, children, delay = 0 }) {
  return (
    <div className="fade-in" style={{
      border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)',
      overflow: 'hidden', animationDelay: `${delay}ms`,
    }}>
      <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--color-border)' }}>
        <h6 style={{ marginBottom: 0 }}>{title}</h6>
      </div>
      <div style={{ padding: '1.5rem' }}>{children}</div>
    </div>
  )
}

const chartTooltipStyle = {
  background: 'var(--gray-900)', border: '1px solid var(--color-border)',
  borderRadius: '6px', color: 'var(--gray-200)', fontSize: '0.8rem',
}

/* ──────────── Sentiment Gauge ──────────── */
function SentimentGauge({ score, label }) {
  // Map -1..+1 to 0..100 for visual
  const pct = Math.round((score + 1) / 2 * 100)
  const displayScore = Math.round(score * 100)

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
      <div style={{ position: 'relative', width: '100px', height: '100px' }}>
        <svg viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
          <circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--gray-850)" strokeWidth="2.5" />
          <circle
            cx="18" cy="18" r="15.9" fill="none"
            stroke={score > 0.05 ? '#d4d4d4' : score < -0.05 ? '#525252' : '#737373'}
            strokeWidth="2.5"
            strokeDasharray={`${pct} ${100 - pct}`}
            strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 0.6s ease' }}
          />
        </svg>
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        }}>
          <span className="mono" style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--gray-100)' }}>
            {displayScore > 0 ? '+' : ''}{displayScore}
          </span>
          <span style={{ fontSize: '0.55rem', color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {label}
          </span>
        </div>
      </div>
      <div style={{ flex: 1, minWidth: '200px' }}>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.8rem', color: 'var(--gray-400)' }}>
          Score ranges from −100 (negative) to +100 (positive)
        </div>
        <div style={{
          width: '100%', height: '6px', borderRadius: '3px',
          background: 'var(--gray-850)', overflow: 'hidden',
        }}>
          <div style={{
            width: `${pct}%`, height: '100%', borderRadius: '3px',
            background: 'var(--gray-300)',
            transition: 'width 0.6s ease',
          }} />
        </div>
      </div>
    </div>
  )
}

/* ──────────── Sentiment Distribution ──────────── */
function SentimentDistribution({ data }) {
  const items = [
    { label: 'Positive', value: data.positive_count, pct: data.positive_pct },
    { label: 'Neutral', value: data.neutral_count, pct: data.neutral_pct },
    { label: 'Negative', value: data.negative_count, pct: data.negative_pct },
  ]
  const colors = ['#d4d4d4', '#737373', '#404040']

  return (
    <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginTop: '1.5rem' }}>
      <ResponsiveContainer width={140} height={140}>
        <PieChart>
          <Pie data={items.filter(i => i.value > 0)} cx="50%" cy="50%" innerRadius={35} outerRadius={60} dataKey="value" stroke="none" paddingAngle={2}>
            {items.filter(i => i.value > 0).map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', justifyContent: 'center' }}>
        {items.map((item, i) => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: colors[i] }} />
            <span style={{ fontSize: '0.85rem', color: 'var(--gray-300)', minWidth: '65px' }}>{item.label}</span>
            <span className="mono" style={{ fontSize: '0.8rem', fontWeight: 500 }}>{item.value}</span>
            <span style={{ fontSize: '0.7rem', color: 'var(--gray-600)' }}>{item.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ──────────── Keywords ──────────── */
function KeywordCloud({ keywords }) {
  if (!keywords || keywords.length === 0) {
    return <p style={{ color: 'var(--gray-600)', fontSize: '0.85rem' }}>No keywords extracted (need more text responses)</p>
  }

  const maxScore = Math.max(...keywords.map(k => k.score))

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
      {keywords.map(kw => {
        const intensity = Math.max(0.3, kw.score / maxScore)
        const size = 0.7 + intensity * 0.45
        return (
          <span key={kw.word} style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
            padding: '0.3rem 0.65rem',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)',
            fontSize: `${size}rem`,
            color: kw.sentiment === 'positive' ? 'var(--gray-200)'
              : kw.sentiment === 'negative' ? 'var(--gray-500)'
              : 'var(--gray-400)',
            background: `rgba(255,255,255,${intensity * 0.04})`,
            transition: 'all 0.15s ease',
            cursor: 'default',
          }}>
            {kw.word}
            <span className="mono" style={{ fontSize: '0.65rem', color: 'var(--gray-600)' }}>
              {kw.count}
            </span>
          </span>
        )
      })}
    </div>
  )
}

/* ──────────── Phrases ──────────── */
function PhraseList({ phrases }) {
  if (!phrases || phrases.length === 0) return null

  return (
    <div style={{ marginTop: '1.25rem' }}>
      <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.6rem' }}>
        Common Phrases
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        {phrases.map((p, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0.4rem 0.6rem', borderRadius: 'var(--radius-sm)',
            background: 'rgba(255,255,255,0.02)',
          }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--gray-300)' }}>"{p.phrase}"</span>
            <span className="mono" style={{ fontSize: '0.7rem', color: 'var(--gray-500)' }}>×{p.count}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ──────────── Performance Score ──────────── */
function PerformanceCard({ performance }) {
  const { overall, grade, dimensions } = performance

  const radarData = Object.values(dimensions).map(d => ({
    subject: d.label,
    score: d.score,
  }))

  return (
    <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'center' }}>
      {/* Score circle */}
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: '120px', height: '120px', borderRadius: '50%',
          border: '3px solid var(--gray-700)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          position: 'relative',
        }}>
          <span className="mono" style={{ fontSize: '2.2rem', fontWeight: 600, color: 'var(--gray-100)', lineHeight: 1 }}>
            {overall}
          </span>
          <span style={{ fontSize: '0.65rem', color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            / 100
          </span>
        </div>
        <div className="mono" style={{ marginTop: '0.5rem', fontSize: '0.9rem', fontWeight: 600, color: 'var(--gray-300)' }}>
          Grade {grade}
        </div>
      </div>

      {/* Radar chart */}
      <div style={{ flex: 1, minWidth: '250px' }}>
        <ResponsiveContainer width="100%" height={220}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="var(--color-border)" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--gray-500)', fontSize: 11 }} />
            <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
            <Radar dataKey="score" stroke="var(--gray-300)" fill="var(--gray-300)" fillOpacity={0.15} strokeWidth={1.5} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Breakdown bars */}
      <div style={{ flex: '0 0 200px', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        {Object.values(dimensions).map(d => (
          <div key={d.label}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.2rem' }}>
              <span style={{ color: 'var(--gray-400)' }}>{d.label}</span>
              <span className="mono" style={{ color: 'var(--gray-300)' }}>{d.score}</span>
            </div>
            <div style={{ width: '100%', height: '4px', borderRadius: '2px', background: 'var(--gray-850)' }}>
              <div style={{
                width: `${d.score}%`, height: '100%', borderRadius: '2px',
                background: 'var(--gray-400)',
                transition: 'width 0.5s ease',
              }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ──────────── Trend Charts ──────────── */
function TrendCharts({ trends }) {
  const { daily, rating_trend, sentiment_trend } = trends

  if (!daily || daily.length === 0) {
    return <p style={{ color: 'var(--gray-600)', fontSize: '0.85rem' }}>Not enough data for trend analysis</p>
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Response volume over time */}
      <div>
        <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
          Response Volume
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={daily} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
            <XAxis dataKey="date" tick={{ fill: 'var(--gray-600)', fontSize: 10 }} axisLine={{ stroke: 'var(--color-border)' }} tickLine={false} />
            <YAxis allowDecimals={false} tick={{ fill: 'var(--gray-600)', fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={chartTooltipStyle} />
            <Area type="monotone" dataKey="responses" stroke="var(--gray-400)" fill="var(--gray-400)" fillOpacity={0.08} strokeWidth={1.5} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Cumulative responses */}
      <div>
        <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
          Cumulative Responses
        </div>
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={daily} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
            <XAxis dataKey="date" tick={{ fill: 'var(--gray-600)', fontSize: 10 }} axisLine={{ stroke: 'var(--color-border)' }} tickLine={false} />
            <YAxis allowDecimals={false} tick={{ fill: 'var(--gray-600)', fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={chartTooltipStyle} />
            <Line type="monotone" dataKey="cumulative" stroke="var(--gray-300)" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Rating trend */}
      {rating_trend && rating_trend.length > 0 && (
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
            Rating Trend
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={rating_trend} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: 'var(--gray-600)', fontSize: 10 }} axisLine={{ stroke: 'var(--color-border)' }} tickLine={false} />
              <YAxis domain={[0, 5]} tick={{ fill: 'var(--gray-600)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={chartTooltipStyle} />
              <Line type="monotone" dataKey="average" stroke="var(--gray-200)" strokeWidth={2} dot={{ fill: 'var(--gray-200)', r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Sentiment trend */}
      {sentiment_trend && sentiment_trend.length > 0 && (
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
            Sentiment Over Time
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={sentiment_trend} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: 'var(--gray-600)', fontSize: 10 }} axisLine={{ stroke: 'var(--color-border)' }} tickLine={false} />
              <YAxis domain={[-1, 1]} tick={{ fill: 'var(--gray-600)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={chartTooltipStyle} />
              <Area type="monotone" dataKey="score" stroke="var(--gray-400)" fill="var(--gray-400)" fillOpacity={0.1} strokeWidth={1.5} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

/* ──────────── Per-response Sentiment List ──────────── */
function ResponseSentimentList({ perResponse }) {
  const [showAll, setShowAll] = useState(false)
  if (!perResponse || perResponse.length === 0) return null
  const visible = showAll ? perResponse : perResponse.slice(0, 6)

  return (
    <div style={{ marginTop: '1.5rem' }}>
      <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.6rem' }}>
        Individual Responses
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        {visible.map((r, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
            padding: '0.6rem 0.85rem', borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
          }}>
            <span className="mono" style={{
              fontSize: '0.7rem', fontWeight: 600, flexShrink: 0,
              padding: '2px 6px', borderRadius: 'var(--radius-xs)',
              background: r.label === 'positive' ? 'rgba(255,255,255,0.08)'
                : r.label === 'negative' ? 'rgba(255,255,255,0.03)'
                : 'rgba(255,255,255,0.05)',
              color: r.label === 'positive' ? 'var(--gray-200)'
                : r.label === 'negative' ? 'var(--gray-500)'
                : 'var(--gray-400)',
            }}>
              {r.score > 0 ? '+' : ''}{Math.round(r.score * 100)}
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--gray-300)', lineHeight: 1.5 }}>
              {r.text}
            </span>
          </div>
        ))}
      </div>
      {perResponse.length > 6 && (
        <button className="btn btn-ghost btn-sm" style={{ marginTop: '0.5rem', color: 'var(--gray-400)' }}
          onClick={() => setShowAll(!showAll)}>
          {showAll ? 'Show less' : `Show all ${perResponse.length}`}
        </button>
      )}
    </div>
  )
}


/* ══════════════════════════════════════════════════════════
   MAIN PAGE
   ══════════════════════════════════════════════════════════ */

export default function FormInsights() {
  const { formId } = useParams()
  const navigate = useNavigate()

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => { fetchInsights() }, [formId])

  const fetchInsights = async () => {
    try {
      const res = await api.get(`/forms/${formId}/insights`)
      setData(res.data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load insights.')
    } finally { setLoading(false) }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div style={{ textAlign: 'center' }}>
          <div className="skeleton" style={{ width: '200px', height: '20px', margin: '0 auto 0.75rem' }} />
          <div className="skeleton" style={{ width: '140px', height: '14px', margin: '0 auto' }} />
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

  const noText = data.total_text_responses === 0

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header style={{ borderBottom: '1px solid var(--color-border)', padding: '0.85rem 0' }}>
        <div className="container flex justify-between items-center">
          <span style={{ fontSize: '0.95rem', fontWeight: 600, letterSpacing: '-0.03em' }}>
            feedback<span style={{ color: 'var(--gray-600)' }}>.</span>
          </span>
          <div className="flex gap-sm">
            <button onClick={() => navigate(`/forms/${formId}/responses`)} className="btn btn-ghost btn-sm">
              Basic Analytics
            </button>
            <button onClick={() => navigate('/dashboard')} className="btn btn-ghost btn-sm">
              ← Dashboard
            </button>
          </div>
        </div>
      </header>

      <div className="container" style={{ maxWidth: '900px', paddingTop: '2.5rem', paddingBottom: '3rem' }}>
        <h1 style={{ marginBottom: '0.3rem' }}>{data.form_title}</h1>
        <p style={{ color: 'var(--gray-500)', fontSize: '0.9rem', marginBottom: '2.5rem' }}>
          Advanced insights &amp; analytics
        </p>

        {/* ── Summary stats ── */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1px', background: 'var(--color-border)',
          border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)',
          overflow: 'hidden', marginBottom: '2rem',
        }}>
          <StatBlock label="Responses" value={data.total_responses} />
          <StatBlock label="Text Answers" value={data.total_text_responses} />
          <StatBlock label="Performance" value={`${data.performance.overall}`} sub={`Grade ${data.performance.grade}`} />
        </div>

        {data.total_responses === 0 ? (
          <div style={{
            textAlign: 'center', padding: '3rem 2rem',
            border: '1px dashed var(--color-border-light)', borderRadius: 'var(--radius-lg)',
          }}>
            <p style={{ color: 'var(--gray-400)', marginBottom: '1.5rem' }}>
              No responses yet. Share your form to start getting insights.
            </p>
            <button className="btn btn-primary"
              onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/form/${formId}`); alert('Link copied!') }}>
              Copy share link
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '2rem' }}>

            {/* ── 1. Performance Score ── */}
            <Section title="PERFORMANCE SCORE" delay={0}>
              <PerformanceCard performance={data.performance} />
            </Section>

            {/* ── 2. Sentiment Analysis ── */}
            <Section title="SENTIMENT ANALYSIS" delay={80}>
              {noText ? (
                <p style={{ color: 'var(--gray-600)', fontSize: '0.85rem' }}>
                  No text responses to analyze. Add text or textarea questions to enable sentiment analysis.
                </p>
              ) : (
                <>
                  <SentimentGauge score={data.sentiment.overall_score} label={data.sentiment.overall_label} />
                  <SentimentDistribution data={data.sentiment} />
                  <ResponseSentimentList perResponse={data.sentiment.per_response} />
                </>
              )}
            </Section>

            {/* ── 3. Keyword Extraction ── */}
            <Section title="KEYWORD EXTRACTION" delay={160}>
              {noText ? (
                <p style={{ color: 'var(--gray-600)', fontSize: '0.85rem' }}>
                  No text responses for keyword extraction.
                </p>
              ) : (
                <>
                  <KeywordCloud keywords={data.keywords} />
                  <PhraseList phrases={data.phrases} />
                </>
              )}
            </Section>

            {/* ── 4. Trend Analysis ── */}
            <Section title="TREND ANALYSIS" delay={240}>
              <TrendCharts trends={data.trends} />
            </Section>

            {/* ── Per-question sentiments ── */}
            {data.question_sentiments && data.question_sentiments.length > 0 && (
              <Section title="PER-QUESTION SENTIMENT" delay={320}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {data.question_sentiments.map(qs => (
                    <div key={qs.question_id} style={{
                      padding: '1rem', borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-border)',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        <h4 style={{ marginBottom: 0, fontSize: '0.9rem' }}>{qs.question_text}</h4>
                        <div className="flex items-center gap-xs">
                          <span className="mono" style={{ fontSize: '0.8rem', color: 'var(--gray-300)' }}>
                            {qs.sentiment.overall_score > 0 ? '+' : ''}{Math.round(qs.sentiment.overall_score * 100)}
                          </span>
                          <span style={{
                            fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em',
                            color: 'var(--gray-500)',
                          }}>
                            {qs.sentiment.overall_label}
                          </span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                        <span>Positive: {qs.sentiment.positive_count}</span>
                        <span>Neutral: {qs.sentiment.neutral_count}</span>
                        <span>Negative: {qs.sentiment.negative_count}</span>
                        <span>Total: {qs.sentiment.total}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
