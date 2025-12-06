/**
 * Onboarding Storage Utilities
 * Handles sessionStorage persistence for onboarding data
 */

export interface OnboardingData {
  logo?: string | null; // Base64 or URL
  logoType?: 'uploaded' | 'sample';
  sampleLogoType?: 'fashion' | 'beauty' | 'tech';
  goal?: string;
  customGoal?: string;
  creatingFor?: string[];
  aestheticVibe?: string[];
  contentType?: string[];
  platforms?: string[];
  usage?: string;
  generatedImages?: string[];
  email?: string;
  name?: string;
  [key: string]: any;
}

const STORAGE_KEY = 'tasy_onboarding_data';

export function saveOnboardingData(data: Partial<OnboardingData>): void {
  if (typeof window === 'undefined') return;
  
  const existing = getOnboardingData();
  const updated = { ...existing, ...data };
  const jsonData = JSON.stringify(updated);
  
  // Save to both sessionStorage and localStorage for consistency
  // sessionStorage is primary, localStorage is backup (especially for images)
  sessionStorage.setItem(STORAGE_KEY, jsonData);
  localStorage.setItem(STORAGE_KEY, jsonData);
}

export function getOnboardingData(): OnboardingData {
  if (typeof window === 'undefined') return {};
  
  try {
    // Check sessionStorage first (preferred)
    let stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    
    // Fallback to localStorage (for images saved during onboarding)
    stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      // Sync to sessionStorage for consistency
      sessionStorage.setItem(STORAGE_KEY, stored);
      return data;
    }
    
    return {};
  } catch {
    return {};
  }
}

export function clearOnboardingData(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(STORAGE_KEY);
}

export function getOnboardingStep(): number {
  if (typeof window === 'undefined') return 1;
  
  try {
    const step = sessionStorage.getItem('tasy_onboarding_step');
    return step ? parseInt(step, 10) : 1;
  } catch {
    return 1;
  }
}

export function saveOnboardingStep(step: number): void {
  // Don't persist onboarding step - always start fresh
  // This ensures users start from the beginning when they log out and click "Get Started"
  if (typeof window === 'undefined') return;
  // Intentionally not saving to storage
}

export function clearOnboardingStep(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem('tasy_onboarding_step');
}

/**
 * Saves onboarding images to the user's profile after signup
 * This should be called after successful authentication
 * Includes retry logic for reliability
 */
export async function saveOnboardingImages(maxRetries: number = 3): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  
  try {
    const onboardingData = getOnboardingData();
    const { generatedImages, logo } = onboardingData;
    
    // Only save if we have generated images
    if (!generatedImages || !Array.isArray(generatedImages) || generatedImages.length === 0) {
      console.log('No generated images to save');
      return false;
    }
    
    // Check if images were already saved (prevent duplicate saves)
    if (onboardingData.imagesSaved) {
      console.log('Images already saved, skipping');
      return true;
    }
    
    // Retry logic for saving images
    let lastError: Error | null = null;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch('/api/onboarding/save-images', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            images: generatedImages,
            logo: logo || null,
          }),
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
        
        const result = await response.json();
        
        // Mark images as saved to prevent duplicate saves
        saveOnboardingData({ imagesSaved: true });
        
        console.log(`Successfully saved ${result.count || generatedImages.length} images`);
        return true;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.warn(`Attempt ${attempt}/${maxRetries} failed to save images:`, lastError.message);
        
        // Wait before retrying (exponential backoff)
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    }
    
    // All retries failed
    console.error('Failed to save onboarding images after all retries:', lastError);
    return false;
  } catch (error) {
    console.error('Error saving onboarding images:', error);
    return false;
  }
}
