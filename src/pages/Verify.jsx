import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import * as faceapi from 'face-api.js';
import { 
  CreditCard, Camera, CheckCircle, AlertCircle, Shield, 
  User, Calendar, MapPin, ArrowRight, RefreshCw, Loader 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Verify.css';

const Verify = () => {
  const [step, setStep] = useState(1);
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [aadhaarData, setAadhaarData] = useState(null);
  const [faceVerifying, setFaceVerifying] = useState(false);
  const [faceResult, setFaceResult] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [error, setError] = useState('');
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [faceDetectionStatus, setFaceDetectionStatus] = useState('');
  const [detectionCount, setDetectionCount] = useState(0);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const detectionIntervalRef = useRef(null);
  const streamRef = useRef(null);
  const navigate = useNavigate();
  const { verifyAadhaar, checkDuplicateFace, hasAadhaarVoted, setCurrentVoter, addFaceEmbedding } = useAuth();

  // Load face-api.js models
  const loadModels = useCallback(async () => {
    if (modelsLoaded || modelsLoading) return;
    setModelsLoading(true);
    setFaceDetectionStatus('Loading AI face detection models...');
    try {
      const MODEL_URL = '/models';
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
      ]);
      setModelsLoaded(true);
      setFaceDetectionStatus('AI models loaded. Starting camera...');
    } catch (err) {
      console.error('Failed to load face detection models:', err);
      setFaceDetectionStatus('Failed to load AI models. Using fallback mode.');
    }
    setModelsLoading(false);
  }, [modelsLoaded, modelsLoading]);

  // Format Aadhaar number with spaces
  const formatAadhaar = (value) => {
    const cleaned = value.replace(/\s/g, '').replace(/\D/g, '');
    const limited = cleaned.slice(0, 12);
    const formatted = limited.replace(/(\d{4})(?=\d)/g, '$1 ');
    return formatted;
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

  // Start webcam and face detection loop
  const startCamera = async () => {
    setError('');
    setFaceDetected(false);
    setDetectionCount(0);
    setFaceDetectionStatus('Requesting camera access...');
    
    // Load models first
    await loadModels();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraActive(true);
        setFaceDetectionStatus('Camera active. Position your face in the frame.');
        
        // Start face detection loop
        if (modelsLoaded) {
          startFaceDetectionLoop();
        }
      }
    } catch (err) {
      console.error('Camera error:', err);
      setError('Camera access denied or not available. Please allow camera permission and try again.');
      setFaceDetectionStatus('Camera unavailable');
    }
  };

  // Continuous face detection loop — draws bounding box + landmarks
  const startFaceDetectionLoop = () => {
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
    }

    detectionIntervalRef.current = setInterval(async () => {
      if (!videoRef.current || videoRef.current.paused || videoRef.current.ended) return;
      
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!canvas) return;

      // Match canvas to video display size
      const displaySize = { width: video.videoWidth, height: video.videoHeight };
      faceapi.matchDimensions(canvas, displaySize);

      try {
        const detection = await faceapi
          .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.5 }))
          .withFaceLandmarks();

        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (detection) {
          const resizedDetection = faceapi.resizeResults(detection, displaySize);
          
          // Draw bounding box
          const { x, y, width, height } = resizedDetection.detection.box;
          ctx.strokeStyle = '#00ff88';
          ctx.lineWidth = 3;
          ctx.strokeRect(x, y, width, height);

          // Draw corner accents
          const cornerLen = 20;
          ctx.strokeStyle = '#FF9933';
          ctx.lineWidth = 4;
          // Top-left
          ctx.beginPath(); ctx.moveTo(x, y + cornerLen); ctx.lineTo(x, y); ctx.lineTo(x + cornerLen, y); ctx.stroke();
          // Top-right
          ctx.beginPath(); ctx.moveTo(x + width - cornerLen, y); ctx.lineTo(x + width, y); ctx.lineTo(x + width, y + cornerLen); ctx.stroke();
          // Bottom-left
          ctx.beginPath(); ctx.moveTo(x, y + height - cornerLen); ctx.lineTo(x, y + height); ctx.lineTo(x + cornerLen, y + height); ctx.stroke();
          // Bottom-right
          ctx.beginPath(); ctx.moveTo(x + width - cornerLen, y + height); ctx.lineTo(x + width, y + height); ctx.lineTo(x + width, y + height - cornerLen); ctx.stroke();

          // Draw landmarks (68 points)
          const landmarks = resizedDetection.landmarks.positions;
          ctx.fillStyle = 'rgba(0, 255, 136, 0.6)';
          landmarks.forEach(pt => {
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, 2, 0, 2 * Math.PI);
            ctx.fill();
          });

          // Show confidence score
          const score = (resizedDetection.detection.score * 100).toFixed(1);
          ctx.fillStyle = '#FF9933';
          ctx.font = 'bold 14px sans-serif';
          ctx.fillText(`Face: ${score}%`, x, y - 8);

          setFaceDetected(true);
          setDetectionCount(prev => prev + 1);
          setFaceDetectionStatus(`Face detected (${score}% confidence). Click "Capture & Verify" when ready.`);
        } else {
          setFaceDetected(false);
          setFaceDetectionStatus('No face detected. Please look directly at the camera.');
        }
      } catch (err) {
        // Silence occasional detection errors during stream
      }
    }, 200); // Run detection every 200ms
  };

  const stopCamera = useCallback(() => {
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  }, []);

  // Capture face and extract 128-dimensional descriptor
  const captureFace = async () => {
    if (!cameraActive) {
      await startCamera();
      return;
    }

    if (!faceDetected) {
      setError('No face detected. Please position your face clearly in the frame.');
      return;
    }

    setFaceVerifying(true);
    setError('');
    setFaceDetectionStatus('Extracting face biometrics...');

    // Stop the live detection loop so we get a clean capture
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }

    try {
      const video = videoRef.current;
      
      // Get full detection with descriptor (128-d vector)
      const detection = await faceapi
        .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.5 }))
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        setError('Face lost during capture. Please try again.');
        setFaceVerifying(false);
        startFaceDetectionLoop();
        return;
      }

      const descriptor = Array.from(detection.descriptor); // 128-dim Float32 → regular array
      const confidence = detection.detection.score;
      
      setFaceDetectionStatus(`Face captured! Confidence: ${(confidence * 100).toFixed(1)}%. Checking for duplicates...`);

      // Check for duplicate face using actual descriptor comparison
      const isDuplicate = checkDuplicateFace(descriptor);

      if (isDuplicate) {
        setFaceResult('duplicate');
        setError('Face matches a previously registered voter. Duplicate voting prevented.');
        stopCamera();
      } else {
        // Store the face descriptor for future duplicate checks
        addFaceEmbedding({
          aadhaar: aadhaarData.aadhaar,
          descriptor: descriptor,
          confidence: confidence
        });

        setFaceResult('success');
        setFaceDetectionStatus('Face verified successfully! Identity confirmed.');
        setCurrentVoter({
          ...aadhaarData,
          faceDescriptor: descriptor,
          faceConfidence: confidence
        });
        stopCamera();
        setTimeout(() => setStep(3), 1500);
      }
    } catch (err) {
      console.error('Face capture error:', err);
      setError('Face capture failed. Please try again.');
      startFaceDetectionLoop();
    }

    setFaceVerifying(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const proceedToVoting = () => {
    navigate('/vote');
  };

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
            <span>Face Detection</span>
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
                    <>
                      <RefreshCw size={18} className="spin" />
                      Verifying...
                    </>
                  ) : verificationStatus === 'verified' ? (
                    <>
                      <CheckCircle size={18} />
                      Verified
                    </>
                  ) : (
                    <>
                      <Shield size={18} />
                      Verify Aadhaar
                    </>
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

        {/* Step 2: Face Detection */}
        {step === 2 && (
          <div className="verify-card">
            <div className="card-header">
              <Camera size={32} />
              <div>
                <h2>Face Detection</h2>
                <p>Capture your face for duplicate voting prevention</p>
              </div>
            </div>

            <div className="card-content">
              {/* Verified Aadhaar Info */}
              {aadhaarData && (
                <div className="aadhaar-info-card">
                  <div className="info-row">
                    <User size={16} />
                    <span>{aadhaarData.name}</span>
                  </div>
                  <div className="info-row">
                    <Calendar size={16} />
                    <span>DOB: {aadhaarData.dob}</span>
                  </div>
                  <div className="info-row">
                    <MapPin size={16} />
                    <span>{aadhaarData.constituency}, {aadhaarData.state}</span>
                  </div>
                </div>
              )}

              <div className="camera-section">
                <div className="camera-box">
                  {cameraActive ? (
                    <>
                      <video ref={videoRef} autoPlay playsInline muted />
                      {/* Simulation face when no actual video stream */}
                      {!videoRef.current?.srcObject && (
                        <div className="simulation-face">
                          <div className="face-oval">
                            <User size={64} />
                          </div>
                          <p>Simulated Camera View</p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="camera-placeholder">
                      <Camera size={48} />
                      <p>Click "Start Camera" to begin</p>
                    </div>
                  )}
                  
                  {faceVerifying && (
                    <div className="face-scanning-overlay">
                      <div className="scanning-animation"></div>
                      <p>Scanning face...</p>
                    </div>
                  )}

                  {faceResult === 'success' && (
                    <div className="face-result success">
                      <CheckCircle size={48} />
                      <p>Face verified successfully!</p>
                    </div>
                  )}

                  {faceResult === 'duplicate' && (
                    <div className="face-result error">
                      <AlertCircle size={48} />
                      <p>Duplicate face detected!</p>
                    </div>
                  )}
                </div>

                {error && (
                  <div className="verify-error">
                    <AlertCircle size={16} />
                    <span>{error}</span>
                  </div>
                )}

                <button 
                  className="btn-capture"
                  onClick={captureFace}
                  disabled={faceVerifying || faceResult === 'success'}
                >
                  {faceVerifying ? (
                    <>
                      <RefreshCw size={18} className="spin" />
                      Verifying...
                    </>
                  ) : !cameraActive ? (
                    <>
                      <Camera size={18} />
                      Start Camera
                    </>
                  ) : (
                    <>
                      <Camera size={18} />
                      Capture & Verify
                    </>
                  )}
                </button>
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
                    <span className="value status">Aadhaar + Face ✓</span>
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
