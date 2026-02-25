import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  UserCheck, Calendar, Shield, BookOpen, MapPin, Eye,
  AlertTriangle, BarChart3, TrendingUp, Users, Cpu, XCircle,
  Mail, CreditCard, Map, Landmark, Megaphone, Calculator,
  Globe, Phone, Accessibility, Heart, RefreshCw, Flag
} from 'lucide-react';
import './AshokaChakra.css';

// Map icon string names from mock data to actual components
const ICON_MAP = {
  UserCheck, Calendar, Shield, BookOpen, MapPin, Eye,
  AlertTriangle, BarChart3, TrendingUp, Users, Cpu, XCircle,
  Mail, CreditCard, Map, Landmark, Megaphone, Calculator,
  Globe, Phone, Accessibility, Heart, RefreshCw, Flag
};

const AshokaChakra = ({ modules, onSpokeClick }) => {
  const [rotation, setRotation] = useState(0);
  const [hoveredSpoke, setHoveredSpoke] = useState(null);
  const [frozen, setFrozen] = useState(false); // freeze rotation on click
  const animRef = useRef(null);
  const lastTimeRef = useRef(null);

  const animate = useCallback((timestamp) => {
    if (lastTimeRef.current === null) {
      lastTimeRef.current = timestamp;
    }
    const delta = timestamp - lastTimeRef.current;
    lastTimeRef.current = timestamp;

    if (hoveredSpoke === null && !frozen) {
      setRotation(prev => (prev + delta * 0.008) % 360);
    }
    animRef.current = requestAnimationFrame(animate);
  }, [hoveredSpoke, frozen]);

  useEffect(() => {
    animRef.current = requestAnimationFrame(animate);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [animate]);

  // Unfreeze after 2 seconds so rotation resumes after a click
  useEffect(() => {
    if (!frozen) return;
    const timer = setTimeout(() => setFrozen(false), 2000);
    return () => clearTimeout(timer);
  }, [frozen]);

  const SPOKE_COUNT = modules?.length || 24;
  const LABEL_R = 280;

  return (
    <div className="ashoka-chakra-container">
      {/* Rotating wheel with rings, spokes, hub */}
      <div
        className="ashoka-chakra"
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        <div className="chakra-ring outer-ring" />
        <div className="chakra-ring middle-ring">
          {[...Array(SPOKE_COUNT)].map((_, i) => (
            <div
              key={`dot-${i}`}
              className="chakra-dot"
              style={{
                transform: `rotate(${i * (360 / SPOKE_COUNT)}deg) translateY(-190px)`
              }}
            />
          ))}
        </div>
        <div className="chakra-ring inner-ring" />

        <div className="chakra-spokes">
          {modules?.map((module, index) => {
            const angle = index * (360 / SPOKE_COUNT) - 90;
            const isHovered = hoveredSpoke === index;
            return (
              <div
                key={module.id}
                className={`chakra-spoke ${isHovered ? 'hovered' : ''}`}
                style={{ transform: `rotate(${angle}deg)` }}
                onMouseEnter={() => setHoveredSpoke(index)}
                onMouseLeave={() => setHoveredSpoke(null)}
                onClick={() => { setFrozen(true); onSpokeClick?.(module, index); }}
              >
                <div className="spoke-line" />
              </div>
            );
          })}
        </div>

        <div className="chakra-hub">
          <div className="hub-inner" />
        </div>
      </div>

      {/* Non-rotating icon labels floating around the wheel */}
      <div className="chakra-labels-ring">
        {modules?.map((module, index) => {
          const angleDeg = index * (360 / SPOKE_COUNT) - 90 + rotation;
          const angleRad = (angleDeg * Math.PI) / 180;
          const x = Math.cos(angleRad) * LABEL_R;
          const y = Math.sin(angleRad) * LABEL_R;
          const isHovered = hoveredSpoke === index;
          const IconComponent = ICON_MAP[module.icon];

          return (
            <div
              key={`lbl-${module.id}`}
              className={`chakra-icon-label ${isHovered ? 'active' : ''}`}
              style={{
                transform: `translate(calc(${x.toFixed(1)}px - 50%), calc(${y.toFixed(1)}px - 50%))`
              }}
              onMouseEnter={() => setHoveredSpoke(index)}
              onMouseLeave={() => setHoveredSpoke(null)}
              onClick={() => { setFrozen(true); onSpokeClick?.(module, index); }}
              title={module.title}
            >
              {IconComponent ? <IconComponent size={18} /> : <span>{index + 1}</span>}
            </div>
          );
        })}
      </div>

      {/* Center overlay */}
      <div className="chakra-center-text">
        <div className="center-content">
          {hoveredSpoke !== null && modules?.[hoveredSpoke] ? (
            <>
              <span className="center-mod-title">{modules[hoveredSpoke].title}</span>
              <span className="center-subtitle">{modules[hoveredSpoke].description}</span>
              <span className="center-hint">Click to explore</span>
            </>
          ) : (
            <>
              <span className="center-title">24</span>
              <span className="center-subtitle">Civic Modules</span>
              <span className="center-hint">Hover a spoke</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AshokaChakra;
