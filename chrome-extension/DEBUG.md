# Debugging Chrome Extension

## Where to Check Logs

### 1. Content Script Logs (Facebook Ads Library page)
- Open Facebook Ads Library
- Press F12 to open DevTools
- Go to **Console** tab
- Look for logs starting with `[Tasy Extension]`

### 2. Background Script Logs (Service Worker)
- Go to `chrome://extensions/`
- Find "Tasy Ad Copier"
- Click **"service worker"** link (or "Inspect views: service worker")
- This opens DevTools for the background script
- Go to **Console** tab
- Look for logs starting with `[Tasy Extension Background]`

### 3. Popup Logs
- Click the extension icon
- Right-click inside the popup
- Select "Inspect"
- Go to **Console** tab

## Common Issues

### Authentication Not Working

1. **Check cookies:**
   - Open Background Script console (see above)
   - Look for "Found cookies" and "Cookie names" logs
   - Should see Supabase cookies like `sb-*-auth-token`

2. **Check API response:**
   - Look for "Response status" logs
   - Status 401 = not authenticated
   - Status 200 = authenticated

3. **Verify you're logged in:**
   - Go to https://tasy.ai
   - Make sure you're logged in
   - Check browser cookies: DevTools → Application → Cookies → tasy.ai
   - Should see `sb-*-auth-token` cookies

### CSP Errors

- Facebook blocks inline event handlers
- All handlers are now attached via `addEventListener`
- If you still see CSP errors, check for any remaining inline handlers

## Testing Steps

1. Open Background Script console
2. Go to Facebook Ads Library
3. Open Content Script console (F12 on Facebook page)
4. Click plus icon on an ad
5. Watch both consoles for logs
6. Check for any errors

