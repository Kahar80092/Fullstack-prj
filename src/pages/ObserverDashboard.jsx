import React, { useState } from 'react';
import { 
  Eye, FileText, MapPin, Camera, Clock, Send,
  CheckCircle, AlertTriangle, Flag, ClipboardList
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const ObserverDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [reportForm, setReportForm] = useState({
    type: 'irregularity',
    location: '',
    description: '',
    severity: 'medium'
  });
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  const { stats, reports, addReport, user } = useAuth();

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Eye },
    { id: 'submit', label: 'Submit Report', icon: FileText },
    { id: 'myreports', label: 'My Reports', icon: ClipboardList },
    { id: 'checklist', label: 'Checklist', icon: CheckCircle }
  ];

  const checklistItems = [
    { id: 1, text: 'Verify polling booth setup', completed: true },
    { id: 2, text: 'Check EVM functionality', completed: true },
    { id: 3, text: 'Confirm voter queue management', completed: false },
    { id: 4, text: 'Observe voter identification process', completed: false },
    { id: 5, text: 'Monitor counting procedure', completed: false },
    { id: 6, text: 'Document any irregularities', completed: false },
    { id: 7, text: 'Submit final observation report', completed: false }
  ];

  const handleFormChange = (e) => {
    setReportForm({
      ...reportForm,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmitReport = (e) => {
    e.preventDefault();
    
    addReport({
      ...reportForm,
      reporter: user?.name || 'Observer',
      time: new Date().toLocaleString()
    });
    
    setSubmitSuccess(true);
    setReportForm({
      type: 'irregularity',
      location: '',
      description: '',
      severity: 'medium'
    });
    
    setTimeout(() => setSubmitSuccess(false), 3000);
  };

  const myReports = reports.filter(r => r.reporter === (user?.name || 'Observer'));

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        {/* Sidebar */}
        <aside className="dashboard-sidebar">
          <div className="sidebar-header">
            <Eye size={24} />
            <span>Observer Panel</span>
          </div>
          <nav className="sidebar-nav">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <tab.icon size={18} />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="dashboard-main">
          {/* Header */}
          <header className="dashboard-header">
            <div>
              <h1>Observer Dashboard</h1>
              <p>Monitor and report election activities</p>
            </div>
            <div className="observer-badge">
              <Eye size={18} />
              <span>Active Observer</span>
              <div className="pulse-dot"></div>
            </div>
          </header>

          {activeTab === 'overview' && (
            <div className="dashboard-content">
              {/* Quick Stats */}
              <div className="stats-grid">
                <div className="stat-box">
                  <div className="stat-icon green">
                    <CheckCircle size={24} />
                  </div>
                  <div className="stat-info">
                    <span className="stat-label">Booths Monitored</span>
                    <span className="stat-value">12</span>
                  </div>
                </div>

                <div className="stat-box">
                  <div className="stat-icon saffron">
                    <FileText size={24} />
                  </div>
                  <div className="stat-info">
                    <span className="stat-label">Reports Submitted</span>
                    <span className="stat-value">{myReports.length}</span>
                  </div>
                </div>

                <div className="stat-box">
                  <div className="stat-icon blue">
                    <Clock size={24} />
                  </div>
                  <div className="stat-info">
                    <span className="stat-label">Hours Active</span>
                    <span className="stat-value">4.5</span>
                  </div>
                </div>

                <div className="stat-box">
                  <div className="stat-icon orange">
                    <Flag size={24} />
                  </div>
                  <div className="stat-info">
                    <span className="stat-label">Issues Flagged</span>
                    <span className="stat-value">{myReports.filter(r => r.severity === 'high').length}</span>
                  </div>
                </div>
              </div>

              {/* Live Updates */}
              <div className="charts-row">
                <div className="chart-card">
                  <h3>
                    <MapPin size={18} />
                    Assigned Locations
                  </h3>
                  <div className="location-list">
                    {[
                      { name: 'Booth #23 - North Delhi', status: 'active' },
                      { name: 'Booth #24 - North Delhi', status: 'active' },
                      { name: 'Booth #25 - East Delhi', status: 'pending' },
                      { name: 'Booth #26 - East Delhi', status: 'pending' }
                    ].map((loc, i) => (
                      <div key={i} className="location-item">
                        <MapPin size={16} />
                        <span>{loc.name}</span>
                        <span className={`loc-status ${loc.status}`}>{loc.status}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="chart-card">
                  <h3>
                    <AlertTriangle size={18} />
                    Recent Alerts
                  </h3>
                  <div className="alert-list">
                    {[
                      { text: 'Queue management issue at Booth #23', time: '10 min ago', priority: 'medium' },
                      { text: 'Voter ID verification delay', time: '25 min ago', priority: 'low' },
                      { text: 'EVM technical check required', time: '45 min ago', priority: 'high' }
                    ].map((alert, i) => (
                      <div key={i} className={`alert-item ${alert.priority}`}>
                        <div className="alert-indicator"></div>
                        <div className="alert-content">
                          <span className="alert-text">{alert.text}</span>
                          <span className="alert-time">{alert.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="quick-actions">
                <h3>Quick Actions</h3>
                <div className="actions-grid">
                  <button className="action-btn" onClick={() => setActiveTab('submit')}>
                    <FileText size={24} />
                    <span>Submit Report</span>
                  </button>
                  <button className="action-btn">
                    <Camera size={24} />
                    <span>Capture Photo</span>
                  </button>
                  <button className="action-btn" onClick={() => setActiveTab('checklist')}>
                    <CheckCircle size={24} />
                    <span>View Checklist</span>
                  </button>
                  <button className="action-btn">
                    <Flag size={24} />
                    <span>Flag Issue</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'submit' && (
            <div className="dashboard-content">
              <div className="form-card">
                <h3>Submit Observation Report</h3>
                
                {submitSuccess && (
                  <div className="success-message">
                    <CheckCircle size={20} />
                    <span>Report submitted successfully!</span>
                  </div>
                )}

                <form onSubmit={handleSubmitReport} className="observation-form">
                  <div className="form-group">
                    <label>Report Type</label>
                    <select 
                      name="type" 
                      value={reportForm.type}
                      onChange={handleFormChange}
                    >
                      <option value="irregularity">Irregularity</option>
                      <option value="technical">Technical Issue</option>
                      <option value="security">Security Concern</option>
                      <option value="procedural">Procedural Violation</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Location / Booth Number</label>
                    <input
                      type="text"
                      name="location"
                      value={reportForm.location}
                      onChange={handleFormChange}
                      placeholder="e.g., Booth #23, North Delhi"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Severity Level</label>
                    <div className="severity-options">
                      {['low', 'medium', 'high'].map(level => (
                        <label key={level} className={`severity-option ${reportForm.severity === level ? 'selected' : ''}`}>
                          <input
                            type="radio"
                            name="severity"
                            value={level}
                            checked={reportForm.severity === level}
                            onChange={handleFormChange}
                          />
                          <span className={`severity-badge ${level}`}>{level}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      name="description"
                      value={reportForm.description}
                      onChange={handleFormChange}
                      placeholder="Provide detailed description of the observation..."
                      rows={5}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Attach Evidence (Optional)</label>
                    <div className="file-upload">
                      <Camera size={24} />
                      <span>Click to upload photo or video</span>
                      <input type="file" accept="image/*,video/*" />
                    </div>
                  </div>

                  <button type="submit" className="btn-submit-report">
                    <Send size={18} />
                    Submit Report
                  </button>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'myreports' && (
            <div className="dashboard-content">
              <div className="table-card">
                <div className="table-header">
                  <h3>My Submitted Reports</h3>
                </div>
                {myReports.length > 0 ? (
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Type</th>
                        <th>Location</th>
                        <th>Severity</th>
                        <th>Status</th>
                        <th>Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myReports.map(report => (
                        <tr key={report.id}>
                          <td>{report.id}</td>
                          <td><span className={`type-badge ${report.type}`}>{report.type}</span></td>
                          <td>{report.location}</td>
                          <td><span className={`severity-badge ${report.severity}`}>{report.severity}</span></td>
                          <td><span className={`status-badge ${report.status}`}>{report.status}</span></td>
                          <td>{report.time}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="empty-state">
                    <FileText size={48} />
                    <p>No reports submitted yet</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'checklist' && (
            <div className="dashboard-content">
              <div className="checklist-card">
                <h3>Observer Checklist</h3>
                <p className="checklist-subtitle">Complete these tasks during your observation duty</p>
                
                <div className="checklist-items">
                  {checklistItems.map(item => (
                    <label key={item.id} className={`checklist-item ${item.completed ? 'completed' : ''}`}>
                      <input type="checkbox" defaultChecked={item.completed} />
                      <span className="checkmark">
                        <CheckCircle size={18} />
                      </span>
                      <span className="item-text">{item.text}</span>
                    </label>
                  ))}
                </div>

                <div className="checklist-progress">
                  <span>Progress: {checklistItems.filter(i => i.completed).length}/{checklistItems.length} completed</span>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${(checklistItems.filter(i => i.completed).length / checklistItems.length) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ObserverDashboard;
