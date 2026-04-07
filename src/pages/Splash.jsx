import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Splash() {
  const navigate = useNavigate();
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Start fade-out at 2.2 seconds
    const fadeOutTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 2200);

    // Navigate at 2.5 seconds
    const navTimer = setTimeout(() => {
      // The prompt specified navigating to Home or Login.
      // We use '/login' for now and let your app routing dictate the rest.
      navigate('/login', { replace: true });
    }, 2500);

    return () => {
      clearTimeout(fadeOutTimer);
      clearTimeout(navTimer);
    };
  }, [navigate]);

  return (
    <div
      style={{
        ...styles.container,
        opacity: isFadingOut ? 0 : 1,
        transition: 'opacity 0.3s ease-out',
      }}
    >
      {/* Background Shapes */}
      <div style={{ ...styles.shape, ...styles.shape1 }} />
      <div style={{ ...styles.shape, ...styles.shape2 }} />

      {/* Main Content Start */}
      <div style={styles.content}>
        
        {/* Logo */}
        <div style={styles.logoContainer}>
          <div style={styles.logoGlow} />
          <div style={styles.logoBox}>
            <svg
              width="45"
              height="45"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#16A34A"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
              <path d="M3 6h18" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
          </div>
        </div>

        {/* Text Area */}
        <div style={styles.textContainer}>
          <h1 style={styles.appName}>Malerkotla Fresh</h1>
          <p style={styles.tagline}>Groceries delivered in minutes</p>
        </div>

        {/* Loader (below tagline) */}
        <div style={styles.loaderContainer}>
          <div style={styles.spinner} />
        </div>

      </div>

      <style>{`
        @keyframes gradientMove {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes float1 {
          0% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(20px, 30px) scale(1.1); }
          100% { transform: translate(0, 0) scale(1); }
        }
        @keyframes float2 {
          0% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-30px, -20px) scale(1.2); }
          100% { transform: translate(0, 0) scale(1); }
        }
        @keyframes popIn {
          0% { transform: scale(0.8); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes fadeInText {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes pulseGlow {
          0% { opacity: 0.5; transform: scale(0.9); }
          50% { opacity: 0.8; transform: scale(1.1); }
          100% { opacity: 0.5; transform: scale(0.9); }
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: {
    height: '100vh',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(-45deg, #16A34A, #22C55E, #15803d)',
    backgroundSize: '400% 400%',
    animation: 'gradientMove 8s ease infinite',
    fontFamily: '"Inter", "Poppins", sans-serif',
    position: 'relative',
    overflow: 'hidden',
    userSelect: 'none',
  },
  shape: {
    position: 'absolute',
    borderRadius: '50%',
    filter: 'blur(60px)',
    opacity: 0.35,
    zIndex: 0,
  },
  shape1: {
    width: '350px',
    height: '350px',
    background: '#4ade80',
    top: '-80px',
    left: '-80px',
    animation: 'float1 10s ease-in-out infinite',
  },
  shape2: {
    width: '300px',
    height: '300px',
    background: '#86efac',
    bottom: '-40px',
    right: '-60px',
    animation: 'float2 12s ease-in-out infinite',
  },
  content: {
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    position: 'relative',
    marginBottom: '24px',
    animation: 'popIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoGlow: {
    position: 'absolute',
    width: '110px',
    height: '110px',
    background: 'rgba(255, 255, 255, 0.4)',
    borderRadius: '50%',
    filter: 'blur(24px)',
    animation: 'pulseGlow 2.5s infinite ease-in-out',
  },
  logoBox: {
    position: 'relative',
    zIndex: 2,
    width: '90px',
    height: '90px',
    backgroundColor: 'white',
    borderRadius: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 12px 32px rgba(0,0,0,0.15), 0 4px 12px rgba(0,0,0,0.1)',
  },
  textContainer: {
    textAlign: 'center',
    opacity: 0,
    animation: 'fadeInText 0.6s ease-out 0.2s forwards',
  },
  appName: {
    margin: '0 0 6px 0',
    color: '#ffffff',
    fontSize: '22px',
    fontWeight: '700',
    letterSpacing: '-0.3px',
  },
  tagline: {
    margin: 0,
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: '13px',
    fontWeight: '400',
  },
  loaderContainer: {
    marginTop: '36px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0,
    animation: 'fadeInText 0.6s ease-out 0.4s forwards',
  },
  spinner: {
    width: '20px',
    height: '20px',
    border: '3px solid rgba(255,255,255,0.2)',
    borderTopColor: '#ffffff',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
};
