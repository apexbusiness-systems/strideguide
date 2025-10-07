# StrideGuide PWA Icon Configuration

## Current Status: Samsung Icon Mode ✅

**Flag:** `USE_SAMSUNG_PWA = true` (see `/public/config/pwa-icons.json`)

---

## What's Deployed

### PWA Manifest Icons (`/public/manifest.json`)
- ✅ `/android-chrome-192x192.png` (192×192) – **Source:** `ic_launcher_foreground.png`
- ✅ `/android-chrome-512x512.png` (512×512) – **Source:** `galaxy_store_icon_512.png` (Samsung squircle-safe)
- ✅ `/maskable_icon_512.png` (512×512, maskable) – **Source:** `maskable_512.png` (One UI optimized)

### Apple/iOS
- ✅ `/apple-touch-icon.png` (1024×1024, will be auto-scaled to 180×180 by iOS) – **Source:** `master_1024.png`

### Favicons
- ✅ `/favicon-32x32.png` – **Source:** `ic_launcher.png` (scaled)
- ✅ `/favicon-16x16.png` – **Source:** `ic_launcher.png` (scaled)

---

## Asset Inventory (Uploaded)

### ✅ Samsung/Web Assets
- `master_1024.png` – Master icon with iOS-style rounded corners (1024×1024)
- `galaxy_store_icon_512.png` – Samsung Galaxy Store listing icon (512×512, squircle-safe)
- `maskable_512.png` – PWA maskable icon (512×512, One UI safe zone)
- `oneui_squircle_preview_1024.png` – Visual preview of Samsung One UI masking

### ✅ Android Adaptive Components
- `ic_launcher_foreground.png` – Adaptive icon foreground layer (transparent BG)
- `ic_launcher_background.png` – Adaptive icon background layer (solid black)
- `ic_launcher_monochrome.png` – Material You monochrome icon (white)
- `ic_launcher.xml` – Adaptive icon XML manifest
- `ic_launcher_round.xml` – Adaptive icon round variant XML

### ⚠️ Missing Assets (for future native builds)
- **iPhone icons:** All sizes referenced in `Contents.json` (20pt@2x/3x, 29pt@2x/3x, 40pt@2x/3x, 60pt@2x/3x)
- **Android density PNGs:** mdpi, hdpi, xhdpi, xxhdpi, xxxhdpi variants
- These are only needed if you set up Capacitor for native iOS/Android builds

---

## Switching Icons

### To Use Standard Android Icons (Future)
1. Set `USE_SAMSUNG_PWA = false` in `/public/config/pwa-icons.json`
2. Regenerate PWA icons from `ic_launcher_foreground.png` or `master_1024.png`:
   - Create centered 192×192 from adaptive foreground
   - Create 512×512 from master (no Samsung squircle padding)
3. Update `/public/manifest.json` icon paths if needed
4. Rebuild and redeploy

---

## Verification Checklist

### PWA (Web)
- [ ] **Samsung device:** Add to home screen → icon shows correctly, no white squircle edges
- [ ] **Pixel/Stock Android:** Maskable icon renders correctly on home screen
- [ ] **iOS (Safari):** Add to home screen → 180×180 touch icon appears (auto-scaled from 1024)
- [ ] **Desktop browsers:** Favicons appear in tabs (32×32, 16×16)
- [ ] **Lighthouse:** Run PWA audit → manifest valid, icons discoverable

### Native (Future – Requires Capacitor Setup)
- [ ] **iOS (Xcode):** Replace `ios/App/App/Assets.xcassets/AppIcon.appiconset/` with uploaded iOS icons
- [ ] **Android (Gradle):** Merge `android/res/` density variants into `app/src/main/res/`
- [ ] **Android Manifest:** Verify `android:icon="@mipmap/ic_launcher"` and `android:roundIcon="@mipmap/ic_launcher_round"`
- [ ] **Material You (Android 12+):** Confirm monochrome icon renders on themed home screens

---

## File Paths Summary

```
public/
├── android-chrome-192x192.png    (Samsung: ic_launcher_foreground)
├── android-chrome-512x512.png    (Samsung: galaxy_store_icon_512)
├── maskable_icon_512.png         (Samsung: maskable_512)
├── apple-touch-icon.png          (iOS: master_1024)
├── favicon-32x32.png             (ic_launcher scaled)
├── favicon-16x16.png             (ic_launcher scaled)
├── favicon.png                   (Existing fallback)
├── manifest.json                 (Updated with Samsung icons)
└── config/
    └── pwa-icons.json            (USE_SAMSUNG_PWA flag)
```

---

## Notes

- **No baked corner radius:** All source icons are square; platforms handle masking (iOS squircle, Android adaptive, Samsung One UI)
- **Maskable safe zone:** The `maskable_512.png` has proper padding for circular/squircle masks
- **Apple auto-scale:** iOS will scale `apple-touch-icon.png` from 1024×1024 to 180×180 automatically
- **Service Worker:** Version bumped to v4 in prior auth fix; icons cached by SW on install
- **Clear cache:** Users must visit `/clear-cache.html` to see new icons after deployment

---

## Output Summary

### Changed Files
- ✅ `/public/manifest.json` – Updated icons array with Samsung assets
- ✅ `/index.html` – Updated favicon/apple-touch-icon links
- ✅ `/public/android-chrome-192x192.png` (new)
- ✅ `/public/android-chrome-512x512.png` (new)
- ✅ `/public/maskable_icon_512.png` (new)
- ✅ `/public/apple-touch-icon.png` (new)
- ✅ `/public/favicon-32x32.png` (new)
- ✅ `/public/favicon-16x16.png` (new)
- ✅ `/public/config/pwa-icons.json` (new config flag)
- ✅ `/public/PWA_ICON_GUIDE.md` (this file)

### Current Config
```json
{
  "USE_SAMSUNG_PWA": true
}
```

---

**Ready to deploy!** Users should clear cache (`/clear-cache.html`) to see new icons on installed PWAs.
