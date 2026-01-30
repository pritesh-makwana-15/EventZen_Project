// ================================================================
// FILE: src/components/Visitor dashboard/CountdownTimer.jsx
// PURPOSE: Live countdown to event start
// ================================================================

import React, { useState, useEffect } from "react";
import { Clock, Calendar } from "lucide-react";

export default function CountdownTimer({ eventDate, eventTime, compact = false }) {
  const [timeLeft, setTimeLeft] = useState(null);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    // Calculate time remaining
    const calculateTimeLeft = () => {
      if (!eventDate || !eventTime) {
        setIsExpired(true);
        return null;
      }

      const eventDateTime = new Date(`${eventDate}T${eventTime}`);
      const now = new Date();
      const difference = eventDateTime - now;

      if (difference <= 0) {
        setIsExpired(true);
        return null;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      return { days, hours, minutes, seconds };
    };

    // Initial calculation
    setTimeLeft(calculateTimeLeft());

    // Update every second
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [eventDate, eventTime]);

  if (isExpired) {
    return (
      <div className="vis-countdown-expired">
        <Calendar size={16} />
        <span>Event has started or ended</span>
      </div>
    );
  }

  if (!timeLeft) {
    return null;
  }

  // Compact version (one line)
  if (compact) {
    return (
      <div className="vis-countdown-compact">
        <Clock size={14} />
        <span>
          {timeLeft.days > 0 && `${timeLeft.days}d `}
          {timeLeft.hours}h {timeLeft.minutes}m
        </span>
      </div>
    );
  }

  // Full version (card display)
  return (
    <div className="vis-countdown-container">
      <div className="vis-countdown-header">
        <Clock size={18} />
        <span>Event Starts In</span>
      </div>

      <div className="vis-countdown-display">
        <div className="vis-countdown-unit">
          <div className="vis-countdown-value">{timeLeft.days}</div>
          <div className="vis-countdown-label">Days</div>
        </div>

        <div className="vis-countdown-separator">:</div>

        <div className="vis-countdown-unit">
          <div className="vis-countdown-value">{String(timeLeft.hours).padStart(2, '0')}</div>
          <div className="vis-countdown-label">Hours</div>
        </div>

        <div className="vis-countdown-separator">:</div>

        <div className="vis-countdown-unit">
          <div className="vis-countdown-value">{String(timeLeft.minutes).padStart(2, '0')}</div>
          <div className="vis-countdown-label">Minutes</div>
        </div>

        <div className="vis-countdown-separator">:</div>

        <div className="vis-countdown-unit">
          <div className="vis-countdown-value">{String(timeLeft.seconds).padStart(2, '0')}</div>
          <div className="vis-countdown-label">Seconds</div>
        </div>
      </div>

      <style jsx>{`
        .vis-countdown-container {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 12px;
          padding: 20px;
          color: white;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }

        .vis-countdown-header {
          display: flex;
          align-items: center;
          gap: 8px;
          justify-content: center;
          margin-bottom: 16px;
          font-size: 16px;
          font-weight: 600;
        }

        .vis-countdown-display {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .vis-countdown-unit {
          display: flex;
          flex-direction: column;
          align-items: center;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          padding: 12px 8px;
          min-width: 60px;
        }

        .vis-countdown-value {
          font-size: 28px;
          font-weight: 700;
          line-height: 1;
        }

        .vis-countdown-label {
          font-size: 11px;
          margin-top: 4px;
          opacity: 0.9;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .vis-countdown-separator {
          font-size: 28px;
          font-weight: 700;
          opacity: 0.7;
          margin: 0 4px;
        }

        .vis-countdown-compact {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #fff3e0;
          color: #e65100;
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 600;
        }

        .vis-countdown-expired {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #e0e0e0;
          color: #666;
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 600;
        }

        @media (max-width: 575px) {
          .vis-countdown-container {
            padding: 16px;
          }

          .vis-countdown-unit {
            min-width: 50px;
            padding: 10px 6px;
          }

          .vis-countdown-value {
            font-size: 24px;
          }

          .vis-countdown-label {
            font-size: 10px;
          }

          .vis-countdown-separator {
            font-size: 24px;
            margin: 0 2px;
          }
        }

        @media (max-width: 400px) {
          .vis-countdown-display {
            gap: 4px;
          }

          .vis-countdown-unit {
            min-width: 45px;
            padding: 8px 4px;
          }

          .vis-countdown-value {
            font-size: 20px;
          }

          .vis-countdown-label {
            font-size: 9px;
          }

          .vis-countdown-separator {
            font-size: 20px;
          }
        }
      `}</style>
    </div>
  );
}