import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CreditCard, Camera, CheckCircle, AlertCircle, Shield, 
  User, Calendar, MapPin, ArrowRight, RefreshCw, ImageIcon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { findMatchingFace } from '../utils/faceCompare';
import './Verify.css';

const Verify = () => {
  const [step, setStep] = useState(1);
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [aadhaarData, setAadhaarData] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [error, setError] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const [saving, setSaving] = useState(false);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const pendingStreamRef = useRef(null);
  const navigate = useNavigate();
  const { verifyAadhaar, hasAadhaarVoted, setCurrentVoter, saveFaceCapture, faceCaptures, blockAadhaar, isAadhaarBlocked, getBlockRemaining } = useAuth();
  const [blockCountdown, setBlockCountdown] = useState(0);

  // Format Aadhaar number with spaces
  const formatAadhaar = (value) => {
    const cleaned = value.replace(/\s/g, '').replace(/\D/g, '');
    const limited = cleaned.slice(0, 12);
    return limited.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const handleAadhaarChange = (e) => {
    setAadhaarNumber(formatAadhaar(e.target.value));
    setError('');
    setVerificationStatus(null);
  };

  const handleAadhaarVerify = async () => {
    const cleanAadhaar = aadhaarNumber.replace(/\s/g, '');
    if (cleanAadhaar.length !== 12) {
      setError('Please enter a valid 12-digit Aadhaar number');
      return;
    }

    setVerificationStatus('verifying');
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (hasAadhaarVoted(cleanAadhaar)) {
      setVerificationStatus('already-voted');
      setError('This Aadhaar has already been used to cast a vote in this election.');
      return;
    }

    const result = verifyAadhaar(cleanAadhaar);
    if (result) {
      setAadhaarData(result);
      setVerificationStatus('verified');
      setTimeout(() => setStep(2), 1000);
    } else {
      setVerificationStatus('failed');
      setError('Aadhaar not found. Try: 1234 5678 9012 or 2345 6789 0123');
    }
  };

  // ─── Camera: open ───
  const startCamera = async () => {
    setError('');

    // Check if Aadhaar is blocked before allowing camera
    if (aadhaarData && isAadhaarBlocked(aadhaarData.aadhaar)) {
      const remaining = getBlockRemaining(aadhaarData.aadhaar);
      setError(`⛔ This Aadhaar is temporarily blocked. Try again in ${remaining}s`);
      setBlockCountdown(remaining);
      return;
    }

    setCapturedPhoto(null);
    setStatusMsg('Requesting camera access...');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
      });
      streamRef.current = stream;
      pendingStreamRef.current = stream;
      setCameraActive(true);
      setStatusMsg('Camera active — position your face and click Capture Photo.');
    } catch (err) {
      console.error('Camera error:', err);
      setError('Camera access denied. Please allow camera permission and try again.');
      setStatusMsg('');
    }
  };

  // ─── Attach stream to video element once it renders ───
  useEffect(() => {
    if (cameraActive && pendingStreamRef.current && videoRef.current) {
      videoRef.current.srcObject = pendingStreamRef.current;
      videoRef.current.play().catch(err => console.error('Video play error:', err));
      pendingStreamRef.current = null;
    }
  }, [cameraActive]);

  // ─── Camera: stop ───
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraActive(false);
  }, []);

  // ─── Snap a photo from the live video ───
  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setCapturedPhoto(dataUrl);
    stopCamera();
    setStatusMsg('Photo captured! Review and confirm below.');
  };

  // ─── Retake ───
  const retakePhoto = () => {
    setCapturedPhoto(null);
    setStatusMsg('');
    startCamera();
  };

  // ─── Countdown timer for blocked Aadhaar ───
  useEffect(() => {
    if (blockCountdown <= 0) return;
    const timer = setInterval(() => {
      setBlockCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setError('');
          return 0;
        }
        setError(`⛔ This Aadhaar is temporarily blocked. Try again in ${prev - 1}s`);
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [blockCountdown]);

  // ─── Confirm & save the photo, proceed to step 3 ───
  const confirmPhoto = async () => {
    if (!capturedPhoto || !aadhaarData) return;
    setSaving(true);
    setError('');
    setStatusMsg('Analyzing face and checking for duplicates...');

    // 1. Check if this Aadhaar is currently blocked
    if (isAadhaarBlocked(aadhaarData.aadhaar)) {
      const remaining = getBlockRemaining(aadhaarData.aadhaar);
      setError(`⛔ This Aadhaar is temporarily blocked. Try again in ${remaining}s`);
      setBlockCountdown(remaining);
      setSaving(false);
      return;
    }

    // 2. Check if this Aadhaar already has a capture (same Aadhaar duplicate)
    const existingCapture = faceCaptures.find(c => c.aadhaar === aadhaarData.aadhaar);
    if (existingCapture) {
      setError('A face capture already exists for this Aadhaar. Duplicate voting prevented.');
      setSaving(false);
      return;
    }

    // 3. Compare face against ALL previously stored captures
    setStatusMsg('Comparing face against existing records...');
    const match = await findMatchingFace(capturedPhoto, faceCaptures, 0.85);
    if (match) {
      // Face matches a previous voter — block this Aadhaar for 15 seconds
      blockAadhaar(aadhaarData.aadhaar, 15000);
      setBlockCountdown(15);
      setError(
        `⛔ Face match detected! Your face matches a previously verified voter (Aadhaar ****${match.aadhaar?.slice(-4)}). ` +
        `This Aadhaar is now blocked for 15 seconds. Duplicate voting prevented.`
      );
      setCapturedPhoto(null);
      setSaving(false);
      setStatusMsg('');
      return;
    }

    // 4. No match found — safe to save
    setStatusMsg('No duplicate found. Saving face capture...');
    await new Promise(r => setTimeout(r, 800));

    saveFaceCapture({
      aadhaar: aadhaarData.aadhaar,
      name: aadhaarData.name,
      constituency: aadhaarData.constituency,
      photo: capturedPhoto
    });

    setCurrentVoter({
      ...aadhaarData,
      facePhoto: capturedPhoto
    });

    setStatusMsg('✅ Face verified and saved successfully!');
    setSaving(false);
    setTimeout(() => setStep(3), 1000);
  };

  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  const proceedToVoting = () => navigate('/vote');

  return (
    <div className="verify-page">
      <div className="verify-container">
        {/* Progress Steps */}
        <div className="verify-progress">
          <div className={`progress-step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
            <div className="step-number">
              {step > 1 ? <CheckCircle size={20} /> : '1'}
            </div>
            <span>Aadhaar Verification</span>
          </div>
          <div className="progress-line"></div>
          <div className={`progress-step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
            <div className="step-number">
              {step > 2 ? <CheckCircle size={20} /> : '2'}
            </div>
            <span>Face Capture</span>
          </div>
          <div className="progress-line"></div>
          <div className={`progress-step ${step >= 3 ? 'active' : ''}`}>
            <div className="step-number">3</div>
            <span>Ready to Vote</span>
          </div>
        </div>

        {/* Step 1: Aadhaar Verification */}
        {step === 1 && (
          <div className="verify-card">
            <div className="card-header">
              <CreditCard size={32} />
              <div>
                <h2>Aadhaar Verification</h2>
                <p>Enter your 12-digit Aadhaar number for identity verification</p>
              </div>
            </div>

            <div className="card-content">
              <div className="aadhaar-input-section">
                <label>Aadhaar Number</label>
                <div className="aadhaar-input-wrapper">
                  <CreditCard size={20} className="input-icon" />
                  <input
                    type="text"
                    value={aadhaarNumber}
                    onChange={handleAadhaarChange}
                    placeholder="XXXX XXXX XXXX"
                    maxLength={14}
                    className={verificationStatus === 'verified' ? 'verified' : ''}
                  />
                  {verificationStatus === 'verified' && (
                    <CheckCircle size={20} className="verified-icon" />
                  )}
                </div>

                {error && (
                  <div className="verify-error">
                    <AlertCircle size={16} />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  className="btn-verify"
                  onClick={handleAadhaarVerify}
                  disabled={verificationStatus === 'verifying' || aadhaarNumber.replace(/\s/g, '').length !== 12}
                >
                  {verificationStatus === 'verifying' ? (
                    <><RefreshCw size={18} className="spin" /> Verifying...</>
                  ) : verificationStatus === 'verified' ? (
                    <><CheckCircle size={18} /> Verified</>
                  ) : (
                    <><Shield size={18} /> Verify Aadhaar</>
                  )}
                </button>
              </div>

              <div className="demo-aadhaar">
                <p>Demo Aadhaar Numbers (click to use):</p>
                <span onClick={() => setAadhaarNumber('1234 5678 9012')}>1234 5678 9012</span>
                <span onClick={() => setAadhaarNumber('2345 6789 0123')}>2345 6789 0123</span>
                <span onClick={() => setAadhaarNumber('4567 8901 2345')}>4567 8901 2345</span>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Face Capture */}
        {step === 2 && (
          <div className="verify-card">
            <div className="card-header">
              <Camera size={32} />
              <div>
                <h2>Face Capture</h2>
                <p>Take a photo for voter identity records &amp; duplicate prevention</p>
              </div>
            </div>

            <div className="card-content">
              {/* Aadhaar Info */}
              {aadhaarData && (
                <div className="aadhaar-info-card">
                  <div className="info-row"><User size={16} /><span>{aadhaarData.name}</span></div>
                  <div className="info-row"><Calendar size={16} /><span>DOB: {aadhaarData.dob}</span></div>
                  <div className="info-row"><MapPin size={16} /><span>{aadhaarData.constituency}, {aadhaarData.state}</span></div>
                </div>
              )}

              <div className="camera-section">
                <div className="camera-box">
                  {/* Live video feed — always in DOM, hidden via CSS */}
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{ display: cameraActive && !capturedPhoto ? 'block' : 'none' }}
                  />

                  {/* Captured photo preview */}
                  {capturedPhoto && (
                    <img src={capturedPhoto} alt="Captured face" className="captured-preview" />
                  )}

                  {/* Placeholder when nothing active */}
                  {!cameraActive && !capturedPhoto && (
                    <div className="camera-placeholder">
                      <Camera size={48} />
                      <p>Click "Start Camera" to begin</p>
                    </div>
                  )}
                </div>

                {/* Hidden canvas for capturing */}
                <canvas ref={canvasRef} style={{ display: 'none' }} />

                {/* Status message */}
                {statusMsg && (
                  <div className={`face-status-bar ${capturedPhoto ? 'detected' : ''}`}>
                    <span>{statusMsg}</span>
                  </div>
                )}

                {/* Error */}
                {error && (
                  <div className={`verify-error ${blockCountdown > 0 ? 'blocked' : ''}`}>
                    <AlertCircle size={16} />
                    <span>{error}</span>
                  </div>
                )}

                {/* Action buttons */}
                <div className="capture-actions">
                  {!cameraActive && !capturedPhoto && (
                    <button className="btn-capture" onClick={startCamera} disabled={blockCountdown > 0}>
                      <Camera size={18} /> {blockCountdown > 0 ? `Blocked (${blockCountdown}s)` : 'Start Camera'}
                    </button>
                  )}

                  {cameraActive && !capturedPhoto && (
                    <button className="btn-capture" onClick={capturePhoto}>
                      <Camera size={18} /> Capture Photo
                    </button>
                  )}

                  {capturedPhoto && (
                    <>
                      <button className="btn-retake" onClick={retakePhoto}>
                        <RefreshCw size={18} /> Retake
                      </button>
                      <button className="btn-confirm" onClick={confirmPhoto} disabled={saving}>
                        {saving ? (
                          <><RefreshCw size={18} className="spin" /> Saving...</>
                        ) : (
                          <><CheckCircle size={18} /> Confirm &amp; Proceed</>
                        )}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Ready to Vote */}
        {step === 3 && (
          <div className="verify-card success-card">
            <div className="success-icon">
              <CheckCircle size={64} />
            </div>
            <h2>Verification Complete!</h2>
            <p>Your identity has been verified. You are now eligible to cast your vote.</p>

            {/* Show the captured photo */}
            {capturedPhoto && (
              <div className="captured-summary">
                <img src={capturedPhoto} alt="Your photo" className="summary-photo" />
              </div>
            )}

            {aadhaarData && (
              <div className="voter-summary">
                <h4>Voter Information</h4>
                <div className="summary-grid">
                  <div className="summary-item">
                    <span className="label">Name</span>
                    <span className="value">{aadhaarData.name}</span>
                  </div>
                  <div className="summary-item">
                    <span className="label">Constituency</span>
                    <span className="value">{aadhaarData.constituency}</span>
                  </div>
                  <div className="summary-item">
                    <span className="label">Verification</span>
                    <span className="value status">Aadhaar + Face Photo ✓</span>
                  </div>
                </div>
              </div>
            )}

            <button className="btn-proceed" onClick={proceedToVoting}>
              Proceed to Voting Booth
              <ArrowRight size={18} />
            </button>
          </div>
        )}

        {/* Security Notice */}
        <div className="security-notice">
          <Shield size={16} />
          <span>Your data is encrypted and processed securely. This is a prototype simulation.</span>
        </div>
      </div>
    </div>
  );
};

export default Verify;
