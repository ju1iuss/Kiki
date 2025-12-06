# Publishing Your Chrome Extension to Chrome Web Store

## Prerequisites Checklist

Before publishing, ensure your extension has:
- ✅ Valid `manifest.json` with required fields (name, version, description, icons)
- ✅ All required icon sizes (16px, 48px, 128px)
- ✅ Proper permissions (only request what you need)
- ✅ Tested and working in Developer Mode

## Step 1: Create Developer Account ($5 one-time fee)

1. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. Sign in with your Google account
3. Agree to the developer agreement and policies
4. Pay the **one-time $5 registration fee** (required)
5. Complete account setup:
   - Add developer email (use a dedicated email you check regularly)
   - Choose trader or non-trader account type
   - Verify your email address

**Important**: Use a dedicated email account for publishing, as you'll receive important notifications here.

## Step 2: Prepare Your Extension Package

### Create ZIP File

Your extension must be packaged as a ZIP file with `manifest.json` at the root:

```bash
cd chrome-extension
zip -r ../tasy-ad-copier.zip . -x "*.git*" -x "*.md" -x "DEBUG.md" -x "TROUBLESHOOTING.md" -x "QUICK-FIX.md" -x "README.md" -x "IMAGE_REQUIREMENTS.md"
```

**Important**: 
- Don't include `.git` folders, `.gitignore`, or documentation files
- Ensure `manifest.json` is at the root of the ZIP
- Include all necessary files (JS, CSS, icons, HTML)

### Verify Your Manifest

Your `manifest.json` should have:
- ✅ `name`: "Tasy Ad Copier" (max 45 characters for display)
- ✅ `version`: "1.0.0" (must increment for updates)
- ✅ `description`: Clear description (max 132 characters)
- ✅ `icons`: All sizes (16, 48, 128)
- ✅ `permissions`: Only what's necessary

## Step 3: Upload Your Extension

1. Go to [Chrome Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. Click **"Add new item"** button
3. Click **"Choose file"** and select your ZIP file
4. Click **"Upload"**

If successful, you'll see your extension in the dashboard and can edit its details.

## Step 4: Fill Out Store Listing Information

Complete all required tabs in the left-hand menu:

### Package Tab
- Automatically populated from your uploaded ZIP
- Verify version number and file size

### Store Listing Tab
- **Title**: "Tasy Ad Copier" (or your preferred name)
- **Description**: 
  ```
  Copy and adapt Facebook & Pinterest ads for your brand using AI. 
  Transform competitor ads into personalized marketing content instantly.
  ```
- **Category**: Choose appropriate category (e.g., "Productivity" or "Marketing")
- **Language**: Select primary language
- **Store Icon**: Upload 128x128px icon
- **Screenshots**: 
  - At least 1 screenshot required (1280x800 or 640x400)
  - Show your extension in action
  - Recommended: 3-5 screenshots showing key features
- **Promotional Images** (optional but recommended):
  - Small promo tile: 440x280
  - Large promo tile: 920x680
  - Marquee promo tile: 1400x560

### Privacy Tab (CRITICAL)
This is the most important section for approval:

1. **Single Purpose Description**: 
   - Provide a clear, concise description of your extension's single purpose
   - Example: "This extension helps users copy and adapt Facebook and Pinterest ads for their brand using AI-powered content transformation."

2. **Permission Justifications**: 
   For each permission in your manifest, explain why it's needed:
   
   - **activeTab**: "Required to interact with Facebook Ads Library and Pinterest pages to extract ad content"
   - **storage**: "Stores user authentication tokens and preferences"
   - **scripting**: "Injects content scripts to add copy buttons and UI elements on Facebook and Pinterest pages"
   - **cookies**: "Manages authentication sessions with Tasy.ai service"
   - **Host permissions** (facebook.com, pinterest.com, tasy.ai): "Required to access Facebook Ads Library, Pinterest content, and communicate with Tasy.ai API for ad adaptation"

3. **Privacy Policy URL**: 
   - Required if you collect user data
   - Must be publicly accessible
   - Should explain what data you collect and how you use it

4. **Data Handling**: 
   - Declare what user data you collect (if any)
   - Explain how data is used and stored

### Distribution Tab

- **Visibility Options**:
  - **Public**: Anyone can find and install (recommended for public release)
  - **Unlisted**: Only people with the link can install (still searchable!)
  - **Private**: Only specific users/groups can install

- **Countries**: Select countries where extension will be available
- **Pricing**: Set to "Free" (or configure if paid)

### Test Instructions Tab (Optional)
Only needed if your extension requires special testing credentials or setup.

## Step 5: Submit for Review

1. Review all tabs to ensure everything is complete
2. Click **"Why can't I submit?"** link if the submit button is disabled
   - This will show what's missing
3. Once all requirements are met, click **"Submit for Review"**
4. Choose publishing option:
   - ✅ **Auto-publish**: Extension goes live automatically after approval
   - ⬜ **Deferred**: You manually publish after approval

## Step 6: Review Process

- **Review Time**: Typically 1-3 business days, can take up to several weeks
- **Notifications**: You'll receive email updates about review status
- **Common Rejection Reasons**:
  - Insufficient permission justifications
  - Privacy policy missing or incomplete
  - Screenshots don't match functionality
  - Violation of Chrome Web Store policies

## Step 7: After Approval

Once approved:
- Your extension will be live on Chrome Web Store
- Users can search and install it
- You'll receive an extension ID (save this for future updates)
- Monitor reviews and analytics in the dashboard

## Updating Your Extension

For future updates:
1. Increment version number in `manifest.json`
2. Create new ZIP file
3. Go to your extension in dashboard
4. Click "Upload new package"
5. Submit for review (updates usually review faster)

## Important Notes

- **Maximum Extensions**: You can have up to 20 extensions published
- **MFA Required**: Your Google account must have 2-Step Verification enabled
- **Keep PEM File**: If you pack extension locally, keep the `.pem` file for future updates (maintains same extension ID)
- **Privacy Policy**: Required if you collect any user data

## Resources

- [Official Publishing Guide](https://developer.chrome.com/docs/webstore/publish/)
- [Developer Dashboard](https://chrome.google.com/webstore/devconsole)
- [Chrome Web Store Policies](https://developer.chrome.com/docs/webstore/program-policies/)
- [Review Process FAQ](https://developer.chrome.com/docs/webstore/faq/)

## Quick Command Reference

```bash
# Create ZIP file (from chrome-extension directory)
zip -r ../tasy-ad-copier.zip . \
  -x "*.git*" \
  -x "*.md" \
  -x "DEBUG.md" \
  -x "TROUBLESHOOTING.md" \
  -x "QUICK-FIX.md" \
  -x "README.md" \
  -x "IMAGE_REQUIREMENTS.md"

# Verify ZIP structure (manifest.json should be at root)
unzip -l tasy-ad-copier.zip | head -20
```

Good luck with your publication! 🚀

