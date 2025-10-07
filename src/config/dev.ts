/**
 * DEVELOPMENT ONLY CONFIGURATION
 * ================================
 * WARNING: NEVER enable DEV_BYPASS in production!
 * This file allows bypassing authentication for local testing.
 */

export const DEV_CONFIG = {
  // Set to true to bypass authentication entirely
  BYPASS_AUTH: true,
  
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

// Safety check - disable bypass in production
if (window.location.hostname !== 'localhost' && 
    !window.location.hostname.includes('lovable.app')) {
  (DEV_CONFIG as any).BYPASS_AUTH = false;
  console.warn('🔒 Dev bypass disabled - not in development environment');
}

if (DEV_CONFIG.BYPASS_AUTH) {
  console.warn('⚠️ DEV MODE: Authentication bypass is ENABLED');
  console.warn('⚠️ Set DEV_CONFIG.BYPASS_AUTH = false to re-enable auth');
}
