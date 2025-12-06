# Permission Justifications for Chrome Web Store

Use these justifications when filling out the Privacy tab in the Chrome Web Store Developer Dashboard.

## Single Purpose Description

**Tasy Ad Copier helps users copy and adapt Facebook and Pinterest ads for their brand using AI-powered content transformation. The extension extracts ad content from competitor ads and transforms it into personalized marketing content.**

## Permission Justifications

### 1. `activeTab` Permission

**Justification:**
The `activeTab` permission is required to interact with Facebook Ads Library and Pinterest pages when the user clicks the extension's action button. This allows the extension to:
- Access the current tab's DOM to extract ad content (images, text, links)
- Inject UI elements (copy buttons) into Facebook Ads Library and Pinterest pages
- Read page content only when the user explicitly activates the extension

**Why it's necessary:**
Without this permission, the extension cannot access the content of Facebook Ads Library or Pinterest pages to extract ad information for adaptation.

---

### 2. `storage` Permission

**Justification:**
The `storage` permission is used to:
- Store user authentication tokens and session information for Tasy.ai service
- Save user preferences (accent colors, logo selections, product images)
- Cache user settings to improve user experience across sessions
- Store generated image data temporarily before upload

**Why it's necessary:**
User preferences and authentication state must persist between browser sessions. Without storage, users would need to re-authenticate and reconfigure settings every time they use the extension.

**Data stored:**
- Authentication tokens (encrypted)
- User preferences (colors, logos, product images)
- No personally identifiable information is stored locally

---

### 3. `scripting` Permission

**Justification:**
The `scripting` permission is required to:
- Inject content scripts that add copy buttons and UI elements on Facebook Ads Library and Pinterest pages
- Dynamically modify page content to display extension functionality
- Extract ad content from the page DOM

**Why it's necessary:**
Content scripts must be injected into Facebook and Pinterest pages to add the extension's functionality (copy buttons, UI overlays). This permission allows the extension to programmatically inject and execute scripts on these specific domains.

**Where it's used:**
- Facebook Ads Library pages (`facebook.com/ads/library/*`)
- Pinterest pages (`pinterest.com/*`)

---

### 4. `cookies` Permission

**Justification:**
The `cookies` permission is required to:
- Manage authentication sessions with Tasy.ai service
- Maintain user login state across extension and web app interactions
- Handle OAuth authentication flows securely

**Why it's necessary:**
The extension integrates with Tasy.ai web service for AI-powered ad adaptation. Authentication cookies are required to maintain secure sessions and ensure users are properly authenticated when making API requests.

**Data accessed:**
- Only cookies from `tasy.ai` and `*.tasy.ai` domains
- Authentication tokens only
- No third-party cookies accessed

---

### 5. Host Permissions

#### Facebook (`https://www.facebook.com/ads/library/*`, `https://*.facebook.com/ads/library/*`)

**Justification:**
Facebook Ads Library is the primary source for competitor ad content. The extension needs access to:
- Extract ad images, text, and metadata from Facebook Ads Library
- Inject copy buttons and UI elements on these pages
- Read page content to identify ad elements

**Why it's necessary:**
Facebook Ads Library is a public tool where users browse competitor ads. The extension enhances this experience by allowing users to copy and adapt these ads for their own use.

**User benefit:**
Users can quickly extract and adapt competitor ad content without manual copying, saving significant time in marketing content creation.

---

#### Pinterest (`https://www.pinterest.com/*`, `https://*.pinterest.com/*`)

**Justification:**
Pinterest is a source for visual marketing inspiration. The extension needs access to:
- Extract pin images and content from Pinterest boards
- Inject copy buttons on Pinterest pages
- Read page content to identify pin elements

**Why it's necessary:**
Pinterest is a popular platform for marketing inspiration. The extension allows users to extract and adapt Pinterest content for their own ad campaigns.

**User benefit:**
Users can quickly adapt Pinterest content for their Facebook ad campaigns, streamlining their marketing workflow.

---

#### Tasy.ai (`https://tasy.ai/*`, `https://*.tasy.ai/*`)

**Justification:**
Tasy.ai is the extension's backend service that provides:
- AI-powered ad adaptation and transformation
- User authentication and account management
- Image processing and generation services
- API endpoints for ad content transformation

**Why it's necessary:**
The extension is a client for the Tasy.ai service. It requires access to communicate with Tasy.ai APIs for:
- User authentication (OAuth flows)
- Sending ad content for AI processing
- Receiving adapted ad content
- Managing user accounts and credits

**Data transmitted:**
- Ad content (images, text) for processing
- User authentication tokens
- User preferences and settings
- No personal data beyond what's necessary for service functionality

---

## Data Collection and Usage

### What data is collected:
1. **Ad Content**: Images and text from Facebook Ads Library and Pinterest (user-selected)
2. **User Preferences**: Colors, logos, product images (stored locally)
3. **Authentication Data**: Tokens for Tasy.ai service (encrypted, stored locally)
4. **Usage Data**: Extension usage statistics (optional, for improvement)

### How data is used:
1. **Ad Content**: Processed by AI to create adapted versions for user's brand
2. **User Preferences**: Used to personalize ad adaptations
3. **Authentication Data**: Maintains secure session with Tasy.ai service
4. **Usage Data**: Used to improve extension functionality (if collected)

### Data sharing:
- Ad content is sent to Tasy.ai for AI processing
- No data is shared with third parties
- No data is sold or used for advertising purposes

### Data storage:
- User preferences: Stored locally in browser
- Authentication tokens: Stored locally (encrypted)
- Ad content: Processed and not permanently stored
- Generated images: Stored on Tasy.ai servers (user's account)

---

## Privacy Policy

A comprehensive privacy policy is available at: `https://app.tasy.ai/privacy-policy`

This policy covers:
- Detailed data collection practices
- How data is used and processed
- User rights and data control
- Security measures
- Contact information for privacy inquiries

