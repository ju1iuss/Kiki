// Auth helper content script - injected into tasy.ai and app.tasy.ai pages to get session token

(function() {
  // Check if we're on a tasy.ai, app.tasy.ai, or localhost page
  if (!window.location.hostname.includes('tasy.ai') && window.location.hostname !== 'localhost') {
    return;
  }

  console.log('[Tasy Extension Auth Helper] Script loaded on', window.location.hostname);

  // Function to get session token from Supabase
  async function getSessionToken() {
    try {
      console.log('[Tasy Extension Auth Helper] Getting session token...');
      
      // Method 1: Try to get session from localStorage (Supabase @supabase/ssr format)
      const keys = Object.keys(localStorage);
      console.log('[Tasy Extension Auth Helper] Total localStorage keys:', keys.length);
      
      const supabaseKeys = keys.filter(k => k.includes('supabase') || k.includes('sb-'));
      console.log('[Tasy Extension Auth Helper] Supabase localStorage keys:', supabaseKeys);
      
      for (const key of supabaseKeys) {
        const value = localStorage.getItem(key);
        console.log('[Tasy Extension Auth Helper] Checking key:', key);
        try {
          const parsed = JSON.parse(value);
          // Check for access_token at various levels
          if (parsed && typeof parsed === 'object') {
            // Direct access_token
            if (parsed.access_token) {
              console.log('[Tasy Extension Auth Helper] Found token at root level');
              return parsed.access_token;
            }
            // Nested in session
            if (parsed.session && parsed.session.access_token) {
              console.log('[Tasy Extension Auth Helper] Found token in session');
              return parsed.session.access_token;
            }
            // Check for currentSession in PKCE format
            if (parsed.currentSession && parsed.currentSession.access_token) {
              console.log('[Tasy Extension Auth Helper] Found token in currentSession');
              return parsed.currentSession.access_token;
            }
          }
        } catch (e) {
          console.log('[Tasy Extension Auth Helper] Failed to parse key:', key, e);
        }
      }
      
      // Method 2: Try cookies as fallback
      const cookies = document.cookie.split(';').map(c => c.trim());
      console.log('[Tasy Extension Auth Helper] Checking', cookies.length, 'cookies');
      
      for (const cookie of cookies) {
        if (cookie.startsWith('sb-') && cookie.includes('-auth-token')) {
          try {
            const [, value] = cookie.split('=');
            const decoded = decodeURIComponent(value);
            const parsed = JSON.parse(decoded);
            if (parsed.access_token) {
              console.log('[Tasy Extension Auth Helper] Found token in cookie');
              return parsed.access_token;
            }
          } catch (e) {
            console.log('[Tasy Extension Auth Helper] Failed to parse cookie:', e);
          }
        }
      }
      
      console.log('[Tasy Extension Auth Helper] No token found');
      return null;
    } catch (error) {
      console.error('[Tasy Extension Auth Helper] Error getting session:', error);
      return null;
    }
  }

  // Listen for messages from extension
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getSessionToken') {
      console.log('[Tasy Extension Auth Helper] Getting session token...');
      getSessionToken().then(token => {
        console.log('[Tasy Extension Auth Helper] Token found:', !!token);
        sendResponse({ token });
      }).catch(error => {
        console.error('[Tasy Extension Auth Helper] Error:', error);
        sendResponse({ token: null, error: error.message });
      });
      return true; // Async response
    }
  });

  // Function to send token to extension
  async function sendTokenToExtension() {
    const token = await getSessionToken();
    if (token) {
      console.log('[Tasy Extension Auth Helper] Sending token to extension');
      chrome.runtime.sendMessage({ 
        action: 'setSessionToken', 
        token 
      });
    }
  }

  // Auto-send token when page loads (if logged in)
  window.addEventListener('load', sendTokenToExtension);
  
  // Send token when page becomes visible (user switches back to tab)
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      console.log('[Tasy Extension Auth Helper] Page became visible, refreshing token...');
      setTimeout(sendTokenToExtension, 500); // Small delay to ensure page is ready
    }
  });
  
  // Also send token on focus (when user switches back to window)
  window.addEventListener('focus', () => {
    console.log('[Tasy Extension Auth Helper] Window focused, refreshing token...');
    setTimeout(sendTokenToExtension, 500);
  });
})();

