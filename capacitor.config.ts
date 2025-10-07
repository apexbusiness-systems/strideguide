import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.strideguide.mobile',
  appName: 'StrideGuide',
  webDir: 'dist',
  server: {
    url: 'https://9b6ba57d-0f87-4893-8630-92e53b225b3f.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  android: {
    allowMixedContent: true
  },
  ios: {
    contentInset: 'always'
  }
};

export default config;
