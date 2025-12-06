# Chrome Extension Image Requirements

## Required Icon Images

You need to create the following PNG icon files in the `chrome-extension/icons/` directory:

1. **icon-16.png** - 16x16 pixels
   - Used in the browser toolbar
   - Should be clear and recognizable at small size

2. **icon-48.png** - 48x48 pixels
   - Used in the Chrome extension management page
   - Medium detail level

3. **icon-128.png** - 128x128 pixels
   - Used in the Chrome Web Store listing
   - High detail level, this is what users see when browsing extensions

## Design Guidelines

- All icons should use the same design/logo
- Use PNG format (not ICO)
- Ensure icons are clear and recognizable at all sizes
- Consider using your Tasy logo/branding
- Icons should have a transparent background or solid color background that matches your brand

## Current Status

The manifest.json has been updated to reference these new icon files. Once you create the images, the extension will use them automatically.

