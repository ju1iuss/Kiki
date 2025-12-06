# Tasy - Instant Replace Chrome Extension

Chrome extension that creates Instagram ready Stories - within seconds. Extract and adapt content from Facebook Ads Library and Pinterest.

## Features

- **Plus Icons on Hover**: Shows plus icons when hovering over ads in Facebook Ads Library
- **AI-Powered Replication**: Uses Gemini 2 for text adaptation and nanobanana-pro for image generation
- **Brand Customization**: Upload product images, brand images, and set accent colors
- **Credit-Based**: Uses Tasy credits system (1 credit per replication)
- **Dashboard Integration**: View all replicated ads in Tasy dashboard

## Setup

### 1. Supabase Secrets

Add these secrets to your Supabase project:
```bash
supabase secrets set GEMINI_API_KEY=your_gemini_key
supabase secrets set FAL_KEY=your_fal_key
```

### 2. Deploy Edge Functions

```bash
supabase functions deploy chrome-adapt-ad
supabase functions deploy chrome-save-ad
supabase functions deploy chrome-auth
```

### 3. Database Migration

Run the migration:
```bash
supabase migration up
```

### 4. Build & Load Extension

1. Create extension icons (16x16, 48x48, 128x128) and place in `chrome-extension/icons/`
2. Load extension in Chrome:
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select `chrome-extension` folder

### 5. Authentication

The extension uses cookie-based authentication. Users need to:
1. Log in to tasy.ai in the same browser
2. The extension will use the session cookie for API calls

## File Structure

- `manifest.json` - Extension configuration
- `background.js` - Service worker for API calls
- `content.js` - Injected into Facebook Ads Library pages
- `content.css` - Styles for injected elements
- `popup.html/js` - Extension popup UI with logo, uploads, color picker
- `README.md` - This file

## API Endpoints

All endpoints proxy to Supabase Edge Functions:
- `GET /api/chrome-extension/auth` → `chrome-auth` Edge Function
- `POST /api/chrome-extension/adapt-ad` → `chrome-adapt-ad` Edge Function
- `POST /api/chrome-extension/save-ad` → `chrome-save-ad` Edge Function

## Edge Functions

- `chrome-adapt-ad` - Adapts ad text with Gemini 2 and generates image with nanobanana-pro
- `chrome-save-ad` - Saves replicated ad to database
- `chrome-auth` - Checks authentication and returns user credits/subscription

## Chrome Web Store Submission

1. Create account at https://chrome.google.com/webstore/devconsole ($5 one-time)
2. Prepare:
   - Icons (16x16, 48x48, 128x128)
   - Screenshots (1280x800 or 640x400)
   - Privacy policy URL
3. Zip the extension folder
4. Upload and submit for review

## How It Works

1. User visits Facebook Ads Library
2. Extension injects plus icons that appear on hover over ads
3. Clicking a plus icon:
   - Extracts ad data (headline, text, CTA, image)
   - Adapts text using Gemini 2
   - Generates new image using nanobanana-pro
   - Saves to database (costs 1 credit)
4. Shows beautiful side-by-side comparison of original vs replicated ad
5. View all replicated ads in `/ads` dashboard
