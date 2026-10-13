import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { incidentService } from '../services/services';
import { connectSocket, disconnectSocket } from '../services/socket';
import './Dashboard.css';

const STATUS_STYLE = {
  unverified: 'badge-unverified',
  verified: 'badge-verified',
  resolved: 'badge-resolved',
};

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Connect socket and join rooms
    const socket = connectSocket(user);
    socket.on('incident:verified', () => loadIncidents());
    return () => disconnectSocket();
  }, [user]);

  useEffect(() => {
    loadIncidents();
  }, []);

  // Auto-update GPS location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          import('../services/services').then(({ authService }) =>
            authService.updateLocation(coords.latitude, coords.longitude).catch(() => {})
          );
        },
        () => {}
      );
    }
  }, []);

  const loadIncidents = async () => {
    try {
      const { data } = await incidentService.getMine();
      setIncidents(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const QUICK_LINKS = [
    { to: '/alerts', icon: '🚨', title: 'Live Alerts', desc: 'View all active disaster alerts' },
    { to: '/report', icon: '📝', title: 'Report Incident', desc: 'Submit a new disaster report' },
    { to: '/shelters', icon: '🏥', title: 'Relief Centres', desc: 'Find nearby shelters and centres' },
    { to: '/emergency', icon: '📞', title: 'Emergency Services', desc: 'Quick access to emergency numbers' },
  ];

  return (
    <div className="dashboard-page">
      <div className="dashboard-sidebar">
        <div className="sidebar__brand">🚨 DisasterPortal</div>
        <div className="sidebar__profile">
          <div className="sidebar__avatar">{user?.name?.charAt(0).toUpperCase()}</div>
          <div>
            <p className="sidebar__name">{user?.name}</p>
            <p className="sidebar__email">{user?.email}</p>
            <span className={`badge badge-${user?.role === 'admin' ? 'high' : user?.role === 'responder' ? 'verified' : 'low'}`}>
              {user?.role}
            </span>
          </div>
        </div>
        <nav className="sidebar__nav">
          <Link to="/dashboard" className="sidebar__link sidebar__link--active">🏠 Dashboard</Link>
          <Link to="/alerts" className="sidebar__link">🚨 Alerts</Link>
          <Link to="/report" className="sidebar__link">📝 Report</Link>
          <Link to="/shelters" className="sidebar__link">🏥 Shelters</Link>
          <Link to="/safety" className="sidebar__link">🛡️ Safety</Link>
          <Link to="/emergency" className="sidebar__link">📞 Emergency</Link>
          {user?.role === 'admin' && (
            <Link to="/admin" className="sidebar__link">⚙️ Admin Panel</Link>
          )}
          {user?.role === 'responder' && (
            <Link to="/responder" className="sidebar__link">🦺 My Tasks</Link>
          )}
        </nav>
        <button className="sidebar__logout btn btn-secondary" onClick={logout}>
          Logout
        </button>
      </div>

      <main className="dashboard-main">
        <div className="dashboard-main__header">
          <div>
            <h1>👋 Welcome back, {user?.name?.split(' ')[0]}!</h1>
            <p>Here's what's happening on the portal today.</p>
          </div>
        </div>

        {user?.role === 'admin' && (
          <div style={{
            background: 'linear-gradient(90deg, rgba(239, 68, 68, 0.2), rgba(249, 115, 22, 0.2))',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            borderRadius: '12px',
            padding: '16px 20px',
            marginBottom: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div>
              <strong style={{ fontSize: '1.05rem', color: '#f87171' }}>🛡️ Authority Admin Access Enabled</strong>
              <p style={{ margin: '4px 0 0', color: '#cbd5e1', fontSize: '0.88rem' }}>
                Review live citizen reports, verify incidents, broadcast alerts, and dispatch rescue teams.
              </p>
            </div>
            <Link to="/admin" className="btn btn-primary" style={{ textDecoration: 'none' }}>
              Open Admin Command HQ →
            </Link>
          </div>
        )}

        {user?.role === 'responder' && (
          <div style={{
            background: 'linear-gradient(90deg, rgba(14, 165, 233, 0.2), rgba(59, 130, 246, 0.2))',
            border: '1px solid rgba(14, 165, 233, 0.4)',
            borderRadius: '12px',
            padding: '16px 20px',
            marginBottom: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div>
              <strong style={{ fontSize: '1.05rem', color: '#38bdf8' }}>🚑 First Responder Access Active</strong>
              <p style={{ margin: '4px 0 0', color: '#cbd5e1', fontSize: '0.88rem' }}>
                View your dispatched emergency rescue tasks, report field telemetry, and update mission status.
              </p>
            </div>
            <Link to="/responder" className="btn btn-primary" style={{ textDecoration: 'none' }}>
              Open Rescue Field Operations →
            </Link>
          </div>
        )}

        {/* Quick Links */}
        <div className="dashboard-grid">
          {QUICK_LINKS.map(({ to, icon, title, desc }) => (
            <Link to={to} key={to} className="dashboard-card">
              <div className="dashboard-card__icon">{icon}</div>
              <h3>{title}</h3>
              <p>{desc}</p>
              <span className="dashboard-card__arrow">→</span>
            </Link>
          ))}
        </div>

        {/* My Recent Reports */}
        <section className="my-reports">
          <div className="my-reports__header">
            <h2>📋 My Recent Reports</h2>
            <Link to="/report" className="btn btn-primary btn-sm">+ New Report</Link>
          </div>

          {loading ? (
            <div className="spinner" />
          ) : incidents.length === 0 ? (
            <div className="empty-state">
              <span>📭</span>
              <p>No reports submitted yet.</p>
              <Link to="/report" className="btn btn-primary">Submit Your First Report</Link>
            </div>
          ) : (
            <div className="reports-table">
              <div className="reports-table__header">
                <span>Type</span><span>Location</span><span>Date</span><span>Status</span>
              </div>
              {incidents.slice(0, 6).map((inc) => (
                <div key={inc._id} className="reports-table__row">
                  <span className="report-type">
                    {inc.type.charAt(0).toUpperCase() + inc.type.slice(1)}
                  </span>
                  <span className="report-location">{inc.address || '📍 GPS Recorded'}</span>
                  <span className="report-date">
                    {new Date(inc.createdAt).toLocaleDateString('en-IN')}
                  </span>
                  <span className={`badge ${STATUS_STYLE[inc.status]}`}>{inc.status}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
