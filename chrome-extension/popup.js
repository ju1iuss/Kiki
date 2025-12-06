// Popup script for Chrome extension

let isPinterest = false;

// Check current tab to determine context
async function checkContext() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.url) {
      isPinterest = tab.url.includes('pinterest.com');
      console.log('[Tasy Popup] Context detected:', isPinterest ? 'Pinterest' : 'Facebook/Other');
      
      // Show/hide sections based on context
      const logoSection = document.getElementById('logoSection');
      const productSection = document.getElementById('productSection');
      const secondarySection = document.getElementById('secondarySection');
      const colorSection = document.getElementById('colorSection');
      
      if (isPinterest) {
        if (logoSection) logoSection.style.display = 'block';
        if (productSection) productSection.style.display = 'none';
        if (secondarySection) secondarySection.style.display = 'none';
        if (colorSection) colorSection.style.display = 'none';
      } else {
        if (logoSection) logoSection.style.display = 'none';
        if (productSection) productSection.style.display = 'block';
        if (secondarySection) secondarySection.style.display = 'block';
        if (colorSection) colorSection.style.display = 'block';
      }
    }
  } catch (error) {
    console.error('[Tasy Popup] Error checking context:', error);
    // Default to Facebook mode if error
    isPinterest = false;
  }
}

// Helper function to set icon image
function setIconImage(element, fallbackUrl = null) {
  if (element) {
    element.src = chrome.runtime.getURL('icons/icon-128.png');
    element.onerror = () => {
      // Fallback to favicon or provided fallback
      element.src = fallbackUrl || chrome.runtime.getURL('icons/favicon.ico');
    };
  }
}

// Load saved settings
document.addEventListener('DOMContentLoaded', async () => {
  // Set logo icons
  setIconImage(document.getElementById('authLogo'));
  setIconImage(document.getElementById('headerLogo'));
  
  // Load cached auth state first to avoid flicker
  await loadCachedAuthState();
  
  // Then verify auth in background
  checkAuthAndShowContent();
  
  await checkContext();
  await loadSettings();
  setupEventListeners();
  await loadCredits();
});

// Load cached auth state immediately to avoid flicker
async function loadCachedAuthState() {
  const authPage = document.getElementById('authPage');
  const settingsContent = document.getElementById('settingsContent');
  
  try {
    // Check if we have cached session token and credits
    const result = await chrome.storage.local.get(['sessionToken', 'userCredits']);
    
    if (result.sessionToken) {
      // We have cached auth, show authenticated UI immediately
      console.log('[Tasy Popup] Using cached auth state');
      if (authPage) authPage.classList.add('hidden');
      if (settingsContent) settingsContent.classList.remove('hidden');
      
      // Show cached credits if available
      const creditsDisplay = document.getElementById('creditsDisplay');
      if (creditsDisplay && result.userCredits !== undefined) {
        creditsDisplay.textContent = `${result.userCredits} credits`;
      }
    } else {
      // No cached auth, show auth page
      console.log('[Tasy Popup] No cached auth, showing auth page');
      if (authPage) authPage.classList.remove('hidden');
      if (settingsContent) settingsContent.classList.add('hidden');
      setupAuthListeners();
    }
  } catch (error) {
    console.error('[Tasy Popup] Error loading cached auth:', error);
    // On error, show auth page
    const authPage = document.getElementById('authPage');
    const settingsContent = document.getElementById('settingsContent');
    if (authPage) authPage.classList.remove('hidden');
    if (settingsContent) settingsContent.classList.add('hidden');
    setupAuthListeners();
  }
}

// Check authentication and show appropriate content
async function checkAuthAndShowContent() {
  const authPage = document.getElementById('authPage');
  const settingsContent = document.getElementById('settingsContent');
  
  try {
    const response = await chrome.runtime.sendMessage({ action: 'checkAuth' });
    
    if (response.success) {
      // User is authenticated - show settings
      console.log('[Tasy Popup] Auth verified, showing settings');
      if (authPage) authPage.classList.add('hidden');
      if (settingsContent) settingsContent.classList.remove('hidden');
      
      // Update credits display
      const creditsDisplay = document.getElementById('creditsDisplay');
      if (creditsDisplay && response.credits !== undefined) {
        creditsDisplay.textContent = `${response.credits} credits`;
      }
    } else {
      // User is not authenticated - show auth page
      console.log('[Tasy Popup] Not authenticated, showing auth page');
      if (authPage) authPage.classList.remove('hidden');
      if (settingsContent) settingsContent.classList.add('hidden');
      setupAuthListeners();
    }
  } catch (error) {
    console.error('[Tasy Popup] Error checking auth:', error);
    // On error, show auth page
    if (authPage) authPage.classList.remove('hidden');
    if (settingsContent) settingsContent.classList.add('hidden');
    setupAuthListeners();
  }
}

// Setup auth page listeners
function setupAuthListeners() {
  const googleSignInBtn = document.getElementById('googleSignInBtn');
  const emailSignInBtn = document.getElementById('emailSignInBtn');
  
  if (googleSignInBtn) {
    googleSignInBtn.addEventListener('click', () => {
      chrome.tabs.create({ url: 'https://app.tasy.ai/' });
    });
  }
  
  if (emailSignInBtn) {
    emailSignInBtn.addEventListener('click', () => {
      chrome.tabs.create({ url: 'https://app.tasy.ai/' });
    });
  }
}

function setupEventListeners() {
  // Logo upload (for Pinterest) - multiple logos
  const addLogoBtn = document.getElementById('addLogoBtn');
  const logoInput = document.getElementById('logoInput');

  if (addLogoBtn && logoInput) {
    addLogoBtn.addEventListener('click', () => logoInput.click());
    logoInput.addEventListener('change', (e) => handleLogoUpload(e));
  }

  // Product upload (for Facebook)
  const productUpload = document.getElementById('productUpload');
  const productInput = document.getElementById('productInput');
  const productPreview = document.getElementById('productPreview');

  if (productUpload && productInput) {
    productUpload.addEventListener('click', () => productInput.click());
    productInput.addEventListener('change', (e) => handleFileUpload(e, 'product', productPreview, productUpload, true));
  }

  // Secondary images (up to 3) - only for Facebook
  const addSecondaryBtn = document.getElementById('addSecondaryBtn');
  const secondaryInput = document.getElementById('secondaryInput');
  
  if (addSecondaryBtn && secondaryInput) {
    addSecondaryBtn.addEventListener('click', () => secondaryInput.click());
    secondaryInput.addEventListener('change', (e) => handleSecondaryImageUpload(e));
  }

  // Color picker (smaller)
  const colorInput = document.getElementById('colorInput');
  const colorValue = document.getElementById('colorValue');

  if (colorInput && colorValue) {
    colorInput.addEventListener('input', (e) => {
      const color = e.target.value;
      colorValue.textContent = color;
      saveSettings();
    });
  }

  // Load generated images
  loadGeneratedImages();

  // Credits display click handler
  const creditsDisplay = document.getElementById('creditsDisplay');
  if (creditsDisplay) {
    creditsDisplay.addEventListener('click', () => {
      chrome.tabs.create({ url: 'https://app.tasy.ai/subscription' });
    });
  }
}

async function handleLogoUpload(event) {
  const files = Array.from(event.target.files);
  if (files.length === 0) return;

  // Get current logos
  const result = await chrome.storage.local.get(['logos']);
  const currentLogos = result.logos || [];

  for (const file of files) {
    if (!file.type.startsWith('image/')) {
      alert(`${file.name} is not an image file`);
      continue;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert(`${file.name} is too large (max 5MB)`);
      continue;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target.result;
      const logoData = {
        name: file.name,
        type: file.type,
        size: file.size,
        data: base64,
        id: Date.now() + Math.random(),
      };

      currentLogos.push(logoData);
      await chrome.storage.local.set({ logos: currentLogos });
      
      // Also set first logo as default for backward compatibility
      if (currentLogos.length === 1) {
        await chrome.storage.local.set({ logo: logoData });
      }
      
      renderLogos();
    };
    reader.readAsDataURL(file);
  }

  event.target.value = '';
}

function renderLogos() {
  chrome.storage.local.get(['logos'], (result) => {
    const logos = result.logos || [];
    const grid = document.getElementById('logosGrid');
    const addBtn = document.getElementById('addLogoBtn');

    if (!grid) return;

    grid.innerHTML = '';

    logos.forEach((logoData, index) => {
      const item = document.createElement('div');
      item.className = 'logo-item';
      item.innerHTML = `
        <img src="${logoData.data}" alt="${logoData.name}">
        <button class="remove-btn" onclick="removeLogo(${index})" style="position: absolute; top: 4px; right: 4px; width: 20px; height: 20px; padding: 0; font-size: 12px; line-height: 1;">×</button>
      `;
      grid.appendChild(item);
    });
  });
}

async function removeLogo(index) {
  const result = await chrome.storage.local.get(['logos']);
  const logos = result.logos || [];
  logos.splice(index, 1);
  await chrome.storage.local.set({ logos: logos });
  
  // Update default logo if needed
  if (logos.length > 0) {
    await chrome.storage.local.set({ logo: logos[0] });
  } else {
    await chrome.storage.local.remove(['logo']);
  }
  
  renderLogos();
}

window.removeLogo = removeLogo;

async function handleFileUpload(event, type, previewElement, uploadArea, isSmall = false) {
  const file = event.target.files[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    alert('Please select an image file');
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    alert('File size must be less than 5MB');
    return;
  }

  // Convert to base64 for storage
  const reader = new FileReader();
  reader.onload = async (e) => {
    const base64 = e.target.result;
    const fileData = {
      name: file.name,
      type: file.type,
      size: file.size,
      data: base64,
    };

    await chrome.storage.local.set({ [type]: fileData });
    
    // Show preview (smaller version)
    previewElement.innerHTML = `
      <img src="${base64}" alt="Preview" style="max-width: 100%; max-height: ${isSmall ? '60px' : '100px'}; border-radius: 4px;">
      <button class="remove-btn" onclick="removeFile('${type}')" style="margin-top: 4px; font-size: 10px; padding: 2px 6px;">Remove</button>
    `;
    previewElement.classList.remove('hidden');
    uploadArea.classList.add('has-file');
  };
  reader.readAsDataURL(file);
}

async function handleSecondaryImageUpload(event) {
  const files = Array.from(event.target.files);
  if (files.length === 0) return;

  // Get current secondary images
  const result = await chrome.storage.local.get(['secondaryImages']);
  const currentImages = result.secondaryImages || [];

  // Check if we can add more (max 3)
  const remainingSlots = 3 - currentImages.length;
  if (remainingSlots <= 0) {
    alert('Maximum 3 secondary images allowed');
    return;
  }

  const filesToAdd = files.slice(0, remainingSlots);

  for (const file of filesToAdd) {
    if (!file.type.startsWith('image/')) {
      alert(`${file.name} is not an image file`);
      continue;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert(`${file.name} is too large (max 5MB)`);
      continue;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target.result;
      const imageData = {
        name: file.name,
        type: file.type,
        size: file.size,
        data: base64,
        id: Date.now() + Math.random(),
      };

      currentImages.push(imageData);
      await chrome.storage.local.set({ secondaryImages: currentImages });
      renderSecondaryImages();
    };
    reader.readAsDataURL(file);
  }

  event.target.value = '';
}

function renderSecondaryImages() {
  chrome.storage.local.get(['secondaryImages'], (result) => {
    const images = result.secondaryImages || [];
    const grid = document.getElementById('secondaryImagesGrid');
    const addBtn = document.getElementById('addSecondaryBtn');

    grid.innerHTML = '';

    images.forEach((imageData, index) => {
      const item = document.createElement('div');
      item.className = 'secondary-image-item';
      item.innerHTML = `
        <img src="${imageData.data}" alt="${imageData.name}">
        <button class="remove-btn" onclick="removeSecondaryImage(${index})" style="position: absolute; top: 4px; right: 4px; width: 20px; height: 20px; padding: 0; font-size: 12px; line-height: 1;">×</button>
      `;
      grid.appendChild(item);
    });

    // Add empty slots
    for (let i = images.length; i < 3; i++) {
      const emptySlot = document.createElement('div');
      emptySlot.className = 'secondary-image-item';
      emptySlot.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="opacity: 0.3;">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
        </svg>
      `;
      emptySlot.addEventListener('click', () => document.getElementById('secondaryInput').click());
      grid.appendChild(emptySlot);
    }

    addBtn.style.display = images.length >= 3 ? 'none' : 'block';
  });
}

async function removeSecondaryImage(index) {
  const result = await chrome.storage.local.get(['secondaryImages']);
  const images = result.secondaryImages || [];
  images.splice(index, 1);
  await chrome.storage.local.set({ secondaryImages: images });
  renderSecondaryImages();
}

window.removeSecondaryImage = removeSecondaryImage;

async function loadGeneratedImages() {
  const container = document.getElementById('generatedImagesContainer');
  const grid = document.getElementById('generatedImagesGrid');
  const emptyState = document.getElementById('emptyGeneratedState');

  try {
    // Fetch mockups from API
    const response = await fetch('http://localhost:3000/api/mockups?limit=20', {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch mockups');
    }

    const data = await response.json();
    const mockups = data.mockups || [];
    
    // Flatten image_urls from all mockups
    const images = [];
    mockups.forEach(mockup => {
      if (mockup.image_urls && Array.isArray(mockup.image_urls)) {
        mockup.image_urls.forEach(url => {
          images.push({
            url,
            mockupId: mockup.id,
            title: mockup.title,
          });
        });
      }
    });

    if (images.length === 0) {
      emptyState.style.display = 'block';
      grid.style.display = 'none';
    } else {
      emptyState.style.display = 'none';
      grid.style.display = 'grid';
      grid.innerHTML = '';

      images.forEach((image, index) => {
        const item = document.createElement('div');
        item.className = 'generated-image-item';
        item.innerHTML = `
          <img src="${image.url}" alt="${image.title || `Generated image ${index + 1}`}" style="width: 100%; height: auto; object-fit: contain; border-radius: 4px; cursor: pointer;" onclick="openDashboard()">
          <button class="download-btn" onclick="downloadImage('${image.url}', ${index})" title="Download Image">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
          </button>
        `;
        grid.appendChild(item);
      });
    }
  } catch (error) {
    console.error('[Tasy Popup] Error loading generated images:', error);
    // Fall back to showing empty state
    emptyState.style.display = 'block';
    grid.style.display = 'none';
  }
}

async function downloadImage(imageUrl, index) {
  try {
    console.log('[Tasy Popup] Downloading image:', imageUrl);
    
    // Fetch the image as a blob
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch image');
    }
    
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    
    // Create and trigger download
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = `tasy-generated-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
    
    console.log('[Tasy Popup] Download initiated');
  } catch (error) {
    console.error('[Tasy Popup] Download error:', error);
    // Fallback: open in new tab
    chrome.tabs.create({ url: imageUrl });
  }
}

function openDashboard() {
  chrome.tabs.create({ url: 'https://app.tasy.ai/dashboard' });
}

window.downloadImage = downloadImage;
window.openDashboard = openDashboard;

async function removeFile(type) {
  await chrome.storage.local.remove([type]);
  const previewElement = document.getElementById(`${type}Preview`);
  const uploadArea = document.getElementById(`${type}Upload`);
  const inputElement = document.getElementById(`${type}Input`);

  if (previewElement) {
    previewElement.classList.add('hidden');
    previewElement.innerHTML = '';
  }
  if (uploadArea) {
    uploadArea.classList.remove('has-file');
  }
  if (inputElement) {
    inputElement.value = '';
  }
  
  // If removing logo, also update context visibility
  if (type === 'logo' && isPinterest) {
    const logoSection = document.getElementById('logoSection');
    if (logoSection) {
      // Logo section should still be visible on Pinterest even if empty
    }
  }
}

// Make removeFile available globally
window.removeFile = removeFile;

async function loadSettings() {
  const result = await chrome.storage.local.get(['logos', 'logo', 'secondaryLogo', 'thirdLogo', 'product', 'accentColor']);

  // Migrate old logo format to new logos array if needed
  if (!result.logos && (result.logo || result.secondaryLogo || result.thirdLogo)) {
    const logos = [];
    if (result.logo) logos.push(result.logo);
    if (result.secondaryLogo) logos.push(result.secondaryLogo);
    if (result.thirdLogo) logos.push(result.thirdLogo);
    await chrome.storage.local.set({ logos: logos });
  }

  // Load logos (for Pinterest)
  renderLogos();

  // Load product (for Facebook)
  if (result.product) {
    const productPreview = document.getElementById('productPreview');
    const productUpload = document.getElementById('productUpload');
    if (productPreview && productUpload) {
      productPreview.innerHTML = `
        <img src="${result.product.data}" alt="Preview" style="max-width: 100%; max-height: 60px; border-radius: 4px;">
        <button class="remove-btn" onclick="removeFile('product')" style="margin-top: 4px; font-size: 10px; padding: 2px 6px;">Remove</button>
      `;
      productPreview.classList.remove('hidden');
      productUpload.classList.add('has-file');
    }
  }

  // Load secondary images (for Facebook)
  renderSecondaryImages();

  // Load color
  const colorInput = document.getElementById('colorInput');
  const colorValue = document.getElementById('colorValue');
  if (result.accentColor && colorInput && colorValue) {
    colorInput.value = result.accentColor;
    colorValue.textContent = result.accentColor;
  }
}

async function saveSettings() {
  const colorInput = document.getElementById('colorInput');
  await chrome.storage.local.set({ accentColor: colorInput.value });
}

async function loadCredits() {
  const creditsDisplay = document.getElementById('creditsDisplay');
  
  // Only load credits if settings content is visible (user is authenticated)
  const settingsContent = document.getElementById('settingsContent');
  if (settingsContent && settingsContent.classList.contains('hidden')) {
    return; // Don't load credits if auth page is showing
  }
  
  // If credits are already displayed from cache, don't fetch again
  // The checkAuthAndShowContent running in background will update them
  if (creditsDisplay && creditsDisplay.textContent && creditsDisplay.textContent !== '-- credits') {
    console.log('[Tasy Popup] Credits already loaded from cache');
    return;
  }
  
  try {
    // Try to get cached credits first
    const result = await chrome.storage.local.get(['userCredits']);
    if (result.userCredits !== undefined) {
      if (creditsDisplay) {
        creditsDisplay.textContent = `${result.userCredits} credits`;
      }
      console.log('[Tasy Popup] Showing cached credits:', result.userCredits);
    } else {
      if (creditsDisplay) {
        creditsDisplay.textContent = '-- credits';
      }
    }
  } catch (error) {
    console.error('[Tasy Popup] Error loading credits:', error);
    if (creditsDisplay) {
      creditsDisplay.textContent = '-- credits';
    }
  }
}
