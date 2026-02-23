import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="min-h-screen" style={{ display: 'flex', flexDirection: 'column' }}>

      {/* ── Navbar ── */}
      <nav style={{
        padding: '1.25rem 0',
        borderBottom: '1px solid var(--color-border)',
      }}>
        <div className="container flex justify-between items-center">
          <span style={{ fontSize: '0.95rem', fontWeight: 600, letterSpacing: '-0.03em' }}>
            feedback<span style={{ color: 'var(--gray-500)' }}>.</span>
          </span>
          <div className="flex gap-sm items-center">
            <Link to="/login" className="btn btn-ghost btn-sm">Sign in</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Get started</Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="container" style={{ textAlign: 'center', paddingTop: '4rem', paddingBottom: '5rem' }}>
          <div className="fade-in-up">
            <p style={{
              fontSize: '0.75rem', fontWeight: 600,
              textTransform: 'uppercase', letterSpacing: '0.1em',
              color: 'var(--gray-500)', marginBottom: '1.5rem',
            }}>
              Feedback Collection Platform
            </p>

            <h1 style={{
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              fontWeight: 600,
              letterSpacing: '-0.04em',
              lineHeight: 1.1,
              marginBottom: '1.5rem',
              maxWidth: '650px',
              margin: '0 auto 1.5rem',
            }}>
              Collect feedback.<br />
              <span style={{ color: 'var(--gray-500)' }}>Understand your audience.</span>
            </h1>

            <p style={{
              fontSize: '1.05rem',
              color: 'var(--gray-400)',
              maxWidth: '460px',
              margin: '0 auto 2.5rem',
              lineHeight: 1.7,
            }}>
              Create elegant forms, share them with a single link, and
              visualize responses — all in one place.
            </p>

            <div className="flex gap-md justify-center">
              <Link to="/register" className="btn btn-primary btn-lg">
                Start for free →
              </Link>
              <Link to="/login" className="btn btn-secondary btn-lg">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Features ── */}
      <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '4rem', paddingBottom: '4rem' }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1px',
            background: 'var(--color-border)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
          }}>
            {[
              {
                num: '01',
                title: 'Build',
                desc: 'Create forms with multiple question types — ratings, multiple choice, open text, and more.',
              },
              {
                num: '02',
                title: 'Share',
                desc: 'Generate a shareable link. Anyone can respond without creating an account.',
              },
              {
                num: '03',
                title: 'Analyze',
                desc: 'Visualize responses with interactive charts. Understand patterns at a glance.',
              },
            ].map((f, i) => (
              <div key={i} style={{
                background: 'var(--color-bg)',
                padding: '2.5rem 2rem',
                transition: 'background 0.3s ease',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--color-surface)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--color-bg)'}
              >
                <span className="mono" style={{
                  fontSize: '0.75rem',
                  color: 'var(--gray-600)',
                  display: 'block',
                  marginBottom: '1rem',
                }}>{f.num}</span>
                <h3 style={{ marginBottom: '0.75rem', fontSize: '1.15rem' }}>{f.title}</h3>
                <p style={{ color: 'var(--gray-500)', fontSize: '0.9rem', marginBottom: 0, lineHeight: 1.6 }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CTA ── */}
      <div style={{ borderTop: '1px solid var(--color-border)', padding: '4rem 0' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{
            fontSize: '1.6rem', letterSpacing: '-0.03em',
            marginBottom: '0.75rem',
          }}>
            Ready to start collecting feedback?
          </h2>
          <p style={{ color: 'var(--gray-500)', marginBottom: '2rem', fontSize: '0.95rem' }}>
            Free to use. Takes less than a minute.
          </p>
          <Link to="/register" className="btn btn-primary btn-lg">
            Create your first form →
          </Link>
        </div>
      </div>

      {/* ── Footer ── */}
      <footer style={{
        borderTop: '1px solid var(--color-border)',
        padding: '1.5rem 0',
        textAlign: 'center',
      }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--gray-600)' }}>
          © {new Date().getFullYear()} feedback. — Built for clarity.
        </span>
      </footer>
    </div>
  )
}
