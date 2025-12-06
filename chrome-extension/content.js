// Content script injected into Facebook Ads Library pages

const BUTTON_CLASS = 'tasy-replicate-btn';
const MODAL_ID = 'tasy-replicate-modal';

// Inject plus icons on ad hover
function injectReplicateButtons() {
  console.log('[Tasy] Scanning for ads...');
  
  // Strategy: Find large images that look like ad creatives, then work up to find parent container
  const allImages = document.querySelectorAll('img');
  console.log('[Tasy] Found', allImages.length, 'images on page');
  
  const processedContainers = new Set();
  
  allImages.forEach(img => {
    // Skip small images (profile pics, icons)
    // Check both rendered size and natural size (for images that may be scaled)
    const rect = img.getBoundingClientRect();
    const width = rect.width || img.naturalWidth || img.width || 0;
    const height = rect.height || img.naturalHeight || img.height || 0;
    
    if (width < 200 || height < 150) return;
    
    // Skip if already has our button nearby
    if (img.closest('.tasy-ad-container')) return;
    
    console.log('[Tasy] Found large image:', rect.width, 'x', rect.height, img.src.substring(0, 50));
    
    // Find a suitable parent container - go up until we find something with text content
    let container = img.parentElement;
    let attempts = 0;
    while (container && attempts < 10) {
      // Look for a container that has both the image and some text
      const hasText = container.textContent && container.textContent.trim().length > 30;
      const containerRect = container.getBoundingClientRect();
      
      // Good container: has text, reasonable size, not the body
      if (hasText && containerRect.height > 300 && container.tagName !== 'BODY') {
        break;
      }
      container = container.parentElement;
      attempts++;
    }
    
    if (!container || container.tagName === 'BODY') {
      console.log('[Tasy] Could not find suitable container for image');
      return;
    }
    
    // Skip if we already processed this container
    if (processedContainers.has(container)) return;
    processedContainers.add(container);
    
    // Skip if button already exists
    if (container.querySelector(`.${BUTTON_CLASS}`)) return;
    
    console.log('[Tasy] Found ad container:', container.tagName, container.className);
    
    // Mark container
    container.classList.add('tasy-ad-container');
    
    // Ensure container has relative positioning for absolute positioned panels
    const containerStyles = window.getComputedStyle(container);
    if (containerStyles.position === 'static') {
      container.style.position = 'relative';
    }
    
    // Extract ad data
    const adData = extractAdData(container);
    
    // Skip if our button already exists
    if (container.querySelector('.tasy-copy-ad-btn')) {
      return;
    }
    
    // Find the "Shop Now" button or similar CTA button
    const findShopNowButton = () => {
      // Helper function to check if element is likely a CTA button (not a container)
      const isLikelyButton = (btn) => {
        const text = btn.textContent?.trim() || '';
        const textLength = text.length;
        
        // Skip if text is too long (likely a container, not a button)
        if (textLength > 50) return false;
        
        // Check if it's actually a button element or has button role
        const isButtonElement = btn.tagName === 'BUTTON' || 
                                btn.getAttribute('role') === 'button' ||
                                btn.tagName === 'A';
        
        if (!isButtonElement) return false;
        
        // Check for button-like text patterns (Shop Now variants)
        const lowerText = text.toLowerCase();
        const buttonPatterns = [
          'shop now', 'jetzt shoppen', 'jetzt', 'kaufen', 'bestellen', 'shop', 
          'mehr erfahren', 'learn more', 'cta', 'call to action',
          'mehr anzeigen', 'show more', 'anzeigen', 'view'
        ];
        
        return buttonPatterns.some(pattern => lowerText.includes(pattern));
      };
      
      // First, look specifically in footer/CTA areas (where buttons typically are)
      const footerAreas = container.querySelectorAll('[class*="footer"], [class*="action"], [class*="cta"], [class*="link"], [class*="preview"]');
      for (const area of footerAreas) {
        const buttons = area.querySelectorAll('button, a[role="button"], [role="button"], a');
        const shopNowButton = Array.from(buttons).find(isLikelyButton);
        if (shopNowButton) {
          const buttonText = shopNowButton.textContent?.trim() || '';
          if (buttonText.length <= 50) {
            return shopNowButton;
          }
        }
      }
      
      // If not found in footer, search all buttons but prioritize shorter text
      const allButtons = container.querySelectorAll('button, a[role="button"], [role="button"], a');
      const sortedButtons = Array.from(allButtons)
        .filter(isLikelyButton)
        .sort((a, b) => {
          const aLen = (a.textContent?.trim() || '').length;
          const bLen = (b.textContent?.trim() || '').length;
          return aLen - bLen;
        });
      
      return sortedButtons[0] || null;
    };
    
    const shopNowButton = findShopNowButton();
    
    if (!shopNowButton) {
      console.log('[Tasy] No Shop Now button found in this ad');
      return;
    }
    
    // Check if already replaced
    if (shopNowButton.dataset._tasyReplaced === '1') {
      return;
    }
    
    shopNowButton.dataset._tasyReplaced = '1';
    
    // Get the original button's styles to match them
    const originalStyles = window.getComputedStyle(shopNowButton);
    const originalParent = shopNowButton.parentElement;
    
    // Hide the original button
    shopNowButton.style.display = 'none';
    
    // Create Copy Ad button to replace Shop Now button
    const copyButton = document.createElement('button');
    copyButton.className = 'tasy-copy-ad-btn';
    copyButton.type = 'button';
    copyButton.setAttribute('data-tasy-button', 'true');
    copyButton.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px;">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
      </svg>
      <span>Copy Ad</span>
    `;
    
    // Match the original button's styles
    copyButton.style.cssText = `
      padding: ${originalStyles.padding || '8px 12px'};
      background: ${originalStyles.background || '#1877f2'};
      color: ${originalStyles.color || '#fff'};
      border: ${originalStyles.border || 'none'};
      border-radius: ${originalStyles.borderRadius || '6px'};
      cursor: pointer !important;
      font-size: ${originalStyles.fontSize || '13px'};
      font-weight: ${originalStyles.fontWeight || '600'};
      font-family: ${originalStyles.fontFamily || 'inherit'};
      display: inline-flex !important;
      align-items: center;
      justify-content: center;
      gap: 6px;
      user-select: none;
      -webkit-user-select: none;
      pointer-events: auto !important;
      opacity: 1 !important;
      visibility: visible !important;
      z-index: 999999 !important;
    `;

    // Simple click handler
    const handleButtonClick = (e) => {
      try {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        console.log('[Tasy] Copy Ad button clicked');
        showReplicatePanel(adData, container);
      } catch (error) {
        console.error('[Tasy] Error in Copy Ad button click:', error);
      }
      return false;
    };

    copyButton.addEventListener('click', handleButtonClick, { capture: true, passive: false });
    copyButton.onclick = handleButtonClick;

    // Insert the new button in the same position as the original
    if (originalParent) {
      originalParent.insertBefore(copyButton, shopNowButton);
      console.log('[Tasy] Successfully replaced Shop Now button with Copy Ad button');
    } else {
      console.error('[Tasy] Could not find parent element for Shop Now button');
    }
  });
  
  console.log('[Tasy] Finished scanning, processed', processedContainers.size, 'ads');
}

// Extract ad data from container
function extractAdData(container) {
  const headline = container.querySelector('[data-testid*="headline"], h2, h3, .x1heor9g')?.textContent?.trim() || '';
  const text = container.querySelector('[data-testid*="text"], .x193iq5w, p')?.textContent?.trim() || '';
  const cta = container.querySelector('[data-testid*="cta"], button, [role="button"]')?.textContent?.trim() || '';
  const description = container.querySelector('[data-testid*="description"], .x1i10hfl')?.textContent?.trim() || '';
  
  // Find the ad creative image (largest image, excluding profile pictures)
  let image = '';
  const allImages = Array.from(container.querySelectorAll('img'));
  let largestImage = null;
  let largestSize = 0;
  
  // First, try to find images in ad creative areas (usually larger)
  const adCreativeAreas = container.querySelectorAll('[data-testid*="ad"], [class*="creative"], [class*="media"], video, [role="img"]');
  const creativeImages = [];
  
  adCreativeAreas.forEach(area => {
    const imgs = area.querySelectorAll('img');
    imgs.forEach(img => creativeImages.push(img));
  });
  
  // Check creative images first
  creativeImages.forEach(img => {
    const src = img.src || '';
    if (!src || src.includes('profile') || src.includes('avatar')) return;
    
    const width = img.naturalWidth || img.width || 0;
    const height = img.naturalHeight || img.height || 0;
    const size = width * height;
    
    // Ad creatives are usually larger than 200x200
    if (size > 40000 && size > largestSize) {
      largestSize = size;
      largestImage = img;
    }
  });
  
  // If no creative image found, check all images but exclude small ones
  if (!largestImage || largestSize < 40000) {
    allImages.forEach(img => {
      const src = img.src || '';
      if (!src) return;
      
      // Skip profile pictures
      if (src.includes('profile') || src.includes('avatar') || src.includes('scontent')) {
        // Check if it's actually a small profile pic
        const width = img.naturalWidth || img.width || 0;
        const height = img.naturalHeight || img.height || 0;
        if (width < 200 && height < 200) return;
      }
      
      const width = img.naturalWidth || img.width || 0;
      const height = img.naturalHeight || img.height || 0;
      const size = width * height;
      
      // Prefer larger images (ad creatives are usually > 300x300)
      if (size > largestSize && size > 90000) {
        largestSize = size;
        largestImage = img;
      }
    });
  }
  
  image = largestImage?.src || '';
  
  // Calculate aspect ratio from the image
  let aspectRatio = null;
  let imageWidth = 0;
  let imageHeight = 0;
  
  if (largestImage) {
    imageWidth = largestImage.naturalWidth || largestImage.width || 0;
    imageHeight = largestImage.naturalHeight || largestImage.height || 0;
    
    if (imageWidth > 0 && imageHeight > 0) {
      const ratio = imageWidth / imageHeight;
      
      // Map to common aspect ratios
      if (Math.abs(ratio - 16/9) < 0.15) aspectRatio = '16:9';
      else if (Math.abs(ratio - 9/16) < 0.15) aspectRatio = '9:16';
      else if (Math.abs(ratio - 4/3) < 0.15) aspectRatio = '4:3';
      else if (Math.abs(ratio - 3/4) < 0.15) aspectRatio = '3:4';
      else if (Math.abs(ratio - 1/1) < 0.15) aspectRatio = '1:1';
      else if (Math.abs(ratio - 21/9) < 0.15) aspectRatio = '21:9';
      else if (Math.abs(ratio - 5/4) < 0.15) aspectRatio = '5:4';
      else if (Math.abs(ratio - 4/5) < 0.15) aspectRatio = '4:5';
      else if (Math.abs(ratio - 3/2) < 0.15) aspectRatio = '3:2';
      else if (Math.abs(ratio - 2/3) < 0.15) aspectRatio = '2:3';
      else {
        // Calculate simplified ratio
        const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
        const divisor = gcd(imageWidth, imageHeight);
        aspectRatio = `${Math.round(imageWidth / divisor)}:${Math.round(imageHeight / divisor)}`;
      }
      
      console.log(`[Tasy] Detected aspect ratio: ${aspectRatio} from ${imageWidth}x${imageHeight}`);
    }
  }

  return {
    headline,
    text,
    cta,
    image,
    description,
    sourceUrl: window.location.href,
    aspectRatio: aspectRatio || 'auto',
    imageWidth,
    imageHeight,
  };
}

// Show replicate panel inline on the page
function showReplicatePanel(adData, container) {
  console.log('[Tasy] showReplicatePanel called', { adData, container });
  
  // Remove any existing panel
  const existingPanel = container.querySelector('.tasy-replicate-panel');
  if (existingPanel) {
    existingPanel.remove();
    return;
  }

  // Get brand settings
  chrome.storage.local.get(['product', 'accentColor', 'secondaryImages'], async (result) => {
    console.log('[Tasy] Got brand settings:', result);
    const accentColor = result.accentColor || '#FF006F';
    const hasProductImage = !!result.product?.data;
    const secondaryImages = result.secondaryImages || [];

    // Create panel overlay - covers the entire ad with transparency
    const panel = document.createElement('div');
    panel.className = 'tasy-replicate-panel';
    panel.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.85);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      border-radius: 12px;
      z-index: 100000;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 24px;
      box-sizing: border-box;
    `;

    // Build secondary images HTML with visual selection
    let secondaryImagesHtml = '';
    if (secondaryImages.length > 0) {
      secondaryImagesHtml = `
        <div style="margin-bottom: 16px;">
          <label style="display: block; color: #888; font-size: 12px; margin-bottom: 8px;">Select images to include:</label>
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            ${secondaryImages.map((img, i) => `
              <div class="tasy-secondary-img" data-index="${i}" style="
                position: relative;
                width: 60px;
                height: 60px;
                border-radius: 6px;
                overflow: hidden;
                cursor: pointer;
                border: 2px solid ${accentColor};
                opacity: 1;
              ">
                <img src="${img.data}" style="width: 100%; height: 100%; object-fit: cover;">
                <div class="tasy-check" style="
                  position: absolute;
                  top: 4px;
                  right: 4px;
                  width: 16px;
                  height: 16px;
                  background: ${accentColor};
                  border-radius: 50%;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                ">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="white">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    panel.innerHTML = `
      <div style="width: 100%; max-width: 400px; margin: 0 auto;">
        <h3 style="color: #fff; font-size: 18px; font-weight: 600; margin-bottom: 16px; text-align: center;">Adapt Ad</h3>
        
        <div style="margin-bottom: 16px;">
          <label style="display: block; color: #888; font-size: 12px; margin-bottom: 6px;">Extra edits</label>
          <textarea 
            id="tasy-extra-edits" 
            placeholder="e.g., Change price to $29.99"
            style="
              width: 100%;
              min-height: 50px;
              padding: 8px;
              background: #1d1f20;
              border: 1px solid #333;
              border-radius: 6px;
              color: #fff;
              font-size: 13px;
              font-family: inherit;
              resize: none;
              box-sizing: border-box;
            "
          ></textarea>
        </div>

        <div style="margin-bottom: 16px;">
          <div style="display: flex; flex-wrap: wrap; gap: 8px;">
            <label style="display: flex; align-items: center; gap: 6px; color: #ccc; font-size: 12px; cursor: pointer; background: #1d1f20; padding: 6px 10px; border-radius: 4px;">
              <input type="checkbox" id="tasy-include-color" checked style="cursor: pointer;">
              <span style="display: inline-block; width: 12px; height: 12px; background: ${accentColor}; border-radius: 2px;"></span>
              Color
            </label>
            ${hasProductImage ? `
              <label style="display: flex; align-items: center; gap: 6px; color: #ccc; font-size: 12px; cursor: pointer; background: #1d1f20; padding: 6px 10px; border-radius: 4px;">
                <input type="checkbox" id="tasy-include-product" checked style="cursor: pointer;">
                Product
              </label>
            ` : ''}
          </div>
        </div>

        ${secondaryImagesHtml}

        <div style="display: flex; gap: 8px;">
          <button 
            id="tasy-start-replicate" 
            style="
              flex: 1;
              padding: 12px 16px;
              background: ${accentColor};
              color: #fff;
              border: none;
              border-radius: 6px;
              font-weight: 600;
              font-size: 14px;
              cursor: pointer;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 6px;
            "
          >
            <span>2</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/>
              <path d="M12 18V6"/>
            </svg>
          </button>
          <button 
            id="tasy-cancel-replicate" 
            style="
              padding: 12px 16px;
              background: transparent;
              color: #888;
              border: 1px solid #333;
              border-radius: 6px;
              font-size: 14px;
              cursor: pointer;
            "
          >
            Cancel
          </button>
        </div>
      </div>
    `;

    container.appendChild(panel);

    // Handle secondary image selection toggle
    panel.querySelectorAll('.tasy-secondary-img').forEach(imgEl => {
      imgEl.addEventListener('click', () => {
        const isSelected = imgEl.style.opacity === '1';
        imgEl.style.opacity = isSelected ? '0.4' : '1';
        imgEl.style.borderColor = isSelected ? '#333' : accentColor;
        imgEl.querySelector('.tasy-check').style.display = isSelected ? 'none' : 'flex';
      });
    });

    // Handle cancel
    panel.querySelector('#tasy-cancel-replicate').onclick = (e) => {
      e.stopPropagation();
      panel.remove();
    };

    // Handle start
    panel.querySelector('#tasy-start-replicate').onclick = async (e) => {
      e.stopPropagation();
      const extraEdits = panel.querySelector('#tasy-extra-edits').value.trim();
      const includeColor = panel.querySelector('#tasy-include-color').checked;
      const includeProduct = hasProductImage && panel.querySelector('#tasy-include-product')?.checked;
      
      // Get selected secondary images
      const selectedSecondaryImages = [];
      panel.querySelectorAll('.tasy-secondary-img').forEach(imgEl => {
        if (imgEl.style.opacity === '1') {
          const index = parseInt(imgEl.dataset.index);
          selectedSecondaryImages.push(secondaryImages[index].data);
        }
      });

      panel.remove();
      await handleReplicateAd(adData, container, {
        extraEdits,
        includeColor,
        includeProduct,
        productImage: includeProduct ? result.product?.data : null,
        secondaryImages: selectedSecondaryImages,
        accentColor,
      });
    };

    // Stop propagation to prevent closing
    panel.onclick = (e) => e.stopPropagation();
  });
}

// Handle ad replication
async function handleReplicateAd(adData, container, options = {}) {
  try {
    console.log('[Tasy Extension] Starting ad replication...');
    
    // Show inline progress panel
    const progressPanel = showInlineProgress(container, 0, 'Authenticating...');

    // Check authentication with retry
    console.log('[Tasy Extension] Checking authentication...');
    let authResult = await chrome.runtime.sendMessage({ action: 'checkAuth' });
    console.log('[Tasy Extension] Auth result:', authResult);
    
    // If not authenticated, try checking again after a short delay
    if (!authResult.success) {
      console.log('[Tasy Extension] Not authenticated, retrying after delay...');
      await new Promise(resolve => setTimeout(resolve, 500));
      authResult = await chrome.runtime.sendMessage({ action: 'checkAuth' });
      console.log('[Tasy Extension] Retry auth result:', authResult);
    }
    
    if (!authResult.success) {
      progressPanel.remove();
      showInlineError(container, 'Please log in to Tasy first.', true);
      return;
    }

    console.log('[Tasy Extension] Authenticated! Credits:', authResult.credits);
    if (authResult.credits < 2) {
      progressPanel.remove();
      showInlineError(container, `Insufficient credits. You have ${authResult.credits} credits. Need 2 credits.`, false);
      return;
    }

    // Start percentage loader (25 seconds to 100% per step)
    let currentPhase = 0;
    const phases = [
      { name: 'Authenticating...', duration: 6000 },
      { name: 'Downloading image...', duration: 6000 },
      { name: 'Generating adapted image...', duration: 10000 },
      { name: 'Saving ad...', duration: 3000 }
    ];
    
    const startPhase = (phaseIndex) => {
      if (phaseIndex >= phases.length) return;
      
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
    
    const mainInterval = startPhase(0);

    // Get brand settings from storage
    const brandSettings = await getBrandSettings();
    brandSettings.extraEdits = options.extraEdits || '';
    brandSettings.includeColor = options.includeColor !== false;
    brandSettings.includeProduct = options.includeProduct || false;
    brandSettings.includeSecondary = options.includeSecondary || false;
    brandSettings.productImage = options.productImage || brandSettings.productImage;
    brandSettings.secondaryImages = options.includeSecondary ? (options.secondaryImages || brandSettings.secondaryImages || []) : [];
    brandSettings.accentColor = options.accentColor || brandSettings.accentColor;

    // Adapt ad using fal.ai
    const adaptResult = await chrome.runtime.sendMessage({
      action: 'adaptAd',
      adData,
      brandInfo: brandSettings,
    });

    if (mainInterval) clearInterval(mainInterval);
    updateInlineProgress(progressPanel, 100, 'Complete!');

    if (!adaptResult.success) {
      progressPanel.remove();
      showInlineError(container, adaptResult.error || 'Failed to replicate ad', false);
      return;
    }

    // Save to database
    const saveResult = await chrome.runtime.sendMessage({
      action: 'saveAd',
      originalAd: adData,
      adaptedAd: adaptResult.adaptedAd,
      sourceUrl: window.location.href,
    });

    if (!saveResult.success) {
      console.error('Failed to save ad:', saveResult.error);
    }

    // Image is now saved to mockups table via save-ad API

    // Show replicated ad inline
    setTimeout(() => {
      progressPanel.remove();
      console.log('[Tasy Extension] Showing result with image:', adaptResult.adaptedAd?.image?.substring(0, 100) || 'NO IMAGE');
      showInlineResult(container, adData, adaptResult.adaptedAd, adaptResult.creditsRemaining);
    }, 500);
  } catch (error) {
    console.error('Error replicating ad:', error);
    showInlineError(container, error.message || 'An error occurred', false);
  }
}

// Show inline progress panel (full overlay inside ad)
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
    z-index: 100000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px;
    box-sizing: border-box;
  `;

  panel.innerHTML = `
    <div style="text-align: center; max-width: 400px; width: 100%;">
      <div style="margin-bottom: 24px;">
        <div style="
          width: 64px;
          height: 64px;
          border: 4px solid rgba(42, 44, 45, 0.3);
          border-top-color: #FF006F;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto;
        "></div>
      </div>
      <div style="margin-bottom: 20px;">
        <div style="
          width: 100%;
          height: 8px;
          background: rgba(29, 31, 32, 0.5);
          border-radius: 4px;
          overflow: hidden;
        ">
          <div id="tasy-progress-bar" style="
            width: ${percentage}%;
            height: 100%;
            background: linear-gradient(90deg, #FF006F, #CC0059);
            transition: width 0.3s ease;
            border-radius: 4px;
          "></div>
        </div>
      </div>
      <div style="color: #fff; font-size: 18px; font-weight: 600; margin-bottom: 8px;">${escapeHtml(phase)}</div>
      <div id="tasy-progress-details" style="color: #888; font-size: 14px; margin-bottom: 4px;">Processing your ad creative...</div>
      <div id="tasy-progress-percent" style="color: #FF006F; font-size: 16px; font-weight: 500; margin-top: 12px;">${percentage}%</div>
      <div style="color: #666; font-size: 12px; margin-top: 8px;">Approximately 25 seconds</div>
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
  
  // Update details based on phase
  if (detailsText) {
    let details = 'Processing your ad creative...';
    if (phase.includes('Authenticating')) {
      details = 'Verifying your account and credits...';
    } else if (phase.includes('Downloading')) {
      details = 'Fetching the original ad image...';
    } else if (phase.includes('Generating')) {
      details = 'AI is recreating the ad with your brand...';
    } else if (phase.includes('Saving')) {
      details = 'Finalizing and saving your adapted ad...';
    } else if (phase.includes('Complete')) {
      details = 'Your adapted ad is ready!';
    }
    detailsText.textContent = details;
  }
}

// Show inline error (full overlay inside ad)
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
    z-index: 100000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px;
    box-sizing: border-box;
  `;

  panel.innerHTML = `
    <div style="text-align: center; max-width: 400px; width: 100%;">
      <div style="color: #ff4444; font-size: 48px; margin-bottom: 16px;">❌</div>
      <div style="color: #fff; font-size: 18px; font-weight: 600; margin-bottom: 12px;">Error</div>
      <div style="color: #888; font-size: 14px; margin-bottom: ${isAuthError ? '20px' : '0'};">
        ${escapeHtml(message)}
      </div>
      ${isAuthError ? `
        <a 
          href="https://app.tasy.ai/sign-in" 
          target="_blank"
          style="
            display: inline-block;
            margin-top: 20px;
            padding: 12px 24px;
            background: #fff;
            color: #000;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 14px;
          "
        >
          Log in →
        </a>
      ` : ''}
      <button 
        onclick="this.closest('.tasy-error-panel').remove()"
        style="
          margin-top: 20px;
          padding: 10px 20px;
          background: rgba(29, 31, 32, 0.8);
          color: #ccc;
          border: 1px solid rgba(42, 44, 45, 0.5);
          border-radius: 6px;
          font-size: 14px;
          cursor: pointer;
          width: 100%;
        "
      >
        Close
      </button>
    </div>
  `;

  container.appendChild(panel);
}

// Show inline result (full overlay inside ad)
function showInlineResult(container, originalAd, adaptedAd, creditsRemaining) {
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
    z-index: 100000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 30px;
    box-sizing: border-box;
    overflow-y: auto;
  `;

  panel.innerHTML = `
    <div style="width: 100%; max-width: 350px; text-align: center; position: relative; z-index: 100001;">
      <div style="color: #fff; font-size: 18px; font-weight: 600; margin-bottom: 16px;">✨ Ad Adapted!</div>
      
      ${adaptedAd.image ? `
        <div style="margin-bottom: 16px; position: relative;">
          <img 
            src="${adaptedAd.image}" 
            id="tasy-result-image"
            style="width: 100%; max-height: 300px; object-fit: contain; border-radius: 8px; border: 1px solid rgba(42, 44, 45, 0.5); display: block; cursor: pointer;" 
            alt="Adapted ad"
          />
          <div style="position: absolute; top: 8px; right: 8px; display: flex; gap: 6px;">
            <button
              id="tasy-expand-btn"
              style="
                padding: 8px;
                background: rgba(0, 0, 0, 0.8);
                backdrop-filter: blur(8px);
                border: 2px solid rgba(255, 255, 255, 0.3);
                border-radius: 6px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: border-color 0.2s ease;
              "
              title="Expand"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"></path>
              </svg>
            </button>
            <button
              id="tasy-download-btn"
              style="
                padding: 8px;
                background: rgba(0, 0, 0, 0.8);
                backdrop-filter: blur(8px);
                border: 2px solid rgba(255, 255, 255, 0.3);
                border-radius: 6px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: border-color 0.2s ease;
              "
              title="Download"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
            </button>
          </div>
        </div>
      ` : ''}
      
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-top: 1px solid rgba(42, 44, 45, 0.5); margin-bottom: 12px; position: relative; z-index: 100002;">
        <div style="font-size: 12px; color: #888;">
          Credits: <strong style="color: #fff;">${creditsRemaining}</strong>
        </div>
        <a 
          id="tasy-view-dashboard-link"
          href="https://app.tasy.ai/content" 
          target="_blank" 
          style="
            color: #FF006F; 
            text-decoration: none; 
            font-size: 12px; 
            font-weight: 500;
            position: relative;
            z-index: 100003;
            pointer-events: auto !important;
            cursor: pointer !important;
            padding: 4px 8px;
            border-radius: 4px;
            transition: background-color 0.2s;
            display: inline-block;
          "
        >
          View Dashboard →
        </a>
      </div>
      
      <button 
        id="tasy-close-result-btn"
        style="
          padding: 10px 20px;
          background: rgba(29, 31, 32, 0.8);
          color: #ccc;
          border: 1px solid rgba(42, 44, 45, 0.5);
          border-radius: 6px;
          font-size: 13px;
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

  container.appendChild(panel);
  
  const resultImage = panel.querySelector('#tasy-result-image');
  
  // Add expand button handler - shows image full screen
  const expandBtn = panel.querySelector('#tasy-expand-btn');
  if (expandBtn && adaptedAd.image && resultImage) {
    expandBtn.addEventListener('mouseenter', function() {
      this.style.borderColor = 'rgba(255, 0, 111, 0.8)';
    });
    expandBtn.addEventListener('mouseleave', function() {
      this.style.borderColor = 'rgba(255, 255, 255, 0.3)';
    });
    expandBtn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      // Create fullscreen overlay
      const fullscreenOverlay = document.createElement('div');
      fullscreenOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.95);
        z-index: 999999;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 40px;
        box-sizing: border-box;
        cursor: zoom-out;
      `;
      
      const fullscreenImage = document.createElement('img');
      fullscreenImage.src = adaptedAd.image;
      fullscreenImage.style.cssText = `
        max-width: 90vw;
        max-height: 90vh;
        object-fit: contain;
        border-radius: 8px;
      `;
      
      fullscreenOverlay.appendChild(fullscreenImage);
      
      // Close on click
      fullscreenOverlay.addEventListener('click', () => {
        fullscreenOverlay.remove();
      });
      
      // Close on Escape key
      const handleEscape = (e) => {
        if (e.key === 'Escape') {
          fullscreenOverlay.remove();
          document.removeEventListener('keydown', handleEscape);
        }
      };
      document.addEventListener('keydown', handleEscape);
      
      document.body.appendChild(fullscreenOverlay);
    });
  }
  
  // Add download button handler
  const downloadBtn = panel.querySelector('#tasy-download-btn');
  if (downloadBtn && adaptedAd.image) {
    downloadBtn.addEventListener('mouseenter', function() {
      this.style.borderColor = 'rgba(255, 0, 111, 0.8)';
    });
    downloadBtn.addEventListener('mouseleave', function() {
      this.style.borderColor = 'rgba(255, 255, 255, 0.3)';
    });
    downloadBtn.addEventListener('click', async function(e) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      
      const img = panel.querySelector('#tasy-result-image');
      const imageUrl = img?.src || adaptedAd.image;
      
      if (!imageUrl) {
        console.error('[Tasy] No image to download');
        return;
      }
      
      try {
        // Show loading state
        const originalContent = this.innerHTML;
        this.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>';
        this.style.opacity = '0.5';
        this.disabled = true;
        
        // Fetch the image as a blob to handle CORS
        console.log('[Tasy] Downloading image:', imageUrl.substring(0, 100));
        const response = await fetch(imageUrl);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.statusText}`);
        }
        
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        
        // Create download link
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = `tasy-ad-${Date.now()}.png`;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        
        // Clean up
        setTimeout(() => {
          document.body.removeChild(link);
          URL.revokeObjectURL(blobUrl);
        }, 100);
        
        console.log('[Tasy] Image downloaded successfully');
        
        // Restore button state
        this.innerHTML = originalContent;
        this.style.opacity = '1';
        this.disabled = false;
      } catch (error) {
        console.error('[Tasy] Download error:', error);
        
        // Restore button state
        this.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>';
        this.style.opacity = '1';
        this.disabled = false;
        
        // Show error to user
        alert('Failed to download image. Please try right-clicking the image and selecting "Save image as..."');
      }
    });
  }
  
  // Add dashboard link handler
  const dashboardLink = panel.querySelector('#tasy-view-dashboard-link');
  if (dashboardLink) {
    dashboardLink.addEventListener('mouseenter', function() {
      this.style.backgroundColor = 'rgba(255, 0, 111, 0.1)';
    });
    dashboardLink.addEventListener('mouseleave', function() {
      this.style.backgroundColor = 'transparent';
    });
    dashboardLink.addEventListener('click', function(e) {
      e.stopPropagation();
      e.stopImmediatePropagation();
      // Link will open naturally via href, but ensure it works
      window.open('https://app.tasy.ai/content', '_blank');
    });
  }
  
  // Add close button handler
  const closeBtn = panel.querySelector('#tasy-close-result-btn');
  if (closeBtn) {
    closeBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      panel.remove();
    });
  }
}

// Get brand settings from storage
async function getBrandSettings() {
  const result = await chrome.storage.local.get(['product', 'accentColor', 'secondaryImages']);
  
  return {
    name: 'My Brand',
    description: '',
    tone: 'professional',
    industry: '',
    accentColor: result.accentColor || '#FF006F',
    productImage: result.product?.data || null,
    secondaryImages: (result.secondaryImages || []).map(img => img.data),
  };
}

// Show loading modal with custom message
function showLoadingModal(title = 'Processing...', subtitle = 'Please wait') {
  removeModal();
  const modal = createModal(`
    <div style="text-align: center; padding: 20px;">
      <div style="margin-bottom: 20px;">
        <div style="
          width: 48px;
          height: 48px;
          border: 4px solid #2a2c2d;
          border-top-color: #FF006F;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto;
        "></div>
      </div>
      <h3 style="color: #fff; margin-bottom: 8px; font-size: 18px; font-weight: 600;">${escapeHtml(title)}</h3>
      <p style="color: #888; font-size: 14px; margin: 0;">${escapeHtml(subtitle)}</p>
    </div>
    <style>
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    </style>
  `, 'loading');
  document.body.appendChild(modal);
}

// Show replicated ad nicely
function showReplicatedAd(originalAd, adaptedAd, creditsRemaining) {
  removeModal();
  
  const modal = createModal(`
    <div style="text-align: left; max-width: 600px;">
      <h2 style="color: #fff; margin-bottom: 20px; font-size: 20px;">✨ Ad Replicated!</h2>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
        <!-- Original -->
        <div>
          <h3 style="font-size: 14px; color: #888; margin-bottom: 12px; font-weight: 600;">Original</h3>
          ${originalAd.image ? `<img src="${originalAd.image}" style="width: 100%; border-radius: 8px; margin-bottom: 12px; border: 1px solid #2a2c2d;" alt="Original ad">` : ''}
          <div style="background: #1d1f20; padding: 12px; border-radius: 6px; border: 1px solid #2a2c2d;">
            ${originalAd.headline ? `<div style="font-weight: 600; margin-bottom: 8px; color: #fff;">${escapeHtml(originalAd.headline)}</div>` : ''}
            ${originalAd.text ? `<div style="font-size: 13px; color: #ccc; margin-bottom: 8px;">${escapeHtml(originalAd.text)}</div>` : ''}
            ${originalAd.cta ? `<div style="color: #fff; font-weight: 500;">${escapeHtml(originalAd.cta)}</div>` : ''}
          </div>
        </div>
        
        <!-- Replicated -->
        <div>
          <h3 style="font-size: 14px; color: #fff; margin-bottom: 12px; font-weight: 600;">Replicated</h3>
          ${adaptedAd.image ? `<img src="${adaptedAd.image}" style="width: 100%; border-radius: 8px; margin-bottom: 12px; border: 1px solid #2a2c2d;" alt="Replicated ad">` : ''}
          <div style="background: #1d1f20; padding: 12px; border-radius: 6px; border: 1px solid #4a4c4d;">
            ${adaptedAd.headline ? `<div style="font-weight: 600; margin-bottom: 8px; color: #fff;">${escapeHtml(adaptedAd.headline)}</div>` : ''}
            ${adaptedAd.text ? `<div style="font-size: 13px; color: #ccc; margin-bottom: 8px;">${escapeHtml(adaptedAd.text)}</div>` : ''}
            ${adaptedAd.cta ? `<div style="color: #fff; font-weight: 500;">${escapeHtml(adaptedAd.cta)}</div>` : ''}
          </div>
        </div>
      </div>
      
      <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 16px; border-top: 1px solid #2a2c2d;">
        <div style="font-size: 12px; color: #888;">
          Credits remaining: <strong style="color: #fff;">${creditsRemaining}</strong>
        </div>
        <a href="https://app.tasy.ai/content" target="_blank" style="color: #fff; text-decoration: none; font-weight: 500; font-size: 14px; border-bottom: 1px solid #fff;">
          View in Dashboard →
        </a>
      </div>
    </div>
  `, 'success');
  
  document.body.appendChild(modal);
}

// Show error modal
function showErrorModal(message, isAuthError = false) {
  removeModal();
  const modal = createModal(`
    <div style="text-align: left;">
      <h3 style="color: #ff4444; margin-bottom: 16px; font-size: 18px;">❌ Error</h3>
      <p style="color: #ccc; margin-bottom: ${isAuthError ? '20px' : '0'};">
        ${escapeHtml(message)}
      </p>
      ${isAuthError ? `
        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #2a2c2d;">
          <a 
            href="https://app.tasy.ai/sign-in" 
            target="_blank"
            id="tasy-login-link"
            class="tasy-login-button"
            style="
              display: inline-block;
              padding: 12px 24px;
              background: #fff;
              color: #000;
              text-decoration: none;
              border-radius: 8px;
              font-weight: 500;
              font-size: 14px;
              transition: all 0.2s;
            "
          >
            Log in to Tasy →
          </a>
          <p style="font-size: 12px; color: #888; margin-top: 12px;">
            After logging in, this page will automatically refresh.
          </p>
        </div>
      ` : ''}
    </div>
  `, 'error');
  document.body.appendChild(modal);
  
  // Add hover styles via CSS (no inline handlers)
  if (isAuthError) {
    const loginLink = modal.querySelector('#tasy-login-link');
    if (loginLink) {
      loginLink.addEventListener('mouseenter', function() {
        this.style.background = '#f0f0f0';
      });
      loginLink.addEventListener('mouseleave', function() {
        this.style.background = '#fff';
      });
      
      loginLink.addEventListener('click', () => {
        console.log('[Tasy Extension] Login link clicked, starting auth check...');
        // Check auth status every 2 seconds after opening login
        const checkInterval = setInterval(async () => {
          try {
            console.log('[Tasy Extension] Checking auth status...');
            const authResult = await chrome.runtime.sendMessage({ action: 'checkAuth' });
            console.log('[Tasy Extension] Auth result:', authResult);
            if (authResult.success) {
              console.log('[Tasy Extension] Auth successful! Refreshing page...');
              clearInterval(checkInterval);
              removeModal();
              // Refresh the page to retry
              window.location.reload();
            }
          } catch (error) {
            console.error('[Tasy Extension] Auth check error:', error);
            // Ignore errors, keep checking
          }
        }, 2000);
        
        // Stop checking after 5 minutes
        setTimeout(() => {
          clearInterval(checkInterval);
          console.log('[Tasy Extension] Stopped checking auth after 5 minutes');
        }, 300000);
      });
    }
  }
}

// Create modal element
function createModal(content, type) {
  const modal = document.createElement('div');
  modal.id = MODAL_ID;
  modal.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: #000;
    border: 1px solid #2a2c2d;
    padding: 24px;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.8);
    z-index: 100000;
    max-width: 700px;
    width: 90%;
    max-height: 80vh;
    overflow-y: auto;
  `;
  modal.innerHTML = content + `
    <button id="tasy-modal-close" style="
      position: absolute;
      top: 12px;
      right: 12px;
      background: none;
      border: none;
      font-size: 28px;
      cursor: pointer;
      color: #999;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      transition: all 0.2s;
    ">×</button>
  `;

  modal.querySelector('#tasy-modal-close').onclick = () => removeModal();
  modal.querySelector('#tasy-modal-close').onmouseenter = function() {
    this.style.background = '#1d1f20';
    this.style.color = '#fff';
  };
  modal.querySelector('#tasy-modal-close').onmouseleave = function() {
    this.style.background = 'none';
    this.style.color = '#888';
  };

  return modal;
}

// Remove modal
function removeModal() {
  const existing = document.getElementById(MODAL_ID);
  if (existing) {
    existing.remove();
  }
}

// Escape HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Global click handler as additional fallback for copy buttons
document.addEventListener('click', (e) => {
  const target = e.target;
  
  // Check if click is on our copy button or its child (SVG)
  const button = target.closest('.tasy-copy-ad-btn');
  if (button && button.hasAttribute('data-tasy-button')) {
    console.log('[Tasy] Global click handler triggered for copy button');
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    
    // Find the ad container
    const container = button.closest('.tasy-ad-container');
    if (container) {
      // Extract ad data
      const adData = extractAdData(container);
      showReplicatePanel(adData, container);
    } else {
      console.error('[Tasy] Could not find ad container for button');
    }
    
    return false;
  }
}, { capture: true, passive: false });

// Refresh auth when tab becomes visible (user switches back)
document.addEventListener('visibilitychange', async () => {
  if (!document.hidden) {
    console.log('[Tasy] Tab became visible, refreshing auth...');
    // Trigger a background refresh by checking auth
    try {
      await chrome.runtime.sendMessage({ action: 'checkAuth' });
    } catch (e) {
      console.log('[Tasy] Auth refresh on visibility change:', e.message);
    }
  }
});

// Also refresh on window focus
window.addEventListener('focus', async () => {
  console.log('[Tasy] Window focused, refreshing auth...');
  try {
    await chrome.runtime.sendMessage({ action: 'checkAuth' });
  } catch (e) {
    console.log('[Tasy] Auth refresh on focus:', e.message);
  }
});

// Initialize on page load with multiple retries
function initializeExtension() {
  console.log('[Tasy] Initializing extension...');
  
  // Try immediately
  injectReplicateButtons();
  
  // Retry after delays (Facebook loads content dynamically)
  setTimeout(injectReplicateButtons, 1000);
  setTimeout(injectReplicateButtons, 2000);
  setTimeout(injectReplicateButtons, 4000);
  setTimeout(injectReplicateButtons, 6000);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeExtension);
} else {
  initializeExtension();
}

// Re-inject buttons when page changes (Facebook uses SPA)
let debounceTimer = null;
const observer = new MutationObserver(() => {
  // Debounce to avoid too many calls
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(injectReplicateButtons, 500);
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});
