import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { toast } from 'react-toastify';

const GOOGLE_CLIENT_ID = '814840604697-ucq1668bo46lens8cpmhdkn66jfkg318.apps.googleusercontent.com';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [verificationRequired, setVerificationRequired] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [resending, setResending] = useState(false);
  const { login, setUserAndToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Load Google Sign-In script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      window.google?.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse
      });
      window.google?.accounts.id.renderButton(
        document.getElementById('google-signin-btn'),
        { theme: 'outline', size: 'large', width: '100%', text: 'signin_with' }
      );
    };

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleGoogleResponse = async (response) => {
    try {
      setLoading(true);
      const res = await authAPI.googleLogin(response.credential);
      localStorage.setItem('token', res.data.token);
      setUserAndToken(res.data.user, res.data.token);
      toast.success('Google login successful!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Google login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (error) {
      if (error.response?.data?.requiresVerification) {
        setVerificationRequired(true);
        setVerificationEmail(error.response.data.email);
        toast.warning('Please verify your email before logging in');
      } else {
        toast.error(error.response?.data?.message || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setResending(true);
    try {
      await authAPI.resendVerification(verificationEmail);
      toast.success('Verification email sent! Check your inbox.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to resend verification email');
    } finally {
      setResending(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 14px',
    fontSize: '14px',
    border: '2px solid #e2e8f0',
    borderRadius: '10px',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    color: '#1e293b'
  };

  const labelStyle = {
    display: 'block',
    fontSize: '13px',
    fontWeight: '600',
    color: '#475569',
    marginBottom: '6px'
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '60px',
            height: '60px',
            background: 'white',
            borderRadius: '16px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px',
            boxShadow: '0 8px 20px rgba(0,0,0,0.15)'
          }}>
            <span style={{ color: '#667eea', fontWeight: 'bold', fontSize: '26px' }}>D</span>
          </div>
          <h1 style={{ color: 'white', fontSize: '26px', fontWeight: '700', margin: '0 0 6px 0', letterSpacing: '-0.5px' }}>
            Welcome Back
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '15px', margin: 0 }}>
            Sign in to Dayflow HRMS
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '28px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
        }}>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
            <button style={{
              flex: 1,
              padding: '10px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              borderRadius: '10px',
              color: 'white',
              fontSize: '14px',
              fontWeight: '600'
            }}>Sign In</button>
            <Link to="/signup" style={{
              flex: 1,
              padding: '10px',
              background: '#f8fafc',
              border: '2px solid #e2e8f0',
              borderRadius: '10px',
              textDecoration: 'none',
              color: '#64748b',
              fontSize: '14px',
              fontWeight: '600',
              textAlign: 'center'
            }}>Sign Up</Link>
          </div>

          {verificationRequired ? (
            /* Verification Required View */
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '70px',
                height: '70px',
                background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                fontSize: '32px'
              }}>
                &#9993;
              </div>
              <h3 style={{ margin: '0 0 10px', color: '#1e293b', fontSize: '18px', fontWeight: '600' }}>
                Email Verification Required
              </h3>
              <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 20px', lineHeight: '1.5' }}>
                We sent a verification email to <strong>{verificationEmail}</strong>.
                Please check your inbox and click the verification link.
              </p>
              <button
                onClick={handleResendVerification}
                disabled={resending}
                style={{
                  width: '100%',
                  padding: '14px',
                  fontSize: '15px',
                  fontWeight: '600',
                  color: 'white',
                  background: resending ? '#94a3b8' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: resending ? 'not-allowed' : 'pointer',
                  marginBottom: '12px'
                }}
              >
                {resending ? 'Sending...' : 'Resend Verification Email'}
              </button>
              <button
                onClick={() => setVerificationRequired(false)}
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#64748b',
                  background: '#f8fafc',
                  border: '2px solid #e2e8f0',
                  borderRadius: '12px',
                  cursor: 'pointer'
                }}
              >
                Back to Login
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '18px' }}>
                <label style={labelStyle}>Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={inputStyle}
                  placeholder="john@company.com"
                  required
                  onFocus={(e) => { e.target.style.borderColor = '#667eea'; e.target.style.boxShadow = '0 0 0 3px rgba(102,126,234,0.1)'; }}
                  onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={labelStyle}>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={inputStyle}
                  placeholder="••••••••"
                  required
                  onFocus={(e) => { e.target.style.borderColor = '#667eea'; e.target.style.boxShadow = '0 0 0 3px rgba(102,126,234,0.1)'; }}
                  onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '14px',
                  fontSize: '15px',
                  fontWeight: '600',
                  color: 'white',
                  background: loading ? '#94a3b8' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: loading ? 'none' : '0 4px 15px rgba(102,126,234,0.4)',
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}
                onMouseOver={(e) => { if (!loading) { e.target.style.transform = 'translateY(-1px)'; e.target.style.boxShadow = '0 6px 20px rgba(102,126,234,0.5)'; }}}
                onMouseOut={(e) => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 4px 15px rgba(102,126,234,0.4)'; }}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>

              {/* Divider */}
              <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0' }}>
                <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }}></div>
                <span style={{ padding: '0 12px', color: '#94a3b8', fontSize: '13px' }}>or</span>
                <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }}></div>
              </div>

              {/* Google Sign In Button */}
              <div id="google-signin-btn" style={{ display: 'flex', justifyContent: 'center' }}></div>
            </form>
          )}

          <p style={{ textAlign: 'center', marginTop: '20px', color: '#64748b', fontSize: '14px' }}>
            Don't have an account?{' '}
            <Link to="/signup" style={{ color: '#667eea', fontWeight: '600', textDecoration: 'none' }}>
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
