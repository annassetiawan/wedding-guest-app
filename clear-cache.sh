#!/bin/bash

echo "🧹 Clearing Next.js cache..."

# Remove Next.js build cache
rm -rf .next

# Remove node_modules cache
rm -rf node_modules/.cache

# Remove turbopack cache
rm -rf .turbopack

echo "✅ Cache cleared successfully!"
echo ""
echo "Now restart your dev server:"
echo "  npm run dev"
