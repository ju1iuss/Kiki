// Language detection and translation utilities

export type Language = 'en' | 'de';

// German-speaking countries (ISO country codes)
const GERMAN_COUNTRIES = ['DE', 'AT', 'CH'];

/**
 * Detects user's language based on their location
 * Returns 'de' for Germany, Austria, Switzerland; 'en' otherwise
 */
export async function detectLanguage(): Promise<Language> {
  try {
    // Try to detect via geolocation API (free service)
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    
    if (data.country_code && GERMAN_COUNTRIES.includes(data.country_code)) {
      return 'de';
    }
  } catch (error) {
    console.warn('Failed to detect location via API, falling back to browser locale');
  }
  
  // Fallback: check browser locale
  if (typeof window !== 'undefined') {
    const locale = navigator.language || (navigator as any).userLanguage;
    if (locale && (locale.startsWith('de') || locale.startsWith('de-'))) {
      return 'de';
    }
  }
  
  return 'en';
}

/**
 * Gets language from localStorage or detects it
 */
export function getLanguage(): Language | null {
  if (typeof window === 'undefined') return null;
  
  const stored = localStorage.getItem('language') as Language | null;
  if (stored === 'de' || stored === 'en') {
    return stored;
  }
  
  return null; // No stored preference
}

/**
 * Sets language in localStorage
 */
export function setLanguage(lang: Language): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('language', lang);
  }
}

