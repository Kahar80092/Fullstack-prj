import { createContext, useContext, useState, useEffect } from 'react';
import { mockUsers, initialStats, initialReports, initialAuditLogs, votedAadhaarHashes, aadhaarDatabase, candidates as mockCandidates, constituencies as mockConstituencies } from '../data/mockData';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(initialStats);
  const [reports, setReports] = useState(initialReports);
  const [auditLogs, setAuditLogs] = useState(initialAuditLogs);
  const [votedAadhaar, setVotedAadhaar] = useState(votedAadhaarHashes);
  const [faceEmbeddings, setFaceEmbeddings] = useState([]);
  const [faceCaptures, setFaceCaptures] = useState([]);
  const [blockedAadhaars, setBlockedAadhaars] = useState({});
  const [electionPhase, setElectionPhase] = useState('voting');
  const [currentVoter, setCurrentVoter] = useState(null);
  const [candidates] = useState(mockCandidates);
  const [constituencies] = useState(mockConstituencies);
  const [votes, setVotes] = useState([]);

  // Check for existing session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('electionUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  // Login function - accepts email or username
  const login = (emailOrUsername, password) => {
    const foundUser = mockUsers.find(
      u => (u.email === emailOrUsername || u.username === emailOrUsername) && u.password === password
    );
    
    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem('electionUser', JSON.stringify(userWithoutPassword));
      
      // Add audit log
      addAuditLog({
        action: 'USER_LOGIN',
        details: `User ${emailOrUsername} logged in`,
        constituency: foundUser.constituency || 'N/A'
      });
      
      return { success: true, user: userWithoutPassword };
    }
    
    return { success: false, message: 'Invalid email or password' };
  };

  // Register function - creates new citizen user
  const register = (formData) => {
    // Check if email already exists
    const existingUser = mockUsers.find(u => u.email === formData.email);
    if (existingUser) {
      return { success: false, message: 'Email already registered' };
    }

    // Create new user
    const newUser = {
      id: `U${Date.now()}`,
      username: formData.email,
      email: formData.email,
      name: formData.name,
      role: 'citizen', // New registrations are always citizens
      password: formData.password
    };

    // Add to mockUsers (in memory only for this session)
    mockUsers.push(newUser);

    // Auto-login the new user
    const { password: _, ...userWithoutPassword } = newUser;
    setUser(userWithoutPassword);
    localStorage.setItem('electionUser', JSON.stringify(userWithoutPassword));

    addAuditLog({
      action: 'USER_REGISTER',
      details: `New user ${formData.email} registered`,
      constituency: 'N/A'
    });

    return { success: true, user: userWithoutPassword };
  };

  // Logout function
  const logout = () => {
    if (user) {
      addAuditLog({
        action: 'USER_LOGOUT',
        details: `User ${user.username} logged out`,
        constituency: user.constituency || 'N/A'
      });
    }
    setUser(null);
    localStorage.removeItem('electionUser');
  };

  // Add audit log
  const addAuditLog = (log) => {
    const newLog = {
      id: `LOG${Date.now()}`,
      timestamp: new Date().toISOString(),
      ...log
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Update statistics
  const updateStats = (updates) => {
    setStats(prev => ({ ...prev, ...updates }));
  };

  // Increment a specific stat
  const incrementStat = (key, amount = 1) => {
    setStats(prev => ({
      ...prev,
      [key]: (prev[key] || 0) + amount
    }));
  };

  // Add observer report
  const addReport = (report) => {
    const newReport = {
      id: `RPT${Date.now()}`,
      timestamp: new Date().toISOString(),
      observerId: user?.id,
      observerName: user?.name,
      status: 'pending',
      ...report
    };
    setReports(prev => [newReport, ...prev]);
    incrementStat('reportsSubmitted');
    return newReport;
  };

  // Update report status
  const updateReportStatus = (reportId, status, resolution = null) => {
    setReports(prev => prev.map(r => 
      r.id === reportId 
        ? { ...r, status, resolution, verifiedBy: user?.id }
        : r
    ));
    
    if (status === 'resolved') {
      incrementStat('issuesResolved');
    }
  };

  // Mark Aadhaar as voted
  const markAadhaarVoted = (aadhaar) => {
    setVotedAadhaar(prev => new Set([...prev, aadhaar]));
  };

  // Check if Aadhaar has voted
  const hasAadhaarVoted = (aadhaar) => {
    return votedAadhaar.has(aadhaar);
  };

  // Add face embedding
  const addFaceEmbedding = (embedding) => {
    setFaceEmbeddings(prev => [...prev, {
      id: `FE${Date.now()}`,
      timestamp: new Date().toISOString(),
      ...embedding
    }]);
  };

  // Save face capture photo (the "folder")
  const saveFaceCapture = (capture) => {
    setFaceCaptures(prev => [...prev, {
      id: `FC${Date.now()}`,
      timestamp: new Date().toISOString(),
      ...capture
    }]);
  };

  // Delete a face capture by ID
  const deleteFaceCapture = (captureId) => {
    setFaceCaptures(prev => prev.filter(c => c.id !== captureId));
  };

  // Block an Aadhaar number for a given duration (ms)
  const blockAadhaar = (aadhaar, durationMs = 15000) => {
    const unblockAt = Date.now() + durationMs;
    setBlockedAadhaars(prev => ({ ...prev, [aadhaar]: unblockAt }));
  };

  // Check if an Aadhaar is currently blocked
  const isAadhaarBlocked = (aadhaar) => {
    const unblockAt = blockedAadhaars[aadhaar];
    if (!unblockAt) return false;
    if (Date.now() >= unblockAt) {
      // Expired — clean up
      setBlockedAadhaars(prev => {
        const copy = { ...prev };
        delete copy[aadhaar];
        return copy;
      });
      return false;
    }
    return true;
  };

  // Get remaining block time in seconds
  const getBlockRemaining = (aadhaar) => {
    const unblockAt = blockedAadhaars[aadhaar];
    if (!unblockAt) return 0;
    const remaining = Math.max(0, Math.ceil((unblockAt - Date.now()) / 1000));
    return remaining;
  };

  // Check for duplicate face using Euclidean distance on 128-d descriptors
  const checkDuplicateFace = (newDescriptor) => {
    if (!newDescriptor || faceEmbeddings.length === 0) return false;
    const THRESHOLD = 0.45; // faces with distance < 0.45 are considered the same person
    for (const stored of faceEmbeddings) {
      if (!stored.descriptor || stored.descriptor.length !== newDescriptor.length) continue;
      let sum = 0;
      for (let i = 0; i < newDescriptor.length; i++) {
        const diff = newDescriptor[i] - stored.descriptor[i];
        sum += diff * diff;
      }
      const distance = Math.sqrt(sum);
      if (distance < THRESHOLD) return true; // duplicate found
    }
    return false;
  };

  // Verify Aadhaar number against database
  const verifyAadhaar = (aadhaarNumber) => {
    const voterData = aadhaarDatabase[aadhaarNumber];
    if (voterData) {
      return {
        aadhaar: aadhaarNumber,
        ...voterData
      };
    }
    return null;
  };

  // Cast vote - accepts object with vote details
  const castVote = (voteData) => {
    const { aadhaarNumber, candidateId, constituency } = voteData;
    markAadhaarVoted(aadhaarNumber);
    incrementStat('totalVotesCast');
    
    // Update turnout
    const newTurnout = ((stats.totalVotesCast + 1) / stats.totalEligibleVoters * 100).toFixed(1);
    updateStats({ turnoutPercentage: parseFloat(newTurnout) });
    
    // Generate receipt ID
    const receiptId = `RCP-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    
    // Record the vote
    setVotes(prev => [...prev, {
      id: receiptId,
      aadhaarNumber,
      candidateId,
      constituency,
      timestamp: new Date().toISOString()
    }]);
    
    addAuditLog({
      action: 'VOTE_CAST',
      details: `Vote cast for candidate ${candidateId}`,
      constituency: constituency || 'Delhi-Central'
    });
    
    // Clear current voter after voting
    setCurrentVoter(null);
    
    return { success: true, receiptId };
  };

  // Change election phase
  const changeElectionPhase = (phase) => {
    setElectionPhase(phase);
    addAuditLog({
      action: 'ELECTION_PHASE_CHANGE',
      details: `Election phase changed to ${phase}`,
      constituency: 'ALL'
    });
  };

  // Check if authenticated
  const isAuthenticated = !!user;

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    register,
    stats,
    updateStats,
    incrementStat,
    reports,
    addReport,
    updateReportStatus,
    auditLogs,
    addAuditLog,
    votedAadhaar,
    markAadhaarVoted,
    hasAadhaarVoted,
    faceEmbeddings,
    addFaceEmbedding,
    checkDuplicateFace,
    faceCaptures,
    saveFaceCapture,
    deleteFaceCapture,
    blockAadhaar,
    isAadhaarBlocked,
    getBlockRemaining,
    castVote,
    electionPhase,
    changeElectionPhase,
    verifyAadhaar,
    currentVoter,
    setCurrentVoter,
    candidates,
    constituencies,
    votes
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
