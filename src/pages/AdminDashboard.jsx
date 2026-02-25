import React, { useState } from 'react';
import { 
  LayoutDashboard, Users, Vote, AlertTriangle, Settings,
  Activity, Shield, Clock, CheckCircle, XCircle, Eye,
  FileText, TrendingUp, MapPin, RefreshCw, Camera
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { 
    stats, electionPhase, changeElectionPhase, 
    reports, auditLogs, votes = [], candidates = [],
    faceCaptures = []
  } = useAuth();

  // Calculate vote counts per party
  const voteCountsByParty = candidates.map(candidate => ({
    ...candidate,
    voteCount: votes.filter(v => v.candidateId === candidate.id).length
  })).sort((a, b) => b.voteCount - a.voteCount);

  const totalVotesRecorded = votes.length;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'monitoring', label: 'Live Monitoring', icon: Activity },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'captures', label: 'Face Captures', icon: Camera },
    { id: 'audit', label: 'Audit Logs', icon: Shield },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const phases = [
    { id: 'pre-election', label: 'Pre-Election', color: 'var(--gray-500)' },
    { id: 'voting', label: 'Voting Open', color: 'var(--green)' },
    { id: 'counting', label: 'Counting', color: 'var(--saffron)' },
    { id: 'results', label: 'Results', color: 'var(--ashoka-blue)' }
  ];

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        {/* Sidebar */}
        <aside className="dashboard-sidebar">
          <div className="sidebar-header">
            <Shield size={24} />
            <span>Admin Panel</span>
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
              <h1>Election Control Center</h1>
              <p>Manage and monitor the election process</p>
            </div>
            <div className="phase-control">
              <span className="phase-label">Current Phase:</span>
              <div className="phase-selector">
                {phases.map(phase => (
                  <button
                    key={phase.id}
                    className={`phase-btn ${electionPhase === phase.id ? 'active' : ''}`}
                    style={{ '--phase-color': phase.color }}
                    onClick={() => changeElectionPhase(phase.id)}
                  >
                    {phase.label}
                  </button>
                ))}
              </div>
            </div>
          </header>

          {/* Content based on active tab */}
          {activeTab === 'overview' && (
            <div className="dashboard-content">
              {/* Stats Grid */}
              <div className="stats-grid">
                <div className="stat-box">
                  <div className="stat-icon saffron">
                    <Vote size={24} />
                  </div>
                  <div className="stat-info">
                    <span className="stat-label">Total Votes Cast</span>
                    <span className="stat-value">{stats.totalVotesCast.toLocaleString()}</span>
                  </div>
                  <div className="stat-trend up">
                    <TrendingUp size={14} />
                    <span>Live</span>
                  </div>
                </div>

                <div className="stat-box">
                  <div className="stat-icon green">
                    <CheckCircle size={24} />
                  </div>
                  <div className="stat-info">
                    <span className="stat-label">Turnout %</span>
                    <span className="stat-value">{stats.turnoutPercentage}%</span>
                  </div>
                </div>

                <div className="stat-box">
                  <div className="stat-icon blue">
                    <Eye size={24} />
                  </div>
                  <div className="stat-info">
                    <span className="stat-label">Active Observers</span>
                    <span className="stat-value">{stats.activeObservers}</span>
                  </div>
                </div>

                <div className="stat-box">
                  <div className="stat-icon orange">
                    <AlertTriangle size={24} />
                  </div>
                  <div className="stat-info">
                    <span className="stat-label">Pending Reports</span>
                    <span className="stat-value">{reports.filter(r => r.status === 'pending').length}</span>
                  </div>
                </div>
              </div>

              {/* Vote Distribution by Party */}
              <div className="vote-distribution-section">
                <div className="chart-card full-width">
                  <h3>
                    <Vote size={18} />
                    Live Vote Count by Party
                  </h3>
                  <div className="party-votes-grid">
                    {voteCountsByParty.filter(c => c.id !== 'NOTA').map((candidate) => (
                      <div key={candidate.id} className="party-vote-card" style={{ borderColor: candidate.color }}>
                        <div className="party-symbol" style={{ background: candidate.color }}>
                          {candidate.symbol}
                        </div>
                        <div className="party-info">
                          <span className="party-name">{candidate.partyShort}</span>
                          <span className="party-full-name">{candidate.party}</span>
                        </div>
                        <div className="party-vote-count" style={{ color: candidate.color }}>
                          {candidate.voteCount}
                        </div>
                      </div>
                    ))}
                  </div>
                  {voteCountsByParty.find(c => c.id === 'NOTA')?.voteCount > 0 && (
                    <div className="nota-count">
                      NOTA Votes: {voteCountsByParty.find(c => c.id === 'NOTA')?.voteCount || 0}
                    </div>
                  )}
                  <div className="total-recorded">
                    <strong>Total Votes Recorded:</strong> {totalVotesRecorded}
                  </div>
                </div>
              </div>

              {/* Charts Row */}
              <div className="charts-row">
                <div className="chart-card">
                  <h3>Voter Turnout by Constituency</h3>
                  <div className="turnout-bars">
                    {['North Delhi', 'South Delhi', 'East Delhi', 'West Delhi'].map((name, i) => (
                      <div key={name} className="turnout-item">
                        <span className="turnout-name">{name}</span>
                        <div className="turnout-bar-wrap">
                          <div 
                            className="turnout-bar" 
                            style={{ width: `${60 + i * 8}%` }}
                          ></div>
                        </div>
                        <span className="turnout-percent">{60 + i * 8}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="chart-card">
                  <h3>Real-time Activity</h3>
                  <div className="activity-feed">
                    {[
                      { time: '2 min ago', event: 'Vote cast in North Delhi', type: 'vote' },
                      { time: '5 min ago', event: 'New observer logged in', type: 'observer' },
                      { time: '8 min ago', event: 'Report submitted', type: 'report' },
                      { time: '12 min ago', event: 'System health check OK', type: 'system' }
                    ].map((item, i) => (
                      <div key={i} className="activity-item">
                        <div className={`activity-dot ${item.type}`}></div>
                        <div className="activity-content">
                          <span className="activity-event">{item.event}</span>
                          <span className="activity-time">{item.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* System Health */}
              <div className="health-section">
                <h3>System Health</h3>
                <div className="health-grid">
                  {[
                    { name: 'Database', status: 'operational', uptime: '99.99%' },
                    { name: 'Authentication', status: 'operational', uptime: '99.95%' },
                    { name: 'Voting Engine', status: 'operational', uptime: '100%' },
                    { name: 'Analytics', status: 'operational', uptime: '99.90%' }
                  ].map(service => (
                    <div key={service.name} className="health-item">
                      <div className="health-status">
                        <CheckCircle size={16} className="status-ok" />
                        <span>{service.name}</span>
                      </div>
                      <span className="health-uptime">{service.uptime}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'monitoring' && (
            <div className="dashboard-content">
              <div className="monitoring-grid">
                <div className="monitor-card large">
                  <h3>
                    <MapPin size={18} />
                    Constituency Map
                  </h3>
                  <div className="map-placeholder">
                    <div className="map-region north">North Delhi<br/><small>2,456 votes</small></div>
                    <div className="map-region south">South Delhi<br/><small>3,102 votes</small></div>
                    <div className="map-region east">East Delhi<br/><small>1,987 votes</small></div>
                    <div className="map-region west">West Delhi<br/><small>2,341 votes</small></div>
                  </div>
                </div>

                <div className="monitor-card">
                  <h3>
                    <Activity size={18} />
                    Votes per Minute
                  </h3>
                  <div className="metric-display">
                    <span className="big-number">127</span>
                    <span className="metric-label">VPM</span>
                  </div>
                  <div className="mini-chart">
                    {[40, 65, 45, 80, 55, 90, 70, 85, 60, 75].map((h, i) => (
                      <div key={i} className="mini-bar" style={{ height: `${h}%` }}></div>
                    ))}
                  </div>
                </div>

                <div className="monitor-card">
                  <h3>
                    <Shield size={18} />
                    Security Status
                  </h3>
                  <div className="security-metrics">
                    <div className="sec-item">
                      <span>Duplicate Attempts Blocked</span>
                      <strong>23</strong>
                    </div>
                    <div className="sec-item">
                      <span>Suspicious Activities</span>
                      <strong>5</strong>
                    </div>
                    <div className="sec-item">
                      <span>System Integrity</span>
                      <strong className="green">100%</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="dashboard-content">
              <div className="table-card">
                <div className="table-header">
                  <h3>Submitted Reports</h3>
                  <button className="btn-refresh">
                    <RefreshCw size={16} />
                    Refresh
                  </button>
                </div>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Type</th>
                      <th>Location</th>
                      <th>Reporter</th>
                      <th>Status</th>
                      <th>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map(report => (
                      <tr key={report.id}>
                        <td>{report.id}</td>
                        <td><span className={`type-badge ${report.type}`}>{report.type}</span></td>
                        <td>{report.location}</td>
                        <td>{report.reporter}</td>
                        <td>
                          <span className={`status-badge ${report.status}`}>
                            {report.status}
                          </span>
                        </td>
                        <td>{report.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'captures' && (
            <div className="dashboard-content">
              <div className="table-card">
                <div className="table-header">
                  <h3>
                    <Camera size={18} />
                    Face Capture Records ({faceCaptures.length})
                  </h3>
                </div>
                {faceCaptures.length === 0 ? (
                  <div className="empty-captures">
                    <Camera size={48} />
                    <p>No face captures yet. Photos will appear here after voters complete verification.</p>
                  </div>
                ) : (
                  <div className="captures-grid">
                    {faceCaptures.map(capture => (
                      <div key={capture.id} className="capture-card">
                        <div className="capture-photo">
                          <img src={capture.photo} alt={`Voter ${capture.name}`} />
                        </div>
                        <div className="capture-info">
                          <span className="capture-name">{capture.name}</span>
                          <span className="capture-aadhaar">Aadhaar: ****{capture.aadhaar?.slice(-4)}</span>
                          <span className="capture-constituency">{capture.constituency}</span>
                          <span className="capture-time">{new Date(capture.timestamp).toLocaleString()}</span>
                        </div>
                        <div className="capture-badge">
                          <CheckCircle size={16} />
                          Verified
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'audit' && (
            <div className="dashboard-content">
              <div className="table-card">
                <div className="table-header">
                  <h3>Audit Trail</h3>
                </div>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Timestamp</th>
                      <th>Action</th>
                      <th>User</th>
                      <th>Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.map(log => (
                      <tr key={log.id}>
                        <td>{log.timestamp}</td>
                        <td><span className={`action-badge ${log.action}`}>{log.action}</span></td>
                        <td>{log.user}</td>
                        <td>{log.details}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="dashboard-content">
              <div className="settings-grid">
                <div className="settings-card">
                  <h3>Election Configuration</h3>
                  <div className="settings-form">
                    <div className="form-row">
                      <label>Election Name</label>
                      <input type="text" defaultValue="General Assembly Elections 2024" />
                    </div>
                    <div className="form-row">
                      <label>Voting Start Time</label>
                      <input type="datetime-local" defaultValue="2024-04-15T08:00" />
                    </div>
                    <div className="form-row">
                      <label>Voting End Time</label>
                      <input type="datetime-local" defaultValue="2024-04-15T18:00" />
                    </div>
                  </div>
                </div>

                <div className="settings-card">
                  <h3>Security Settings</h3>
                  <div className="toggle-list">
                    <div className="toggle-item">
                      <span>Face Detection Verification</span>
                      <label className="toggle">
                        <input type="checkbox" defaultChecked />
                        <span className="slider"></span>
                      </label>
                    </div>
                    <div className="toggle-item">
                      <span>Aadhaar Verification</span>
                      <label className="toggle">
                        <input type="checkbox" defaultChecked />
                        <span className="slider"></span>
                      </label>
                    </div>
                    <div className="toggle-item">
                      <span>Duplicate Vote Prevention</span>
                      <label className="toggle">
                        <input type="checkbox" defaultChecked />
                        <span className="slider"></span>
                      </label>
                    </div>
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

export default AdminDashboard;
