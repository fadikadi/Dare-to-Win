import React, { useState, useEffect } from 'react';
import './PromotionScreen.css';

const PromotionScreen = ({ onComplete }) => {
  const [timeLeft, setTimeLeft] = useState(30);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="promotion-screen">
      <div className="promotion-content">
        <div className="promotion-header">
          <h1>🙏 Help a Talented Pakistani Chef in Need 🙏</h1>
          <div className="countdown-timer">
            <span className="timer-label">Continuing in:</span>
            <span className="timer-value">{timeLeft}s</span>
          </div>
        </div>

        <div className="promotion-body">
          <p className="promotion-description">
            A skilled Pakistani woman with years of professional restaurant experience is currently without a job and urgently needs income. She is offering home cooking services—bringing the taste of authentic Pakistani cuisine right to your kitchen.
          </p>

          <div className="promotion-features">
            <div className="feature-item">
              <span className="feature-icon">🍛</span>
              <span className="feature-text">
                From biryanis and curries to fresh rotis, parathas, and sweet dishes like Zarda & Kheer—everything is prepared with love and expertise.
              </span>
            </div>

            <div className="feature-item">
              <span className="feature-icon">💼</span>
              <span className="feature-text">
                She will cook at your home for freshness and hygiene (pick and drop from Oakville required).
              </span>
            </div>
          </div>

          <div className="contact-info">
            <div className="contact-item">
              <span className="contact-icon">📍</span>
              <span className="contact-text">Based in Oakville, ON</span>
            </div>
            <div className="contact-item phone-highlight">
              <span className="contact-icon">📱</span>
              <span className="contact-text">
                Contact on WhatsApp only: 
                <span className="phone-number">‪+1 (437) 449-1214‬</span>
              </span>
            </div>
          </div>

          <div className="promotion-footer">
            <p className="footer-text">
              Even if you don't need this service, please consider sharing it with someone who might. Every bit helps.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromotionScreen; 