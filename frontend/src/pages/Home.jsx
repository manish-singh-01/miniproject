import { Link } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import './Home.css';

const FEATURES = [
  { icon: '🗺️', title: 'Live Incident Map', desc: 'Real-time map showing verified incidents, danger zones and shelters near you.' },
  { icon: '🚨', title: 'Instant Alerts', desc: 'Receive live disaster alerts the moment they are issued by administrators.' },
  { icon: '📝', title: 'Report Incidents', desc: 'Submit disaster reports with GPS location and photos directly from the field.' },
  { icon: '🏥', title: 'Find Shelters', desc: 'Locate the nearest available relief centres and emergency shelters.' },
  { icon: '🛡️', title: 'Safety Guides', desc: 'Step-by-step safety protocols for floods, earthquakes, cyclones and more.' },
  { icon: '📞', title: 'Emergency Contacts', desc: 'One-tap access to police, fire brigade, ambulance and disaster helplines.' },
];

const STATS = [
  { value: '24/7', label: 'Monitoring' },
  { value: '3', label: 'User Roles' },
  { value: '100%', label: 'Real-time' },
  { value: '∞', label: 'Coverage' },
];

const ALERTS_PREVIEW = [
  { icon: '🌊', type: 'Flood Alert', severity: 'high', area: 'Uttarakhand', time: 'Live' },
  { icon: '🌍', type: 'Earthquake Advisory', severity: 'medium', area: 'North India', time: '2h ago' },
  { icon: '🌀', type: 'Cyclone Watch', severity: 'low', area: 'Coastal Region', time: '5h ago' },
];

const Home = () => {
  const heroRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.target.classList.toggle('visible', e.isIntersecting)),
      { threshold: 0.1 }
    );
    document.querySelectorAll('.animate-in').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="home">
      {/* ── HERO ── */}
      <section className="hero" ref={heroRef}>
        <div className="hero__bg-glow" />
        <div className="hero__content">
          <p className="tagline">Stay Alert • Stay Safe • Stay Connected</p>
          <h1 className="hero__title">
            India's Disaster
            <br />
            <span className="gradient-text">Management Portal</span>
          </h1>
          <p className="hero__subtitle">
            A centralized platform connecting citizens, responders and administrators
            during natural disasters — with real-time alerts, live maps, and instant
            emergency assistance.
          </p>
          <div className="hero__actions">
            <Link to="/alerts" className="btn btn-primary hero__cta">
              View Live Alerts
            </Link>
            <Link to="/report" className="btn btn-secondary">
              Report Incident
            </Link>
          </div>

          {/* Live Alert Ticker */}
          <div className="alert-ticker">
            <span className="ticker__label">🔴 LIVE</span>
            <div className="ticker__track">
              <div className="ticker__items">
                {[...ALERTS_PREVIEW, ...ALERTS_PREVIEW].map((a, i) => (
                  <span key={i} className="ticker__item">
                    {a.icon} {a.type} — {a.area}
                    <span className="ticker__sep">•</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="hero__stats">
          {STATS.map(({ value, label }) => (
            <div key={label} className="stat-card">
              <span className="stat-card__value">{value}</span>
              <span className="stat-card__label">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── EMERGENCY QUICK ACCESS ── */}
      <section className="section emergency-strip animate-in">
        <div className="emergency-strip__inner">
          <span className="emergency-strip__label">⚡ Emergency</span>
          {[
            { label: 'Police', num: '112' },
            { label: 'Ambulance', num: '108' },
            { label: 'Fire Brigade', num: '101' },
            { label: 'Disaster Mgmt', num: '1078' },
          ].map(({ label, num }) => (
            <a key={num} href={`tel:${num}`} className="emergency-chip">
              <strong>{label}</strong> {num}
            </a>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="section">
        <div className="section-header animate-in">
          <p className="tagline">Platform Features</p>
          <h2>Everything You Need During a Disaster</h2>
          <p>Built for citizens, responders, and administrators to collaborate seamlessly.</p>
        </div>
        <div className="grid-3">
          {FEATURES.map(({ icon, title, desc }) => (
            <div key={title} className="feature-card animate-in">
              <div className="feature-card__icon">{icon}</div>
              <h3>{title}</h3>
              <p>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── LIVE ALERTS PREVIEW ── */}
      <section className="section alerts-preview-section">
        <div className="section-header animate-in">
          <p className="tagline">Real-time Updates</p>
          <h2>Current Active Alerts</h2>
          <p>Alerts are issued and broadcast instantly by disaster management authorities.</p>
        </div>
        <div className="grid-3">
          {ALERTS_PREVIEW.map((a) => (
            <div key={a.type} className={`alert-preview-card alert-preview-card--${a.severity} animate-in`}>
              <div className="alert-preview-card__top">
                <span className="alert-preview-card__icon">{a.icon}</span>
                <span className={`badge badge-${a.severity}`}>{a.severity}</span>
              </div>
              <h3>{a.type}</h3>
              <p className="alert-preview-card__area">📍 {a.area}</p>
              <p className="alert-preview-card__time">🕐 {a.time}</p>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: '32px' }}>
          <Link to="/alerts" className="btn btn-primary">View All Alerts →</Link>
        </div>
      </section>

      {/* ── ROLES ── */}
      <section className="section roles-section animate-in">
        <div className="section-header">
          <p className="tagline">Who It's For</p>
          <h2>Built for Every Role</h2>
        </div>
        <div className="grid-3">
          {[
            { icon: '👤', role: 'Citizens', color: '#3b82f6', points: ['Report incidents with GPS', 'SOS emergency button', 'Find nearest shelters', '"I\'m Safe" check-in'] },
            { icon: '🦺', role: 'Responders', color: '#22c55e', points: ['Accept & manage tasks', 'Real-time map updates', 'Update task status live', 'Submit field notes'] },
            { icon: '⚙️', role: 'Administrators', color: '#ef4444', points: ['Verify incident reports', 'Issue zone-wide alerts', 'Assign responder tasks', 'View analytics dashboard'] },
          ].map(({ icon, role, color, points }) => (
            <div key={role} className="role-card" style={{ '--role-color': color }}>
              <div className="role-card__icon">{icon}</div>
              <h3>{role}</h3>
              <ul className="role-card__list">
                {points.map((p) => <li key={p}>{p}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="cta-section animate-in">
        <div className="cta-section__inner">
          <h2>Ready to help or get help?</h2>
          <p>Join the platform that connects communities during their most critical moments.</p>
          <div className="cta-section__actions">
            <Link to="/register" className="btn btn-primary">Create Free Account</Link>
            <Link to="/alerts" className="btn btn-secondary">View Live Alerts</Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="footer">
        <div className="footer__inner">
          <div className="footer__brand">
            <span>🚨 DisasterPortal</span>
            <p>Connecting communities during critical moments.</p>
          </div>
          <div className="footer__links">
            <Link to="/alerts">Alerts</Link>
            <Link to="/shelters">Shelters</Link>
            <Link to="/report">Report</Link>
            <Link to="/safety">Safety</Link>
            <Link to="/emergency">Emergency</Link>
          </div>
        </div>
        <p className="footer__copy">© 2026 Disaster Management Portal. Built for India.</p>
      </footer>
    </div>
  );
};

export default Home;
