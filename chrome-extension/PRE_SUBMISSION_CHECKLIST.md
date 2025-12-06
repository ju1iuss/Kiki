# Pre-Submission Checklist

Use this checklist before submitting your extension to Chrome Web Store.

## ✅ Manifest Requirements

- [x] `manifest_version`: 3 (correct)
- [x] `name`: "Tasy Ad Copier" (present)
- [x] `version`: "1.0.0" (present)
- [x] `description`: Present and under 132 characters
- [x] `icons`: All sizes (16, 48, 128) present
- [x] **COMPLETED**: Removed `http://localhost:3000/*` from `host_permissions` and `web_accessible_resources`

## ✅ Files & Assets

- [x] All icon files exist (icon-16.png, icon-48.png, icon-128.png)
- [x] All JavaScript files referenced in manifest exist (auth-helper.js, background.js, content.js, pinterest-content.js, popup.js)
- [x] All CSS files referenced in manifest exist (content.css)
- [x] popup.html exists
- [x] Production manifest ready (localhost removed)
- [ ] No test/debug files included in ZIP (will be excluded by packaging script)
- [ ] No .git folders or .gitignore files in ZIP (will be excluded by packaging script)

## ✅ Store Listing Assets

- [ ] **Store Icon**: 128x128px PNG ready
- [ ] **Screenshots**: At least 1 screenshot (1280x800 or 640x400)
  - [ ] Screenshot showing Facebook Ads Library integration
  - [ ] Screenshot showing Pinterest integration
  - [ ] Screenshot showing the popup/UI
- [ ] **Promotional Images** (optional but recommended):
  - [ ] Small promo tile: 440x280
  - [ ] Large promo tile: 920x680

## ✅ Privacy & Permissions

- [x] **Privacy Policy Template**: Created (PRIVACY_POLICY_TEMPLATE.md)
  - [ ] **ACTION NEEDED**: Host privacy policy at https://app.tasy.ai/privacy-policy
- [x] **Single Purpose Description**: Written and ready (see PERMISSION_JUSTIFICATIONS.md)
- [x] **Permission Justifications**: Prepared for each permission (see PERMISSION_JUSTIFICATIONS.md):
  - [x] `activeTab` justification
  - [x] `storage` justification
  - [x] `scripting` justification
  - [x] `cookies` justification
  - [x] Host permissions justification (Facebook, Pinterest, Tasy.ai)

## ✅ Testing

- [ ] Extension tested in Developer Mode
- [ ] All features work correctly
- [ ] No console errors
- [ ] Works on Facebook Ads Library
- [ ] Works on Pinterest
- [ ] Authentication flow works
- [ ] Popup works correctly

## ✅ Account Setup

- [ ] Google account ready
- [ ] $5 payment method ready
- [ ] Dedicated email account for developer notifications
- [ ] 2-Step Verification enabled on Google account

## ✅ Content & Description

- [x] Store listing description written (see STORE_LISTING_CONTENT.md)
- [x] Category selected (Productivity/Marketing)
- [x] Language selected (English)
- [x] Keywords/tags prepared (see STORE_LISTING_CONTENT.md)

## ✅ Distribution Settings

- [ ] Visibility option chosen (Public/Unlisted/Private)
- [ ] Countries selected
- [ ] Pricing set (Free/Paid)

## ⚠️ Important Notes

### About localhost Permission

✅ **COMPLETED**: Removed `http://localhost:3000/*` from host_permissions and web_accessible_resources in production manifest.

### Privacy Policy

If your extension:
- Collects user data
- Stores user information
- Sends data to external servers

You **must** have a privacy policy URL. Even if you don't collect data, having one is recommended.

## Quick Test

Run the packaging script to verify everything is ready:

```bash
cd chrome-extension
./package-for-store.sh
```

Check the generated ZIP file to ensure:
- manifest.json is at the root
- All required files are included
- No unnecessary files are included

## Ready to Submit?

Once all items are checked, you're ready to:
1. Create your developer account ($5)
2. Upload your ZIP file
3. Fill out all the store listing information
4. Submit for review

Good luck! 🚀

