import { Link } from 'react-router-dom';
import { Vote, Mail, Phone, MapPin } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section brand-section">
          <div className="footer-brand">
            <Vote className="footer-icon" />
            <span>EMIS</span>
          </div>
          <p className="footer-tagline">
            Election Monitoring & Integrity System
          </p>
          <p className="footer-description">
            Ensuring transparent, fair, and secure elections for every citizen through technology and vigilance.
          </p>
        </div>

        <div className="footer-section">
          <h4>Quick Links</h4>
          <nav className="footer-nav">
            <Link to="/education">Voter Education</Link>
            <Link to="/progress">Election Progress</Link>
            <Link to="/verify">Verify & Vote</Link>
            <Link to="/report">Report Issue</Link>
          </nav>
        </div>

        <div className="footer-section">
          <h4>User Portals</h4>
          <nav className="footer-nav">
            <Link to="/voter">Citizen Portal</Link>
            <Link to="/observer">Observer Portal</Link>
            <Link to="/analyst">Analyst Portal</Link>
            <Link to="/admin">Admin Portal</Link>
          </nav>
        </div>

        <div className="footer-section">
          <h4>Support</h4>
          <div className="contact-info">
            <div className="contact-item">
              <Phone size={16} />
              <span>Helpline: 1950</span>
            </div>
            <div className="contact-item">
              <Mail size={16} />
              <span>help@emis.gov.in</span>
            </div>
            <div className="contact-item">
              <MapPin size={16} />
              <span>New Delhi, India</span>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-disclaimer">
        <p>
          <strong>DISCLAIMER:</strong> This system is a prototype developed for academic and monitoring 
          purposes only and does not replace or integrate with official government election or Aadhaar systems.
        </p>
      </div>

      <div className="footer-bottom">
        <p>© 2026 Election Monitoring & Integrity System | Academic Project</p>
        <div className="footer-colors">
          <span className="color-strip saffron"></span>
          <span className="color-strip white"></span>
          <span className="color-strip green"></span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
