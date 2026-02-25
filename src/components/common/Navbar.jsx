import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Vote, Menu, X, LogOut, User, LayoutDashboard, 
  Eye, BarChart3, Shield, Home, BookOpen, TrendingUp 
} from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'admin': return '/admin';
      case 'observer': return '/observer';
      case 'analyst': return '/analyst';
      default: return '/voter';
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <Vote className="brand-icon" />
          <span className="brand-text">EMIS</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="navbar-links">
          <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
            <Home size={18} />
            <span>Home</span>
          </Link>
          <Link to="/education" className={`nav-link ${isActive('/education') ? 'active' : ''}`}>
            <BookOpen size={18} />
            <span>Education</span>
          </Link>
          <Link to="/progress" className={`nav-link ${isActive('/progress') ? 'active' : ''}`}>
            <TrendingUp size={18} />
            <span>Progress</span>
          </Link>
          
          {user ? (
            <>
              <Link to={getDashboardLink()} className={`nav-link ${location.pathname.includes(getDashboardLink()) ? 'active' : ''}`}>
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
              </Link>
              <div className="nav-user">
                <div className="user-info">
                  <User size={18} />
                  <span>{user.name}</span>
                  <span className="user-role">{user.role}</span>
                </div>
                <button onClick={handleLogout} className="logout-btn">
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </div>
            </>
          ) : (
            <div className="nav-auth">
              <Link to="/login" className="btn btn-outline">Login</Link>
              <Link to="/register" className="btn btn-primary">Register</Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="mobile-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
        <Link to="/" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>
          <Home size={20} />
          Home
        </Link>
        <Link to="/education" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>
          <BookOpen size={20} />
          Education
        </Link>
        <Link to="/progress" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>
          <TrendingUp size={20} />
          Progress
        </Link>
        
        {user ? (
          <>
            <Link to={getDashboardLink()} className="mobile-link" onClick={() => setMobileMenuOpen(false)}>
              <LayoutDashboard size={20} />
              Dashboard
            </Link>
            <div className="mobile-user">
              <User size={20} />
              <span>{user.name}</span>
              <span className="role-badge">{user.role}</span>
            </div>
            <button onClick={handleLogout} className="mobile-link logout">
              <LogOut size={20} />
              Logout
            </button>
          </>
        ) : (
          <div className="mobile-auth">
            <Link to="/login" className="btn btn-outline" onClick={() => setMobileMenuOpen(false)}>
              Login
            </Link>
            <Link to="/register" className="btn btn-primary" onClick={() => setMobileMenuOpen(false)}>
              Register
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
