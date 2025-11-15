/**
 * DEVELOPMENT ONLY CONFIGURATION
 * ================================
 * SECURITY: Auth bypass is ONLY allowed on localhost in development mode
 * Production builds completely disable this feature
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

// SECURITY: Strict localhost-only check + development mode verification
const hostname = window.location.hostname;
const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]';
const isDevelopment = import.meta.env.DEV === true || import.meta.env.MODE === 'development';

// SECURITY: Only allow bypass if BOTH conditions are met
const isDevEnvironment = isLocalhost && isDevelopment;

// Use type assertion to modify readonly config
type WritableConfig = { -readonly [K in keyof typeof DEV_CONFIG]: boolean | typeof DEV_CONFIG.MOCK_USER };

// SECURITY: URL parameter override ONLY works on localhost in dev mode
if (isDevEnvironment) {
  const params = new URLSearchParams(window.location.search);
  const bypassParam = params.get('dev_bypass');

  if (bypassParam === '1') {
    (DEV_CONFIG as WritableConfig).BYPASS_AUTH = true;
    console.warn('⚠️ DEV MODE: Auth bypass enabled via ?dev_bypass=1 (localhost only)');
  } else if (bypassParam === '0') {
    (DEV_CONFIG as WritableConfig).BYPASS_AUTH = false;
    console.info('🔒 Auth bypass explicitly disabled via ?dev_bypass=0');
  }
} else {
  // PRODUCTION/NON-LOCALHOST: Force disable bypass
  (DEV_CONFIG as WritableConfig).BYPASS_AUTH = false;

  // Log attempt if someone tries to use dev_bypass in production
  const params = new URLSearchParams(window.location.search);
  if (params.has('dev_bypass')) {
    console.error(
      '🚨 SECURITY: Auth bypass attempt blocked. ' +
      'Dev bypass only works on localhost in development mode.'
    );
  }
}

if (DEV_CONFIG.BYPASS_AUTH) {
  console.warn('⚠️ DEV MODE: Authentication bypass is ACTIVE (localhost development only)');
  console.warn('⚠️ Use ?dev_bypass=0 to re-enable authentication');
}
