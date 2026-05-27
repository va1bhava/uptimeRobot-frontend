import React, { useState, useEffect, useRef } from 'react';
import '../styles/login.css';

const API = ''; // Proxied via Netlify redirects

export default function LoginApp() {
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register'
  const [regStep, setRegStep] = useState(1); // 1: Email/Password, 2: OTP

  // Form inputs
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  
  // OTP states
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [isOtpShaking, setIsOtpShaking] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  
  // UI States
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState({ login: '', reg: '' });
  const [successMsg, setSuccessMsg] = useState({ login: '', reg: '' });
  const [isLoading, setIsLoading] = useState({ login: false, reg: false });
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  
  // Refs
  const otpInputRefs = useRef([]);
  const [tiltStyle, setTiltStyle] = useState({});
  
  // Typing indicators
  const [typingStates, setTypingStates] = useState({});
  const typingTimers = useRef({});

  const triggerTyping = (id) => {
    setTypingStates(prev => ({ ...prev, [id]: true }));
    clearTimeout(typingTimers.current[id]);
    typingTimers.current[id] = setTimeout(() => {
      setTypingStates(prev => ({ ...prev, [id]: false }));
    }, 600);
  };

  // Check URL params for OAuth redirect or existing token for Auto-Login
  useEffect(() => {
    document.body.className = 'login-body';
    
    const urlParams = new URLSearchParams(window.location.search);
    const oauthToken = urlParams.get('token');
    const oauthEmail = urlParams.get('email') || '';

    if (oauthToken) {
      localStorage.setItem('ur_token', oauthToken);
      localStorage.setItem('ur_email', oauthEmail);
      window.history.replaceState({}, '', 'login.html');
      
      // Show success and redirect
      setShowSuccessOverlay(true);
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 1200);
    } else if (localStorage.getItem('ur_token')) {
      window.location.href = 'dashboard.html';
    }

    return () => {
      document.body.className = '';
    };
  }, []);

  // Cooldown countdown for resending OTP
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Tab switching
  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    setErrorMsg({ login: '', reg: '' });
    setSuccessMsg({ login: '', reg: '' });
  };

  // 3D tilt effect on card
  const handleMouseMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const rotX = (0.5 - y) * 6;
    const rotY = (x - 0.5) * 6;
    setTiltStyle({
      transform: `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.01)`,
      transition: 'none'
    });
  };

  const handleMouseLeave = () => {
    setTiltStyle({
      transform: 'perspective(800px) rotateX(0) rotateY(0) scale(1)',
      transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
    });
  };

  // Login execution
  const doLogin = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg(prev => ({ ...prev, login: '' }));
    setSuccessMsg(prev => ({ ...prev, login: '' }));

    if (!loginEmail || !loginPassword) {
      setErrorMsg(prev => ({ ...prev, login: 'Please fill in all fields.' }));
      return;
    }

    setIsLoading(prev => ({ ...prev, login: true }));

    try {
      const res = await fetch(`${API}/uptimerobot/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail.trim(), password: loginPassword })
      });
      
      const token = await res.text();
      if (!res.ok) {
        let errorMsg = token;
        try {
          const parsed = JSON.parse(token);
          errorMsg = parsed.error || parsed.message || token;
        } catch {}
        throw new Error(errorMsg || 'Invalid credentials');
      }

      localStorage.setItem('ur_token', token);
      localStorage.setItem('ur_email', loginEmail.trim());
      
      setSuccessMsg(prev => ({ ...prev, login: 'Success! Redirecting...' }));
      setShowSuccessOverlay(true);
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 1200);
    } catch (err) {
      setErrorMsg(prev => ({ ...prev, login: err.message }));
    } finally {
      setIsLoading(prev => ({ ...prev, login: false }));
    }
  };

  // Send OTP (Register step 1)
  const doSendOtp = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg(prev => ({ ...prev, reg: '' }));
    setSuccessMsg(prev => ({ ...prev, reg: '' }));

    if (!regEmail || !regPassword) {
      setErrorMsg(prev => ({ ...prev, reg: 'Please fill in all fields.' }));
      return;
    }
    if (regPassword.length < 6) {
      setErrorMsg(prev => ({ ...prev, reg: 'Password must be at least 6 characters.' }));
      return;
    }

    setIsLoading(prev => ({ ...prev, reg: true }));

    try {
      const res = await fetch(`${API}/uptimerobot/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: regEmail.trim(), password: regPassword })
      });
      
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || data.Error || data.Message || 'Failed to send OTP');
      }

      setRegStep(2);
      setSuccessMsg(prev => ({ ...prev, reg: 'OTP sent! Check your inbox.' }));
      
      // Focus first input field after animation delay
      setTimeout(() => {
        if (otpInputRefs.current[0]) otpInputRefs.current[0].focus();
      }, 100);
    } catch (err) {
      setErrorMsg(prev => ({ ...prev, reg: err.message }));
    } finally {
      setIsLoading(prev => ({ ...prev, reg: false }));
    }
  };

  // Verify OTP (Register step 2)
  const doVerifyOtp = async () => {
    setErrorMsg(prev => ({ ...prev, reg: '' }));
    setSuccessMsg(prev => ({ ...prev, reg: '' }));
    
    const otp = otpDigits.join('');
    if (otp.length !== 6) {
      setErrorMsg(prev => ({ ...prev, reg: 'Please enter the full 6-digit OTP.' }));
      return;
    }

    setIsLoading(prev => ({ ...prev, reg: true }));

    try {
      const res = await fetch(`${API}/uptimerobot/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: regEmail.trim(), otp })
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.Error || data.error || 'Invalid OTP, please try again.');
      }

      const data = await res.json();
      localStorage.setItem('ur_token', data.token);
      localStorage.setItem('ur_email', regEmail.trim());

      setSuccessMsg(prev => ({ ...prev, reg: 'Account created! Redirecting...' }));
      setShowSuccessOverlay(true);
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 1200);
    } catch (err) {
      setErrorMsg(prev => ({ ...prev, reg: err.message }));
      
      // Shake inputs
      setIsOtpShaking(true);
      setTimeout(() => setIsOtpShaking(false), 500);
      
      // Clear OTP inputs
      setOtpDigits(['', '', '', '', '', '']);
      if (otpInputRefs.current[0]) otpInputRefs.current[0].focus();
    } finally {
      setIsLoading(prev => ({ ...prev, reg: false }));
    }
  };

  // Resend OTP
  const doResendOtp = async () => {
    setErrorMsg(prev => ({ ...prev, reg: '' }));
    setSuccessMsg(prev => ({ ...prev, reg: '' }));
    setResendCooldown(30);

    try {
      const res = await fetch(`${API}/uptimerobot/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: regEmail.trim(), password: regPassword })
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.Error || data.error || 'Could not resend OTP');
      }

      setSuccessMsg(prev => ({ ...prev, reg: 'New OTP sent! Check your inbox.' }));
    } catch (err) {
      setErrorMsg(prev => ({ ...prev, reg: err.message }));
      setResendCooldown(0); // clear cooldown
    }
  };

  // OTP inputs key events and changes
  const handleOtpChange = (index, val) => {
    const cleanVal = val.replace(/\D/g, '').slice(0, 1);
    const newDigits = [...otpDigits];
    newDigits[index] = cleanVal;
    setOtpDigits(newDigits);

    // Auto-advance focus
    if (cleanVal && index < 5) {
      if (otpInputRefs.current[index + 1]) otpInputRefs.current[index + 1].focus();
    }

    // Trigger auto-submit when full
    if (cleanVal && index === 5) {
      const finalOtp = newDigits.join('');
      if (finalOtp.length === 6) {
        // Trigger submit
        setTimeout(() => {
          doVerifyOtp();
        }, 50);
      }
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      const newDigits = [...otpDigits];
      newDigits[index - 1] = '';
      setOtpDigits(newDigits);
      if (otpInputRefs.current[index - 1]) {
        otpInputRefs.current[index - 1].focus();
      }
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = (e.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, 6);
    const newDigits = [...otpDigits];
    
    pasted.split('').forEach((char, i) => {
      if (i < 6) newDigits[i] = char;
    });
    setOtpDigits(newDigits);

    if (pasted.length === 6) {
      setTimeout(() => {
        doVerifyOtp();
      }, 50);
    } else if (otpInputRefs.current[pasted.length]) {
      otpInputRefs.current[pasted.length].focus();
    }
  };

  // Back from OTP step to Email step
  const goBackToStep1 = () => {
    setRegStep(1);
    setErrorMsg(prev => ({ ...prev, reg: '' }));
    setSuccessMsg(prev => ({ ...prev, reg: '' }));
  };

  return (
    <>
      {/* Background layers */}
      <div className="bg-grid"></div>
      <div className="noise"></div>
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>
      <div className="orb orb-3"></div>
      <div className="orb orb-4"></div>

      {/* Success redirect overlay */}
      <div className={`success-overlay ${showSuccessOverlay ? 'active' : ''}`} id="success-overlay">
        <div className="ripple"></div>
        <div className="checkmark">
          <svg viewBox="0 0 24 24"><polyline points="4 12 10 18 20 6"/></svg>
        </div>
      </div>

      {/* Auth Card */}
      <div 
        className="auth-card" 
        id="auth-card"
        style={tiltStyle}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div className="logo">
          <svg className="logo-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
          </svg>
          <div className="logo-text">Uptime<span>Robot</span></div>
        </div>

        <div className={`tabs ${activeTab === 'register' ? 'register' : ''}`} id="tabs-container">
          <div className="tab-indicator"></div>
          <button 
            type="button" 
            className={`tab ${activeTab === 'login' ? 'active' : ''}`} 
            onClick={() => handleTabSwitch('login')}
          >
            Sign In
          </button>
          <button 
            type="button" 
            className={`tab ${activeTab === 'register' ? 'active' : ''}`} 
            onClick={() => handleTabSwitch('register')}
          >
            Register
          </button>
        </div>

        {/* LOGIN PANEL */}
        {activeTab === 'login' && (
          <form className="panel active" onSubmit={doLogin}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <div className="input-wrapper">
                <input 
                  type="email" 
                  className={`form-input ${typingStates['login-email'] ? 'typing' : ''}`} 
                  placeholder="you@example.com" 
                  autoComplete="email" 
                  value={loginEmail}
                  onChange={(e) => {
                    setLoginEmail(e.target.value);
                    triggerTyping('login-email');
                  }}
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-wrapper">
                <input 
                  type={showLoginPassword ? "text" : "password"} 
                  className={`form-input has-icon ${typingStates['login-password'] ? 'typing' : ''}`} 
                  placeholder="••••••••" 
                  autoComplete="current-password" 
                  value={loginPassword}
                  onChange={(e) => {
                    setLoginPassword(e.target.value);
                    triggerTyping('login-password');
                  }}
                />
                <button 
                  className="pwd-toggle" 
                  type="button" 
                  onClick={() => setShowLoginPassword(!showLoginPassword)} 
                  tabIndex="-1"
                >
                  {showLoginPassword ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <button 
              type="submit" 
              className="btn-primary" 
              disabled={isLoading.login}
            >
              {isLoading.login ? (
                <>
                  <span className="spinner"></span>Signing in...
                </>
              ) : 'Sign In'}
            </button>
            
            <div className="divider">or</div>
            
            <a 
              className="btn-google" 
              href="https://uptimerobot-xvf5.onrender.com/oauth2/authorization/google"
            >
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </a>

            <div className={`msg error ${errorMsg.login ? 'show' : ''}`}>
              <span className="msg-icon">✕</span>
              <span>{errorMsg.login}</span>
            </div>
            <div className={`msg success ${successMsg.login ? 'show' : ''}`}>
              <span className="msg-icon">✓</span>
              <span>{successMsg.login}</span>
            </div>
          </form>
        )}

        {/* REGISTER PANEL */}
        {activeTab === 'register' && (
          <div className="panel active">
            {/* Step 1: Email + Password */}
            {regStep === 1 ? (
              <form onSubmit={doSendOtp}>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <div className="input-wrapper">
                    <input 
                      type="email" 
                      className={`form-input ${typingStates['reg-email'] ? 'typing' : ''}`} 
                      placeholder="you@example.com" 
                      autoComplete="email" 
                      value={regEmail}
                      onChange={(e) => {
                        setRegEmail(e.target.value);
                        triggerTyping('reg-email');
                      }}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <div className="input-wrapper">
                    <input 
                      type={showRegPassword ? "text" : "password"} 
                      className={`form-input has-icon ${typingStates['reg-password'] ? 'typing' : ''}`} 
                      placeholder="Min 6 characters" 
                      autoComplete="new-password" 
                      value={regPassword}
                      onChange={(e) => {
                        setRegPassword(e.target.value);
                        triggerTyping('reg-password');
                      }}
                    />
                    <button 
                      className="pwd-toggle" 
                      type="button" 
                      onClick={() => setShowRegPassword(!showRegPassword)} 
                      tabIndex="-1"
                    >
                      {showRegPassword ? (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                <button 
                  type="submit" 
                  className="btn-primary" 
                  disabled={isLoading.reg}
                >
                  {isLoading.reg ? (
                    <>
                      <span className="spinner"></span>Sending OTP...
                    </>
                  ) : 'Send OTP'}
                </button>
                
                <div className="divider">or</div>
                
                <a 
                  className="btn-google" 
                  href="https://uptimerobot-xvf5.onrender.com/oauth2/authorization/google"
                >
                  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Continue with Google
                </a>
              </form>
            ) : (
              /* Step 2: OTP Verification */
              <div className="otp-step active">
                <div className="otp-header">
                  <button type="button" className="back-btn" onClick={goBackToStep1} title="Go back">←</button>
                  <span className="otp-title">Verify Email</span>
                  <span className="otp-email" title={regEmail}>{regEmail}</span>
                </div>
                <div className="otp-info">Enter the 6-digit code sent to<br/><strong>{regEmail}</strong></div>
                <div className={`otp-input-group ${isOtpShaking ? 'shake' : ''}`} id="otp-inputs">
                  {otpDigits.map((digit, idx) => (
                    <input 
                      key={idx}
                      ref={(el) => (otpInputRefs.current[idx] = el)}
                      type="text" 
                      maxLength="1" 
                      inputMode="numeric" 
                      className={`otp-digit ${digit ? 'filled' : ''}`} 
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      onPaste={handleOtpPaste}
                      onFocus={(e) => e.target.select()}
                    />
                  ))}
                </div>
                <button 
                  type="button" 
                  className="btn-primary" 
                  onClick={doVerifyOtp}
                  disabled={isLoading.reg || otpDigits.join('').length !== 6}
                >
                  {isLoading.reg ? (
                    <>
                      <span className="spinner"></span>Verifying...
                    </>
                  ) : 'Verify & Create Account'}
                </button>
                <button 
                  type="button" 
                  className="resend-link" 
                  disabled={resendCooldown > 0} 
                  onClick={doResendOtp}
                >
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
                </button>
              </div>
            )}

            <div className={`msg error ${errorMsg.reg ? 'show' : ''}`}>
              <span className="msg-icon">✕</span>
              <span>{errorMsg.reg}</span>
            </div>
            <div className={`msg success ${successMsg.reg ? 'show' : ''}`}>
              <span className="msg-icon">✓</span>
              <span>{successMsg.reg}</span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
