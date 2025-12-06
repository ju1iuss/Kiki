// Auth helper content script - injected into tasy.ai and app.tasy.ai pages to get session token

(function() {
  // Check if we're on a tasy.ai or app.tasy.ai page
  if (!window.location.hostname.includes('tasy.ai')) {
    return;
  }

  console.log('[Tasy Extension Auth Helper] Script loaded on', window.location.hostname);

  // Function to get session token from Supabase
  async function getSessionToken() {
    try {
      // Try to access Supabase client from the page
      // The page should have initialized Supabase client
      const cookies = document.cookie.split(';');
      console.log('[Tasy Extension Auth Helper] Cookies:', cookies.length);
      
      // Try to get session from localStorage
      const keys = Object.keys(localStorage);
      const supabaseKeys = keys.filter(k => k.includes('supabase') || k.includes('sb-'));
      console.log('[Tasy Extension Auth Helper] Supabase localStorage keys:', supabaseKeys);
      
      for (const key of supabaseKeys) {
        const value = localStorage.getItem(key);
        try {
          const parsed = JSON.parse(value);
          if (parsed && (parsed.access_token || parsed.session?.access_token)) {
            const token = parsed.access_token || parsed.session?.access_token;
            console.log('[Tasy Extension Auth Helper] Found token in localStorage');
            return token;
          }
        } catch (e) {
          // Not JSON or doesn't have token
        }
      }
      
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

