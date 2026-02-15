import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="container" style={{ paddingTop: '4rem', paddingBottom: '4rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '3.5rem', marginBottom: '1.5rem', background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Feedback Collection Platform
        </h1>
        <p style={{ fontSize: '1.25rem', color: 'var(--color-text-secondary)', maxWidth: '600px', margin: '0 auto 2rem' }}>
          Create, distribute, and analyze feedback forms for your events and courses with ease.
        </p>
        
        <div className="flex gap-md" style={{ justifyContent: 'center', marginTop: '2rem' }}>
          <Link to="/register" className="btn btn-primary" style={{ fontSize: '1.1rem', padding: '0.75rem 2rem' }}>
            Get Started
          </Link>
          <Link to="/login" className="btn btn-secondary" style={{ fontSize: '1.1rem', padding: '0.75rem 2rem' }}>
            Sign In
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="container" style={{ paddingTop: '3rem', paddingBottom: '4rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          {/* Feature 1 */}
          <div className="card-glass" style={{ padding: '2rem', transition: 'transform var(--transition-normal)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📝</div>
            <h3 style={{ marginBottom: '1rem' }}>Easy Form Builder</h3>
            <p className="text-muted">
              Create custom feedback forms with multiple question types including text, multiple choice, ratings, and more.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="card-glass" style={{ padding: '2rem', transition: 'transform var(--transition-normal)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🔒</div>
            <h3 style={{ marginBottom: '1rem' }}>Secure & Anonymous</h3>
            <p className="text-muted">
              Support both anonymous and authenticated submissions with enterprise-grade security.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="card-glass" style={{ padding: '2rem', transition: 'transform var(--transition-normal)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📊</div>
            <h3 style={{ marginBottom: '1rem' }}>Analytics Dashboard</h3>
            <p className="text-muted">
              Visualize responses with interactive charts and export data for deeper analysis.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container" style={{ paddingTop: '3rem', paddingBottom: '4rem', textAlign: 'center' }}>
        <div className="card" style={{ maxWidth: '700px', margin: '0 auto', padding: '3rem' }}>
          <h2 style={{ marginBottom: '1rem' }}>Ready to get started?</h2>
          <p className="text-muted" style={{ marginBottom: '2rem' }}>
            Create your first feedback form in minutes
          </p>
          <Link to="/register" className="btn btn-primary" style={{ fontSize: '1.1rem', padding: '0.75rem 2.5rem' }}>
            Create Free Account
          </Link>
        </div>
      </div>
    </div>
  )
}
