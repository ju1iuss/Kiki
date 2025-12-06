# Quick Fix for Cookie Issue

## Problem
Chrome extensions can't read HttpOnly cookies (like Supabase auth cookies). We need a different approach.

## Solution: Use Session Token from Extension Popup

Since the extension can't read HttpOnly cookies, we'll:
1. Have users log in through the extension popup (which opens tasy.ai)
2. Get the session token and store it in `chrome.storage`
3. Use that token for API calls

## Alternative Solution: Use Web Page Message Passing

The extension could inject a script into tasy.ai pages that can access the session, then pass it to the extension.

## For Now: Test Locally

1. Make sure your Next.js dev server is running:
   ```bash
   npm run dev
   ```

2. Reload the extension in Chrome

3. The extension will now call `http://localhost:3000` instead of production

## Cookie Access Issue

The extension found these cookies:
- `_hjSessionUser_3662153` (HotJar)
- `_hjSession_3662153` (HotJar)

No Supabase cookies found because they're HttpOnly and can't be accessed by extensions.

Supabase cookies would be named like:
- `sb-zcftkbpfekuvatkiiujq-auth-token`
- `sb-zcftkbpfekuvatkiiujq-auth-token-code-verifier`

## Next Steps

1. Test with localhost to verify the API routes work
2. Implement proper auth flow (store token in chrome.storage)
3. Deploy API routes to production

