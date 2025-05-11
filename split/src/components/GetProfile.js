import React, { useState, useEffect, useCallback } from 'react';

// Configuration object with all necessary settings
const CONFIG = {
  LIFF_ID: process.env.REACT_APP_LIFF_ID || "2007317887-J6OyAed2",
  API_URL: process.env.REACT_APP_API_URL || "https://68d6-2001-b011-300c-7f19-68a6-f16-ecc3-b264.ngrok-free.app/api/profile",
  LIFF_SCOPE: "profile openid email"
};

const GetProfile = () => {
  // State management
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [liffInfo, setLiffInfo] = useState(null);
  const [apiStatus, setApiStatus] = useState(null);

  // Load LIFF SDK dynamically
  const loadLiffSdk = useCallback(() => {
    console.log('Loading LIFF SDK');
    return new Promise((resolve, reject) => {
      if (window.liff) {
        console.log('LIFF SDK already loaded');
        return resolve(window.liff);
      }
      
      const script = document.createElement('script');
      script.src = 'https://static.line-scdn.net/liff/edge/2/sdk.js';
      script.async = true;
      script.onload = () => {
        console.log('LIFF SDK loaded successfully');
        resolve(window.liff);
      };
      script.onerror = (err) => {
        console.error('Failed to load LIFF SDK:', err);
        reject(new Error('Failed to load LIFF SDK'));
      };
      document.body.appendChild(script);
    });
  }, []);

  // Get LIFF information for debugging
  const getLiffInfo = useCallback(() => {
    if (!window.liff) return null;
    
    try {
      const liff = window.liff;
      const info = {
        isLoggedIn: liff.isLoggedIn(),
        isInClient: liff.isInClient(),
        os: liff.getOS(),
        lineVersion: liff.getLineVersion(),
        accessToken: liff.isLoggedIn() ? 'Available (hidden for security)' : 'Not logged in'
      };
      
      setLiffInfo(info);
      return info;
    } catch (err) {
      console.error('Error getting LIFF info:', err);
      return null;
    }
  }, []);

  // Save profile to backend
  const saveProfileToBackend = useCallback(async (profileData) => {
    try {
      setApiStatus({ status: 'loading', message: 'Saving profile to backend...' });
      
      // Dynamically import axios only when needed
      const { default: axios } = await import('axios');
      
      // Format data according to your API schema
      const apiData = {
        userId: profileData.userId,
        displayName: profileData.displayName,
        pictureUrl: profileData.pictureUrl,
        statusMessage: profileData.statusMessage || ''
      };
      
      console.log('Saving profile to backend:', apiData);
      
      // Make API request
      const response = await axios.post(CONFIG.API_URL, apiData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Backend response:', response.data);
      setApiStatus({ status: 'success', message: 'Profile saved successfully' });
      return response.data;
    } catch (err) {
      console.error('Error saving profile to backend:', err);
      setApiStatus({ 
        status: 'error', 
        message: `Backend error: ${err.message}. Please check CORS settings on your server.` 
      });
      throw err;
    }
  }, []);

  // Get user profile
  const getProfile = useCallback(async () => {
    if (!window.liff) {
      console.error('LIFF SDK not available');
      return null;
    }
    
    if (!window.liff.isLoggedIn()) {
      console.error('User is not logged in');
      setError('Please log in with LINE to access your profile');
      return null;
    }

    setError(null);
    
    try {
      // Directly try to get the profile
      console.log('Fetching LINE profile...');
      const lineProfile = await window.liff.getProfile();
      console.log('Profile retrieved:', lineProfile);
      setProfile(lineProfile);
      
      // Try to save profile to backend - but don't fail if it doesn't work
      try {
        await saveProfileToBackend(lineProfile);
      } catch (apiErr) {
        console.error('Backend save error (continuing anyway):', apiErr);
      }
      
      return lineProfile;
    } catch (err) {
      console.error('Profile error:', err);
      setError(`Failed to get profile: ${err.message}`);
      setProfile(null);
      return null;
    }
  }, [saveProfileToBackend]);

  // Initialize LIFF with more robust error handling
  const initializeLiff = useCallback(async () => {
    try {
      if (!window.liff) {
        throw new Error('LIFF SDK not available');
      }
      
      console.log('Initializing LIFF with ID:', CONFIG.LIFF_ID);
      
      // Initialize LIFF
      await window.liff.init({
        liffId: CONFIG.LIFF_ID,
        withLoginOnExternalBrowser: true
      });
      
      console.log('LIFF initialized successfully');
      
      // Get debug info
      getLiffInfo();
      
      // Check login status and fetch profile after a delay
      if (window.liff.isLoggedIn()) {
        // The crucial delay that prevents "LIFF not initialized" errors
        setTimeout(() => {
          getProfile().catch(err => {
            console.error('Error fetching profile:', err);
            setError(`Failed to get profile: ${err.message}`);
          });
        }, 1000); // Increased delay to 1000ms for more reliability
      } else {
        setError('Please log in with LINE to access your profile');
      }
      
      return true;
    } catch (err) {
      console.error('LIFF initialization error:', err);
      setError(`LIFF initialization failed: ${err.message}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [getProfile, getLiffInfo]);

  // Main initialization effect
  useEffect(() => {
    let isMounted = true;
    let initAttempts = 0;
    const MAX_ATTEMPTS = 3;
    
    const initialize = async () => {
      if (initAttempts >= MAX_ATTEMPTS) {
        console.error(`Failed to initialize after ${MAX_ATTEMPTS} attempts`);
        if (isMounted) {
          setError(`Failed to initialize after multiple attempts. Please refresh.`);
          setIsLoading(false);
        }
        return;
      }
      
      initAttempts++;
      console.log(`Initialization attempt #${initAttempts}`);
      
      try {
        // Load LIFF SDK
        await loadLiffSdk();
        
        if (!isMounted) return;
        
        // Add a small delay before initialization
        await new Promise(resolve => setTimeout(resolve, 500));
        
        if (isMounted) {
          // Initialize LIFF
          const success = await initializeLiff();
          
          if (!success && isMounted && initAttempts < MAX_ATTEMPTS) {
            console.log('Initialization failed, retrying...');
            setTimeout(initialize, 1000);
          }
        }
      } catch (err) {
        console.error('Initialization error:', err);
        if (isMounted) {
          if (initAttempts < MAX_ATTEMPTS) {
            console.log('Initialization error, retrying...');
            setTimeout(initialize, 1000);
          } else {
            setError(`Failed to initialize: ${err.message}`);
            setIsLoading(false);
          }
        }
      }
    };
    
    initialize();
    
    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [loadLiffSdk, initializeLiff]);

  // Function to manually trigger login with force option
  const handleLogin = useCallback(() => {
    if (!window.liff) {
      setError('LIFF SDK not available. Please refresh the page.');
      return;
    }
    
    try {
      console.log('Initiating LINE login...');
      window.liff.login({
        redirectUri: window.location.href,
        scope: CONFIG.LIFF_SCOPE,
        force: true // Force re-authentication
      });
    } catch (err) {
      console.error('Login error:', err);
      setError(`Login failed: ${err.message}`);
    }
  }, []);

  // Handle logout
  const handleLogout = useCallback(() => {
    if (!window.liff) {
      setError('LIFF SDK not available. Please refresh the page.');
      return;
    }
    
    try {
      console.log('Logging out...');
      window.liff.logout();
      setProfile(null);
      setError(null);
      setApiStatus(null);
      window.location.reload(); // Reload after logout
    } catch (err) {
      console.error('Logout error:', err);
      setError(`Logout failed: ${err.message}`);
    }
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading LINE integration...</p>
      </div>
    );
  }

  return (
    <div className="profile-container">
      {/* Error message and login button */}
      {error && (
        <div className="error-container">
          <div className="error-message">{error}</div>
          <button 
            onClick={handleLogin} 
            className="line-login-button"
            disabled={!window.liff}
          >
            Login with LINE
          </button>
        </div>
      )}
      
      {/* Profile information */}
      {profile && (
        <div className="profile-success">
          <img
            src={profile.pictureUrl || '/default-profile.png'}
            alt={profile.displayName || 'Profile'}
            className="profile-image"
          />
          <div className="profile-info">
            <h2>{profile.displayName}</h2>
            <p>User ID: {profile.userId}</p>
            {profile.statusMessage && (
              <p>Status: {profile.statusMessage}</p>
            )}
            
            {/* API Status notification */}
            {apiStatus && (
              <div className={`api-status api-status-${apiStatus.status}`}>
                <p>{apiStatus.message}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Logout button */}
      {window.liff && window.liff.isLoggedIn() && (
        <button onClick={handleLogout} className="logout-button">
          Logout from LINE
        </button>
      )}

      {/* Debug information */}
      {liffInfo && (
        <div className="debug-section">
          <details>
            <summary>LIFF Debug Information</summary>
            <pre className="debug-info">{JSON.stringify(liffInfo, null, 2)}</pre>
          </details>
        </div>
      )}
    </div>
  );
};

export default GetProfile;