import React, { useState } from 'react';
import { 
  BarChart3, TrendingUp, PieChart, Download, FileSpreadsheet,
  Map, Users, Vote, Filter, Calendar, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const AnalystDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedConstituency, setSelectedConstituency] = useState('all');
  
  const { stats, votes = [], constituencies = [], candidates = [] } = useAuth();

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'turnout', label: 'Turnout Analysis', icon: TrendingUp },
    { id: 'demographics', label: 'Demographics', icon: Users },
    { id: 'export', label: 'Export Data', icon: Download }
  ];

  // Calculate vote distribution
  const voteDistribution = (candidates || []).map(candidate => ({
    ...candidate,
    votes: (votes || []).filter(v => v.candidateId === candidate.id).length
  }));

  const totalVotesCast = (votes || []).length;

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        {/* Sidebar */}
        <aside className="dashboard-sidebar">
          <div className="sidebar-header">
            <BarChart3 size={24} />
            <span>Analyst Panel</span>
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
              <h1>Analytics Dashboard</h1>
              <p>Election data analysis and insights</p>
            </div>
            <div className="filter-controls">
              <div className="filter-item">
                <Filter size={16} />
                <select 
                  value={selectedConstituency}
                  onChange={(e) => setSelectedConstituency(e.target.value)}
                >
                  <option value="all">All Constituencies</option>
                  {constituencies.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="filter-item">
                <Calendar size={16} />
                <input type="date" defaultValue="2024-04-15" />
              </div>
            </div>
          </header>

          {activeTab === 'overview' && (
            <div className="dashboard-content">
              {/* Key Metrics */}
              <div className="stats-grid">
                <div className="stat-box">
                  <div className="stat-icon saffron">
                    <Vote size={24} />
                  </div>
                  <div className="stat-info">
                    <span className="stat-label">Total Votes</span>
                    <span className="stat-value">{stats.totalVotesCast.toLocaleString()}</span>
                  </div>
                  <div className="stat-trend up">
                    <ArrowUpRight size={14} />
                    <span>+12.5%</span>
                  </div>
                </div>

                <div className="stat-box">
                  <div className="stat-icon green">
                    <TrendingUp size={24} />
                  </div>
                  <div className="stat-info">
                    <span className="stat-label">Turnout Rate</span>
                    <span className="stat-value">{stats.turnoutPercentage}%</span>
                  </div>
                  <div className="stat-trend up">
                    <ArrowUpRight size={14} />
                    <span>+5.2%</span>
                  </div>
                </div>

                <div className="stat-box">
                  <div className="stat-icon blue">
                    <Users size={24} />
                  </div>
                  <div className="stat-info">
                    <span className="stat-label">Eligible Voters</span>
                    <span className="stat-value">1.2M</span>
                  </div>
                </div>

                <div className="stat-box">
                  <div className="stat-icon orange">
                    <PieChart size={24} />
                  </div>
                  <div className="stat-info">
                    <span className="stat-label">NOTA Votes</span>
                    <span className="stat-value">{votes?.filter(v => v.candidateId === 'nota').length || 0}</span>
                  </div>
                </div>
              </div>

              {/* Charts */}
              <div className="charts-row">
                <div className="chart-card">
                  <h3>
                    <BarChart3 size={18} />
                    Vote Distribution by Party
                  </h3>
                  <div className="bar-chart">
                    {voteDistribution.map((candidate, i) => {
                      const percentage = totalVotesCast > 0 
                        ? Math.round((candidate.votes / Math.max(totalVotesCast, 1)) * 100)
                        : Math.round(Math.random() * 25 + 5);
                      return (
                        <div key={candidate.id} className="bar-item">
                          <div className="bar-label">
                            <span className="bar-symbol">{candidate.symbol}</span>
                            <span>{candidate.partyShort || candidate.party}</span>
                          </div>
                          <div className="bar-wrapper">
                            <div 
                              className="bar-fill"
                              style={{ 
                                width: `${percentage}%`,
                                background: candidate.color || ['var(--saffron)', 'var(--green)', 'var(--ashoka-blue)', '#9333ea'][i % 4]
                              }}
                            ></div>
                            <span className="bar-value">{percentage}%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="chart-card">
                  <h3>
                    <TrendingUp size={18} />
                    Hourly Voting Trend
                  </h3>
                  <div className="line-chart">
                    <div className="chart-grid">
                      {[8, 9, 10, 11, 12, 13, 14, 15, 16, 17].map(hour => (
                        <div key={hour} className="grid-line">
                          <span className="hour-label">{hour}:00</span>
                        </div>
                      ))}
                    </div>
                    <svg className="trend-line" viewBox="0 0 400 150">
                      <polyline
                        fill="none"
                        stroke="var(--ashoka-blue)"
                        strokeWidth="3"
                        points="20,120 60,100 100,80 140,60 180,70 220,40 260,50 300,30 340,45 380,20"
                      />
                      <g className="data-points">
                        {[[20,120], [60,100], [100,80], [140,60], [180,70], [220,40], [260,50], [300,30], [340,45], [380,20]].map(([x, y], i) => (
                          <circle key={i} cx={x} cy={y} r="5" fill="var(--ashoka-blue)" />
                        ))}
                      </g>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Constituency Breakdown */}
              <div className="breakdown-section">
                <h3>Constituency Breakdown</h3>
                <div className="breakdown-grid">
                  {constituencies.map(constituency => (
                    <div key={constituency.id} className="breakdown-card">
                      <div className="breakdown-header">
                        <Map size={18} />
                        <span>{constituency.name}</span>
                      </div>
                      <div className="breakdown-stats">
                        <div className="breakdown-stat">
                          <span className="bs-label">Total Votes</span>
                          <span className="bs-value">{constituency.totalVoters.toLocaleString()}</span>
                        </div>
                        <div className="breakdown-stat">
                          <span className="bs-label">Turnout</span>
                          <span className="bs-value">{Math.round(Math.random() * 20 + 55)}%</span>
                        </div>
                      </div>
                      <div className="mini-bar-chart">
                        <div className="mini-bar" style={{ width: '45%', background: 'var(--saffron)' }}></div>
                        <div className="mini-bar" style={{ width: '35%', background: 'var(--green)' }}></div>
                        <div className="mini-bar" style={{ width: '20%', background: 'var(--ashoka-blue)' }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'turnout' && (
            <div className="dashboard-content">
              <div className="charts-row">
                <div className="chart-card full-width">
                  <h3>
                    <TrendingUp size={18} />
                    Cumulative Turnout Over Time
                  </h3>
                  <div className="large-chart">
                    <svg viewBox="0 0 800 300" className="area-chart">
                      <defs>
                        <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="var(--saffron)" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="var(--saffron)" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M0,280 L80,260 L160,220 L240,180 L320,150 L400,120 L480,90 L560,70 L640,50 L720,35 L800,25 L800,300 L0,300 Z"
                        fill="url(#areaGradient)"
                      />
                      <polyline
                        fill="none"
                        stroke="var(--saffron)"
                        strokeWidth="3"
                        points="0,280 80,260 160,220 240,180 320,150 400,120 480,90 560,70 640,50 720,35 800,25"
                      />
                    </svg>
                    <div className="chart-x-axis">
                      {['8 AM', '9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM', '4 PM', '5 PM', '6 PM'].map(time => (
                        <span key={time}>{time}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="turnout-comparison">
                <h3>Turnout Comparison by Constituency</h3>
                <div className="comparison-bars">
                  {constituencies.map((c, i) => {
                    const turnout = 55 + i * 8;
                    const prevTurnout = turnout - 5;
                    return (
                      <div key={c.id} className="comparison-item">
                        <div className="comparison-label">
                          <span>{c.name}</span>
                          <span className="comparison-change">
                            {turnout > prevTurnout ? (
                              <><ArrowUpRight size={14} className="up" /> +{turnout - prevTurnout}%</>
                            ) : (
                              <><ArrowDownRight size={14} className="down" /> {turnout - prevTurnout}%</>
                            )}
                          </span>
                        </div>
                        <div className="comparison-bars-wrap">
                          <div className="comp-bar current" style={{ width: `${turnout}%` }}>
                            <span>{turnout}%</span>
                          </div>
                          <div className="comp-bar previous" style={{ width: `${prevTurnout}%` }}>
                            <span>{prevTurnout}%</span>
                          </div>
                        </div>
                        <div className="comparison-legend">
                          <span><span className="dot current"></span> Current</span>
                          <span><span className="dot previous"></span> Previous</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'demographics' && (
            <div className="dashboard-content">
              <div className="charts-row">
                <div className="chart-card">
                  <h3>
                    <Users size={18} />
                    Age Distribution
                  </h3>
                  <div className="donut-chart-container">
                    <div className="donut-chart">
                      <svg viewBox="0 0 200 200">
                        <circle cx="100" cy="100" r="80" fill="none" stroke="var(--gray-200)" strokeWidth="30" />
                        <circle cx="100" cy="100" r="80" fill="none" stroke="var(--saffron)" strokeWidth="30" 
                          strokeDasharray="125.6 502.4" strokeDashoffset="0" />
                        <circle cx="100" cy="100" r="80" fill="none" stroke="var(--green)" strokeWidth="30" 
                          strokeDasharray="150.7 502.4" strokeDashoffset="-125.6" />
                        <circle cx="100" cy="100" r="80" fill="none" stroke="var(--ashoka-blue)" strokeWidth="30" 
                          strokeDasharray="125.6 502.4" strokeDashoffset="-276.3" />
                        <circle cx="100" cy="100" r="80" fill="none" stroke="#9333ea" strokeWidth="30" 
                          strokeDasharray="100.5 502.4" strokeDashoffset="-401.9" />
                      </svg>
                      <div className="donut-center">
                        <span>100%</span>
                        <small>Voters</small>
                      </div>
                    </div>
                    <div className="donut-legend">
                      <div className="legend-item"><span style={{background: 'var(--saffron)'}}></span> 18-25 (25%)</div>
                      <div className="legend-item"><span style={{background: 'var(--green)'}}></span> 26-40 (30%)</div>
                      <div className="legend-item"><span style={{background: 'var(--ashoka-blue)'}}></span> 41-55 (25%)</div>
                      <div className="legend-item"><span style={{background: '#9333ea'}}></span> 55+ (20%)</div>
                    </div>
                  </div>
                </div>

                <div className="chart-card">
                  <h3>
                    <Users size={18} />
                    Gender Distribution
                  </h3>
                  <div className="gender-chart">
                    <div className="gender-bar-container">
                      <div className="gender-bar male" style={{ width: '52%' }}>
                        <span>Male</span>
                        <strong>52%</strong>
                      </div>
                      <div className="gender-bar female" style={{ width: '47%' }}>
                        <span>Female</span>
                        <strong>47%</strong>
                      </div>
                      <div className="gender-bar other" style={{ width: '1%' }}>
                        <span>Other</span>
                        <strong>1%</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="chart-card">
                <h3>Voter Type Distribution</h3>
                <div className="type-distribution">
                  {[
                    { type: 'First-time Voters', percent: 15, color: 'var(--saffron)' },
                    { type: 'Regular Voters', percent: 65, color: 'var(--green)' },
                    { type: 'Senior Citizens', percent: 12, color: 'var(--ashoka-blue)' },
                    { type: 'Specially-abled', percent: 3, color: '#9333ea' },
                    { type: 'NRI Voters', percent: 5, color: '#ec4899' }
                  ].map(item => (
                    <div key={item.type} className="type-item">
                      <div className="type-header">
                        <span>{item.type}</span>
                        <strong>{item.percent}%</strong>
                      </div>
                      <div className="type-bar-wrap">
                        <div 
                          className="type-bar-fill" 
                          style={{ width: `${item.percent * 1.5}%`, background: item.color }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'export' && (
            <div className="dashboard-content">
              <div className="export-section">
                <h3>Export Election Data</h3>
                <p className="export-description">Download election data in various formats for analysis</p>
                
                <div className="export-grid">
                  {[
                    { name: 'Voting Summary', format: 'CSV', icon: FileSpreadsheet, size: '2.4 MB' },
                    { name: 'Turnout Report', format: 'PDF', icon: FileSpreadsheet, size: '1.8 MB' },
                    { name: 'Constituency Data', format: 'Excel', icon: FileSpreadsheet, size: '3.2 MB' },
                    { name: 'Demographic Analysis', format: 'CSV', icon: FileSpreadsheet, size: '1.5 MB' },
                    { name: 'Full Audit Trail', format: 'JSON', icon: FileSpreadsheet, size: '5.6 MB' },
                    { name: 'Visualization Pack', format: 'PNG', icon: FileSpreadsheet, size: '8.1 MB' }
                  ].map(item => (
                    <div key={item.name} className="export-card">
                      <div className="export-icon">
                        <item.icon size={32} />
                      </div>
                      <div className="export-info">
                        <h4>{item.name}</h4>
                        <span className="export-meta">{item.format} • {item.size}</span>
                      </div>
                      <button className="btn-download">
                        <Download size={16} />
                        Download
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AnalystDashboard;
