import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './PasswordScreen.css';

const PasswordScreen = ({ onPasswordCorrect }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTime, setLockoutTime] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [displayValue, setDisplayValue] = useState('');
  const { t } = useTranslation();

  // Remove the auto-bypass logic - password should be required every time

  // Check lockout timer
  useEffect(() => {
    if (isLocked && lockoutTime > 0) {
      const timer = setInterval(() => {
        setLockoutTime(prev => {
          if (prev <= 1) {
            setIsLocked(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isLocked, lockoutTime]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (isLocked) {
      return;
    }

    // Default password - you can change this to any password you want
    const correctPassword = 'Bismellah';
    
    if (password === correctPassword) {
      // Password correct - allow access to game
      onPasswordCorrect();
    } else {
      setAttempts(prev => prev + 1);
      setError(t('password.incorrect'));
      setPassword('');
      
      // Lock after 3 attempts for 30 seconds
      if (attempts >= 2) {
        setIsLocked(true);
        setLockoutTime(30);
        setError(t('password.locked'));
      }
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="password-screen">
      <div className="password-container">
        <div className="password-header">
          <h2>Al Salamu Alikum</h2>
          <p>Enter Password:</p>

        </div>
        
        <form onSubmit={handleSubmit} className="password-form">
          <div className="password-input-group">
            <input
              type="text"
              value={showPassword ? password : '*'.repeat(password.length)}
              onChange={(e) => {
                const newValue = e.target.value;
                if (showPassword) {
                  setPassword(newValue);
                } else {
                  // When hidden, we need to track the actual characters
                  // The input shows asterisks but we need to capture real characters
                  if (newValue.length > password.length) {
                    // Adding character - we need to get the actual character typed
                    // Since the input shows asterisks, we can't get the character directly
                    // So we'll use a different approach - track the actual input
                    const actualChar = newValue.charAt(newValue.length - 1);
                    setPassword(password + actualChar);
                  } else if (newValue.length < password.length) {
                    // Removing character
                    setPassword(password.slice(0, -1));
                  }
                }
              }}
              placeholder={t('password.placeholder')}
              disabled={isLocked}
              className="password-input"
              autoFocus
              style={{
                fontFamily: showPassword ? 'inherit' : 'monospace',
                letterSpacing: showPassword ? 'normal' : '2px',
                color: showPassword ? '#333' : '#000'
              }}
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="password-toggle"
              disabled={isLocked}
              title={showPassword ? t('password.hidePassword') : t('password.showPassword')}
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>
          
          {error && (
            <div className="password-error">
              {error}
            </div>
          )}
          

          
          {isLocked && (
            <div className="password-lockout">
              {t('password.lockoutMessage')} {formatTime(lockoutTime)}
            </div>
          )}
          
          <button
            type="submit"
            disabled={isLocked || !password.trim()}
            className="password-button"
          >
            {t('password.submit')}
          </button>
        </form>
        
        <div className="password-footer">
          <p>{t('password.attempts', { count: attempts })}</p>
        </div>
      </div>
    </div>
  );
};

export default PasswordScreen; 