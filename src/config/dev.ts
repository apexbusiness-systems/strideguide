/**
 * DEVELOPMENT ONLY CONFIGURATION
 * ================================
 * WARNING: NEVER enable DEV_BYPASS in production!
 * This file allows bypassing authentication for local testing.
 */

export const DEV_CONFIG = {
  // Set to true to bypass authentication entirely
  BYPASS_AUTH: false,
  
  // Mock user data used when bypass is enabled
  MOCK_USER: {
    id: '00000000-0000-0000-0000-000000000000',
    email: 'dev@test.com',
    user_metadata: {
      first_name: 'Dev',
      last_name: 'User'
    }
  }
} as const;

// Safety check and overrides - disable bypass in production except known dev hosts
const hostname = window.location.hostname;
const isDevHost =
  hostname === 'localhost' ||
  hostname.includes('lovable.app') ||
  hostname.includes('lovableproject.com');

const params = new URLSearchParams(window.location.search);
const bypassParam = params.get('dev_bypass');

if (bypassParam === '1') {
  (DEV_CONFIG as any).BYPASS_AUTH = true;
  console.warn('⚠️ DEV MODE: Bypass forced via ?dev_bypass=1');
} else if (bypassParam === '0') {
  (DEV_CONFIG as any).BYPASS_AUTH = false;
  console.warn('🔒 Dev bypass disabled via ?dev_bypass=0');
} else if (!isDevHost) {
  (DEV_CONFIG as any).BYPASS_AUTH = false;
  console.warn('🔒 Dev bypass disabled - not in development host');
}

if ((DEV_CONFIG as any).BYPASS_AUTH) {
  console.warn('⚠️ DEV MODE: Authentication bypass is ENABLED');
  console.warn('⚠️ Set DEV_CONFIG.BYPASS_AUTH = false or use ?dev_bypass=0 to re-enable auth');
}
