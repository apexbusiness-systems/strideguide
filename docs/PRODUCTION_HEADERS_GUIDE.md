# Production Headers & Caching Guide

## Cache-Control Strategy

### No-Store (Dynamic Content)
```
Cache-Control: no-store, no-cache, must-revalidate
```
Applied to:
- `/index.html` - Always fetch fresh to get latest SW version
- `/sw.js` - Service Worker must never be stale

### Immutable (Hashed Assets)
```
Cache-Control: public, max-age=31536000, immutable
```
Applied to:
- `/assets/*` - Vite-hashed JS/CSS bundles
- `/*.js` - JavaScript modules
- `/*.css` - Stylesheets
- `/icons/*` - Icon files
- `/audio/*` - Audio assets
- `/ml/*` - ML model files

## Platform-Specific Configuration

### Netlify
Use `netlify.toml` (already configured in project root)

### Vercel
Create `vercel.json`:
```json
{
  "headers": [
    {
      "source": "/index.html",
      "headers": [
        { "key": "Cache-Control", "value": "no-store" }
      ]
    },
    {
      "source": "/sw.js",
      "headers": [
        { "key": "Cache-Control", "value": "no-store" }
      ]
    },
    {
      "source": "/assets/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ]
}
```

### Cloudflare Pages
Create `_headers`:
```
/index.html
  Cache-Control: no-store

/sw.js
  Cache-Control: no-store

/assets/*
  Cache-Control: public, max-age=31536000, immutable
```

## Service Worker Behavior

### Production
- SW v3 caches only hashed assets from allowlist
- `index.html` and `sw.js` NEVER cached by SW
- Network-first for all non-allowlisted paths
- Update toast shown on new SW version

### Preview/Development
- SW registration skipped entirely
- All requests go to network
- Ensures fresh content during development

## Verification

After deployment, verify headers:

```bash
# Check index.html (should be no-store)
curl -I https://strideguide.cam/index.html

# Check SW (should be no-store)
curl -I https://strideguide.cam/sw.js

# Check hashed asset (should be immutable)
curl -I https://strideguide.cam/assets/index-abc123.js
```

Expected responses:
- index.html: `Cache-Control: no-store`
- sw.js: `Cache-Control: no-store`
- /assets/*: `Cache-Control: public, max-age=31536000, immutable`

## Update Flow

1. Deploy new version with changed code
2. Browser fetches fresh `index.html` (no-store)
3. Fresh HTML loads new `sw.js` (no-store)
4. New SW installs and fires `updatefound` event
5. UpdateToast component shows "New version available"
6. User clicks "Reload" → app refreshes with new code
7. New hashed assets cached for instant offline access

## Troubleshooting

**Users see old version after deploy:**
- Check production headers are set correctly
- Verify SW registration is using `updateViaCache: 'none'`
- Ask users to use "Reset App Cache" button in Settings

**Hashed assets not caching:**
- Verify files match allowlist patterns in SW
- Check browser DevTools → Application → Cache Storage
- Ensure headers have `immutable` directive

**Deep links return 404:**
- Verify SPA redirect rule is active
- Check hosting platform configuration
- Test with direct navigation to `/app/guidance`
