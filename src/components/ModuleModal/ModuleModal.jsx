import React from 'react';
import { X, BookOpen, ExternalLink } from 'lucide-react';
import './ModuleModal.css';

const ModuleModal = ({ module, onClose }) => {
  if (!module) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-container">
        <button className="modal-close" onClick={onClose}>
          <X size={24} />
        </button>
        
        <div className="modal-header">
          <div className="modal-icon">
            <BookOpen size={32} />
          </div>
          <div className="modal-badge">Module {module.id}</div>
        </div>
        
        <div className="modal-content">
          <h2 className="modal-title">{module.title}</h2>
          <p className="modal-description">{module.description}</p>
          
          <div className="modal-details">
            <div className="detail-item">
              <span className="detail-label">Category</span>
              <span className="detail-value">{module.category || 'Civic Education'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Duration</span>
              <span className="detail-value">{module.duration || '5-10 minutes'}</span>
            </div>
          </div>
          
          <div className="module-content-box">
            <h4>Key Points</h4>
            <ul className="key-points">
              {module.keyPoints ? (
                module.keyPoints.map((point, index) => (
                  <li key={index}>{point}</li>
                ))
              ) : (
                <>
                  <li>Understanding this fundamental aspect of democracy</li>
                  <li>How this relates to electoral integrity</li>
                  <li>Your role as a responsible citizen</li>
                  <li>Practical application in the voting process</li>
                </>
              )}
            </ul>
          </div>
          
          <div className="modal-actions">
            <button className="btn-learn-more">
              <BookOpen size={18} />
              Learn More
            </button>
            <button className="btn-close-modal" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
        
        <div className="modal-footer">
          <span className="footer-note">
            This is educational content for the Election Monitoring prototype.
          </span>
        </div>
      </div>
    </div>
  );
};

export default ModuleModal;
