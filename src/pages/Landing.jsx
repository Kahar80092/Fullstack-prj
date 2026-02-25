import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { civicModules } from '../data/mockData';
import AshokaChakra from '../components/AshokaChakra/AshokaChakra';
import ModuleModal from '../components/ModuleModal/ModuleModal';
import { 
  Vote, Shield, UserCheck, Eye, BarChart3, 
  Settings, ChevronRight, TrendingUp, Users,
  CheckCircle, AlertTriangle
} from 'lucide-react';
import './Landing.css';

const Landing = () => {
  const { stats } = useAuth();
  const [selectedModule, setSelectedModule] = useState(null);

  const handleSpokeClick = (module) => {
    setSelectedModule(module);
  };

  const closeModal = () => {
    setSelectedModule(null);
  };

  return (
    <div className="landing-page">
      {/* Hero Section - Saffron Theme */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <h1 className="hero-title">
              Election Monitoring
              <span className="hero-subtitle">& Integrity System</span>
            </h1>
            <p className="hero-description">
              Ensuring transparent, fair, and secure elections for every citizen.
            </p>
            <div className="hero-actions">
              <Link to="/verify" className="btn btn-hero-primary">
                <Vote size={20} />
                Verify & Vote
              </Link>
              <Link to="/education" className="btn btn-hero-outline">
                Learn More
                <ChevronRight size={18} />
              </Link>
            </div>
          </div>
          
          <div className="hero-badge">
            <Shield className="badge-icon" />
            <div className="badge-content">
              <span className="badge-title">Secure</span>
              <span className="badge-subtitle">Hashed Aadhaar</span>
            </div>
          </div>
        </div>
        
        {/* Decorative Wave */}
        <div className="hero-wave">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
          </svg>
        </div>
      </section>

      {/* Chakra Section - White Theme */}
      <section className="chakra-section">
        <div className="chakra-container">
          {/* Left Stats */}
          <div className="stats-column left">
            <div className="stat-card saffron">
              <div className="stat-icon">
                <CheckCircle size={20} />
              </div>
              <div className="stat-content">
                <span className="stat-label">Total Votes</span>
                <span className="stat-value">{stats.totalVotesCast.toLocaleString()}</span>
              </div>
            </div>
            <div className="stat-card green">
              <div className="stat-icon">
                <Shield size={20} />
              </div>
              <div className="stat-content">
                <span className="stat-label">Integrity</span>
                <span className="stat-value">{stats.integrityIndex}%</span>
              </div>
            </div>
          </div>

          {/* Ashoka Chakra */}
          <div className="chakra-wrapper">
            <AshokaChakra modules={civicModules} onSpokeClick={handleSpokeClick} />
            <p className="chakra-instruction">Click any spoke to explore</p>
          </div>

          {/* Right Stats */}
          <div className="stats-column right">
            <div className="stat-card blue">
              <div className="stat-icon">
                <TrendingUp size={20} />
              </div>
              <div className="stat-content">
                <span className="stat-label">Turnout</span>
                <span className="stat-value">{stats.turnoutPercentage}%</span>
              </div>
            </div>
            <div className="stat-card orange">
              <div className="stat-icon">
                <Eye size={20} />
              </div>
              <div className="stat-content">
                <span className="stat-label">Observers</span>
                <span className="stat-value">{stats.activeObservers.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Roles Section - Green Theme */}
      <section className="roles-section">
        <div className="roles-container">
          <Link to="/verify" className="role-card">
            <div className="role-icon citizen">
              <UserCheck size={28} />
            </div>
            <h3 className="role-title">Citizen</h3>
            <p className="role-description">
              Verify eligibility & cast your vote securely
            </p>
            <span className="role-arrow">
              <ChevronRight size={20} />
            </span>
          </Link>

          <Link to="/observer" className="role-card">
            <div className="role-icon observer">
              <Eye size={28} />
            </div>
            <h3 className="role-title">Observer</h3>
            <p className="role-description">
              Monitor polling activities & report anomalies
            </p>
            <span className="role-arrow">
              <ChevronRight size={20} />
            </span>
          </Link>

          <Link to="/analyst" className="role-card">
            <div className="role-icon analyst">
              <BarChart3 size={28} />
            </div>
            <h3 className="role-title">Analyst</h3>
            <p className="role-description">
              Analyze data & generate election reports
            </p>
            <span className="role-arrow">
              <ChevronRight size={20} />
            </span>
          </Link>

          <Link to="/admin" className="role-card">
            <div className="role-icon admin">
              <Settings size={28} />
            </div>
            <h3 className="role-title">Admin</h3>
            <p className="role-description">
              Manage users, roles & monitor activity
            </p>
            <span className="role-arrow">
              <ChevronRight size={20} />
            </span>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="features-container">
          <h2 className="section-title">Why Trust Our System?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <Shield size={32} />
              </div>
              <h3>Secure Verification</h3>
              <p>Aadhaar numbers are hashed using SHA-256. No raw data is ever stored.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <UserCheck size={32} />
              </div>
              <h3>Duplicate Prevention</h3>
              <p>Face matching prevents the same person from voting multiple times.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <Eye size={32} />
              </div>
              <h3>Real-time Monitoring</h3>
              <p>Observers can report issues instantly from any polling location.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <BarChart3 size={32} />
              </div>
              <h3>Transparent Analytics</h3>
              <p>All voting data is analyzed and made available through public dashboards.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Module Modal */}
      {selectedModule && (
        <ModuleModal module={selectedModule} onClose={closeModal} />
      )}
    </div>
  );
};

export default Landing;
