// Content script injected into Pinterest pages

const BUTTON_CLASS = 'tasy-copy-pin-btn';
const PROCESSED_ATTR = 'data-tasy-processed';

// Helper function to escape HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Get brand settings from storage
async function getBrandSettings() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['logos', 'logo', 'secondaryLogo', 'thirdLogo', 'accentColor'], (result) => {
      // Use new logos array if available, otherwise migrate from old format
      let logos = [];
      if (result.logos && Array.isArray(result.logos) && result.logos.length > 0) {
        logos = result.logos.map(l => l?.data || l);
      } else {
        // Migrate from old format
        if (result.logo) logos.push(result.logo?.data || result.logo);
        if (result.secondaryLogo) logos.push(result.secondaryLogo?.data || result.secondaryLogo);
        if (result.thirdLogo) logos.push(result.thirdLogo?.data || result.thirdLogo);
      }
      
      const logo = logos.length > 0 ? logos[0] : null;
      const secondaryLogo = logos.length > 1 ? logos[1] : null;
      const thirdLogo = logos.length > 2 ? logos[2] : null;
      
      console.log('[Tasy Pinterest] Retrieved logos from storage:', {
        logosCount: logos.length,
        hasLogo: !!logo,
        hasSecondaryLogo: !!secondaryLogo,
        hasThirdLogo: !!thirdLogo,
        logoType: logo ? (logo.startsWith('data:') ? 'base64' : 'URL') : 'none',
        logoLength: logo?.length || 0,
      });
      resolve({
        logos: logos,
        logo: logo,
        secondaryLogo: secondaryLogo,
        thirdLogo: thirdLogo,
        accentColor: result.accentColor || '#FF006F',
      });
    });
  });
}

// Check if we're on a pin detail page
function isPinDetailPage() {
  const pathname = window.location.pathname;
  // Detail pages typically have /pin/ followed by a pin ID, and often have specific containers
  const isDetailPath = /\/pin\/[^\/]+/.test(pathname) && !pathname.includes('/pin/repin');
  const hasDetailContainer = document.querySelector('[data-test-id="visual-content-container"]') !== null ||
                            document.querySelector('[data-test-id="closeup-image"]') !== null ||
                            document.querySelector('[data-test-id="pin"]') !== null;
  return isDetailPath && hasDetailContainer;
}

// Inject Copy buttons on Pinterest pins
function injectCopyButtons() {
  console.log('[Tasy Pinterest] Scanning for pins...');
  
  const isDetailPage = isPinDetailPage();
  console.log('[Tasy Pinterest] Is detail page:', isDetailPage);
  
  // On detail pages, also look for the main pin container
  let containers = [];
  if (isDetailPage) {
    // Find the main pin image container on detail page
    const detailContainer = document.querySelector('[data-test-id="visual-content-container"]') ||
                           document.querySelector('[data-test-id="closeup-image"]') ||
                           document.querySelector('[data-test-id="pin"]') ||
                           document.querySelector('div[role="img"]') ||
                           document.querySelector('img[data-test-id*="pin"]')?.closest('div');
    if (detailContainer) {
      containers.push({ container: detailContainer, isDetail: true });
    }
  }
  
  // Process detail page container
  if (containers.length > 0 && containers[0].isDetail) {
    const { container } = containers[0];
    if (!container.querySelector(`.${BUTTON_CLASS}`)) {
      attachCopyButton(container, true);
    }
  }
  
  // Process grid pins (small pins)
  const pinLinks = document.querySelectorAll('a[href*="/pin/"]:not([data-tasy-processed])');
  console.log('[Tasy Pinterest] Found', pinLinks.length, 'pin links');
  
  pinLinks.forEach(pinLink => {
    // Mark as processed
    pinLink.setAttribute(PROCESSED_ATTR, 'true');
    
    // Skip if already has button
    if (pinLink.querySelector(`.${BUTTON_CLASS}`)) {
      return;
    }
    
    // Use the pin link itself as the container for better hover detection
    if (pinLink && pinLink !== containers[0]?.container) {
      attachCopyButton(pinLink, false);
    }
  });
}

// Attach Copy button to a container
function attachCopyButton(container, isDetailPage) {
    
  // Ensure container has relative positioning
  const containerStyles = window.getComputedStyle(container);
  if (containerStyles.position === 'static') {
    container.style.position = 'relative';
  }
  
  // Calculate position - same for both detail and grid pages (bottom left corner)
  let positionStyle = '';
  let buttonPadding = '';
  let buttonFontSize = '';
  let buttonBorderRadius = '';
  
  // Always use bottom-left corner positioning for all pages
  positionStyle = 'bottom: 8px; left: 8px;';
  buttonPadding = '10px 16px';
  buttonFontSize = '13px';
  buttonBorderRadius = '12px';
  
  // Create Copy button wrapper to include chevron
  const copyBtnWrapper = document.createElement('div');
  copyBtnWrapper.className = `${BUTTON_CLASS}-wrapper`;
  copyBtnWrapper.style.cssText = `
    position: absolute;
    ${positionStyle}
    display: flex;
    align-items: center;
    gap: 0;
    z-index: 10000;
    opacity: 1;
    visibility: hidden;
    transition: visibility 0.2s ease;
    pointer-events: none;
  `;
  
  // Create Replace button
  const copyBtn = document.createElement('button');
  copyBtn.className = BUTTON_CLASS;
  copyBtn.innerHTML = '<span style="flex: 1;">Replace</span>';
  
  copyBtn.style.cssText = `
    padding: ${buttonPadding};
    background: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border: none;
    border-radius: ${buttonBorderRadius};
    color: #fff;
    font-size: ${buttonFontSize};
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s ease;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1;
    white-space: nowrap;
    opacity: 1 !important;
  `;
  
  // No chevron button or settings panel on pin buttons - all functionality is in modal
  
  copyBtnWrapper.appendChild(copyBtn);
  
  // Add hover behavior for all pins (grid and detail pages)
  let hideTimeout = null;
  let isMouseOver = false;
  
  const showButton = () => {
    // Clear any pending hide timeout
    if (hideTimeout) {
      clearTimeout(hideTimeout);
      hideTimeout = null;
    }
    isMouseOver = true;
    copyBtnWrapper.style.visibility = 'visible';
    copyBtnWrapper.style.pointerEvents = 'auto';
  };
  
  const hideButton = () => {
    isMouseOver = false;
    // Add delay before hiding to prevent flickering
    hideTimeout = setTimeout(() => {
      if (!isMouseOver) {
        copyBtnWrapper.style.visibility = 'hidden';
        copyBtnWrapper.style.pointerEvents = 'none';
      }
      hideTimeout = null;
    }, 300);
  };
  
  // Simple and reliable: just listen to mouseenter/mouseleave on the container
  container.addEventListener('mouseenter', showButton);
  container.addEventListener('mouseleave', hideButton);
  
  // Also keep visible when hovering button
  copyBtnWrapper.addEventListener('mouseenter', showButton);
  copyBtnWrapper.addEventListener('mouseleave', hideButton);
  
  // Lighten up on hover
  copyBtn.addEventListener('mouseenter', () => {
    copyBtn.style.background = 'rgba(40, 40, 40, 0.9)';
  });
  
  copyBtn.addEventListener('mouseleave', () => {
    copyBtn.style.background = 'rgba(0, 0, 0, 0.85)';
  });
  
  // Handle click - opens modal popup
  copyBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    
    // Extract pin image
    const img = container.querySelector('img');
    if (!img || !img.src) {
      console.error('[Tasy Pinterest] No image found in pin');
      return;
    }
    
    // Get the best quality image URL (Pinterest often has multiple sizes)
    let imageUrl = img.src;
    
    // Try to get higher resolution version
    if (img.srcset) {
      const srcset = img.srcset.split(',').map(s => s.trim());
      // Get the largest image
      const largest = srcset.reduce((prev, current) => {
        const prevSize = parseInt(prev.split(' ')[1]) || 0;
        const currentSize = parseInt(current.split(' ')[1]) || 0;
        return currentSize > prevSize ? current : prev;
      }, srcset[0]);
      if (largest) {
        imageUrl = largest.split(' ')[0];
      }
    }
    
    // Also try data-testid or other attributes that might have high-res URL
    if (img.dataset.src) {
      imageUrl = img.dataset.src;
    }
    
    console.log('[Tasy Pinterest] Extracted image URL:', imageUrl.substring(0, 100));
    
    // Find pin link if available
    const pinLink = container.closest('a[href*="/pin/"]') || container.querySelector('a[href*="/pin/"]');
    
    // No settings on pin buttons - all settings are in the modal popup
    const customPrompt = '';
    const selectedLogos = [];
    const textReplacements = [];
    
    // Get pin data
    const pinData = {
      image: imageUrl,
      url: pinLink?.href || window.location.href,
      title: container.querySelector('[data-test-id="pinrep-title"]')?.textContent || 
             container.querySelector('h2')?.textContent || 
             '',
      customPrompt: customPrompt,
      selectedLogos: selectedLogos,
      textReplacements: textReplacements,
    };
    
    // Show popup modal instead of inline processing
    showReplaceModal(pinData, container);
  });
  
  container.appendChild(copyBtnWrapper);
}

// Helper function to close all modals and popups
function closeAllModals() {
  const mainModal = document.getElementById('tasy-replace-modal');
  const textEditPopup = document.getElementById('tasy-text-edit-popup');
  if (textEditPopup) {
    textEditPopup.remove();
  }
  if (mainModal) {
    mainModal.remove();
  }
}

// Start checking auth periodically when login modal is shown
let authCheckInterval = null;
function startAuthCheckLoop(modal, pinData, container) {
  // Clear any existing interval
  if (authCheckInterval) {
    clearInterval(authCheckInterval);
  }
  
  console.log('[Tasy Pinterest] Starting auth check loop...');
  
  // Check immediately
  checkAndRefreshAuth(modal, pinData, container);
  
  // Then check every 2 seconds
  authCheckInterval = setInterval(() => {
    checkAndRefreshAuth(modal, pinData, container);
  }, 2000);
  
  // Stop checking after 5 minutes
  setTimeout(() => {
    if (authCheckInterval) {
      clearInterval(authCheckInterval);
      authCheckInterval = null;
      console.log('[Tasy Pinterest] Stopped auth check loop after 5 minutes');
    }
  }, 300000);
}

// Check auth and refresh modal if authenticated
async function checkAndRefreshAuth(modal, pinData, container) {
  // Only check if modal still exists and shows login UI
  if (!modal || !document.body.contains(modal)) {
    if (authCheckInterval) {
      clearInterval(authCheckInterval);
      authCheckInterval = null;
    }
    return;
  }
  
  const loginContent = modal.querySelector('#tasy-modal-login-content');
  if (!loginContent) {
    // Already showing authenticated UI, stop checking
    if (authCheckInterval) {
      clearInterval(authCheckInterval);
      authCheckInterval = null;
    }
    return;
  }
  
  try {
    console.log('[Tasy Pinterest] Checking auth status...');
    const authResult = await chrome.runtime.sendMessage({ action: 'checkAuth' });
    
    if (authResult && authResult.success) {
      console.log('[Tasy Pinterest] Auth successful! Refreshing modal...');
      
      // Stop checking
      if (authCheckInterval) {
        clearInterval(authCheckInterval);
        authCheckInterval = null;
      }
      
      // Refresh the modal to show authenticated UI
      refreshModalForAuth(modal, pinData, container);
    }
  } catch (error) {
    // Auth check failed, keep checking
    console.log('[Tasy Pinterest] Auth check failed, will retry:', error.message);
  }
}

// Refresh modal to show authenticated UI
async function refreshModalForAuth(modal, pinData, container) {
  console.log('[Tasy Pinterest] Refreshing modal for authenticated user...');
  
  // Close the current modal and reopen it, which will automatically show authenticated UI
  closeAllModals();
  
  // Small delay to ensure modal is closed, then reopen
  setTimeout(() => {
    showReplaceModal(pinData, container);
  }, 200);
}

// Show replace modal in top right corner
async function showReplaceModal(pinData, container) {
  // Remove any existing modal
  const existingModal = document.getElementById('tasy-replace-modal');
  if (existingModal) {
    closeAllModals();
  }
  
  // Check authentication first
  let isAuthenticated = false;
  let authResult = null;
  try {
    authResult = await chrome.runtime.sendMessage({ action: 'checkAuth' });
    isAuthenticated = authResult && authResult.success;
  } catch (error) {
    console.error('[Tasy Pinterest] Auth check failed:', error);
    isAuthenticated = false;
  }
  
  // Extract image URL for background
  const img = container.querySelector('img');
  let imageUrl = pinData.image;
  
  if (img) {
    if (img.srcset) {
      const srcset = img.srcset.split(',').map(s => s.trim());
      const largest = srcset.reduce((prev, current) => {
        const prevSize = parseInt(prev.split(' ')[1]) || 0;
        const currentSize = parseInt(current.split(' ')[1]) || 0;
        return currentSize > prevSize ? current : prev;
      }, srcset[0]);
      if (largest) {
        imageUrl = largest.split(' ')[0];
      }
    }
    if (img.dataset.src) {
      imageUrl = img.dataset.src;
    }
  }
  
  // Create modal - will be sized based on image aspect ratio
  const modal = document.createElement('div');
  modal.id = 'tasy-replace-modal';
  
  // Store pinData and container reference for auth refresh
  modal.dataset.pinData = JSON.stringify(pinData);
  // Create a unique ID for the container if it doesn't have one
  if (!container.dataset.tasyContainerId) {
    container.dataset.tasyContainerId = `tasy-container-${Date.now()}`;
  }
  modal.dataset.containerId = container.dataset.tasyContainerId;
  
  // Load image to get dimensions for aspect ratio
  const tempImg = new Image();
  tempImg.crossOrigin = 'anonymous';
  
  tempImg.onload = () => {
    const imageAspectRatio = tempImg.width / tempImg.height;
    const maxWidth = Math.min(480, window.innerWidth - 40);
    // Limit max height to 70% of viewport for very tall images
    const maxHeight = Math.min(window.innerHeight * 0.7, window.innerHeight - 40);
    
    // Calculate dimensions maintaining aspect ratio
    let finalWidth = maxWidth;
    let finalHeight = maxWidth / imageAspectRatio;
    
    // If height exceeds max, scale down
    if (finalHeight > maxHeight) {
      finalHeight = maxHeight;
      finalWidth = maxHeight * imageAspectRatio;
    }
    
    console.log('[Tasy Pinterest] Modal dimensions:', { 
      imageAspectRatio, 
      finalWidth, 
      finalHeight,
      imageWidth: tempImg.width,
      imageHeight: tempImg.height
    });
    
    modal.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      width: ${finalWidth}px;
      height: ${finalHeight}px;
      max-width: calc(100vw - 40px);
      max-height: calc(100vh - 40px);
      border-radius: 20px;
      z-index: 9999999;
      overflow: hidden;
      box-shadow: 0 12px 48px rgba(0, 0, 0, 0.8);
      display: flex;
      flex-direction: column;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      animation: tasyModalSlideIn 0.3s ease-out;
      opacity: 0;
    `;
    
    // Trigger animation after setting dimensions
    setTimeout(() => {
      modal.style.opacity = '1';
    }, 10);
  };
  
  tempImg.onerror = () => {
    // Fallback to default size if image fails to load
    console.log('[Tasy Pinterest] Image failed to load, using default size');
    modal.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      width: 480px;
      max-width: calc(100vw - 40px);
      max-height: calc(100vh - 40px);
      border-radius: 20px;
      z-index: 9999999;
      overflow: hidden;
      box-shadow: 0 12px 48px rgba(0, 0, 0, 0.8);
      display: flex;
      flex-direction: column;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      animation: tasyModalSlideIn 0.3s ease-out;
      opacity: 0;
      min-height: 400px;
    `;
    setTimeout(() => {
      modal.style.opacity = '1';
    }, 10);
  };
  
  // Set initial style (will be updated when image loads)
  modal.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    width: 480px;
    max-width: calc(100vw - 40px);
    max-height: calc(100vh - 40px);
    border-radius: 20px;
    z-index: 9999999;
    overflow: hidden;
    box-shadow: 0 12px 48px rgba(0, 0, 0, 0.8);
    display: flex;
    flex-direction: column;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    animation: tasyModalSlideIn 0.3s ease-out;
    opacity: 0;
    min-height: 400px;
  `;
  
  tempImg.src = imageUrl;
  
  // Add animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes tasyModalSlideIn {
      from {
        opacity: 0;
        transform: translateX(20px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
  `;
  if (!document.getElementById('tasy-modal-styles')) {
    style.id = 'tasy-modal-styles';
    document.head.appendChild(style);
  }
  
  // Trigger animation
  setTimeout(() => {
    modal.style.opacity = '1';
  }, 10);
  
  // Background image layer - full size, no compression
  const backgroundLayer = document.createElement('div');
  backgroundLayer.id = 'tasy-modal-background';
  // Use inline style for background-image to avoid escaping issues
  backgroundLayer.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    height: 100%;
    background-size: cover;
    background-position: center center;
    background-repeat: no-repeat;
    z-index: 0;
    min-width: 100%;
    min-height: 100%;
  `;
  backgroundLayer.style.backgroundImage = `url("${imageUrl.replace(/"/g, '\\"')}")`;
  
  // Content layer
  const contentLayer = document.createElement('div');
  contentLayer.id = 'tasy-modal-content-layer';
  contentLayer.style.cssText = `
    position: relative;
    z-index: 2;
    display: flex;
    flex-direction: column;
    height: 100%;
  `;
  
  // Close button - minimalistic, in corner
  const closeBtn = document.createElement('button');
  closeBtn.innerHTML = '×';
  closeBtn.style.cssText = `
    position: absolute;
    top: 12px;
    right: 12px;
    background: rgba(0, 0, 0, 0.5);
    border: none;
    color: rgba(255, 255, 255, 0.9);
    font-size: 20px;
    cursor: pointer;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: all 0.2s;
    padding: 0;
    line-height: 1;
    z-index: 10;
  `;
  
  closeBtn.addEventListener('mouseenter', () => {
    closeBtn.style.background = 'rgba(0, 0, 0, 0.7)';
    closeBtn.style.color = '#fff';
  });
  
  closeBtn.addEventListener('mouseleave', () => {
    closeBtn.style.background = 'rgba(0, 0, 0, 0.5)';
    closeBtn.style.color = 'rgba(255, 255, 255, 0.9)';
  });
  
  closeBtn.addEventListener('click', () => {
    closeAllModals();
  });
  
  // If not authenticated, show login UI instead of main content
  if (!isAuthenticated) {
    // Create login content matching the sign-in page design
    const loginContent = document.createElement('div');
    loginContent.id = 'tasy-modal-login-content';
    loginContent.style.cssText = `
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px 20px;
      text-align: center;
      background: #191919;
    `;
    
    // Tasy icon/logo
    const logoIcon = document.createElement('img');
    const iconUrl = chrome.runtime.getURL('icons/icon-128.png');
    console.log('[Tasy Pinterest] Loading logo icon from:', iconUrl);
    logoIcon.src = iconUrl;
    logoIcon.alt = 'Tasy';
    logoIcon.style.cssText = `
      width: 64px;
      height: 64px;
      margin-bottom: 32px;
      border-radius: 12px;
    `;
    logoIcon.onload = () => {
      console.log('[Tasy Pinterest] Logo icon loaded successfully');
    };
    logoIcon.onerror = (e) => {
      console.error('[Tasy Pinterest] Logo icon failed to load, using fallback. Error:', e);
      // Fallback to favicon
      logoIcon.src = 'https://app.tasy.ai/favicon.ico';
    };
    loginContent.appendChild(logoIcon);
    
    // Welcome title
    const title = document.createElement('h1');
    title.textContent = 'Welcome to Tasy';
    title.style.cssText = `
      font-size: 30px;
      font-weight: 700;
      color: #fff;
      margin: 0 0 48px 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.2;
    `;
    loginContent.appendChild(title);
    
    // Button container
    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `
      width: 100%;
      max-width: 320px;
    `;
    
    // Google Sign In button
    const googleBtn = document.createElement('button');
    googleBtn.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" style="margin-right: 8px;">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
      Continue with Google
    `;
    googleBtn.style.cssText = `
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 14px 24px;
      background: #fff;
      border: none;
      border-radius: 16px;
      color: #000;
      font-size: 16px;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.2s;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      width: 100%;
      margin-bottom: 16px;
    `;
    googleBtn.addEventListener('mouseenter', () => {
      googleBtn.style.background = '#f5f5f5';
    });
    googleBtn.addEventListener('mouseleave', () => {
      googleBtn.style.background = '#fff';
    });
    googleBtn.addEventListener('click', () => {
      window.open('https://app.tasy.ai/', '_blank');
      // Start checking for auth after opening sign-up page
      startAuthCheckLoop(modal, pinData, container);
    });
    buttonContainer.appendChild(googleBtn);
    
    // Divider
    const divider = document.createElement('div');
    divider.style.cssText = `
      position: relative;
      margin: 24px 0;
      height: 1px;
      background: #404040;
    `;
    const dividerText = document.createElement('span');
    dividerText.textContent = 'Or';
    dividerText.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      padding: 0 12px;
      background: #191919;
      color: #888;
      font-size: 14px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;
    divider.appendChild(dividerText);
    buttonContainer.appendChild(divider);
    
    // Email Sign In button
    const emailBtn = document.createElement('button');
    emailBtn.innerHTML = `
      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="margin-right: 8px;">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
      Continue with Email
    `;
    emailBtn.style.cssText = `
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 14px 24px;
      background: #fff;
      border: none;
      border-radius: 16px;
      color: #000;
      font-size: 16px;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.2s;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      width: 100%;
      margin-bottom: 16px;
    `;
    emailBtn.addEventListener('mouseenter', () => {
      emailBtn.style.background = '#f5f5f5';
    });
    emailBtn.addEventListener('mouseleave', () => {
      emailBtn.style.background = '#fff';
    });
    emailBtn.addEventListener('click', () => {
      window.open('https://app.tasy.ai/', '_blank');
      // Start checking for auth after opening sign-up page
      startAuthCheckLoop(modal, pinData, container);
    });
    buttonContainer.appendChild(emailBtn);
    
    loginContent.appendChild(buttonContainer);
    
    // Disclaimer
    const disclaimer = document.createElement('p');
    disclaimer.innerHTML = `
      By continuing, I acknowledge the <a href="https://app.tasy.ai/privacy-policy" target="_blank" style="color: #fff; text-decoration: underline;">Privacy Policy</a> and agree to the <a href="https://app.tasy.ai/terms-of-use" target="_blank" style="color: #fff; text-decoration: underline;">Terms of Use</a>. I also confirm that I am at least 18 years old.
    `;
    disclaimer.style.cssText = `
      margin-top: 48px;
      font-size: 12px;
      color: #999;
      line-height: 1.5;
      max-width: 320px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;
    loginContent.appendChild(disclaimer);
    
    contentLayer.appendChild(closeBtn);
    contentLayer.appendChild(loginContent);
    
    modal.appendChild(contentLayer);
    document.body.appendChild(modal);
    
    // Start checking for auth when modal is shown with login UI
    startAuthCheckLoop(modal, pinData, container);
    
    return; // Don't render the rest of the modal
  }
  
  // Main content area (only shown when authenticated)
  const mainContent = document.createElement('div');
  mainContent.id = 'tasy-modal-main-content';
  mainContent.style.cssText = `
    flex: 1;
    padding: 20px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 16px;
  `;
  
  // Replace button with dropdown (like detail pages)
  const replaceBtnWrapper = document.createElement('div');
  replaceBtnWrapper.style.cssText = `
    display: flex;
    align-items: center;
    gap: 0;
    margin-bottom: 0px;
    position: relative;
  `;
  
  const replaceBtn = document.createElement('button');
  replaceBtn.textContent = 'Replace';
  replaceBtn.style.cssText = `
    padding: 8px 16px;
    background: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border: none;
    border-radius: 12px;
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
    color: #fff;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s ease;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    display: flex;
    align-items: center;
    justify-content: center;
    white-space: nowrap;
    min-width: fit-content;
    height: 36px;
  `;
  
  const chevronBtn = document.createElement('button');
  chevronBtn.innerHTML = `
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
  `;
  chevronBtn.style.cssText = `
    padding: 8px 12px;
    height: 36px;
    width: 36px;
    min-width: 36px;
    background: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border: none;
    border-left: 1px solid rgba(255, 255, 255, 0.1);
    border-top-right-radius: 12px;
    border-bottom-right-radius: 12px;
    color: #fff;
    cursor: pointer;
    transition: background 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
  `;
  
  // Settings panel (initially hidden) - positioned right below replace button
  const settingsPanel = document.createElement('div');
  settingsPanel.className = 'tasy-modal-settings-panel';
  settingsPanel.style.cssText = `
    position: absolute;
    top: 100%;
    left: 0;
    display: none;
    flex-direction: column;
    gap: 12px;
    margin-top: 4px;
    padding: 16px;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    width: 280px;
    z-index: 1000;
  `;
  
  // Settings panel content
  settingsPanel.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 6px;">
      <label style="color: rgba(255, 255, 255, 0.8); font-size: 10px;">Logos</label>
      <div id="tasy-modal-logo-selector" style="display: flex; flex-direction: row; flex-wrap: wrap; gap: 8px;">
      </div>
    </div>
    
    <div style="margin-top: 12px; border-top: 1px solid rgba(255, 255, 255, 0.1); padding-top: 8px;">
      <div id="tasy-modal-custom-prompt-header" style="display: flex; align-items: center; justify-content: space-between; cursor: pointer; padding: 4px 0;">
        <label style="color: rgba(255, 255, 255, 0.8); font-size: 10px; margin: 0;">Custom Prompt</label>
        <svg id="tasy-modal-custom-prompt-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: rgba(255, 255, 255, 0.6); transition: transform 0.2s;">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>
      <div id="tasy-modal-custom-prompt-content" style="display: none; margin-top: 8px;">
        <textarea id="tasy-modal-custom-prompt" placeholder="Add custom instructions..." style="
          width: 100%;
          min-height: 60px;
          padding: 8px;
          background: rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 6px;
          color: #fff;
          font-size: 11px;
          font-family: inherit;
          resize: vertical;
        "></textarea>
      </div>
    </div>
  `;
  
  let settingsOpen = false;
  
  // Toggle settings panel
  chevronBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    
    settingsOpen = !settingsOpen;
    settingsPanel.style.display = settingsOpen ? 'flex' : 'none';
    
    // Rotate chevron
    const svg = chevronBtn.querySelector('svg');
    if (svg) {
      svg.style.transform = settingsOpen ? 'rotate(180deg)' : 'rotate(0deg)';
      svg.style.transition = 'transform 0.2s ease';
    }
    
    // When opening, populate logo selector
    if (settingsOpen) {
      setTimeout(() => {
        populateModalLogoSelector();
      }, 100);
    }
  });
  
  // Populate logo selector function
  const populateModalLogoSelector = async () => {
    const selector = settingsPanel.querySelector('#tasy-modal-logo-selector');
    if (!selector) return;
    
    try {
      const brandSettings = await getBrandSettings();
      const logos = brandSettings.logos || [];
      selector.innerHTML = '';
      
      logos.forEach((logoUrl, index) => {
        const logoBox = document.createElement('div');
        logoBox.id = `tasy-modal-logo-${index + 1}`;
        logoBox.dataset.logoIndex = index;
        logoBox.dataset.checked = 'false';
        logoBox.dataset.logoUrl = logoUrl;
        logoBox.style.cssText = `
        width: 48px;
        height: 48px;
        min-width: 48px;
          background: rgba(255, 255, 255, 0.1);
          border: 2px solid rgba(255, 255, 255, 0.2);
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        position: relative;
      `;
        
        const logoImg = document.createElement('img');
        logoImg.src = logoUrl;
        logoImg.style.cssText = 'width: 100%; height: 100%; object-fit: contain;';
        logoBox.appendChild(logoImg);
        
        const checkmark = document.createElement('div');
        checkmark.className = 'tasy-logo-checkmark';
        checkmark.style.cssText = `
          position: absolute;
          top: 2px;
          right: 2px;
          width: 16px;
          height: 16px;
          background: rgba(255, 0, 111, 0.95);
          border-radius: 50%;
          display: none;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          color: #fff;
          font-weight: bold;
        `;
        checkmark.innerHTML = '✓';
        logoBox.appendChild(checkmark);
        
        logoBox.addEventListener('click', () => {
          const isChecked = logoBox.dataset.checked === 'true';
          logoBox.dataset.checked = isChecked ? 'false' : 'true';
          if (isChecked) {
            logoBox.style.borderColor = 'rgba(255, 255, 255, 0.2)';
            logoBox.style.boxShadow = 'none';
            checkmark.style.display = 'none';
          } else {
            logoBox.style.borderColor = 'rgba(255, 0, 111, 0.8)';
            logoBox.style.boxShadow = '0 0 0 2px rgba(255, 0, 111, 0.3)';
            checkmark.style.display = 'flex';
          }
        });
        
        selector.appendChild(logoBox);
      });
    } catch (error) {
      console.error('[Tasy Pinterest] Error populating logo selector:', error);
    }
  };
  
  // Setup custom prompt collapse/expand
  const customPromptHeader = settingsPanel.querySelector('#tasy-modal-custom-prompt-header');
  const customPromptContent = settingsPanel.querySelector('#tasy-modal-custom-prompt-content');
  const customPromptChevron = settingsPanel.querySelector('#tasy-modal-custom-prompt-chevron');
  let customPromptExpanded = false;
  
  if (customPromptHeader && customPromptContent && customPromptChevron) {
    customPromptHeader.addEventListener('click', () => {
      customPromptExpanded = !customPromptExpanded;
      customPromptContent.style.display = customPromptExpanded ? 'block' : 'none';
      customPromptChevron.style.transform = customPromptExpanded ? 'rotate(180deg)' : 'rotate(0deg)';
    });
  }
  
  replaceBtn.addEventListener('mouseenter', () => {
    replaceBtn.style.background = 'rgba(40, 40, 40, 0.9)';
  });
  
  replaceBtn.addEventListener('mouseleave', () => {
    replaceBtn.style.background = 'rgba(0, 0, 0, 0.85)';
  });
  
  chevronBtn.addEventListener('mouseenter', () => {
    chevronBtn.style.background = 'rgba(40, 40, 40, 0.9)';
  });
  
  chevronBtn.addEventListener('mouseleave', () => {
    chevronBtn.style.background = 'rgba(0, 0, 0, 0.85)';
  });
  
  replaceBtnWrapper.appendChild(replaceBtn);
  replaceBtnWrapper.appendChild(chevronBtn);
  replaceBtnWrapper.appendChild(settingsPanel); // Append settings panel to wrapper for positioning
  
  // Analyze Text button - same styling as Replace button
  const analyzeBtn = document.createElement('button');
  analyzeBtn.textContent = 'Analyze Text';
  analyzeBtn.style.cssText = `
    padding: 8px 16px;
    background: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border: none;
    border-radius: 12px;
    color: #fff;
    font-size: 13px;
    font-weight: 600;
        cursor: pointer;
    transition: background 0.2s ease;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    display: inline-flex;
        align-items: center;
        justify-content: center;
    white-space: nowrap;
    height: 36px;
    width: auto;
    margin-top: -2px;
    align-self: flex-start;
  `;
  
  analyzeBtn.addEventListener('mouseenter', () => {
    analyzeBtn.style.background = 'rgba(40, 40, 40, 0.9)';
  });
  
  analyzeBtn.addEventListener('mouseleave', () => {
    analyzeBtn.style.background = 'rgba(0, 0, 0, 0.85)';
  });
  
  let isAnalyzing = false;
  let textEditPopup = null;
  let lastAnalyzedTexts = null; // Store analyzed texts for "Try Different" button
  
  // Analyze text function
  const analyzeText = async () => {
    if (isAnalyzing) return;
    
    isAnalyzing = true;
    analyzeBtn.textContent = 'Analyzing...';
    analyzeBtn.style.opacity = '0.6';
    analyzeBtn.style.cursor = 'not-allowed';
    
    try {
      // Extract pin image URL
      const img = container.querySelector('img');
      if (!img || !img.src) {
        throw new Error('No image found');
      }
      
      let imageUrl = img.src;
      if (img.srcset) {
        const srcset = img.srcset.split(',').map(s => s.trim());
        const largest = srcset.reduce((prev, current) => {
          const prevSize = parseInt(prev.split(' ')[1]) || 0;
          const currentSize = parseInt(current.split(' ')[1]) || 0;
          return currentSize > prevSize ? current : prev;
        }, srcset[0]);
        if (largest) {
          imageUrl = largest.split(' ')[0];
        }
      }
      if (img.dataset.src) {
        imageUrl = img.dataset.src;
      }
      
      // Call analyze text function
      const result = await chrome.runtime.sendMessage({
        action: 'analyzeText',
        imageUrl: imageUrl,
      });
      
      if (result.error || !result.success) {
        throw new Error(result.error || 'Failed to analyze text');
      }
      
      // Log the received texts for debugging
      console.log('[Tasy Pinterest] Received analyzed texts:', result.texts);
      if (result.texts && result.texts.length > 0) {
        result.texts.forEach((textItem, index) => {
          console.log(`[Tasy Pinterest] Text ${index + 1}:`, {
            label: textItem.label,
            text: textItem.text,
            textLength: textItem.text?.length || 0,
            fullText: JSON.stringify(textItem.text)
          });
        });
      }
      
      // Store analyzed texts for later use
      lastAnalyzedTexts = result.texts || [];
      
      // Show text editing popup
      showTextEditPopup(lastAnalyzedTexts);
    } catch (error) {
      console.error('[Tasy Pinterest] Analyze text error:', error);
      // Show error in button instead of alert
      const originalText = analyzeBtn.textContent;
      analyzeBtn.textContent = 'Error - Click to retry';
      analyzeBtn.style.color = '#ff6b6b';
      
      // Reset after 3 seconds
      setTimeout(() => {
        analyzeBtn.textContent = originalText;
        analyzeBtn.style.color = '#fff';
      }, 3000);
    } finally {
      isAnalyzing = false;
      if (analyzeBtn.textContent !== 'Error - Click to retry') {
        analyzeBtn.textContent = 'Analyze Text';
      }
      analyzeBtn.style.opacity = '1';
      analyzeBtn.style.cursor = 'pointer';
    }
  };
  
  analyzeBtn.addEventListener('click', analyzeText);
  
  // Show text editing popup below modal
  const showTextEditPopup = (texts) => {
    // Remove existing popup if any
    if (textEditPopup) {
      textEditPopup.remove();
    }
    
    // Get modal position
    const modalRect = modal.getBoundingClientRect();
    
    // Calculate estimated height needed for popup content
    // Header (18px + margins) + each text input (~70px per item) + apply button (60px) + padding
    const estimatedPopupHeight = 60 + (texts.length * 80) + 80 + 40;
    
    // Check if popup would fit below modal
    const spaceBelow = window.innerHeight - modalRect.bottom - 20;
    const spaceLeft = modalRect.left - 20;
    const minRequiredHeight = 200; // Minimum height to ensure Apply button is visible
    
    // Decide positioning: prefer below, but use left if not enough space below
    let positionToLeft = false;
    if (spaceBelow < minRequiredHeight || estimatedPopupHeight > spaceBelow) {
      // Not enough space below, check if we have space to the left
      if (spaceLeft >= modalRect.width) {
        positionToLeft = true;
      }
    }
    
    // Load image first to get dimensions for aspect ratio
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      const imageAspectRatio = img.width / img.height;
      const maxWidth = Math.min(modalRect.width, 600);
      const maxAvailableHeight = Math.min(window.innerHeight * 0.7, window.innerHeight - modalRect.bottom - 20);
      
      // Calculate dimensions maintaining aspect ratio
      let finalWidth = maxWidth;
      let finalHeight = maxWidth / imageAspectRatio;
      
      // If height exceeds max, scale down
      if (finalHeight > maxAvailableHeight) {
        finalHeight = maxAvailableHeight;
        finalWidth = maxAvailableHeight * imageAspectRatio;
      }
      
      // Create text edit popup with dynamic positioning
      textEditPopup = document.createElement('div');
      textEditPopup.id = 'tasy-text-edit-popup';
      
      // Position to the left or below based on available space
      if (positionToLeft) {
        textEditPopup.style.cssText = `
          position: fixed;
          top: ${modalRect.top}px;
          right: ${window.innerWidth - modalRect.left + 10}px;
          width: ${modalRect.width}px;
          max-width: ${modalRect.width}px;
          max-height: ${modalRect.height}px;
          background: rgba(0, 0, 0, 0.95);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-radius: 20px;
          z-index: 99999999;
          overflow: hidden;
          box-shadow: 0 12px 48px rgba(0, 0, 0, 0.8);
          display: flex;
          flex-direction: column;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          animation: tasyModalSlideIn 0.3s ease-out;
        `;
      } else {
        textEditPopup.style.cssText = `
          position: fixed;
          top: ${modalRect.bottom + 10}px;
          right: ${window.innerWidth - modalRect.right}px;
          width: ${modalRect.width}px;
          max-width: ${modalRect.width}px;
          max-height: calc(100vh - ${modalRect.bottom + 20}px);
          background: rgba(0, 0, 0, 0.95);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-radius: 20px;
          z-index: 99999999;
          overflow: hidden;
          box-shadow: 0 12px 48px rgba(0, 0, 0, 0.8);
          display: flex;
          flex-direction: column;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          animation: tasyModalSlideIn 0.3s ease-out;
        `;
      }
      
      // Continue with popup creation
      createPopupContent(texts, modalRect);
    };
    
    img.onerror = () => {
      // Fallback if image fails to load
      const modalRect = modal.getBoundingClientRect();
      textEditPopup = document.createElement('div');
      textEditPopup.id = 'tasy-text-edit-popup';
      
      // Use same positioning logic for fallback
      if (positionToLeft) {
        textEditPopup.style.cssText = `
          position: fixed;
          top: ${modalRect.top}px;
          right: ${window.innerWidth - modalRect.left + 10}px;
          width: ${modalRect.width}px;
          max-width: ${modalRect.width}px;
          max-height: ${modalRect.height}px;
          background: rgba(0, 0, 0, 0.95);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-radius: 20px;
          z-index: 99999999;
          overflow: hidden;
          box-shadow: 0 12px 48px rgba(0, 0, 0, 0.8);
          display: flex;
          flex-direction: column;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          animation: tasyModalSlideIn 0.3s ease-out;
        `;
      } else {
        textEditPopup.style.cssText = `
          position: fixed;
          top: ${modalRect.bottom + 10}px;
          right: ${window.innerWidth - modalRect.right}px;
          width: ${modalRect.width}px;
          max-width: ${modalRect.width}px;
          max-height: calc(100vh - ${modalRect.bottom + 20}px);
          background: rgba(0, 0, 0, 0.95);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-radius: 20px;
          z-index: 99999999;
          overflow: hidden;
          box-shadow: 0 12px 48px rgba(0, 0, 0, 0.8);
          display: flex;
          flex-direction: column;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          animation: tasyModalSlideIn 0.3s ease-out;
        `;
      }
      createPopupContent(texts, modalRect);
    };
    
    img.src = imageUrl;
    
    // Function to create popup content (called after image loads)
    function createPopupContent(texts, modalRect) {
      // Background image (same as main modal) - covers content area only
    const popupBackground = document.createElement('div');
    popupBackground.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      width: 100%;
      height: 100%;
      background-size: cover;
      background-position: center center;
      background-repeat: no-repeat;
      z-index: 0;
    `;
    popupBackground.style.backgroundImage = `url("${imageUrl.replace(/"/g, '\\"')}")`;
    
    // Dark overlay on top of image
    const popupOverlay = document.createElement('div');
    popupOverlay.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.75);
      z-index: 1;
    `;
    
    // Content layer - auto height based on content
    const popupContent = document.createElement('div');
    popupContent.style.cssText = `
      position: relative;
      z-index: 2;
      display: flex;
      flex-direction: column;
      padding: 20px;
      overflow-y: auto;
      min-height: fit-content;
    `;
    
    // Header
    const popupHeader = document.createElement('div');
    popupHeader.textContent = 'Edit Text';
    popupHeader.style.cssText = `
      color: #fff;
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 16px;
    `;
    
    // Text inputs container
    const textInputsContainer = document.createElement('div');
    textInputsContainer.id = 'tasy-popup-text-inputs';
    textInputsContainer.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: 12px;
      flex: 1;
      margin-bottom: 60px;
    `;
    
    // Populate text inputs
    if (!texts || texts.length === 0) {
      textInputsContainer.innerHTML = '<div style="color: rgba(255, 255, 255, 0.6); font-size: 13px; padding: 8px;">No text found in image</div>';
    } else {
    texts.forEach((textItem, index) => {
      const label = textItem.label || `Text ${index + 1}`;
      const text = textItem.text || '';
      
      const inputWrapper = document.createElement('div');
        inputWrapper.style.cssText = 'display: flex; flex-direction: column; gap: 6px;';
      
      const labelEl = document.createElement('label');
        labelEl.style.cssText = 'color: rgba(255, 255, 255, 0.8); font-size: 12px; font-weight: 500;';
      labelEl.textContent = label;
      
      const inputEl = document.createElement('input');
      inputEl.type = 'text';
        // Properly set the value - ensure full text is preserved
        inputEl.setAttribute('value', text);
        inputEl.value = text; // Also set via property for compatibility
      inputEl.dataset.label = label;
        // Store original text properly - encode to handle special characters
        inputEl.setAttribute('data-original-text', text);
      inputEl.dataset.originalText = text;
      inputEl.style.cssText = `
        width: 100%;
          padding: 10px;
          background: rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
        color: #fff;
          font-size: 13px;
        font-family: inherit;
          box-sizing: border-box;
        `;
        
        // Debug: log the text being set
        console.log(`[Tasy Pinterest] Setting text input ${index + 1}:`, {
          label: label,
          text: text,
          textLength: text.length,
          fullText: JSON.stringify(text)
        });
        
        inputEl.addEventListener('focus', () => {
          inputEl.style.borderColor = '#FF006F';
        });
        
        inputEl.addEventListener('blur', () => {
          inputEl.style.borderColor = 'rgba(255, 255, 255, 0.2)';
        });
      
      inputWrapper.appendChild(labelEl);
      inputWrapper.appendChild(inputEl);
      textInputsContainer.appendChild(inputWrapper);
    });
  }
  
    // Apply button - bottom right
    const applyBtnWrapper = document.createElement('div');
    applyBtnWrapper.style.cssText = `
      position: absolute;
      bottom: 20px;
      right: 20px;
      display: flex;
      gap: 0;
    `;
    
    const applyBtn = document.createElement('button');
    applyBtn.textContent = 'Apply';
    applyBtn.style.cssText = `
      padding: 8px 16px;
      background: rgba(0, 0, 0, 0.85);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      border: none;
      border-radius: 12px;
      color: #fff;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s ease;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      white-space: nowrap;
      min-width: fit-content;
      height: 36px;
    `;
    
    applyBtn.addEventListener('mouseenter', () => {
      applyBtn.style.background = 'rgba(40, 40, 40, 0.9)';
    });
    
    applyBtn.addEventListener('mouseleave', () => {
      applyBtn.style.background = 'rgba(0, 0, 0, 0.85)';
    });
    
    applyBtn.addEventListener('click', async () => {
      try {
        console.log('[Tasy Pinterest] Apply button clicked');
        
        // Disable button during processing
        applyBtn.textContent = 'Processing...';
        applyBtn.style.opacity = '0.6';
        applyBtn.style.cursor = 'not-allowed';
        applyBtn.disabled = true;
        
        // Collect text replacements
        const textReplacements = [];
        const textInputs = textInputsContainer.querySelectorAll('input[type="text"]');
    
    textInputs.forEach(input => {
          // Get original text from both dataset and attribute for reliability
          const originalText = input.getAttribute('data-original-text') || input.dataset.originalText || '';
      const newText = input.value.trim();
      const label = input.dataset.label || '';
      
          console.log(`[Tasy Pinterest] Collecting text replacement:`, {
            label: label,
            originalText: originalText,
            originalTextLength: originalText.length,
            newText: newText,
            newTextLength: newText.length,
            changed: newText !== originalText
          });
          
      if (newText !== originalText) {
            textReplacements.push({
          label: label,
          originalText: originalText,
              newText: newText,
        });
      }
    });
    
        console.log('[Tasy Pinterest] Text replacements:', textReplacements);
        
        // Collect logos from modal settings panel
        const selectedLogos = [];
        const modalLogoBoxes = settingsPanel.querySelectorAll('[id^="tasy-modal-logo-"]');
        modalLogoBoxes.forEach(logoBox => {
          if (logoBox.dataset.checked === 'true' && logoBox.dataset.logoUrl) {
            selectedLogos.push({ url: logoBox.dataset.logoUrl });
          }
        });
        
        // Get custom prompt from modal
        const customPrompt = settingsPanel.querySelector('#tasy-modal-custom-prompt')?.value.trim() || '';
        
        console.log('[Tasy Pinterest] Selected logos:', selectedLogos);
        console.log('[Tasy Pinterest] Custom prompt:', customPrompt);
        
        // Update pinData
        pinData.selectedLogos = selectedLogos;
        pinData.textReplacements = textReplacements;
        pinData.customPrompt = customPrompt;
        
        // Close text edit popup immediately
        if (textEditPopup) {
          textEditPopup.remove();
          textEditPopup = null;
        }
        
        // Show loader in main modal (not on pin)
        const modalLoaderOverlay = document.createElement('div');
        modalLoaderOverlay.id = 'tasy-modal-loader';
        modalLoaderOverlay.style.cssText = `
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          gap: 16px;
        `;
        
        // Spinner container (static, doesn't rotate)
        const modalLoaderContainer = document.createElement('div');
        modalLoaderContainer.style.cssText = `
          position: relative;
          width: 64px;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: center;
        `;
        
        const modalLoaderSpinner = document.createElement('div');
        modalLoaderSpinner.id = 'tasy-modal-loader-spinner';
        modalLoaderSpinner.style.cssText = `
          position: absolute;
          width: 64px;
          height: 64px;
          border: 4px solid rgba(255, 255, 255, 0.2);
          border-top-color: #FF006F;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        `;
        
        const modalLoaderText = document.createElement('div');
        modalLoaderText.id = 'tasy-modal-loader-text';
        modalLoaderText.textContent = '0%';
        modalLoaderText.style.cssText = `
          color: #fff;
          font-size: 14px;
          font-weight: 600;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          position: relative;
          z-index: 1;
        `;
        
        // Add spin animation if not already added
        if (!document.getElementById('tasy-loader-spin-style')) {
          const style = document.createElement('style');
          style.id = 'tasy-loader-spin-style';
          style.textContent = `
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `;
          document.head.appendChild(style);
        }
        
        modalLoaderContainer.appendChild(modalLoaderSpinner);
        modalLoaderContainer.appendChild(modalLoaderText);
        modalLoaderOverlay.appendChild(modalLoaderContainer);
        modal.appendChild(modalLoaderOverlay);
        
        // Start percentage loader: 0-100% over 25 seconds
        let progress = 0;
        const totalDuration = 25000; // 25 seconds
        const updateInterval = 100; // Update every 100ms
        const incrementPerUpdate = (100 / (totalDuration / updateInterval));
        
        const progressInterval = setInterval(() => {
          progress = Math.min(100, progress + incrementPerUpdate);
          const percentage = Math.floor(progress);
          
          // Update percentage only (inside circle)
          modalLoaderText.textContent = `${percentage}%`;
          
          if (progress >= 100) {
            clearInterval(progressInterval);
          }
        }, updateInterval);
        
        // Process the pin (loader is in modal, not on pin)
        console.log('[Tasy Pinterest] Calling handleCopyPin with:', pinData);
        const result = await handleCopyPin(pinData, container, modal); // Pass modal to skip pin loader
        console.log('[Tasy Pinterest] handleCopyPin completed:', result);
        
        // Remove loader
        if (modalLoaderOverlay) {
          modalLoaderOverlay.remove();
        }
        clearInterval(progressInterval);
        
        // Show result inside modal with adapted image as background
        if (result && result.success && result.adaptedAd) {
          showModalResult(modal, result.adaptedAd, result.creditsRemaining);
        } else {
          // Close modal on error
          if (modal) {
            closeAllModals();
          }
        }
      } catch (error) {
        console.error('[Tasy Pinterest] Apply button error:', error);
        
        // Remove loader on error
        const modalLoader = modal?.querySelector('#tasy-modal-loader');
        if (modalLoader) {
          modalLoader.remove();
        }
        
        // Re-enable button
        applyBtn.textContent = 'Apply';
        applyBtn.style.opacity = '1';
        applyBtn.style.cursor = 'pointer';
        applyBtn.disabled = false;
        
        // Show error in button
        applyBtn.textContent = 'Error - Click to retry';
        applyBtn.style.color = '#ff6b6b';
        
        setTimeout(() => {
          applyBtn.textContent = 'Apply';
          applyBtn.style.color = '#fff';
        }, 3000);
      }
    });
    
    applyBtnWrapper.appendChild(applyBtn);
    
    popupContent.appendChild(popupHeader);
    popupContent.appendChild(textInputsContainer);
    popupContent.appendChild(applyBtnWrapper);
    
      textEditPopup.appendChild(popupBackground);
      textEditPopup.appendChild(popupOverlay);
      textEditPopup.appendChild(popupContent);
      
      document.body.appendChild(textEditPopup);
      
      // Close popup when clicking outside
      const handleClickOutside = (e) => {
        if (textEditPopup && !textEditPopup.contains(e.target) && !modal.contains(e.target)) {
          textEditPopup.remove();
          textEditPopup = null;
          document.removeEventListener('click', handleClickOutside);
        }
      };
      setTimeout(() => {
        document.addEventListener('click', handleClickOutside);
      }, 100);
    }
  };
  
  // Function to show result inside modal with adapted image as background
  function showModalResult(modalElement, adaptedAd, creditsRemaining) {
    console.log('[Tasy Pinterest] Showing modal result:', { hasImage: !!adaptedAd?.image, credits: creditsRemaining, imageUrl: adaptedAd?.image?.substring(0, 100) });
    
    // Hide main content
    const mainContent = modalElement.querySelector('#tasy-modal-main-content');
    if (mainContent) {
      mainContent.style.display = 'none';
      console.log('[Tasy Pinterest] Main content hidden');
    }
    
    // Update background to show adapted image - CRITICAL FIX
    const backgroundLayer = modalElement.querySelector('#tasy-modal-background');
    console.log('[Tasy Pinterest] Background layer found:', !!backgroundLayer);
    if (backgroundLayer && adaptedAd?.image) {
      const newImageUrl = adaptedAd.image;
      console.log('[Tasy Pinterest] Setting new background image:', newImageUrl.substring(0, 100));
      backgroundLayer.style.backgroundImage = `url("${newImageUrl.replace(/"/g, '\\"')}")`;
      console.log('[Tasy Pinterest] Background updated, current value:', backgroundLayer.style.backgroundImage.substring(0, 100));
    }
    
    // Create result content layer (positioned EXACTLY like main content)
    const resultContent = document.createElement('div');
    resultContent.id = 'tasy-modal-result';
    resultContent.style.cssText = `
      flex: 1;
      padding: 20px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 16px;
    `;
    
    // Download button wrapper - same structure as replaceBtnWrapper
    const downloadBtnWrapper = document.createElement('div');
    downloadBtnWrapper.style.cssText = `
      display: flex;
      align-items: center;
      gap: 0;
      margin-bottom: 0px;
      position: relative;
    `;
    
    // Download button - exact same styling as Replace button
    const downloadBtn = document.createElement('button');
    downloadBtn.textContent = 'Download';
    downloadBtn.style.cssText = `
      padding: 8px 16px;
      background: rgba(0, 0, 0, 0.85);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      border: none;
      border-radius: 12px;
      color: #fff;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s ease;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      white-space: nowrap;
      min-width: fit-content;
      height: 36px;
    `;
    
    downloadBtn.addEventListener('mouseenter', () => {
      downloadBtn.style.background = 'rgba(40, 40, 40, 0.9)';
    });
    
    downloadBtn.addEventListener('mouseleave', () => {
      downloadBtn.style.background = 'rgba(0, 0, 0, 0.85)';
    });
    
    downloadBtn.addEventListener('click', async () => {
      console.log('[Tasy Pinterest] Download button clicked, image URL:', adaptedAd?.image);
      if (adaptedAd?.image) {
        try {
          // Fetch the image as a blob
          const response = await fetch(adaptedAd.image);
          const blob = await response.blob();
          
          // Create object URL from blob
          const blobUrl = URL.createObjectURL(blob);
          
          // Create and trigger download
          const link = document.createElement('a');
          link.href = blobUrl;
          link.download = `tasy-pin-${Date.now()}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          // Clean up object URL
          setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
          
          console.log('[Tasy Pinterest] Download initiated');
        } catch (error) {
          console.error('[Tasy Pinterest] Download error:', error);
          // Fallback to direct link
          const link = document.createElement('a');
          link.href = adaptedAd.image;
          link.download = `tasy-pin-${Date.now()}.png`;
          link.target = '_blank';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      }
    });
    
    // Go Again button - exact same styling as Analyze Text button
    const goAgainBtn = document.createElement('button');
    goAgainBtn.textContent = 'Go Again';
    goAgainBtn.style.cssText = `
      padding: 8px 16px;
      background: rgba(0, 0, 0, 0.85);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      border: none;
      border-radius: 12px;
      color: #fff;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s ease;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      white-space: nowrap;
      height: 36px;
      width: auto;
      margin-top: -2px;
      align-self: flex-start;
    `;
    
    goAgainBtn.addEventListener('mouseenter', () => {
      goAgainBtn.style.background = 'rgba(40, 40, 40, 0.9)';
    });
    
    goAgainBtn.addEventListener('mouseleave', () => {
      goAgainBtn.style.background = 'rgba(0, 0, 0, 0.85)';
    });
    
    goAgainBtn.addEventListener('click', () => {
      console.log('[Tasy Pinterest] Go Again clicked, resetting modal');
      // Remove result and show main content again
      resultContent.remove();
      if (mainContent) {
        mainContent.style.display = 'flex';
      }
      // Reset background to original image
      if (backgroundLayer) {
        backgroundLayer.style.backgroundImage = `url("${imageUrl.replace(/"/g, '\\"')}")`;
      }
    });
    
    // Try Different button - exact same styling as Analyze Text button
    const tryDifferentBtn = document.createElement('button');
    tryDifferentBtn.textContent = 'Try Different';
    tryDifferentBtn.style.cssText = `
      padding: 8px 16px;
      background: rgba(0, 0, 0, 0.85);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      border: none;
      border-radius: 12px;
      color: #fff;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s ease;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      white-space: nowrap;
      height: 36px;
      width: auto;
      margin-top: -2px;
      align-self: flex-start;
    `;
    
    tryDifferentBtn.addEventListener('mouseenter', () => {
      tryDifferentBtn.style.background = 'rgba(40, 40, 40, 0.9)';
    });
    
    tryDifferentBtn.addEventListener('mouseleave', () => {
      tryDifferentBtn.style.background = 'rgba(0, 0, 0, 0.85)';
    });
    
    tryDifferentBtn.addEventListener('click', () => {
      console.log('[Tasy Pinterest] Try Different clicked, resetting to edit mode');
      // Remove result and show main content again
      resultContent.remove();
      if (mainContent) {
        mainContent.style.display = 'flex';
      }
      // Reset background to original image
      if (backgroundLayer) {
        backgroundLayer.style.backgroundImage = `url("${imageUrl.replace(/"/g, '\\"')}")`;
      }
      
      // If text was previously analyzed, reopen the text edit popup
      if (lastAnalyzedTexts && lastAnalyzedTexts.length > 0) {
        console.log('[Tasy Pinterest] Reopening text edit popup with previous analysis');
        setTimeout(() => {
          showTextEditPopup(lastAnalyzedTexts);
        }, 300);
      }
    });
    
    // Add download button to wrapper (like Replace button)
    downloadBtnWrapper.appendChild(downloadBtn);
    
    // Append wrapper and buttons to result content (same structure as mainContent)
    resultContent.appendChild(downloadBtnWrapper);
    resultContent.appendChild(goAgainBtn);
    resultContent.appendChild(tryDifferentBtn);
    
    // Get content layer and append result
    const contentLayer = modalElement.querySelector('#tasy-modal-content-layer');
    if (contentLayer) {
      contentLayer.appendChild(resultContent);
      console.log('[Tasy Pinterest] Result content added to content layer');
    } else {
      modalElement.appendChild(resultContent);
      console.log('[Tasy Pinterest] Result content added directly to modal');
    }
  }
  
  // Settings section with logo selector and custom prompt
  const settingsContainer = document.createElement('div');
  settingsContainer.style.cssText = `
    display: flex;
    flex-direction: column;
    gap: 12px;
  `;
  
  // Get brand settings
  const getBrandSettings = async () => {
    return new Promise((resolve) => {
      chrome.storage.local.get(['logos', 'logo', 'secondaryLogo', 'thirdLogo', 'accentColor'], (result) => {
        let logos = [];
        if (result.logos && Array.isArray(result.logos) && result.logos.length > 0) {
          logos = result.logos.map(l => l?.data || l);
        } else {
          if (result.logo) logos.push(result.logo?.data || result.logo);
          if (result.secondaryLogo) logos.push(result.secondaryLogo?.data || result.secondaryLogo);
          if (result.thirdLogo) logos.push(result.thirdLogo?.data || result.thirdLogo);
        }
        resolve({
          logos: logos,
          accentColor: result.accentColor || '#FF006F',
        });
      });
    });
  };
  
  // Replace button click handler
  replaceBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    
    // Close settings if open
    if (settingsOpen) {
      settingsPanel.style.display = 'none';
      settingsOpen = false;
      const svg = chevronBtn.querySelector('svg');
      if (svg) svg.style.transform = 'rotate(0deg)';
    }
    
    // Collect logos from modal settings panel
    const selectedLogos = [];
    const modalLogoBoxes = settingsPanel.querySelectorAll('[id^="tasy-modal-logo-"]');
    modalLogoBoxes.forEach(logoBox => {
      if (logoBox.dataset.checked === 'true' && logoBox.dataset.logoUrl) {
        selectedLogos.push({ url: logoBox.dataset.logoUrl });
      }
    });
    
    // Text replacements should be empty when clicking Replace button directly
    const textReplacements = [];
    
    // Get custom prompt from modal
    const customPrompt = settingsPanel.querySelector('#tasy-modal-custom-prompt')?.value.trim() || '';
    
    // Update pinData with selections
    pinData.selectedLogos = selectedLogos;
    pinData.textReplacements = textReplacements;
    pinData.customPrompt = customPrompt;
    
    // Show loader in modal (not on pin)
    const modalLoaderOverlay = document.createElement('div');
    modalLoaderOverlay.id = 'tasy-modal-loader';
    modalLoaderOverlay.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.85);
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
      z-index: 100;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      gap: 16px;
    `;
    
    // Spinner container (static, doesn't rotate)
    const modalLoaderContainer = document.createElement('div');
    modalLoaderContainer.style.cssText = `
      position: relative;
      width: 64px;
      height: 64px;
      display: flex;
      align-items: center;
      justify-content: center;
    `;
    
    const modalLoaderSpinner = document.createElement('div');
    modalLoaderSpinner.style.cssText = `
      position: absolute;
      width: 64px;
      height: 64px;
      border: 4px solid rgba(255, 255, 255, 0.2);
      border-top-color: #FF006F;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    `;
    
    const modalLoaderText = document.createElement('div');
    modalLoaderText.id = 'tasy-modal-loader-text';
    modalLoaderText.textContent = '0%';
    modalLoaderText.style.cssText = `
      color: #fff;
      font-size: 14px;
      font-weight: 600;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      position: relative;
      z-index: 1;
    `;
    
    // Add spin animation if not already added
    if (!document.getElementById('tasy-loader-spin-style')) {
      const style = document.createElement('style');
      style.id = 'tasy-loader-spin-style';
      style.textContent = `
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(style);
    }
    
    modalLoaderContainer.appendChild(modalLoaderSpinner);
    modalLoaderContainer.appendChild(modalLoaderText);
    modalLoaderOverlay.appendChild(modalLoaderContainer);
    modal.appendChild(modalLoaderOverlay);
    
    // Start percentage loader: 0-100% over 25 seconds
    let progress = 0;
    const totalDuration = 25000;
    const updateInterval = 100;
    const incrementPerUpdate = (100 / (totalDuration / updateInterval));
    
    const progressInterval = setInterval(() => {
      progress = Math.min(100, progress + incrementPerUpdate);
      const percentage = Math.floor(progress);
      modalLoaderText.textContent = `${percentage}%`;
      
      if (progress >= 100) {
        clearInterval(progressInterval);
      }
    }, updateInterval);
    
    // Process the pin (loader is in modal, not on pin)
    console.log('[Tasy Pinterest] Calling handleCopyPin from Replace button:', pinData);
    const result = await handleCopyPin(pinData, container, modal);
    console.log('[Tasy Pinterest] handleCopyPin completed from Replace button:', result);
    
    // Remove loader
    if (modalLoaderOverlay) {
      modalLoaderOverlay.remove();
    }
    clearInterval(progressInterval);
    
    // Show result inside modal with adapted image as background
    if (result && result.success && result.adaptedAd) {
      showModalResult(modal, result.adaptedAd, result.creditsRemaining);
    } else {
      // Close modal on error
      if (modal) {
        closeAllModals();
      }
    }
  });
  
  mainContent.appendChild(replaceBtnWrapper);
  mainContent.appendChild(analyzeBtn);
  
  contentLayer.appendChild(mainContent);
  
  modal.appendChild(backgroundLayer);
  modal.appendChild(contentLayer);
  modal.appendChild(closeBtn);
  
  document.body.appendChild(modal);
  
  // Close on outside click
  modal.addEventListener('click', (e) => {
    if (e.target === modal || e.target === backgroundLayer) {
      closeAllModals();
    }
  });
  
  // Close on Escape key
  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      closeAllModals();
      document.removeEventListener('keydown', handleEscape);
    }
  };
  document.addEventListener('keydown', handleEscape);
}

// Handle pin copying
async function handleCopyPin(pinData, container, modalElement = null) {
  try {
    console.log('[Tasy Pinterest] Starting pin copy...');
    
    // Only show inline progress on pin if not called from modal
    let progressPanel = null;
    if (!modalElement) {
      progressPanel = showInlineProgress(container, 0, 'Authenticating...');
    }
    
    // Check authentication
    let authResult = await chrome.runtime.sendMessage({ action: 'checkAuth' });
    
    if (!authResult.success) {
      await new Promise(resolve => setTimeout(resolve, 500));
      authResult = await chrome.runtime.sendMessage({ action: 'checkAuth' });
    }
    
    if (!authResult.success) {
      if (progressPanel) progressPanel.remove();
      if (modalElement) {
        const modalLoader = modalElement.querySelector('#tasy-modal-loader');
        if (modalLoader) modalLoader.remove();
      }
      showInlineError(container, 'Please log in to Tasy first.', true);
      return;
    }
    
    console.log('[Tasy Pinterest] Authenticated! Credits:', authResult.credits);
    if (authResult.credits < 2) {
      if (progressPanel) progressPanel.remove();
      if (modalElement) {
        const modalLoader = modalElement.querySelector('#tasy-modal-loader');
        if (modalLoader) modalLoader.remove();
      }
      showInlineError(container, `Insufficient credits. You have ${authResult.credits} credits. Need 2 credits.`, false);
      return;
    }
    
    // Start percentage loader only if not in modal (modal has its own loader)
    let mainInterval = null;
    if (!modalElement && progressPanel) {
    const phases = [
      { name: 'Authenticating...', duration: 6000 },
      { name: 'Downloading image...', duration: 6000 },
      { name: 'Replacing logo...', duration: 12000 },
      { name: 'Saving pin...', duration: 3000 }
    ];
    
    const startPhase = (phaseIndex) => {
        if (phaseIndex >= phases.length) return null;
      
      const phase = phases[phaseIndex];
      const startTime = Date.now();
      
      const phaseInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(100, Math.floor((elapsed / phase.duration) * 100));
        updateInlineProgress(progressPanel, progress, phase.name);
        
        if (progress >= 100) {
          clearInterval(phaseInterval);
          startPhase(phaseIndex + 1);
        }
      }, 100);
      
      return phaseInterval;
    };
    
      mainInterval = startPhase(0);
    }
    
    // Get brand settings (logos)
    const brandSettings = await getBrandSettings();
    
    // Determine which logo(s) to use based on selection (including temporary uploads)
    const logosToUse = [];
    
    // ONLY use selected logos - DO NOT auto-select any logos
    if (pinData.selectedLogos && pinData.selectedLogos.length > 0) {
      pinData.selectedLogos.forEach(logo => {
        if (logo && logo.url) {
          logosToUse.push(logo.url);
        }
      });
    }
    
    // Validate: need either logos OR text replacements OR custom prompt
    const hasLogos = logosToUse.length > 0;
    const hasTextReplacements = pinData.textReplacements && pinData.textReplacements.length > 0;
    const hasCustomPrompt = pinData.customPrompt && pinData.customPrompt.trim() !== '';
    
    if (!hasLogos && !hasTextReplacements && !hasCustomPrompt) {
      if (mainInterval) clearInterval(mainInterval);
      progressPanel.remove();
      showInlineError(container, 'Please select at least one logo, edit text, or provide a custom prompt.', false);
      return;
    }
    
    console.log('[Tasy Pinterest] Processing with:', {
      logosCount: logosToUse.length,
      textReplacements: pinData.textReplacements?.length || 0,
      hasCustomPrompt: hasCustomPrompt,
      mode: hasLogos ? 'LOGO + TEXT' : 'TEXT ONLY'
    });
    
    // Log what we're sending
    console.log('[Tasy Pinterest] Text replacements collected:', pinData.textReplacements);
    console.log('[Tasy Pinterest] Selected logos:', pinData.selectedLogos);
    console.log('[Tasy Pinterest] Custom prompt:', pinData.customPrompt);
    
    // Build custom prompt with text replacements if any
    let finalCustomPrompt = pinData.customPrompt || '';
    
    // Note: Text replacements are now sent separately, not added to custom prompt
    // This allows the edge function to format them properly
    
    // Adapt pin using fal.ai
    // CRITICAL: Only send logos if they were actually selected
    const adaptResult = await chrome.runtime.sendMessage({
      action: 'adaptPin',
      pinData,
      brandInfo: {
        logos: hasLogos ? logosToUse : [], // Empty array if no logos selected
        logo: hasLogos ? logosToUse[0] : null, // null if no logos selected
        customPrompt: finalCustomPrompt,
        accentColor: brandSettings.accentColor,
        textReplacements: pinData.textReplacements || [],
      },
    });
    
    if (mainInterval) clearInterval(mainInterval);
    if (progressPanel) {
    updateInlineProgress(progressPanel, 100, 'Complete!');
    }
    
    if (!adaptResult.success) {
      if (progressPanel) progressPanel.remove();
      if (modalElement) {
        const modalLoader = modalElement.querySelector('#tasy-modal-loader');
        if (modalLoader) modalLoader.remove();
      }
      if (modalElement) {
        return { success: false, error: adaptResult.error || 'Failed to copy pin' };
      }
      showInlineError(container, adaptResult.error || 'Failed to copy pin', false);
      return;
    }
    
    // Save to database
    const saveResult = await chrome.runtime.sendMessage({
      action: 'saveAd',
      originalAd: {
        image: pinData.image,
        headline: pinData.title,
        text: '',
        cta: '',
      },
      adaptedAd: adaptResult.adaptedAd,
      sourceUrl: window.location.href,
    });
    
    if (!saveResult.success) {
      console.error('Failed to save pin:', saveResult.error);
    }
    
    // Image is now saved to mockups table via save-ad API
    
    // Return result if called from modal, otherwise show inline
    if (modalElement) {
      if (progressPanel) progressPanel.remove();
      return {
        success: true,
        adaptedAd: adaptResult.adaptedAd,
        creditsRemaining: adaptResult.creditsRemaining,
      };
    }
    
    // Show replicated pin inline (only when not called from modal)
    setTimeout(() => {
      if (progressPanel) progressPanel.remove();
      console.log('[Tasy Pinterest] Showing result with image:', adaptResult.adaptedAd?.image?.substring(0, 100) || 'NO IMAGE');
      showInlineResult(container, pinData, adaptResult.adaptedAd, adaptResult.creditsRemaining);
    }, 500);
  } catch (error) {
    console.error('Error copying pin:', error);
    showInlineError(container, error.message || 'An error occurred', false);
  }
}

// Show inline progress panel
function showInlineProgress(container, percentage, phase) {
  const existing = container.querySelector('.tasy-progress-panel');
  if (existing) existing.remove();
  
  const panel = document.createElement('div');
  panel.className = 'tasy-progress-panel';
  panel.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.75);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border-radius: 12px;
    z-index: 999999;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 12px;
    box-sizing: border-box;
    pointer-events: auto;
  `;
  
  // Stop all clicks from propagating to the pin
  panel.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
  });
  
  panel.innerHTML = `
    <div style="text-align: center; max-width: 280px; width: 100%; padding: 0 8px;">
      <div style="margin-bottom: 12px;">
        <div style="
          width: 32px;
          height: 32px;
          border: 3px solid rgba(42, 44, 45, 0.3);
          border-top-color: #FF006F;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto;
        "></div>
      </div>
      <div style="margin-bottom: 12px;">
        <div style="
          width: 100%;
          height: 4px;
          background: rgba(29, 31, 32, 0.5);
          border-radius: 2px;
          overflow: hidden;
        ">
          <div id="tasy-progress-bar" style="
            width: ${percentage}%;
            height: 100%;
            background: linear-gradient(90deg, #FF006F, #CC0059);
            transition: width 0.3s ease;
            border-radius: 2px;
          "></div>
        </div>
      </div>
      <div style="color: #fff; font-size: 11px; font-weight: 600; margin-bottom: 4px;">${escapeHtml(phase)}</div>
      <div id="tasy-progress-details" style="color: #888; font-size: 10px; margin-bottom: 2px;">Processing...</div>
      <div id="tasy-progress-percent" style="color: #FF006F; font-size: 11px; font-weight: 500; margin-top: 6px;">${percentage}%</div>
    </div>
    <style>
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    </style>
  `;
  
  container.appendChild(panel);
  return panel;
}

// Update inline progress
function updateInlineProgress(panel, percentage, phase) {
  const bar = panel.querySelector('#tasy-progress-bar');
  const percentText = panel.querySelector('#tasy-progress-percent');
  const phaseText = panel.querySelector('div[style*="font-weight: 600"]');
  const detailsText = panel.querySelector('#tasy-progress-details');
  
  if (bar) bar.style.width = `${percentage}%`;
  if (percentText) percentText.textContent = `${percentage}%`;
  if (phaseText) phaseText.textContent = phase;
  
  if (detailsText) {
    let details = 'Processing your pin...';
    if (phase.includes('Authenticating')) {
      details = 'Verifying your account and credits...';
    } else if (phase.includes('Downloading')) {
      details = 'Fetching the original pin image...';
    } else if (phase.includes('Replacing')) {
      details = 'AI is replacing the logo with your brand logo...';
    } else if (phase.includes('Saving')) {
      details = 'Finalizing and saving your adapted pin...';
    } else if (phase.includes('Complete')) {
      details = 'Your adapted pin is ready!';
    }
    detailsText.textContent = details;
  }
}

// Show inline error
function showInlineError(container, message, isAuthError) {
  const existing = container.querySelector('.tasy-error-panel');
  if (existing) existing.remove();
  
  const panel = document.createElement('div');
  panel.className = 'tasy-error-panel';
  panel.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.92);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-radius: 12px;
    z-index: 999999;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 12px;
    box-sizing: border-box;
    pointer-events: auto;
  `;
  
  // Stop all clicks from propagating to the pin
  panel.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
  });
  
  const contentDiv = document.createElement('div');
  contentDiv.style.cssText = `
    text-align: center;
    max-width: 280px;
    width: 100%;
    position: relative;
    z-index: 1000000;
    pointer-events: auto;
  `;
  
  contentDiv.innerHTML = `
    <div style="color: #ff4444; font-size: 24px; margin-bottom: 8px;">❌</div>
    <div style="color: #fff; font-size: 11px; font-weight: 600; margin-bottom: 6px;">Error</div>
    <div style="color: #888; font-size: 10px; margin-bottom: ${isAuthError ? '10px' : '0'};">
      ${escapeHtml(message)}
    </div>
  `;
  
  // Add login link with proper event handling
  if (isAuthError) {
    const loginLink = document.createElement('a');
    loginLink.href = 'https://app.tasy.ai/sign-in';
    loginLink.target = '_blank';
    loginLink.textContent = 'Log in →';
    loginLink.style.cssText = `
      display: inline-block;
      margin-top: 10px;
      padding: 6px 12px;
      background: #fff;
      color: #000;
      text-decoration: none;
      border-radius: 4px;
      font-weight: 600;
      font-size: 10px;
      cursor: pointer;
      position: relative;
      z-index: 1000001;
      pointer-events: auto;
    `;
    
    // Ensure click works properly
    loginLink.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      window.open('https://app.tasy.ai/sign-in', '_blank');
    });
    
    contentDiv.appendChild(loginLink);
  }
  
  // Add close button with proper event handling
  const closeBtn = document.createElement('button');
  closeBtn.textContent = 'Close';
  closeBtn.style.cssText = `
    margin-top: 10px;
    padding: 6px 12px;
    background: rgba(29, 31, 32, 0.8);
    color: #ccc;
    border: 1px solid rgba(42, 44, 45, 0.5);
    border-radius: 4px;
    font-size: 10px;
    cursor: pointer;
    width: 100%;
    position: relative;
    z-index: 1000001;
    pointer-events: auto;
  `;
  
  closeBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    panel.remove();
  });
  
  contentDiv.appendChild(closeBtn);
  panel.appendChild(contentDiv);
  container.appendChild(panel);
}

// Show inline result
function showInlineResult(container, originalPin, adaptedPin, creditsRemaining) {
  const existing = container.querySelector('.tasy-result-panel');
  if (existing) existing.remove();
  
  const panel = document.createElement('div');
  panel.className = 'tasy-result-panel';
  panel.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgb(0, 0, 0);
    border-radius: 12px;
    z-index: 999999;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px;
    box-sizing: border-box;
    overflow: hidden;
    pointer-events: auto;
  `;
  
  // Stop all clicks from propagating to the pin
  panel.addEventListener('click', (e) => {
    // Only stop if clicking on the panel background, not on interactive elements
    if (e.target === panel) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
    }
  });
  
  panel.innerHTML = `
    <div style="width: 100%; height: 100%; text-align: center; position: relative; z-index: 100001; display: flex; flex-direction: column; justify-content: center; padding: 8px;">
      <div style="color: #fff; font-size: 11px; font-weight: 600; margin-bottom: 8px;">✨ Copied!</div>
      
      ${adaptedPin.image ? `
        <div style="flex: 1; margin-bottom: 8px; position: relative; min-height: 0; display: flex; align-items: center; justify-content: center;">
          <img 
            src="${adaptedPin.image}" 
            id="tasy-result-image"
            style="max-width: 100%; max-height: 100%; width: auto; height: auto; object-fit: contain; border-radius: 6px; border: 1px solid rgba(42, 44, 45, 0.5); display: block; cursor: pointer;" 
            alt="Adapted pin"
          />
          <div style="position: absolute; top: 4px; right: 4px; display: flex; gap: 4px;">
            <button
              id="tasy-expand-btn"
              style="
                padding: 4px;
                background: rgba(0, 0, 0, 0.8);
                backdrop-filter: blur(8px);
                border: 1px solid rgba(255, 255, 255, 0.3);
                border-radius: 4px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: border-color 0.2s ease;
              "
              title="Expand"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"></path>
              </svg>
            </button>
            <button
              id="tasy-download-btn"
              style="
                padding: 4px;
                background: rgba(0, 0, 0, 0.8);
                backdrop-filter: blur(8px);
                border: 1px solid rgba(255, 255, 255, 0.3);
                border-radius: 4px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: border-color 0.2s ease;
              "
              title="Download"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
            </button>
          </div>
        </div>
      ` : ''}
      
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 0; border-top: 1px solid rgba(42, 44, 45, 0.5); margin-bottom: 6px; position: relative; z-index: 100002;">
        <div style="font-size: 9px; color: #888;">
          Credits: <strong style="color: #fff;">${creditsRemaining}</strong>
        </div>
        <a 
          id="tasy-view-dashboard-link"
          href="https://app.tasy.ai/content" 
          target="_blank" 
          style="
            color: #FF006F; 
            text-decoration: none; 
            font-size: 9px; 
            font-weight: 500;
            position: relative;
            z-index: 100003;
            pointer-events: auto !important;
            cursor: pointer !important;
            padding: 2px 6px;
            border-radius: 3px;
            transition: background-color 0.2s;
            display: inline-block;
          "
        >
          Dashboard →
        </a>
      </div>
      
      <button 
        id="tasy-close-result-btn"
        style="
          padding: 6px 12px;
          background: rgba(29, 31, 32, 0.8);
          color: #ccc;
          border: 1px solid rgba(42, 44, 45, 0.5);
          border-radius: 4px;
          font-size: 10px;
          cursor: pointer;
          width: 100%;
          font-weight: 500;
          position: relative;
          z-index: 100000;
        "
      >
        Close
      </button>
    </div>
  `;
  
  // Handle expand button
  const expandBtn = panel.querySelector('#tasy-expand-btn');
  if (expandBtn) {
    expandBtn.addEventListener('click', () => {
      const img = panel.querySelector('#tasy-result-image');
      if (img) {
        window.open(img.src, '_blank');
      }
    });
  }
  
  // Handle download button
  const downloadBtn = panel.querySelector('#tasy-download-btn');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      
      const img = panel.querySelector('#tasy-result-image');
      if (!img || !img.src) {
        console.error('[Tasy Pinterest] No image to download');
        return;
      }
      
      try {
        // Show loading state
        const originalContent = downloadBtn.innerHTML;
        downloadBtn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>';
        downloadBtn.style.opacity = '0.5';
        downloadBtn.disabled = true;
        
        // Fetch the image as a blob to handle CORS
        console.log('[Tasy Pinterest] Downloading image:', img.src.substring(0, 100));
        const response = await fetch(img.src);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.statusText}`);
        }
        
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        
        // Create download link
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = `tasy-pin-${Date.now()}.png`;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        
        // Clean up
        setTimeout(() => {
          document.body.removeChild(link);
          URL.revokeObjectURL(blobUrl);
        }, 100);
        
        console.log('[Tasy Pinterest] Image downloaded successfully');
        
        // Restore button state
        downloadBtn.innerHTML = originalContent;
        downloadBtn.style.opacity = '1';
        downloadBtn.disabled = false;
      } catch (error) {
        console.error('[Tasy Pinterest] Download error:', error);
        
        // Restore button state
        downloadBtn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>';
        downloadBtn.style.opacity = '1';
        downloadBtn.disabled = false;
        
        // Show error to user
        alert('Failed to download image. Please try right-clicking the image and selecting "Save image as..."');
      }
    });
  }
  
  // Handle close button
  const closeBtn = panel.querySelector('#tasy-close-result-btn');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      panel.remove();
    });
  }
  
  container.appendChild(panel);
}

// Initialize
console.log('[Tasy Pinterest] Content script loaded');

// Track current URL to detect navigation
let currentUrl = window.location.href;

// Listen for auth state changes from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'authStateChanged') {
    console.log('[Tasy Pinterest] Auth state changed, checking for open modal...');
    
    // Check if modal is open and showing login UI
    const modal = document.getElementById('tasy-replace-modal');
    if (modal) {
      const loginContent = modal.querySelector('#tasy-modal-login-content');
      if (loginContent) {
        console.log('[Tasy Pinterest] Login modal is open, refreshing for auth...');
        // Get stored data
        const pinData = modal.dataset.pinData ? JSON.parse(modal.dataset.pinData) : null;
        const container = modal.dataset.containerId ? document.querySelector(`[data-tasy-container-id="${modal.dataset.containerId}"]`) : null;
        
        if (pinData && container) {
          // Immediately check and refresh
          checkAndRefreshAuth(modal, pinData, container);
        }
      }
    }
    
    sendResponse({ success: true });
  }
  return true;
});

// Refresh auth when tab becomes visible (user switches back)
document.addEventListener('visibilitychange', async () => {
  if (!document.hidden) {
    console.log('[Tasy Pinterest] Tab became visible, refreshing auth...');
    // Trigger a background refresh by checking auth
    try {
      await chrome.runtime.sendMessage({ action: 'checkAuth' });
      
      // Check if modal is open and showing login UI, refresh if needed
      const modal = document.getElementById('tasy-replace-modal');
      if (modal) {
        const loginContent = modal.querySelector('#tasy-modal-login-content');
        if (loginContent) {
          // Modal is showing login UI, check if we should refresh
          const pinData = modal.dataset.pinData ? JSON.parse(modal.dataset.pinData) : null;
          const container = modal.dataset.containerId ? document.querySelector(`[data-tasy-container-id="${modal.dataset.containerId}"]`) : null;
          if (pinData && container) {
            checkAndRefreshAuth(modal, pinData, container);
          }
        }
      }
    } catch (e) {
      console.log('[Tasy Pinterest] Auth refresh on visibility change:', e.message);
    }
  }
});

// Also refresh on window focus
window.addEventListener('focus', async () => {
  console.log('[Tasy Pinterest] Window focused, refreshing auth...');
  try {
    await chrome.runtime.sendMessage({ action: 'checkAuth' });
    
    // Check if modal is open and showing login UI, refresh if needed
    const modal = document.getElementById('tasy-replace-modal');
    if (modal) {
      const loginContent = modal.querySelector('#tasy-modal-login-content');
      if (loginContent) {
        // Modal is showing login UI, check if we should refresh
        const pinData = modal.dataset.pinData ? JSON.parse(modal.dataset.pinData) : null;
        const container = modal.dataset.containerId ? document.querySelector(`[data-tasy-container-id="${modal.dataset.containerId}"]`) : null;
        if (pinData && container) {
          checkAndRefreshAuth(modal, pinData, container);
        }
      }
    }
  } catch (e) {
    console.log('[Tasy Pinterest] Auth refresh on focus:', e.message);
  }
});

// Initial injection
injectCopyButtons();

// Watch for URL changes (Pinterest uses client-side routing)
const urlObserver = new MutationObserver(() => {
  if (window.location.href !== currentUrl) {
    currentUrl = window.location.href;
    console.log('[Tasy Pinterest] URL changed, re-injecting buttons');
    // Clear processed markers on navigation
    document.querySelectorAll(`[${PROCESSED_ATTR}]`).forEach(el => {
      el.removeAttribute(PROCESSED_ATTR);
    });
    setTimeout(() => injectCopyButtons(), 500);
  }
});

// Watch for URL changes in the address bar
urlObserver.observe(document.body, {
  childList: true,
  subtree: true,
});

// Also listen to popstate for back/forward navigation
window.addEventListener('popstate', () => {
  setTimeout(() => {
    document.querySelectorAll(`[${PROCESSED_ATTR}]`).forEach(el => {
      el.removeAttribute(PROCESSED_ATTR);
    });
    injectCopyButtons();
  }, 500);
});

// Watch for new pins (infinite scroll)
const observer = new MutationObserver((mutations) => {
  let shouldInject = false;
  
  for (const mutation of mutations) {
    for (const node of mutation.addedNodes) {
      if (node.nodeType === 1) {
        // Check if new pins were added or if detail page content changed
        if (node.querySelector && (
          node.querySelector('a[href*="/pin/"]') ||
          node.querySelector('[data-test-id="visual-content-container"]') ||
          node.querySelector('[data-test-id="pin"]')
        )) {
          shouldInject = true;
          break;
        }
      }
    }
    if (shouldInject) break;
  }
  
  if (shouldInject) {
    // Debounce injection
    clearTimeout(window.tasyPinterestInjectTimeout);
    window.tasyPinterestInjectTimeout = setTimeout(() => {
      injectCopyButtons();
    }, 500);
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});

