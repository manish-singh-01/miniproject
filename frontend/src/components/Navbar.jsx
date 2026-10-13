import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setMenuOpen(false), [location]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/alerts', label: '🚨 Alerts' },
    { to: '/shelters', label: '🏥 Shelters' },
    { to: '/report', label: '📝 Report' },
    { to: '/emergency', label: '📞 Emergency' },
    { to: '/safety', label: '🛡️ Safety' },
  ];

  return (
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="navbar__inner">
        <Link to="/" className="navbar__logo">
          <span className="logo-icon">🚨</span>
          <span>DisasterPortal</span>
        </Link>

        <button
          className="navbar__hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? '✕' : '☰'}
        </button>

        <ul className={`navbar__links ${menuOpen ? 'navbar__links--open' : ''}`}>
          {navLinks.map(({ to, label }) => (
            <li key={to}>
              <Link
                to={to}
                className={`navbar__link ${location.pathname === to ? 'navbar__link--active' : ''}`}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="navbar__actions">
          {user ? (
            <>
              {user.role === 'admin' && (
                <Link to="/admin" className="btn btn-sm btn-primary" style={{ padding: '6px 12px' }}>
                  ⚙️ Admin HQ
                </Link>
              )}
              {user.role === 'responder' && (
                <Link to="/responder" className="btn btn-sm btn-primary" style={{ padding: '6px 12px' }}>
                  🦺 Rescue HQ
                </Link>
              )}
              <Link to={user.role === 'admin' ? '/admin' : user.role === 'responder' ? '/responder' : '/dashboard'} className="navbar__user-badge">
                <span className="user-role">{user.role}</span>
                {user.name.split(' ')[0]}
              </Link>
              <button onClick={handleLogout} className="btn btn-secondary navbar__logout">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost">Login</Link>
              <Link to="/register" className="btn btn-primary">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
