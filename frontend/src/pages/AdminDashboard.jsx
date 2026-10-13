import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  incidentService,
  alertService,
  taskService,
  shelterService,
  authService,
} from '../services/services';
import { connectSocket, disconnectSocket } from '../services/socket';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('incidents');
  const [loading, setLoading] = useState(true);

  // Data states
  const [incidents, setIncidents] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [shelters, setShelters] = useState([]);
  const [responders, setResponders] = useState([]);

  // Form states
  const [filterStatus, setFilterStatus] = useState('all');
  const [alertForm, setAlertForm] = useState({
    title: '',
    description: '',
    severity: 'high',
    type: 'flood',
    area: '',
  });
  const [taskForm, setTaskForm] = useState({
    incidentId: '',
    assignedTo: '',
    title: '',
    description: '',
  });
  const [shelterForm, setShelterForm] = useState({
    name: '',
    address: '',
    lat: '',
    lng: '',
    capacity: 100,
    contact: '',
  });

  const [feedback, setFeedback] = useState({ text: '', type: '' });

  const showMsg = (text, type = 'success') => {
    setFeedback({ text, type });
    setTimeout(() => setFeedback({ text: '', type: '' }), 4000);
  };

  useEffect(() => {
    fetchAllData();

    const socket = connectSocket(user);
    socket.on('incident:reported', () => fetchIncidents());
    socket.on('incident:verified', () => fetchIncidents());
    socket.on('task:updated', () => fetchTasks());

    return () => disconnectSocket();
  }, [user]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchIncidents(),
        fetchAlerts(),
        fetchTasks(),
        fetchShelters(),
        fetchResponders(),
      ]);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const fetchIncidents = async () => {
    try {
      const { data } = await incidentService.getAll();
      setIncidents(data);
    } catch {}
  };

  const fetchAlerts = async () => {
    try {
      const { data } = await alertService.getAll();
      setAlerts(data);
    } catch {}
  };

  const fetchTasks = async () => {
    try {
      const { data } = await taskService.getAll();
      setTasks(data);
    } catch {}
  };

  const fetchShelters = async () => {
    try {
      const { data } = await shelterService.getAll();
      setShelters(data);
    } catch {}
  };

  const fetchResponders = async () => {
    try {
      const { data } = await authService.getResponders();
      setResponders(data);
    } catch {}
  };

  // Incident Actions
  const handleVerify = async (id) => {
    try {
      await incidentService.verify(id);
      showMsg('Incident marked as verified! Notifications sent.');
      fetchIncidents();
    } catch (err) {
      showMsg(err.response?.data?.message || 'Verification failed', 'error');
    }
  };

  const handleResolve = async (id) => {
    try {
      await incidentService.resolve(id);
      showMsg('Incident marked as resolved.');
      fetchIncidents();
    } catch (err) {
      showMsg(err.response?.data?.message || 'Resolve action failed', 'error');
    }
  };

  // Broadcast Alert Action
  const handleCreateAlert = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: alertForm.title,
        description: alertForm.description,
        severity: alertForm.severity,
        type: alertForm.type,
        location: {
          area: alertForm.area || 'All Regions',
          coordinates: [77.209, 28.6139], // Default GPS if area only
        },
      };
      await alertService.create(payload);
      showMsg('Emergency Alert broadcasted immediately via Socket and Email!');
      setAlertForm({ title: '', description: '', severity: 'high', type: 'flood', area: '' });
      fetchAlerts();
    } catch (err) {
      showMsg(err.response?.data?.message || 'Failed to broadcast alert', 'error');
    }
  };

  const handleDeleteAlert = async (id) => {
    if (!window.confirm('Delete this active alert?')) return;
    try {
      await alertService.delete(id);
      showMsg('Alert removed');
      fetchAlerts();
    } catch (err) {
      showMsg('Failed to delete alert', 'error');
    }
  };

  // Task Assign Action
  const handleAssignTask = async (e) => {
    e.preventDefault();
    if (!taskForm.assignedTo || !taskForm.title) {
      showMsg('Please select a responder and give task title', 'error');
      return;
    }
    try {
      await taskService.create({
        incidentId: taskForm.incidentId || undefined,
        assignedTo: taskForm.assignedTo,
        title: taskForm.title,
        description: taskForm.description,
      });
      showMsg('Task successfully assigned to responder! Dispatched via Socket.');
      setTaskForm({ incidentId: '', assignedTo: '', title: '', description: '' });
      fetchTasks();
    } catch (err) {
      showMsg(err.response?.data?.message || 'Failed to dispatch task', 'error');
    }
  };

  // Shelter Create Action
  const handleCreateShelter = async (e) => {
    e.preventDefault();
    try {
      const latVal = parseFloat(shelterForm.lat) || 28.6139;
      const lngVal = parseFloat(shelterForm.lng) || 77.209;
      await shelterService.create({
        name: shelterForm.name,
        address: shelterForm.address,
        lat: latVal,
        lng: lngVal,
        location: {
          type: 'Point',
          coordinates: [lngVal, latVal],
        },
        capacity: parseInt(shelterForm.capacity, 10) || 100,
        contact: shelterForm.contact || '',
      });
      showMsg('Relief Shelter registered successfully!');
      setShelterForm({ name: '', address: '', lat: '', lng: '', capacity: 100, contact: '' });
      fetchShelters();
    } catch (err) {
      showMsg(err.response?.data?.message || 'Failed to register shelter', 'error');
    }
  };

  // Filter incidents
  const filteredIncidents = incidents.filter((inc) => {
    if (filterStatus === 'all') return true;
    return inc.status === filterStatus;
  });

  const pendingCount = incidents.filter((i) => i.status === 'unverified').length;
  const verifiedCount = incidents.filter((i) => i.status === 'verified').length;
  const activeAlertsCount = alerts.filter((a) => a.isActive).length;

  return (
    <div className="admin-page">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar__brand">
          <span>🛡️</span>
          <h2>Command HQ</h2>
        </div>

        <div className="admin-profile-card">
          <div className="admin-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
          <div className="admin-info">
            <span className="admin-name">{user?.name}</span>
            <span className="admin-badge">System Administrator</span>
          </div>
        </div>

        <nav className="admin-nav">
          <button
            className={`admin-nav-item ${activeTab === 'incidents' ? 'active' : ''}`}
            onClick={() => setActiveTab('incidents')}
          >
            📋 Incidents Review
            {pendingCount > 0 && <span className="tab-pill">{pendingCount}</span>}
          </button>
          <button
            className={`admin-nav-item ${activeTab === 'alerts' ? 'active' : ''}`}
            onClick={() => setActiveTab('alerts')}
          >
            🚨 Emergency Broadcast
            {activeAlertsCount > 0 && <span className="tab-pill alert-pill">{activeAlertsCount}</span>}
          </button>
          <button
            className={`admin-nav-item ${activeTab === 'tasks' ? 'active' : ''}`}
            onClick={() => setActiveTab('tasks')}
          >
            🦺 Dispatch Tasks
            <span className="tab-pill">{tasks.length}</span>
          </button>
          <button
            className={`admin-nav-item ${activeTab === 'shelters' ? 'active' : ''}`}
            onClick={() => setActiveTab('shelters')}
          >
            🏥 Relief Shelters
          </button>
          <hr className="admin-nav-divider" />
          <Link to="/dashboard" className="admin-nav-item secondary-nav">
            🏠 Citizen Dashboard View
          </Link>
          <Link to="/" className="admin-nav-item secondary-nav">
            🌐 Public Portal
          </Link>
        </nav>

        <button className="admin-logout-btn" onClick={logout}>
          Sign Out
        </button>
      </aside>

      {/* Main Command Center */}
      <main className="admin-main">
        {feedback.text && (
          <div className={`admin-toast toast-${feedback.type}`}>
            {feedback.type === 'error' ? '⚠️' : '✅'} {feedback.text}
          </div>
        )}

        {/* Top Header & Key Metrics */}
        <header className="admin-header">
          <div>
            <h1>Disaster Authority Command Center</h1>
            <p className="admin-subtitle">Real-time incident response, alert distribution, and resource coordination</p>
          </div>
          <button className="refresh-btn" onClick={fetchAllData}>
            🔄 Refresh Live Data
          </button>
        </header>

        {/* Stat Cards */}
        <div className="admin-stats-grid">
          <div className="admin-stat-card card-danger">
            <div className="stat-icon">⚠️</div>
            <div className="stat-content">
              <h3>{pendingCount}</h3>
              <p>Pending Verification</p>
            </div>
          </div>
          <div className="admin-stat-card card-warning">
            <div className="stat-icon">🚨</div>
            <div className="stat-content">
              <h3>{activeAlertsCount}</h3>
              <p>Active Live Alerts</p>
            </div>
          </div>
          <div className="admin-stat-card card-info">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <h3>{verifiedCount}</h3>
              <p>Verified Ongoing</p>
            </div>
          </div>
          <div className="admin-stat-card card-success">
            <div className="stat-icon">🦺</div>
            <div className="stat-content">
              <h3>{responders.length}</h3>
              <p>Active Responders</p>
            </div>
          </div>
          <div className="admin-stat-card card-purple">
            <div className="stat-icon">🏥</div>
            <div className="stat-content">
              <h3>{shelters.length}</h3>
              <p>Relief Centres</p>
            </div>
          </div>
        </div>

        {/* Tab 1: Incidents Review */}
        {activeTab === 'incidents' && (
          <section className="admin-section">
            <div className="section-head">
              <div className="section-head-title">
                <h2>Citizen Incident Reports</h2>
                <span className="section-count">{filteredIncidents.length} Records</span>
              </div>
              <div className="filter-controls">
                <span>Filter Status:</span>
                {['all', 'unverified', 'verified', 'resolved'].map((st) => (
                  <button
                    key={st}
                    className={`filter-btn ${filterStatus === st ? 'active' : ''}`}
                    onClick={() => setFilterStatus(st)}
                  >
                    {st.charAt(0).toUpperCase() + st.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="spinner-center"><div className="spinner" /></div>
            ) : filteredIncidents.length === 0 ? (
              <div className="empty-state-box">
                <p>No incidents found in this category.</p>
              </div>
            ) : (
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Type & Severity</th>
                      <th>Location / Address</th>
                      <th>Reported By</th>
                      <th>Time</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredIncidents.map((inc) => (
                      <tr key={inc._id}>
                        <td>
                          <div className="type-cell">
                            <span className="type-title">{inc.type.toUpperCase()}</span>
                            <span className={`badge badge-${inc.severity}`}>{inc.severity}</span>
                          </div>
                          <p className="cell-desc">{inc.description}</p>
                        </td>
                        <td>
                          <strong>{inc.address || 'GPS Coordinates Recorded'}</strong>
                          {inc.location?.coordinates && (
                            <div className="geo-coord">
                              [{inc.location.coordinates[1].toFixed(3)}, {inc.location.coordinates[0].toFixed(3)}]
                            </div>
                          )}
                        </td>
                        <td>
                          <div>{inc.reportedBy?.name || 'Citizen'}</div>
                          <small className="text-muted">{inc.reportedBy?.email || ''}</small>
                        </td>
                        <td>{new Date(inc.createdAt).toLocaleString('en-IN')}</td>
                        <td>
                          <span className={`badge badge-${inc.status}`}>{inc.status}</span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            {inc.status === 'unverified' && (
                              <button
                                className="btn-action btn-verify"
                                onClick={() => handleVerify(inc._id)}
                              >
                                ✔ Verify
                              </button>
                            )}
                            {inc.status === 'verified' && (
                              <>
                                <button
                                  className="btn-action btn-task"
                                  onClick={() => {
                                    setTaskForm({
                                      ...taskForm,
                                      incidentId: inc._id,
                                      title: `Respond to ${inc.type} at ${inc.address || 'location'}`,
                                    });
                                    setActiveTab('tasks');
                                  }}
                                >
                                  🦺 Dispatch Task
                                </button>
                                <button
                                  className="btn-action btn-resolve"
                                  onClick={() => handleResolve(inc._id)}
                                >
                                  ✅ Resolve
                                </button>
                              </>
                            )}
                            {inc.status === 'resolved' && (
                              <span className="resolved-tag">Completed</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* Tab 2: Emergency Broadcast */}
        {activeTab === 'alerts' && (
          <section className="admin-section">
            <div className="admin-grid-two">
              {/* Broadcast Form */}
              <div className="admin-card-panel">
                <h2>📡 Broadcast Live Emergency Alert</h2>
                <p className="panel-desc">
                  Broadcasts instant alert to all logged-in citizens and responders via Socket.io and Email.
                </p>
                <form onSubmit={handleCreateAlert} className="admin-form">
                  <div className="form-group">
                    <label>Alert Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Flash Flood Warning in District 4"
                      value={alertForm.title}
                      onChange={(e) => setAlertForm({ ...alertForm, title: e.target.value })}
                    />
                  </div>
                  <div className="form-row-2">
                    <div className="form-group">
                      <label>Disaster Category *</label>
                      <select
                        value={alertForm.type}
                        onChange={(e) => setAlertForm({ ...alertForm, type: e.target.value })}
                      >
                        <option value="flood">Flood</option>
                        <option value="earthquake">Earthquake</option>
                        <option value="cyclone">Cyclone / Storm</option>
                        <option value="fire">Wildfire / Industrial Fire</option>
                        <option value="landslide">Landslide</option>
                        <option value="tsunami">Tsunami</option>
                        <option value="general">General Emergency</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Severity Level *</label>
                      <select
                        value={alertForm.severity}
                        onChange={(e) => setAlertForm({ ...alertForm, severity: e.target.value })}
                      >
                        <option value="low">Low (Advisory)</option>
                        <option value="medium">Medium (Watch)</option>
                        <option value="high">High (Warning)</option>
                        <option value="critical">Critical (Immediate Evacuation)</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Affected Area / Region</label>
                    <input
                      type="text"
                      placeholder="e.g. Yamuna Floodplains & East Delhi"
                      value={alertForm.area}
                      onChange={(e) => setAlertForm({ ...alertForm, area: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Detailed Instructions & Safety Directive *</label>
                    <textarea
                      rows="4"
                      required
                      placeholder="e.g. Evacuate low-lying areas immediately. Move to designated higher ground shelters."
                      value={alertForm.description}
                      onChange={(e) => setAlertForm({ ...alertForm, description: e.target.value })}
                    />
                  </div>
                  <button type="submit" className="btn btn-primary btn-block">
                    🚨 Send Live Emergency Broadcast Now
                  </button>
                </form>
              </div>

              {/* Active Alerts List */}
              <div className="admin-card-panel">
                <h2>📢 Active Emergency Alerts</h2>
                <div className="active-alerts-list">
                  {alerts.length === 0 ? (
                    <p className="text-muted">No active emergency alerts recorded.</p>
                  ) : (
                    alerts.map((a) => (
                      <div key={a._id} className={`alert-item-card border-${a.severity}`}>
                        <div className="alert-item-header">
                          <span className={`badge badge-${a.severity}`}>{a.severity.toUpperCase()}</span>
                          <span className="alert-type-badge">{a.type}</span>
                          <button
                            className="btn-delete"
                            title="Remove alert"
                            onClick={() => handleDeleteAlert(a._id)}
                          >
                            🗑️
                          </button>
                        </div>
                        <h3>{a.title}</h3>
                        <p>{a.description}</p>
                        <div className="alert-item-footer">
                          <span>📍 {a.location?.area || 'All Areas'}</span>
                          <span>🕒 {new Date(a.createdAt).toLocaleTimeString('en-IN')}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Tab 3: Dispatch Tasks */}
        {activeTab === 'tasks' && (
          <section className="admin-section">
            <div className="admin-grid-two">
              {/* Task Creation Form */}
              <div className="admin-card-panel">
                <h2>🦺 Dispatch Task to First Responder</h2>
                <p className="panel-desc">Assign targeted emergency and rescue operations directly to active responders.</p>
                <form onSubmit={handleAssignTask} className="admin-form">
                  <div className="form-group">
                    <label>Select Active Responder *</label>
                    <select
                      required
                      value={taskForm.assignedTo}
                      onChange={(e) => setTaskForm({ ...taskForm, assignedTo: e.target.value })}
                    >
                      <option value="">-- Choose Responder Team --</option>
                      {responders.map((r) => (
                        <option key={r._id} value={r._id}>
                          {r.name} ({r.email}) {r.phone ? `- ${r.phone}` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Associated Incident (Optional)</label>
                    <select
                      value={taskForm.incidentId}
                      onChange={(e) => setTaskForm({ ...taskForm, incidentId: e.target.value })}
                    >
                      <option value="">-- No specific incident / General Dispatch --</option>
                      {incidents
                        .filter((i) => i.status === 'verified')
                        .map((inc) => (
                          <option key={inc._id} value={inc._id}>
                            [{inc.type.toUpperCase()}] {inc.address || 'Incident'} ({inc.severity})
                          </option>
                        ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Task Mission Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Conduct water rescue at Sector 14"
                      value={taskForm.title}
                      onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Mission Instructions & Details</label>
                    <textarea
                      rows="3"
                      placeholder="Provide coordinates, patient info, required gear or safety hazards..."
                      value={taskForm.description}
                      onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                    />
                  </div>
                  <button type="submit" className="btn btn-primary btn-block">
                    ⚡ Assign & Notify Responder
                  </button>
                </form>
              </div>

              {/* Tasks Live Feed */}
              <div className="admin-card-panel">
                <h2>📋 Dispatched Operations Status</h2>
                <div className="task-feed">
                  {tasks.length === 0 ? (
                    <p className="text-muted">No responder tasks dispatched yet.</p>
                  ) : (
                    tasks.map((t) => (
                      <div key={t._id} className="task-item-card">
                        <div className="task-item-header">
                          <h4>{t.title}</h4>
                          <span className={`badge badge-task-${t.status}`}>
                            {t.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                        <p>{t.description || 'No description provided.'}</p>
                        <div className="task-meta">
                          <span>👤 Responder: <strong>{t.assignedTo?.name || 'Assigned'}</strong></span>
                          <span>📅 {new Date(t.createdAt).toLocaleDateString('en-IN')}</span>
                        </div>
                        {t.notes && <div className="responder-notes">💬 Note: {t.notes}</div>}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Tab 4: Relief Shelters */}
        {activeTab === 'shelters' && (
          <section className="admin-section">
            <div className="admin-grid-two">
              {/* Add Shelter */}
              <div className="admin-card-panel">
                <h2>🏥 Register Relief Centre / Shelter</h2>
                <p className="panel-desc">Add official community shelters and evacuation hubs to the public directory.</p>
                <form onSubmit={handleCreateShelter} className="admin-form">
                  <div className="form-group">
                    <label>Shelter Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Red Cross Community Relief Hall"
                      value={shelterForm.name}
                      onChange={(e) => setShelterForm({ ...shelterForm, name: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Address / Landmark *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ring Road, Near Civil Hospital"
                      value={shelterForm.address}
                      onChange={(e) => setShelterForm({ ...shelterForm, address: e.target.value })}
                    />
                  </div>
                  <div className="form-row-2">
                    <div className="form-group">
                      <label>Latitude (e.g. 28.6139)</label>
                      <input
                        type="number"
                        step="any"
                        placeholder="28.6139"
                        value={shelterForm.lat}
                        onChange={(e) => setShelterForm({ ...shelterForm, lat: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Longitude (e.g. 77.2090)</label>
                      <input
                        type="number"
                        step="any"
                        placeholder="77.2090"
                        value={shelterForm.lng}
                        onChange={(e) => setShelterForm({ ...shelterForm, lng: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="form-row-2">
                    <div className="form-group">
                      <label>Capacity (Persons)</label>
                      <input
                        type="number"
                        value={shelterForm.capacity}
                        onChange={(e) => setShelterForm({ ...shelterForm, capacity: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Helpline / Contact</label>
                      <input
                        type="text"
                        placeholder="+91 11 2345 6789"
                        value={shelterForm.contact}
                        onChange={(e) => setShelterForm({ ...shelterForm, contact: e.target.value })}
                      />
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary btn-block">
                    ➕ Register Shelter
                  </button>
                </form>
              </div>

              {/* Shelters Directory */}
              <div className="admin-card-panel">
                <h2>🏢 Active Relief Shelters ({shelters.length})</h2>
                <div className="shelter-feed">
                  {shelters.length === 0 ? (
                    <p className="text-muted">No shelters registered yet.</p>
                  ) : (
                    shelters.map((s) => (
                      <div key={s._id} className="shelter-item-card">
                        <div className="shelter-item-head">
                          <h4>{s.name}</h4>
                          <span className="badge badge-low">{s.capacity} Capacity</span>
                        </div>
                        <p>📍 {s.address}</p>
                        <div className="shelter-item-foot">
                          <span>📞 {s.contact || 'No contact specified'}</span>
                          <span>👥 Occupants: {s.currentOccupancy || 0}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
