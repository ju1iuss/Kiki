# Troubleshooting Chrome Extension Authentication

## Current Issue: Authentication Failing

The extension is showing "Not authenticated" even when logged into tasy.ai.

## Debugging Steps

### 1. Check Background Script Logs

1. Go to `chrome://extensions/`
2. Find "Tasy Ad Copier"
3. Click **"service worker"** link
4. Open **Console** tab
5. Look for logs starting with `[Tasy Extension Background]`

**What to look for:**
- `Found cookies: X` - Should show number of cookies found
- `Cookie names: [...]` - Should list all cookie names
- `Auth cookies found: X` - Should show Supabase auth cookies
- `Response status: 401` - This means authentication failed

### 2. Check Server Logs

Check your Next.js server logs (where you're running `npm run dev` or production logs).

Look for logs starting with `[Chrome Extension API]`:
- `Cookie header present: true/false`
- `Parsed cookies count: X`
- `Cookie names: [...]`
- `Auth cookies found: X`
- `Session check - has session: true/false`

### 3. Manual Cookie Check

In Background Script console, run:
```javascript
chrome.runtime.sendMessage({ action: 'debugAuth' }, (response) => {
  console.log('Debug result:', response);
});
```

This will show:
- How many cookies were found
- Cookie names
- Auth check result

### 4. Check Browser Cookies

1. Go to https://www.tasy.ai
2. Open DevTools (F12)
3. Go to **Application** tab → **Cookies** → `https://www.tasy.ai`
4. Look for cookies starting with `sb-` (Supabase cookies)
5. Common names:
   - `sb-<project-id>-auth-token`
   - `sb-<project-id>-auth-token-code-verifier`
   - `sb-access-token`
   - `sb-refresh-token`

### 5. Common Issues

#### Issue: No cookies found
**Solution:** Make sure you're logged into tasy.ai in the same browser

#### Issue: Cookies found but no session
**Possible causes:**
- Cookies are HttpOnly (can't be read by extension)
- Cookies are for wrong domain
- Session expired

**Solution:** Try logging out and logging back in to tasy.ai

#### Issue: CORS errors
**Solution:** Already fixed - using `www.tasy.ai` instead of `tasy.ai`

## Expected Cookie Names

Supabase uses cookies like:
- `sb-<project-id>-auth-token`
- `sb-<project-id>-auth-token-code-verifier`
- `sb-access-token` (if using custom names)
- `sb-refresh-token` (if using custom names)

Where `<project-id>` is your Supabase project ID (e.g., `zcftkbpfekuvatkiiujq`).

## Next Steps

1. Check Background Script console logs
2. Check server logs
3. Run debug function
4. Share the logs with developer

