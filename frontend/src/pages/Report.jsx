import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { incidentService } from '../services/services';
import toast, { Toaster } from 'react-hot-toast';
import './Report.css';

const TYPES = ['flood', 'earthquake', 'cyclone', 'fire', 'landslide', 'other'];
const SEVERITIES = [
  { value: 'low', label: '🟢 Low', desc: 'Minor, no immediate danger' },
  { value: 'medium', label: '🟡 Medium', desc: 'Moderate risk, monitor closely' },
  { value: 'high', label: '🔴 High', desc: 'Immediate threat to life' },
];

const Report = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({
    type: 'flood', severity: 'medium',
    description: '', address: '',
    lat: '', lng: '',
  });
  const [locationStatus, setLocationStatus] = useState('detecting');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationStatus('unavailable');
      return;
    }
    setLocationStatus('detecting');
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setForm((f) => ({
          ...f,
          lat: coords.latitude.toFixed(6),
          lng: coords.longitude.toFixed(6),
        }));
        setLocationStatus('detected');
      },
      () => setLocationStatus('failed'),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.lat || !form.lng) {
      toast.error('GPS location is required. Allow location access.');
      return;
    }
    setLoading(true);
    try {
      await incidentService.create({
        ...form,
        lat: parseFloat(form.lat),
        lng: parseFloat(form.lng),
      });
      setSuccess(true);
      setForm({ type: 'flood', severity: 'medium', description: '', address: '', lat: form.lat, lng: form.lng });
      toast.success('Report submitted! Pending admin verification.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit report.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="report-page">
      <Toaster position="top-right" />
      <div className="report-page__hero">
        <div className="auth-bg-glow" />
        <p className="tagline">Citizen Reporting</p>
        <h1>📝 Report a Disaster</h1>
        <p>Submit incident information to help authorities respond faster.</p>
      </div>

      <div className="report-page__body section">
        <div className="report-layout">
          {/* FORM */}
          <div className="report-form-card">
            {success && (
              <div className="success-msg" style={{ marginBottom: '20px' }}>
                ✅ Report submitted successfully! It will appear on the map after admin verification.
              </div>
            )}

            <form onSubmit={handleSubmit} className="report-form">
              {/* Disaster Type */}
              <div className="form-group">
                <label>Disaster Type</label>
                <div className="type-grid">
                  {TYPES.map((t) => (
                    <button
                      key={t}
                      type="button"
                      className={`type-btn ${form.type === t ? 'type-btn--active' : ''}`}
                      onClick={() => setForm({ ...form, type: t })}
                    >
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Severity */}
              <div className="form-group">
                <label>Severity</label>
                <div className="severity-grid">
                  {SEVERITIES.map(({ value, label, desc }) => (
                    <button
                      key={value}
                      type="button"
                      className={`severity-btn ${form.severity === value ? 'severity-btn--active severity-btn--' + value : ''}`}
                      onClick={() => setForm({ ...form, severity: value })}
                    >
                      <strong>{label}</strong>
                      <span>{desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="form-group">
                <label htmlFor="description">Description <span className="required">*</span></label>
                <textarea
                  id="description"
                  name="description"
                  className="form-control"
                  placeholder="Describe what you see — water levels, number of people affected, road conditions..."
                  rows={4}
                  value={form.description}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Address */}
              <div className="form-group">
                <label htmlFor="address">Address / Landmark</label>
                <input
                  id="address" name="address" type="text"
                  className="form-control"
                  placeholder="e.g. Near Gandhi Chowk, Roorkee"
                  value={form.address}
                  onChange={handleChange}
                />
              </div>

              {/* GPS */}
              <div className="gps-row">
                <div className={`gps-status gps-status--${locationStatus}`}>
                  {locationStatus === 'detecting' && '📡 Detecting your location...'}
                  {locationStatus === 'detected' && `✅ GPS: ${form.lat}, ${form.lng}`}
                  {locationStatus === 'failed' && '⚠️ GPS failed — enter coordinates manually'}
                  {locationStatus === 'unavailable' && '❌ Geolocation not supported'}
                </div>
                {locationStatus === 'failed' && (
                  <div className="gps-manual">
                    <input name="lat" type="number" step="any" className="form-control" placeholder="Latitude" value={form.lat} onChange={handleChange} />
                    <input name="lng" type="number" step="any" className="form-control" placeholder="Longitude" value={form.lng} onChange={handleChange} />
                  </div>
                )}
              </div>

              <button type="submit" className="btn btn-primary report-submit" disabled={loading}>
                {loading ? 'Submitting...' : '🚨 Submit Report'}
              </button>
            </form>
          </div>

          {/* INFO PANEL */}
          <div className="report-info">
            <div className="info-card">
              <h3>📋 How it works</h3>
              <ol className="info-steps">
                <li>Fill in the incident details and your GPS location is auto-captured</li>
                <li>Submit the report — it gets sent to administrators immediately</li>
                <li>Admin verifies and publishes it to the live map</li>
                <li>Responders get assigned and dispatched to your location</li>
              </ol>
            </div>
            <div className="info-card info-card--emergency">
              <h3>🆘 Life-threatening emergency?</h3>
              <p>Don't wait — call emergency services directly:</p>
              <div className="sos-numbers">
                <a href="tel:112">🚓 Police: 112</a>
                <a href="tel:108">🚑 Ambulance: 108</a>
                <a href="tel:101">🚒 Fire: 101</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Report;
