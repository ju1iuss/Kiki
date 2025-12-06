// Background service worker for Chrome extension

// Use localhost for development, production for release
const API_BASE = 'http://localhost:3000/api/chrome-extension';
// const API_BASE = 'https://www.tasy.ai/api/chrome-extension'; // For production
const SUPABASE_URL = 'https://zcftkbpfekuvatkiiujq.supabase.co'; // Update with your Supabase URL

// Store session token
let sessionToken = null;

// Load session token from storage on startup
chrome.storage.local.get(['sessionToken'], (result) => {
  if (result.sessionToken) {
    console.log('[Tasy Extension Background] Loaded session token from storage');
    sessionToken = result.sessionToken;
  }
});

// Listen for tab updates to refresh token when tasy.ai or app.tasy.ai tabs become active
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && 
      (tab.url.includes('tasy.ai') || tab.url.includes('app.tasy.ai') || tab.url.includes('localhost:3000'))) {
    console.log('[Tasy Extension Background] Tasy.ai tab updated, refreshing token...');
    await refreshSessionToken();
  }
});

// Listen for tab activation to refresh token when switching to tasy.ai or app.tasy.ai tabs
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    if (tab.url && (tab.url.includes('tasy.ai') || tab.url.includes('app.tasy.ai') || tab.url.includes('localhost:3000'))) {
      console.log('[Tasy Extension Background] Tasy.ai tab activated, refreshing token...');
      await refreshSessionToken();
    }
  } catch (e) {
    // Tab might not be accessible
  }
});

// Notify all Pinterest tabs that auth state has changed
async function notifyPinterestTabsAuthChanged() {
  try {
    const tabs = await chrome.tabs.query({ url: 'https://*.pinterest.com/*' });
    console.log('[Tasy Extension Background] Notifying', tabs.length, 'Pinterest tabs of auth change');
    
    for (const tab of tabs) {
      try {
        await chrome.tabs.sendMessage(tab.id, { action: 'authStateChanged' });
      } catch (e) {
        // Tab might not have content script loaded yet
      }
    }
  } catch (e) {
    console.log('[Tasy Extension Background] Error notifying Pinterest tabs:', e.message);
  }
}

// Refresh session token from tasy.ai or app.tasy.ai pages
async function refreshSessionToken() {
  try {
    console.log('[Tasy Extension Background] Refreshing session token from tasy.ai or app.tasy.ai...');
    const tabs = await chrome.tabs.query({});
    // Try app.tasy.ai first, then tasy.ai, then localhost
    const tasyTab = tabs.find(tab => 
      tab.url && tab.url.includes('app.tasy.ai')
    ) || tabs.find(tab => 
      tab.url && tab.url.includes('tasy.ai')
    ) || tabs.find(tab => 
      tab.url && tab.url.includes('localhost:3000')
    );
    
    if (tasyTab) {
      console.log('[Tasy Extension Background] Found tasy.ai tab, requesting token...');
      try {
        const response = await chrome.tabs.sendMessage(tasyTab.id, { action: 'getSessionToken' });
        if (response && response.token) {
          sessionToken = response.token;
          await chrome.storage.local.set({ sessionToken });
          console.log('[Tasy Extension Background] Refreshed session token from page');
          
          // Notify Pinterest tabs
          notifyPinterestTabsAuthChanged();
          
          return true;
        }
      } catch (e) {
        console.log('[Tasy Extension Background] Could not get token from tab (may not be loaded):', e.message);
      }
    }
    
    // Also try to get cookies directly from both domains
    try {
      const cookies1 = await chrome.cookies.getAll({ domain: '.tasy.ai' });
      const cookies2 = await chrome.cookies.getAll({ domain: 'tasy.ai' });
      const cookies3 = await chrome.cookies.getAll({ domain: 'app.tasy.ai' });
      const cookies4 = await chrome.cookies.getAll({ domain: 'www.tasy.ai' });
      const allCookies = [...cookies1, ...cookies2, ...cookies3, ...cookies4];
      
      console.log('[Tasy Extension Background] Found', allCookies.length, 'cookies');
      console.log('[Tasy Extension Background] Cookie names:', allCookies.map(c => c.name));
      
      // Look for Supabase auth token cookie - try multiple patterns
      let authCookie = allCookies.find(c => 
        c.name.startsWith('sb-') && c.name.includes('auth-token')
      );
      
      if (!authCookie) {
        authCookie = allCookies.find(c => 
        c.name.includes('supabase.auth.token')
      );
      }
      
      // Try to find any cookie with 'sb-' prefix that might contain auth data
      if (!authCookie) {
        const sbCookies = allCookies.filter(c => c.name.startsWith('sb-'));
        console.log('[Tasy Extension Background] Found Supabase cookies:', sbCookies.map(c => c.name));
        // Try the first sb- cookie that looks like an auth cookie
        authCookie = sbCookies.find(c => 
          c.name.includes('auth') || c.name.includes('token') || c.name.includes('session')
        ) || sbCookies[0]; // Fallback to first sb- cookie
      }
      
      if (authCookie) {
        console.log('[Tasy Extension Background] Found auth cookie:', authCookie.name);
        try {
          // Try parsing as JSON first
          let cookieValue;
        try {
            cookieValue = JSON.parse(decodeURIComponent(authCookie.value));
          } catch (e) {
            // If not JSON, try parsing as URL-encoded JSON
            cookieValue = JSON.parse(authCookie.value);
          }
          
          // Extract access_token from various possible structures
          let token = cookieValue.access_token || 
                     cookieValue.session?.access_token ||
                     cookieValue.token ||
                     cookieValue.accessToken;
          
          if (token) {
            sessionToken = token;
            await chrome.storage.local.set({ sessionToken });
            console.log('[Tasy Extension Background] Extracted token from cookie');
            
            // Notify Pinterest tabs
            notifyPinterestTabsAuthChanged();
            
            return true;
          } else {
            console.log('[Tasy Extension Background] Cookie found but no access_token in structure:', Object.keys(cookieValue));
          }
        } catch (e) {
          console.log('[Tasy Extension Background] Could not parse cookie value:', e.message);
          console.log('[Tasy Extension Background] Cookie value preview:', authCookie.value.substring(0, 100));
        }
      } else {
        console.log('[Tasy Extension Background] No auth cookie found');
      }
    } catch (e) {
      console.log('[Tasy Extension Background] Could not access cookies:', e.message);
    }
    
    return false;
  } catch (e) {
    console.error('[Tasy Extension Background] Error refreshing token:', e);
    return false;
  }
}

// Make authenticated API request (uses session token)
async function apiRequest(endpoint, options = {}) {
  console.log('[Tasy Extension Background] Making request to:', `${API_BASE}${endpoint}`);
  console.log('[Tasy Extension Background] Has session token:', !!sessionToken);
  
  // If no session token, try to get it from storage first, then refresh if needed
  if (!sessionToken) {
    const stored = await chrome.storage.local.get(['sessionToken']);
    if (stored.sessionToken) {
      sessionToken = stored.sessionToken;
      console.log('[Tasy Extension Background] Loaded token from storage');
    } else {
    await refreshSessionToken();
    }
  }
  
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      // Use Bearer token if available
      ...(sessionToken && { 'Authorization': `Bearer ${sessionToken}` }),
      ...options.headers,
    },
    credentials: 'include',
    redirect: 'follow',
  });

  console.log('[Tasy Extension Background] Response status:', response.status);
  console.log('[Tasy Extension Background] Response URL:', response.url);
  
  if (response.status === 401) {
    const errorText = await response.text();
    console.error('[Tasy Extension Background] 401 error, attempting to refresh token...');
    // Clear invalid token
    sessionToken = null;
    await chrome.storage.local.remove('sessionToken');
    
    // Try to refresh token and retry once
    const refreshed = await refreshSessionToken();
    if (refreshed && sessionToken) {
      console.log('[Tasy Extension Background] Token refreshed, retrying request with new token...');
      // Retry the request with new token
      return fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`,
          ...options.headers,
        },
        credentials: 'include',
        redirect: 'follow',
      });
    }
    
    // If refresh failed, try one more time by loading from storage
    const stored = await chrome.storage.local.get(['sessionToken']);
    if (stored.sessionToken) {
      console.log('[Tasy Extension Background] Using stored token for retry...');
      sessionToken = stored.sessionToken;
      return fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`,
          ...options.headers,
        },
        credentials: 'include',
        redirect: 'follow',
      });
    }
    
    throw new Error('Authentication required');
  }

  return response;
}

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Handle session token from tasy.ai pages
  if (request.action === 'setSessionToken') {
    console.log('[Tasy Extension Background] Received session token from page');
    sessionToken = request.token;
    // Store in chrome.storage for persistence
    chrome.storage.local.set({ sessionToken: request.token });
    
    // Notify all Pinterest tabs that auth state changed
    notifyPinterestTabsAuthChanged();
    
    sendResponse({ success: true });
    return true;
  }

  if (request.action === 'adaptAd') {
    adaptAd(request.adData, request.brandInfo)
      .then(result => sendResponse({ success: true, ...result }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Async response
  }

  if (request.action === 'adaptPin') {
    adaptPin(request.pinData, request.brandInfo)
      .then(result => sendResponse({ success: true, ...result }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Async response
  }

  if (request.action === 'analyzeText') {
    analyzeText(request.imageUrl)
      .then(result => sendResponse({ success: true, ...result }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Async response
  }

  if (request.action === 'saveAd') {
    saveAd(request.originalAd, request.adaptedAd, request.sourceUrl)
      .then(result => sendResponse({ success: true, ...result }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }

  if (request.action === 'checkAuth') {
    checkAuth()
      .then(result => sendResponse({ success: true, ...result }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }

  if (request.action === 'debugAuth') {
    (async () => {
      try {
        console.log('=== Tasy Extension Auth Debug ===');
        const cookies1 = await chrome.cookies.getAll({ domain: 'tasy.ai' });
        const cookies2 = await chrome.cookies.getAll({ domain: '.tasy.ai' });
        const cookies3 = await chrome.cookies.getAll({ domain: 'www.tasy.ai' });
        const cookies4 = await chrome.cookies.getAll({ domain: 'app.tasy.ai' });
        const allCookies = [...cookies1, ...cookies2, ...cookies3, ...cookies4];
        
        console.log('Total cookies:', allCookies.length);
        console.log('Cookie names:', allCookies.map(c => c.name));
        console.log('Cookie domains:', [...new Set(allCookies.map(c => c.domain))]);
        
        const result = await checkAuth();
        sendResponse({ success: true, cookies: allCookies.length, cookieNames: allCookies.map(c => c.name), auth: result });
      } catch (error) {
        console.error('Debug failed:', error);
        sendResponse({ success: false, error: error.message });
      }
    })();
    return true;
  }
});

// Check user authentication and credits
async function checkAuth() {
  try {
    console.log('[Tasy Extension Background] Checking auth...');
    
    // First, try to load token from storage
    if (!sessionToken) {
      const stored = await chrome.storage.local.get(['sessionToken']);
      if (stored.sessionToken) {
        sessionToken = stored.sessionToken;
        console.log('[Tasy Extension Background] Loaded token from storage');
      } else {
        console.log('[Tasy Extension Background] No token in storage, refreshing...');
      await refreshSessionToken();
      }
    }
    
    const response = await apiRequest('/auth');
    console.log('[Tasy Extension Background] Auth response status:', response.status);
    
    if (!response.ok) {
      // If auth failed, try refreshing token once more
      console.log('[Tasy Extension Background] Auth failed (status:', response.status, '), attempting token refresh...');
      const refreshed = await refreshSessionToken();
      
      if (refreshed && sessionToken) {
        // Retry with refreshed token
        console.log('[Tasy Extension Background] Token refreshed, retrying auth check...');
        const retryResponse = await apiRequest('/auth');
        if (retryResponse.ok) {
          const data = await retryResponse.json();
          console.log('[Tasy Extension Background] Auth success after refresh:', data);
          
          // Store user credits
          if (data.credits !== undefined) {
            await chrome.storage.local.set({ userCredits: data.credits });
          }
          
          return data;
        } else {
          console.log('[Tasy Extension Background] Retry also failed with status:', retryResponse.status);
        }
      } else {
        console.log('[Tasy Extension Background] Token refresh failed or no token available');
      }
      
      // If we get here, user is not authenticated
      console.log('[Tasy Extension Background] User is not authenticated');
      throw new Error('Not authenticated');
    }
    
    const data = await response.json();
    console.log('[Tasy Extension Background] Auth success:', data);
    
    // Store user credits in chrome storage for popup (credits is at root level)
    if (data.credits !== undefined) {
      await chrome.storage.local.set({ userCredits: data.credits });
      console.log('[Tasy Extension Background] Stored user credits:', data.credits);
    }
    
    return data;
  } catch (error) {
    console.error('[Tasy Extension Background] Auth check error:', error);
    // Don't wrap the error message if it's already "Not authenticated"
    if (error.message === 'Not authenticated' || error.message === 'Authentication required') {
      throw error;
    }
    throw new Error('Failed to check authentication: ' + error.message);
  }
}

// Adapt ad using Gemini
async function adaptAd(adData, brandInfo) {
  try {
    console.log('[Tasy Extension Background] Adapting ad with data:', {
      originalAdImage: adData.image?.substring(0, 100) + '...',
      brandInfo: {
        ...brandInfo,
        productImage: brandInfo.productImage ? brandInfo.productImage.substring(0, 100) + '...' : null,
        secondaryImages: brandInfo.secondaryImages?.length || 0,
      }
    });
    
    const response = await apiRequest('/adapt-ad', {
      method: 'POST',
      body: JSON.stringify({
        originalAd: adData,
        brandInfo: brandInfo,
        source: 'facebook', // Indicate this is from Facebook
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to adapt ad');
    }

    const result = await response.json();
    console.log('[Tasy Extension Background] Received adapted ad:', {
      image: result.adaptedAd?.image?.substring(0, 100) + '...' || 'NO IMAGE',
      creditsRemaining: result.creditsRemaining
    });
    
    // Update stored credits
    if (result.creditsRemaining !== undefined) {
      await chrome.storage.local.set({ userCredits: result.creditsRemaining });
      console.log('[Tasy Extension Background] Updated credits:', result.creditsRemaining);
    }
    
    return result;
  } catch (error) {
    console.error('[Tasy Extension Background] Adapt ad error:', error);
    throw error;
  }
}

// Analyze text from Pinterest image
async function analyzeText(imageUrl) {
  try {
    console.log('[Tasy Extension Background] Analyzing text from image:', imageUrl.substring(0, 100));
    
    const response = await apiRequest('/analyze-text', {
      method: 'POST',
      body: JSON.stringify({ imageUrl }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to analyze text');
    }

    const result = await response.json();
    console.log('[Tasy Extension Background] Text analysis result:', result.texts?.length || 0, 'texts found');
    
    return result;
  } catch (error) {
    console.error('[Tasy Extension Background] Analyze text error:', error);
    throw error;
  }
}

// Adapt pin (Pinterest) - similar to adaptAd but for Pinterest logo replacement
async function adaptPin(pinData, brandInfo) {
  try {
    const logoPreview = brandInfo.logo ? 
      (brandInfo.logo.startsWith('data:') ? 
        `data:image (base64, ${brandInfo.logo.length} chars)` : 
        brandInfo.logo.substring(0, 100) + '...') : 
      'NO LOGO';
    
    console.log('[Tasy Extension Background] Adapting pin with data:', {
      originalPinImage: pinData.image?.substring(0, 100) + '...',
      brandInfo: {
        logosCount: brandInfo.logos?.length || 0,
        logo: logoPreview,
        logoLength: brandInfo.logo?.length || 0,
        logoType: brandInfo.logo?.startsWith('data:') ? 'base64' : 'URL',
        hasTextReplacements: !!(brandInfo.textReplacements?.length),
        textReplacementsCount: brandInfo.textReplacements?.length || 0,
        customPrompt: brandInfo.customPrompt || '',
        accentColor: brandInfo.accentColor,
        mode: (brandInfo.logos?.length || 0) > 0 ? 'LOGO_REPLACEMENT' : 'TEXT_ONLY'
      }
    });
    
    if (brandInfo.textReplacements && brandInfo.textReplacements.length > 0) {
      console.log('[Tasy Extension Background] Text replacements:', brandInfo.textReplacements);
    }
    
    const response = await apiRequest('/adapt-ad', {
      method: 'POST',
      body: JSON.stringify({
        originalAd: {
          image: pinData.image,
          headline: pinData.title || '',
          text: '',
          cta: '',
        },
        brandInfo: {
          logos: brandInfo.logos || [], // Send empty array if no logos, NO FALLBACK
          logo: brandInfo.logo || null, // null if no logo
          customPrompt: brandInfo.customPrompt || '',
          accentColor: brandInfo.accentColor,
          textReplacements: brandInfo.textReplacements || [],
        },
        source: 'pinterest', // Indicate this is from Pinterest
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to adapt pin');
    }

    const result = await response.json();
    console.log('[Tasy Extension Background] Received adapted pin:', {
      image: result.adaptedAd?.image?.substring(0, 100) + '...' || 'NO IMAGE',
      creditsRemaining: result.creditsRemaining
    });
    
    // Update stored credits
    if (result.creditsRemaining !== undefined) {
      await chrome.storage.local.set({ userCredits: result.creditsRemaining });
      console.log('[Tasy Extension Background] Updated credits:', result.creditsRemaining);
    }
    
    return result;
  } catch (error) {
    console.error('[Tasy Extension Background] Adapt pin error:', error);
    throw error;
  }
}

// Save adapted ad to database
async function saveAd(originalAd, adaptedAd, sourceUrl) {
  try {
    const response = await apiRequest('/save-ad', {
      method: 'POST',
      body: JSON.stringify({
        originalAd,
        adaptedAd,
        sourceUrl,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to save ad');
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
  // This is handled by popup.html
});

// Debug function - can be called from console via chrome.runtime
// Usage: chrome.runtime.sendMessage({ action: 'debugAuth' })
if (typeof self !== 'undefined') {
  // Service worker context - attach to self
  self.debugTasyAuth = async function() {
    console.log('=== Tasy Extension Auth Debug ===');
    
    // Check cookies from both domains
    const cookies1 = await chrome.cookies.getAll({ domain: 'tasy.ai' });
    const cookies2 = await chrome.cookies.getAll({ domain: '.tasy.ai' });
    const cookies3 = await chrome.cookies.getAll({ domain: 'www.tasy.ai' });
    const cookies4 = await chrome.cookies.getAll({ domain: 'app.tasy.ai' });
    const allCookies = [...cookies1, ...cookies2, ...cookies3, ...cookies4];
    
    console.log('Total cookies:', allCookies.length);
    console.log('Cookie names:', allCookies.map(c => c.name));
    console.log('Cookie domains:', [...new Set(allCookies.map(c => c.domain))]);
    
    // Check for Supabase cookies
    const supabaseCookies = allCookies.filter(c => 
      c.name.startsWith('sb-') || 
      c.name.includes('supabase') || 
      c.name.includes('auth')
    );
    console.log('Supabase cookies:', supabaseCookies.map(c => ({ name: c.name, domain: c.domain })));
    
    // Test auth
    try {
      const result = await checkAuth();
      console.log('Auth check result:', result);
    } catch (error) {
      console.error('Auth check failed:', error);
    }
  };
}


