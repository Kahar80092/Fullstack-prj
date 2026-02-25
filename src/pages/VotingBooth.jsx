import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Vote, CheckCircle, AlertTriangle, User, Shield, 
  Timer, ArrowRight, Award 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './VotingBooth.css';

const VotingBooth = () => {
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [voteSubmitting, setVoteSubmitting] = useState(false);
  const [voteSuccess, setVoteSuccess] = useState(false);
  const [receiptId, setReceiptId] = useState('');
  
  const navigate = useNavigate();
  const { currentVoter, candidates, castVote, electionPhase } = useAuth();

  // Get all candidates except NOTA (which is shown separately)
  const constituencyCandidate = candidates.filter(c => c.id !== 'NOTA');

  const handleCandidateSelect = (candidate) => {
    if (!voteSuccess) {
      setSelectedCandidate(candidate);
    }
  };

  const handleConfirmVote = async () => {
    if (!selectedCandidate || !currentVoter) return;
    
    setVoteSubmitting(true);
    
    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const result = castVote({
      aadhaarNumber: currentVoter.aadhaar,
      candidateId: selectedCandidate.id,
      constituency: currentVoter.constituency,
      faceHash: currentVoter.faceHash,
      timestamp: new Date().toISOString()
    });
    
    if (result.success) {
      setReceiptId(result.receiptId);
      setVoteSuccess(true);
    }
    
    setVoteSubmitting(false);
  };

  // Check if voting is allowed
  if (electionPhase !== 'voting' && electionPhase !== 'LIVE') {
    return (
      <div className="voting-booth-page">
        <div className="booth-container">
          <div className="phase-notice">
            <AlertTriangle size={48} />
            <h2>Voting Not Available</h2>
            <p>
              The election is currently in <strong>{electionPhase}</strong> phase.
              Voting is only available during the voting phase.
            </p>
            <button onClick={() => navigate('/')} className="btn-back-home">
              Return to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentVoter) {
    return (
      <div className="voting-booth-page">
        <div className="booth-container">
          <div className="phase-notice">
            <Shield size={48} />
            <h2>Verification Required</h2>
            <p>Please complete identity verification before voting.</p>
            <button onClick={() => navigate('/verify')} className="btn-verify-first">
              Verify Identity
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="voting-booth-page">
      <div className="booth-container">
        {/* Header */}
        <div className="booth-header">
          <div className="header-info">
            <Vote size={32} />
            <div>
              <h1>Electronic Voting Booth</h1>
              <p>Constituency: {currentVoter.constituency}</p>
            </div>
          </div>
          <div className="voter-badge">
            <User size={16} />
            <span>{currentVoter.name}</span>
            <CheckCircle size={14} className="verified" />
          </div>
        </div>

        {!voteSuccess ? (
          <>
            {/* Candidate Selection */}
            <div className="candidates-section">
              <h2>Select Your Candidate</h2>
              <p className="instruction">Click on a candidate card to select. Your vote is secret and secure.</p>
              
              <div className="candidates-grid">
                {constituencyCandidate.map((candidate) => (
                  <div
                    key={candidate.id}
                    className={`candidate-card ${selectedCandidate?.id === candidate.id ? 'selected' : ''}`}
                    onClick={() => handleCandidateSelect(candidate)}
                    style={{ '--party-color': candidate.color }}
                  >
                    <div className="candidate-photo" style={{ background: candidate.color }}>
                      <span className="photo-symbol">{candidate.symbol}</span>
                    </div>
                    <div className="candidate-info">
                      <h3>{candidate.name}</h3>
                      <span className="party">{candidate.partyShort || candidate.party}</span>
                      <span className="party-full">{candidate.party}</span>
                    </div>
                    <div className="symbol-box" style={{ borderColor: candidate.color }}>
                      <span className="symbol">{candidate.symbol}</span>
                    </div>
                    {selectedCandidate?.id === candidate.id && (
                      <div className="selected-badge">
                        <CheckCircle size={20} />
                      </div>
                    )}
                  </div>
                ))}
                
                {/* NOTA Option */}
                <div
                  className={`candidate-card nota ${selectedCandidate?.id === 'nota' ? 'selected' : ''}`}
                  onClick={() => handleCandidateSelect({ id: 'nota', name: 'NOTA', party: 'None of the Above', symbol: '✗' })}
                >
                  <div className="candidate-photo nota-photo">
                    <span>✗</span>
                  </div>
                  <div className="candidate-info">
                    <h3>NOTA</h3>
                    <span className="party">None of the Above</span>
                  </div>
                  {selectedCandidate?.id === 'nota' && (
                    <div className="selected-badge">
                      <CheckCircle size={20} />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Confirm Button */}
            {selectedCandidate && !showConfirm && (
              <div className="action-section">
                <button 
                  className="btn-confirm-selection"
                  onClick={() => setShowConfirm(true)}
                >
                  Confirm Selection
                  <ArrowRight size={18} />
                </button>
              </div>
            )}

            {/* Confirmation Dialog */}
            {showConfirm && (
              <div className="confirm-dialog">
                <div className="confirm-content">
                  <AlertTriangle size={32} className="warning-icon" />
                  <h3>Confirm Your Vote</h3>
                  <p>You are about to cast your vote for:</p>
                  
                  <div className="confirm-candidate">
                    <span className="symbol">{selectedCandidate.symbol}</span>
                    <div>
                      <strong>{selectedCandidate.name}</strong>
                      <span>{selectedCandidate.party}</span>
                    </div>
                  </div>
                  
                  <p className="warning-text">
                    This action cannot be undone. Once submitted, your vote is final.
                  </p>
                  
                  <div className="confirm-actions">
                    <button 
                      className="btn-cancel"
                      onClick={() => setShowConfirm(false)}
                      disabled={voteSubmitting}
                    >
                      Go Back
                    </button>
                    <button 
                      className="btn-submit-vote"
                      onClick={handleConfirmVote}
                      disabled={voteSubmitting}
                    >
                      {voteSubmitting ? (
                        <>
                          <span className="loading-spinner"></span>
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Vote size={18} />
                          Submit Vote
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          /* Success Screen */
          <div className="vote-success">
            <div className="success-animation">
              <CheckCircle size={80} />
            </div>
            <h2>Vote Cast Successfully!</h2>
            <p>Thank you for participating in the democratic process.</p>
            
            <div className="receipt-card">
              <div className="receipt-header">
                <Award size={24} />
                <span>Vote Receipt</span>
              </div>
              <div className="receipt-body">
                <div className="receipt-row">
                  <span>Receipt ID</span>
                  <strong>{receiptId}</strong>
                </div>
                <div className="receipt-row">
                  <span>Timestamp</span>
                  <strong>{new Date().toLocaleString()}</strong>
                </div>
                <div className="receipt-row">
                  <span>Constituency</span>
                  <strong>{currentVoter.constituency}</strong>
                </div>
                <div className="receipt-row">
                  <span>Status</span>
                  <strong className="status-recorded">Recorded ✓</strong>
                </div>
              </div>
              <div className="receipt-footer">
                <p>Your vote has been securely recorded on the blockchain.</p>
              </div>
            </div>
            
            <button onClick={() => navigate('/')} className="btn-back-home">
              Return to Home
            </button>
          </div>
        )}

        {/* Security Footer */}
        <div className="booth-security">
          <Shield size={16} />
          <span>End-to-end encrypted voting session</span>
          <Timer size={16} />
          <span>Session expires in 10 minutes</span>
        </div>
      </div>
    </div>
  );
};

export default VotingBooth;
