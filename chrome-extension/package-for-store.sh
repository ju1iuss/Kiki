#!/bin/bash

# Script to package Chrome extension for Chrome Web Store submission
# Usage: ./package-for-store.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
EXTENSION_NAME="tasy-ad-copier"
OUTPUT_DIR="$SCRIPT_DIR/../"
ZIP_FILE="$OUTPUT_DIR/${EXTENSION_NAME}.zip"

echo "📦 Packaging Chrome extension for Chrome Web Store..."
echo ""

# Check if manifest.json exists
if [ ! -f "$SCRIPT_DIR/manifest.json" ]; then
    echo "❌ Error: manifest.json not found!"
    exit 1
fi

# Remove old ZIP if exists
if [ -f "$ZIP_FILE" ]; then
    echo "🗑️  Removing old ZIP file..."
    rm "$ZIP_FILE"
fi

# Create ZIP file excluding unnecessary files
echo "📝 Creating ZIP file..."
cd "$SCRIPT_DIR"

zip -r "$ZIP_FILE" . \
    -x "*.git*" \
    -x "*.DS_Store" \
    -x "*.md" \
    -x "DEBUG.md" \
    -x "TROUBLESHOOTING.md" \
    -x "QUICK-FIX.md" \
    -x "README.md" \
    -x "IMAGE_REQUIREMENTS.md" \
    -x "PUBLISHING_GUIDE.md" \
    -x "package-for-store.sh" \
    -x "*.sh" \
    > /dev/null

# Verify ZIP structure
echo "✅ Verifying ZIP structure..."
if unzip -l "$ZIP_FILE" | grep -q "manifest.json"; then
    echo "✅ manifest.json found in ZIP"
else
    echo "❌ Error: manifest.json not found in ZIP!"
    exit 1
fi

# Show ZIP contents
echo ""
echo "📋 ZIP file contents:"
unzip -l "$ZIP_FILE" | head -20

# Get file size
FILE_SIZE=$(du -h "$ZIP_FILE" | cut -f1)
echo ""
echo "✅ Successfully created: $ZIP_FILE"
echo "📊 File size: $FILE_SIZE"
echo ""
echo "🚀 Next steps:"
echo "   1. Go to https://chrome.google.com/webstore/devconsole"
echo "   2. Click 'Add new item'"
echo "   3. Upload: $ZIP_FILE"
echo "   4. Follow the PUBLISHING_GUIDE.md for complete instructions"

