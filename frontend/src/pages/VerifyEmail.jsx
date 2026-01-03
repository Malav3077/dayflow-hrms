import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { authAPI } from '../services/api';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      verifyEmail(token);
    } else {
      setStatus('error');
      setMessage('No verification token provided');
    }
  }, [searchParams]);

  const verifyEmail = async (token) => {
    try {
      const response = await authAPI.verifyEmail(token);
      setStatus('success');
      setMessage(response.data.message);
    } catch (error) {
      setStatus('error');
      setMessage(error.response?.data?.message || 'Verification failed. Please try again.');
    }
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
            Email Verification
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '15px', margin: 0 }}>
            Dayflow HRMS
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '40px 28px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
          textAlign: 'center'
        }}>
          {status === 'verifying' && (
            <>
              <div style={{
                width: '80px',
                height: '80px',
                margin: '0 auto 24px',
                border: '4px solid #e2e8f0',
                borderTopColor: '#667eea',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg); }}`}</style>
              <h3 style={{ margin: '0 0 10px', color: '#1e293b', fontSize: '20px', fontWeight: '600' }}>
                Verifying Your Email
              </h3>
              <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
                Please wait while we verify your email address...
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div style={{
                width: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
                fontSize: '40px',
                color: 'white'
              }}>
                &#10003;
              </div>
              <h3 style={{ margin: '0 0 10px', color: '#1e293b', fontSize: '20px', fontWeight: '600' }}>
                Email Verified!
              </h3>
              <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 24px', lineHeight: '1.5' }}>
                {message}
              </p>
              <Link
                to="/login"
                style={{
                  display: 'inline-block',
                  width: '100%',
                  padding: '14px',
                  fontSize: '15px',
                  fontWeight: '600',
                  color: 'white',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  boxShadow: '0 4px 15px rgba(102,126,234,0.4)',
                  boxSizing: 'border-box'
                }}
              >
                Continue to Login
              </Link>
            </>
          )}

          {status === 'error' && (
            <>
              <div style={{
                width: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
                fontSize: '40px',
                color: 'white'
              }}>
                &#10005;
              </div>
              <h3 style={{ margin: '0 0 10px', color: '#1e293b', fontSize: '20px', fontWeight: '600' }}>
                Verification Failed
              </h3>
              <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 24px', lineHeight: '1.5' }}>
                {message}
              </p>
              <Link
                to="/login"
                style={{
                  display: 'inline-block',
                  width: '100%',
                  padding: '14px',
                  fontSize: '15px',
                  fontWeight: '600',
                  color: 'white',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  boxShadow: '0 4px 15px rgba(102,126,234,0.4)',
                  boxSizing: 'border-box'
                }}
              >
                Back to Login
              </Link>
              <p style={{ marginTop: '16px', color: '#64748b', fontSize: '13px' }}>
                Need a new verification link? Try logging in to request a new one.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
