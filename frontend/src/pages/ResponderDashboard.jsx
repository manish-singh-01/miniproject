import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { taskService, alertService, authService, incidentService } from '../services/services';
import { connectSocket, disconnectSocket } from '../services/socket';
import './ResponderDashboard.css';

const ResponderDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('missions');
  const [tasks, setTasks] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [gpsStatus, setGpsStatus] = useState('Detecting GPS...');
  const [taskNotes, setTaskNotes] = useState({});
  const [feedback, setFeedback] = useState({ text: '', type: '' });

  const showMsg = (text, type = 'success') => {
    setFeedback({ text, type });
    setTimeout(() => setFeedback({ text: '', type: '' }), 4000);
  };

  useEffect(() => {
    loadData();

    // Socket listeners for real-time task dispatch & alerts
    const socket = connectSocket(user);
    socket.on('task:assigned', (data) => {
      showMsg(`⚡ New Mission Dispatched: "${data.title}"!`, 'warning');
      loadTasks();
    });
    socket.on('alert:new', (data) => {
      showMsg(`🚨 Emergency Alert Broadcast: ${data.title}`, 'warning');
      loadAlerts();
    });
    socket.on('incident:reported', () => {
      showMsg('📢 New Citizen Incident Reported!', 'warning');
      loadIncidents();
    });
    socket.on('incident:verified', () => {
      loadIncidents();
    });

    return () => disconnectSocket();
  }, [user]);

  // Track & Update GPS
  useEffect(() => {
    updateGpsLocation();
  }, []);

  const updateGpsLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async ({ coords }) => {
          try {
            await authService.updateLocation(coords.latitude, coords.longitude);
            setGpsStatus(`📍 Lat: ${coords.latitude.toFixed(4)}, Lng: ${coords.longitude.toFixed(4)}`);
          } catch {
            setGpsStatus('GPS updated locally');
          }
        },
        () => setGpsStatus('GPS Permission Denied / Default Coordinates')
      );
    } else {
      setGpsStatus('Geolocation not supported');
    }
  };

  const loadData = async () => {
    setLoading(true);
    await Promise.all([loadTasks(), loadAlerts(), loadIncidents()]);
    setLoading(false);
  };

  const loadTasks = async () => {
    try {
      const { data } = await taskService.getMine();
      setTasks(data);
    } catch {}
  };

  const loadAlerts = async () => {
    try {
      const { data } = await alertService.getActive();
      setAlerts(data);
    } catch {}
  };

  const loadIncidents = async () => {
    try {
      const { data } = await incidentService.getAll();
      setIncidents(data);
    } catch {}
  };

  const handleUpdateStatus = async (taskId, newStatus) => {
    try {
      const notes = taskNotes[taskId] || '';
      await taskService.updateStatus(taskId, newStatus, notes);
      showMsg(`Mission status updated to "${newStatus.replace('_', ' ').toUpperCase()}"`);
      loadTasks();
    } catch (err) {
      showMsg(err.response?.data?.message || 'Failed to update status', 'error');
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'active') return t.status !== 'done';
    if (filter === 'completed') return t.status === 'done';
    return true;
  });

  const activeCount = tasks.filter((t) => t.status !== 'done').length;
  const completedCount = tasks.filter((t) => t.status === 'done').length;

  return (
    <div className="responder-page">
      {/* Sidebar */}
      <aside className="responder-sidebar">
        <div className="responder-sidebar__brand">
          <span>🚑</span>
          <h2>Rescue Unit HQ</h2>
        </div>

        <div className="responder-profile-card">
          <div className="responder-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
          <div className="responder-info">
            <span className="responder-name">{user?.name}</span>
            <span className="responder-badge">First Responder (On Duty)</span>
          </div>
        </div>

        <div className="gps-indicator-box">
          <div className="gps-pulse">
            <span className="pulse-dot"></span>
            <strong>Live Beacon:</strong>
          </div>
          <p className="gps-text">{gpsStatus}</p>
          <button className="btn-gps-sync" onClick={updateGpsLocation}>
            📡 Ping GPS Location
          </button>
        </div>

        <nav className="responder-nav">
          <button
            className={`responder-nav-item ${activeTab === 'missions' ? 'active' : ''}`}
            onClick={() => setActiveTab('missions')}
          >
            🦺 Assigned Missions
            {activeCount > 0 && <span className="tab-pill alert-pill">{activeCount}</span>}
          </button>
          <button
            className={`responder-nav-item ${activeTab === 'incidents' ? 'active' : ''}`}
            onClick={() => setActiveTab('incidents')}
          >
            📋 Live Incidents / SOS Feed
            {incidents.length > 0 && <span className="tab-pill">{incidents.length}</span>}
          </button>
          <Link to="/alerts" className="responder-nav-item">
            🚨 Live Emergency Alerts
          </Link>
          <Link to="/shelters" className="responder-nav-item">
            🏥 Relief Centres
          </Link>
          <Link to="/dashboard" className="responder-nav-item secondary-nav">
            🏠 Citizen Dashboard View
          </Link>
          <Link to="/" className="responder-nav-item secondary-nav">
            🌐 Public Portal
          </Link>
        </nav>

        <button className="responder-logout-btn" onClick={logout}>
          Sign Out
        </button>
      </aside>

      {/* Main Missions Center */}
      <main className="responder-main">
        {feedback.text && (
          <div className={`responder-toast toast-${feedback.type}`}>
            {feedback.type === 'error' ? '⚠️' : '⚡'} {feedback.text}
          </div>
        )}

        {/* Top Header */}
        <header className="responder-header">
          <div>
            <h1>Emergency Response Field Operations</h1>
            <p className="responder-subtitle">Active missions, live incident telemetry, and hazard radar</p>
          </div>
          <button className="refresh-btn" onClick={loadData}>
            🔄 Refresh Data
          </button>
        </header>

        {/* Stats Row */}
        <div className="responder-stats-grid">
          <div className="responder-stat-card card-warning">
            <div className="stat-icon">🏃‍♂️</div>
            <div className="stat-content">
              <h3>{activeCount}</h3>
              <p>Active Operations</p>
            </div>
          </div>
          <div className="responder-stat-card card-info">
            <div className="stat-icon">📋</div>
            <div className="stat-content">
              <h3>{incidents.length}</h3>
              <p>Reported Incidents</p>
            </div>
          </div>
          <div className="responder-stat-card card-success">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <h3>{completedCount}</h3>
              <p>Missions Completed</p>
            </div>
          </div>
          <div className="responder-stat-card card-danger">
            <div className="stat-icon">🚨</div>
            <div className="stat-content">
              <h3>{alerts.length}</h3>
              <p>Regional Hazards</p>
            </div>
          </div>
        </div>

        {/* Missions / Incidents Content Grid */}
        <div className="responder-content-grid">
          {activeTab === 'missions' ? (
            <div className="missions-panel">
              <div className="panel-header">
                <div className="panel-header-title">
                  <h2>Assigned Field Operations</h2>
                  <span className="missions-count">({filteredTasks.length} Missions)</span>
                </div>
                <div className="missions-filter">
                  <button
                    className={`btn-filter ${filter === 'all' ? 'active' : ''}`}
                    onClick={() => setFilter('all')}
                  >
                    All ({tasks.length})
                  </button>
                  <button
                    className={`btn-filter ${filter === 'active' ? 'active' : ''}`}
                    onClick={() => setFilter('active')}
                  >
                    Active ({activeCount})
                  </button>
                  <button
                    className={`btn-filter ${filter === 'completed' ? 'active' : ''}`}
                    onClick={() => setFilter('completed')}
                  >
                    Completed ({completedCount})
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="spinner-center"><div className="spinner" /></div>
              ) : filteredTasks.length === 0 ? (
              <div className="empty-missions-box">
                <span className="empty-icon">🎉</span>
                <h3>No missions pending right now</h3>
                <p>You have responded to all assigned operations. Stand by for further dispatch.</p>
              </div>
            ) : (
              <div className="missions-list">
                {filteredTasks.map((t) => (
                  <div key={t._id} className={`mission-card status-${t.status}`}>
                    <div className="mission-card-top">
                      <div className="mission-title-group">
                        <span className={`badge badge-task-${t.status}`}>
                          {t.status.replace('_', ' ').toUpperCase()}
                        </span>
                        <h3>{t.title}</h3>
                      </div>
                      <span className="dispatch-time">
                        {new Date(t.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <p className="mission-desc">{t.description || 'No additional instructions.'}</p>

                    {/* Associated Incident Info */}
                    {t.incidentId && (
                      <div className="incident-context-box">
                        <span className="context-label">Target Incident:</span>
                        <strong>{t.incidentId.type?.toUpperCase()}</strong> —{' '}
                        <span>{t.incidentId.address || 'GPS Location'}</span>
                        <span className={`badge badge-${t.incidentId.severity || 'high'}`}>
                          {t.incidentId.severity}
                        </span>
                      </div>
                    )}

                    {/* Field Notes Input */}
                    {t.status !== 'done' && (
                      <div className="notes-input-box">
                        <input
                          type="text"
                          placeholder="Add field update or notes (e.g. 2 casualties evacuated)..."
                          value={taskNotes[t._id] || ''}
                          onChange={(e) => setTaskNotes({ ...taskNotes, [t._id]: e.target.value })}
                        />
                      </div>
                    )}

                    {/* Status Actions */}
                    <div className="mission-actions">
                      {t.status === 'assigned' && (
                        <button
                          className="btn-status btn-en-route"
                          onClick={() => handleUpdateStatus(t._id, 'en_route')}
                        >
                          🏃 Depart (En Route)
                        </button>
                      )}
                      {t.status === 'en_route' && (
                        <button
                          className="btn-status btn-on-site"
                          onClick={() => handleUpdateStatus(t._id, 'on_site')}
                        >
                          📍 Confirm Arrival On Site
                        </button>
                      )}
                      {t.status === 'on_site' && (
                        <button
                          className="btn-status btn-complete"
                          onClick={() => handleUpdateStatus(t._id, 'done')}
                        >
                          ✅ Complete Operation
                        </button>
                      )}
                      {t.status === 'done' && (
                        <div className="completed-badge">
                          ✓ Mission Completed at {new Date(t.doneAt || t.updatedAt).toLocaleTimeString('en-IN')}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          ) : (
            <div className="missions-panel">
              <div className="panel-header">
                <div className="panel-header-title">
                  <h2>Live Incident Reports / SOS Telemetry</h2>
                  <span className="missions-count">({incidents.length} Reported)</span>
                </div>
              </div>

              {loading ? (
                <div className="spinner-center"><div className="spinner" /></div>
              ) : incidents.length === 0 ? (
                <div className="empty-missions-box">
                  <span className="empty-icon">📭</span>
                  <h3>No incident reports</h3>
                  <p>All sectors currently report nominal status.</p>
                </div>
              ) : (
                <div className="missions-list">
                  {incidents.map((inc) => (
                    <div key={inc._id} className="mission-card">
                      <div className="mission-card-top">
                        <div className="mission-title-group">
                          <span className={`badge badge-${inc.severity}`}>
                            {inc.severity.toUpperCase()}
                          </span>
                          <span className={`badge badge-${inc.status}`}>
                            {inc.status}
                          </span>
                          <h3>{inc.type.toUpperCase()}</h3>
                        </div>
                        <span className="dispatch-time">
                          {new Date(inc.createdAt).toLocaleString('en-IN')}
                        </span>
                      </div>
                      <p className="mission-desc">{inc.description}</p>
                      <div className="incident-context-box">
                        <span className="context-label">Location:</span>
                        <strong>{inc.address || 'GPS Coordinates Recorded'}</strong>
                        {inc.location?.coordinates && (
                          <span className="geo-coord" style={{ color: '#38bdf8', marginLeft: '6px' }}>
                            [{inc.location.coordinates[1].toFixed(4)}, {inc.location.coordinates[0].toFixed(4)}]
                          </span>
                        )}
                      </div>
                      <div className="task-meta" style={{ marginTop: '8px', fontSize: '0.82rem', color: '#94a3b8' }}>
                        <span>Reported by: <strong>{inc.reportedBy?.name || 'Citizen'}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Right Column: Active Emergency Alerts */}
          <div className="side-alerts-panel">
            <h2>🚨 Regional Threat Level</h2>
            <p className="panel-sub">Real-time alerts broadcasted by Disaster Management HQ</p>

            <div className="alerts-feed">
              {alerts.length === 0 ? (
                <p className="text-muted">No active emergency alerts in this sector.</p>
              ) : (
                alerts.map((a) => (
                  <div key={a._id} className={`threat-card threat-${a.severity}`}>
                    <div className="threat-header">
                      <span className={`badge badge-${a.severity}`}>{a.severity.toUpperCase()}</span>
                      <span className="threat-type">{a.type}</span>
                    </div>
                    <h4>{a.title}</h4>
                    <p>{a.description}</p>
                    <small>📍 {a.location?.area || 'All Sectors'}</small>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ResponderDashboard;
