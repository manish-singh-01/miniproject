import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    role: 'citizen', phone: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      return setError('Passwords do not match');
    }
    if (form.password.length < 6) {
      return setError('Password must be at least 6 characters');
    }

    setLoading(true);
    try {
      const { confirmPassword, ...payload } = form;
      await register(payload);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-glow" />
      <div className="auth-card auth-card--wide">
        <div className="auth-card__icon">👤</div>
        <h1>Create Account</h1>
        <p className="auth-card__sub">Join the Disaster Management Portal and help your community.</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-form__grid">
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                id="name" name="name" type="text"
                className="form-control" placeholder="Enter your full name"
                value={form.name} onChange={handleChange} required
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                id="phone" name="phone" type="tel"
                className="form-control" placeholder="e.g. 9876543210"
                value={form.phone} onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email" name="email" type="email"
              className="form-control" placeholder="Enter your email"
              value={form.email} onChange={handleChange} required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="role">Register As</label>
            <select id="role" name="role" className="form-control" value={form.role} onChange={handleChange}>
              <option value="citizen">🏘️ Citizen — Report incidents & find help</option>
              <option value="responder">🦺 Responder / Volunteer — Respond to incidents</option>
            </select>
          </div>

          <div className="auth-form__grid">
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password" name="password" type="password"
                className="form-control" placeholder="Min 6 characters"
                value={form.password} onChange={handleChange} required
                autoComplete="new-password"
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword" name="confirmPassword" type="password"
                className="form-control" placeholder="Repeat password"
                value={form.confirmPassword} onChange={handleChange} required
                autoComplete="new-password"
              />
            </div>
          </div>

          {error && <p className="error-msg">{error}</p>}

          <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account 🚀'}
          </button>
        </form>

        <p className="auth-card__switch">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
