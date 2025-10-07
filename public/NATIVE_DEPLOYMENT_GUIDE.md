# StrideGuide Native App Icon Deployment Guide

## Status: Assets Staged ✅ | Capacitor Installed ✅ | Native Platforms Pending ⏳

---

## What's Ready Now

### ✅ PWA Icons (Live in Preview)
- `/public/android-chrome-192x192.png` – Updated with `ic_launcher_foreground-3.png`
- `/public/android-chrome-512x512.png` – Samsung Galaxy Store icon
- `/public/maskable_icon_512.png` – Samsung One UI maskable
- `/public/apple-touch-icon.png` – iOS master 1024×1024
- `/public/favicon-32x32.png` – Updated with `ic_launcher-3.png`
- `/public/favicon-16x16.png` – Updated with `ic_launcher-3.png`

### ✅ Capacitor Configuration
- `capacitor.config.ts` created
- App ID: `app.strideguide.mobile`
- App Name: `StrideGuide`
- Hot-reload URL configured for dev

### ✅ Staged Native Assets
**iOS Icons** (ready for `/ios/App/App/Assets.xcassets/AppIcon.appiconset/`):
- `/public/ios-icons/iphone_notification_20pt@2x.png` (40×40)
- `/public/ios-icons/iphone_notification_20pt@3x.png` (60×60)
- `/public/ios-icons/iphone_settings_29pt@2x.png` (58×58)
- `/public/ios-icons/iphone_settings_29pt@3x.png` (87×87)
- `/public/ios-icons/iphone_spotlight_40pt@2x.png` (80×80)
- `/public/ios-icons/iphone_spotlight_40pt@3x.png` (120×120)
- ⚠️ **Still missing:** `iphone_app_60pt@2x.png` (120×120) and `iphone_app_60pt@3x.png` (180×180)
- ✅ **Have:** All iPad icons from earlier upload
- ✅ **Have:** `app_store_1024.png` (1024×1024, no alpha)

**Android Adaptive Icons** (ready for `/android/app/src/main/res/`):
- `/public/android-icons/ic_launcher_foreground.png` (108dp adaptive layer)
- `/public/android-icons/ic_launcher_background.png` (solid black #000000)
- `/public/android-icons/ic_launcher_monochrome.png` (Material You white)
- `/public/android-icons/ic_launcher.xml`
- `/public/android-icons/ic_launcher_round.xml`
- `/public/android-icons/colors.xml`

---

## Next Steps (You Do Locally)

### 1. Export & Build
```bash
# Export project to GitHub (use "Export to Github" button in Lovable)
git pull

# Install dependencies
npm install

# Build for production
npm run build
```

### 2. Add Native Platforms
```bash
# Add Android
npx cap add android

# Add iOS (requires macOS with Xcode)
npx cap add ios

# Sync assets
npx cap sync
```

### 3. Deploy Icons to Native Projects

**iOS (Xcode - macOS only):**
```bash
# Copy icons to Xcode asset catalog
cp public/ios-icons/* ios/App/App/Assets.xcassets/AppIcon.appiconset/
cp public/app_store_1024.png ios/App/App/Assets.xcassets/AppIcon.appiconset/

# Open Xcode and verify
npx cap open ios
# → Navigate to App → General → App Icons Source → Should show "AppIcon" with all slots filled
```

**Android (Android Studio):**
```bash
# Create res directories if missing
mkdir -p android/app/src/main/res/mipmap-{mdpi,hdpi,xhdpi,xxhdpi,xxxhdpi}
mkdir -p android/app/src/main/res/values

# Copy adaptive icon layers (you'll need to generate density variants)
# For now, place the 108dp versions in xxxhdpi:
cp public/android-icons/ic_launcher_foreground.png android/app/src/main/res/mipmap-xxxhdpi/
cp public/android-icons/ic_launcher_background.png android/app/src/main/res/mipmap-xxxhdpi/
cp public/android-icons/ic_launcher_monochrome.png android/app/src/main/res/mipmap-xxxhdpi/

# Copy XML manifests
cp public/android-icons/ic_launcher.xml android/app/src/main/res/mipmap-anydpi-v26/
cp public/android-icons/ic_launcher_round.xml android/app/src/main/res/mipmap-anydpi-v26/
cp public/android-icons/colors.xml android/app/src/main/res/values/

# Open Android Studio
npx cap open android
# → Verify icons appear in all densities
```

### 4. Generate Missing Android Density Variants

You need to create **mdpi, hdpi, xhdpi, xxhdpi** versions of:
- `ic_launcher_foreground.png`
- `ic_launcher_background.png`
- `ic_launcher_monochrome.png`

**Density Scale Guide:**
- **mdpi:** 48dp (scale to ~48×48px)
- **hdpi:** 72dp (scale to ~72×72px)
- **xhdpi:** 96dp (scale to ~96×96px)
- **xxhdpi:** 144dp (scale to ~144×144px)
- **xxxhdpi:** 192dp (current 108dp source scales to ~192×192px)

Use your design tool (Figma/Sketch/Photoshop) to export at these sizes, maintaining the safe zone.

### 5. Verify AndroidManifest.xml

Open `android/app/src/main/AndroidManifest.xml` and confirm:
```xml
<application
    android:icon="@mipmap/ic_launcher"
    android:roundIcon="@mipmap/ic_launcher_round"
    ...>
```

### 6. Build & Test

**iOS:**
```bash
# Xcode → Product → Build (⌘B)
# Run on simulator or device
npx cap run ios
```

**Android:**
```bash
# Build APK
cd android
./gradlew assembleDebug

# Or run directly
npx cap run android
```

---

## Missing Assets Report

### ⚠️ iPhone App Icons (Critical for iOS Build)
You uploaded spotlight/settings/notification, but still need:
- `iphone_app_60pt@2x.png` (120×120) – **iPhone app icon @2x**
- `iphone_app_60pt@3x.png` (180×180) – **iPhone app icon @3x**

These are referenced in your `Contents.json` but not yet uploaded.

### ⚠️ Android Density Variants (Required for Production)
Your current `ic_launcher_foreground-3.png` is a single 108dp icon. You need to export:
- Foreground/background/monochrome at **mdpi, hdpi, xhdpi, xxhdpi** scales

Without these, Android will scale the xxxhdpi version, which may look blurry on lower-res devices.

---

## Configuration Summary

**Capacitor Config (`capacitor.config.ts`):**
```typescript
{
  appId: 'app.strideguide.mobile',
  appName: 'StrideGuide',
  webDir: 'dist',
  server: {
    url: 'https://9b6ba57d-0f87-4893-8630-92e53b225b3f.lovableproject.com?forceHideBadge=true',
    cleartext: true  // For dev hot-reload
  }
}
```

**PWA Flag:** `USE_SAMSUNG_PWA = true` (in `/public/config/pwa-icons.json`)

---

## Verification Checklist

### PWA (Works Now in Preview)
- [x] Manifest icons updated
- [x] Favicons refreshed
- [x] Apple touch icon set
- [ ] User clears cache (`/clear-cache.html`) to see new icons

### iOS (After `npx cap add ios`)
- [ ] All AppIcon slots filled in Xcode asset catalog
- [ ] 1024×1024 marketing icon present, no alpha channel
- [ ] Build runs without warnings
- [ ] Icon appears on home screen with iOS rounded corners

### Android (After `npx cap add android`)
- [ ] Adaptive foreground/background/monochrome present for all densities
- [ ] `AndroidManifest.xml` references `@mipmap/ic_launcher` and `@mipmap/ic_launcher_round`
- [ ] Gradle lint passes
- [ ] Icon displays correctly on Pixel (adaptive) and Samsung (One UI squircle)
- [ ] Material You monochrome icon renders on Android 12+ themed home screens

### Samsung One UI (Native Android Build)
- [ ] Add app to home screen → no white squircle edges
- [ ] Icon shape follows system theme (circle/squircle/rounded square)

---

## Current File Tree

```
public/
├── android-chrome-192x192.png        (PWA, updated with ic_launcher_foreground-3)
├── android-chrome-512x512.png        (PWA, Samsung Galaxy Store)
├── maskable_icon_512.png             (PWA, Samsung One UI)
├── apple-touch-icon.png              (PWA, iOS master 1024×1024)
├── favicon-32x32.png                 (updated with ic_launcher-3)
├── favicon-16x16.png                 (updated with ic_launcher-3)
├── favicon.png                       (legacy fallback)
├── manifest.json                     (Samsung mode active)
├── config/
│   └── pwa-icons.json                (USE_SAMSUNG_PWA: true)
├── ios-icons/                        (Staged for Xcode)
│   ├── iphone_notification_20pt@2x.png
│   ├── iphone_notification_20pt@3x.png
│   ├── iphone_settings_29pt@2x.png
│   ├── iphone_settings_29pt@3x.png
│   ├── iphone_spotlight_40pt@2x.png
│   ├── iphone_spotlight_40pt@3x.png
│   └── (iPad icons from earlier upload)
└── android-icons/                    (Staged for Android Studio)
    ├── ic_launcher_foreground.png
    ├── ic_launcher_background.png
    ├── ic_launcher_monochrome.png
    ├── ic_launcher.xml
    ├── ic_launcher_round.xml
    └── colors.xml

capacitor.config.ts                    (Capacitor config created)
```

---

## Output Summary

**What Changed:**
- ✅ PWA icons refreshed with `-3` variants (latest quality)
- ✅ Capacitor installed (`@capacitor/core`, `cli`, `android`, `ios`)
- ✅ `capacitor.config.ts` created
- ✅ iPhone icons staged in `/public/ios-icons/`
- ✅ Android adaptive icons staged in `/public/android-icons/`
- ✅ Documentation updated (`PUBLIC_NATIVE_DEPLOYMENT_GUIDE.md`)

**Current Flag:** `USE_SAMSUNG_PWA = true`

**Blocked on:**
- Missing `iphone_app_60pt@2x/3x.png` (upload these to complete iOS icon set)
- Native platform setup (`npx cap add android/ios` – you run locally)
- Android density variants (mdpi–xxhdpi exports)

---

## Next Upload Needed

Please provide:
1. **iPhone App Icons:**
   - `iphone_app_60pt@2x.png` (120×120)
   - `iphone_app_60pt@3x.png` (180×180)

2. **Android Density Variants** (optional but recommended):
   - Export `ic_launcher_foreground/background/monochrome` at mdpi, hdpi, xhdpi, xxhdpi scales

Once uploaded, I'll update the staging directories and finalize the deployment guide.

---

**Ready to proceed!** Follow steps 1-6 above to add native platforms and deploy icons. 🚀
