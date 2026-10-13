import { useState, useEffect } from 'react';
import { alertService } from '../services/services';
import { getSocket } from '../services/socket';
import toast, { Toaster } from 'react-hot-toast';
import './Alerts.css';

const TYPE_ICON = {
  flood: '🌊', earthquake: '🌍', cyclone: '🌀',
  fire: '🔥', landslide: '⛰️', general: '🚨',
};

const AlertCard = ({ alert }) => (
  <div className={`alert-card alert-card--${alert.severity}`}>
    <div className="alert-card__top">
      <span className="alert-card__icon">{TYPE_ICON[alert.type] || '🚨'}</span>
      <span className={`badge badge-${alert.severity}`}>{alert.severity.toUpperCase()}</span>
    </div>
    <h3>{alert.title}</h3>
    <p className="alert-card__msg">{alert.message}</p>
    <div className="alert-card__meta">
      <span>📍 {alert.affectedArea || 'Multiple areas'}</span>
      <span>🕐 {new Date(alert.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
    </div>
  </div>
);

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadAlerts();

    // Real-time socket listener
    const socket = getSocket();
    socket.connect();
    socket.on('alert:new', (newAlert) => {
      setAlerts((prev) => [newAlert, ...prev]);
      toast.custom(
        <div className="live-toast">
          <span>🚨</span>
          <div>
            <strong>New Alert: {newAlert.title}</strong>
            <p>{newAlert.message}</p>
          </div>
        </div>,
        { duration: 6000 }
      );
    });
    return () => socket.off('alert:new');
  }, []);

  const loadAlerts = async () => {
    try {
      const { data } = await alertService.getActive();
      setAlerts(data);
    } catch {
      toast.error('Could not load alerts');
    } finally {
      setLoading(false);
    }
  };

  const filtered = filter === 'all' ? alerts : alerts.filter((a) => a.severity === filter);

  return (
    <div className="alerts-page">
      <Toaster position="top-right" />

      <div className="alerts-page__header">
        <div className="alerts-page__header-content">
          <p className="tagline">Real-time Updates</p>
          <h1>🚨 Disaster Alerts</h1>
          <p>Stay updated with live disaster alerts and warnings from authorities.</p>
        </div>

        <div className="alerts-filter">
          {['all', 'high', 'medium', 'low'].map((f) => (
            <button
              key={f}
              className={`filter-btn ${filter === f ? 'filter-btn--active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="alerts-page__body section">
        {loading ? (
          <div className="spinner" />
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <span>✅</span>
            <h3>No {filter !== 'all' ? filter + ' ' : ''}alerts at this time</h3>
            <p>You're safe! Check back for updates.</p>
          </div>
        ) : (
          <div className="alerts-grid">
            {filtered.map((alert) => (
              <AlertCard key={alert._id} alert={alert} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Alerts;
