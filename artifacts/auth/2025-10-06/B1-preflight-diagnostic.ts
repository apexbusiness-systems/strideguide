/**
 * B1 - Preflight Diagnostic Script
 * Run in browser console on the auth page to capture OPTIONS/POST flow
 * 
 * Usage:
 *   Copy this entire script into browser DevTools console and run:
 *   await runPreflightDiagnostic();
 */

interface PreflightResult {
  timestamp: string;
  correlationId: string;
  origin: string;
  tests: {
    optionsRequest: {
      success: boolean;
      statusCode?: number;
      headers?: Record<string, string>;
      error?: string;
    };
    corsHeaders: {
      allowOrigin?: string;
      allowMethods?: string;
      allowHeaders?: string;
      allowCredentials?: string;
      vary?: string;
      passed: boolean;
      issues: string[];
    };
    postRequest: {
      success: boolean;
      statusCode?: number;
      error?: string;
    };
  };
  recommendation: string[];
}

async function runPreflightDiagnostic(): Promise<PreflightResult> {
  const correlationId = crypto.randomUUID();
  const origin = window.location.origin;
  const authUrl = 'https://yrndifsbsmpvmpudglcc.supabase.co/auth/v1/token?grant_type=password';
  
  console.log(`[PREFLIGHT-${correlationId}] Starting diagnostic from origin: ${origin}`);
  
  const result: PreflightResult = {
    timestamp: new Date().toISOString(),
    correlationId,
    origin,
    tests: {
      optionsRequest: { success: false },
      corsHeaders: { passed: false, issues: [] },
      postRequest: { success: false }
    },
    recommendation: []
  };

  // Test 1: OPTIONS preflight request
  console.log(`[PREFLIGHT-${correlationId}] Test 1: Sending OPTIONS request...`);
  try {
    const optionsResponse = await fetch(authUrl, {
      method: 'OPTIONS',
      headers: {
        'Origin': origin,
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'content-type,authorization'
      }
    });

    result.tests.optionsRequest.success = optionsResponse.ok;
    result.tests.optionsRequest.statusCode = optionsResponse.status;
    
    // Capture response headers
    const headers: Record<string, string> = {};
    optionsResponse.headers.forEach((value, key) => {
      headers[key] = value;
    });
    result.tests.optionsRequest.headers = headers;

    console.log(`[PREFLIGHT-${correlationId}] OPTIONS status: ${optionsResponse.status}`);
    console.log(`[PREFLIGHT-${correlationId}] Response headers:`, headers);

  } catch (error) {
    result.tests.optionsRequest.error = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[PREFLIGHT-${correlationId}] OPTIONS failed:`, error);
  }

  // Test 2: Validate CORS headers
  const headers = result.tests.optionsRequest.headers || {};
  
  result.tests.corsHeaders.allowOrigin = headers['access-control-allow-origin'];
  result.tests.corsHeaders.allowMethods = headers['access-control-allow-methods'];
  result.tests.corsHeaders.allowHeaders = headers['access-control-allow-headers'];
  result.tests.corsHeaders.allowCredentials = headers['access-control-allow-credentials'];
  result.tests.corsHeaders.vary = headers['vary'];

  // Check each required header
  if (!headers['access-control-allow-origin']) {
    result.tests.corsHeaders.issues.push('Missing Access-Control-Allow-Origin header');
  } else if (headers['access-control-allow-origin'] !== origin && headers['access-control-allow-origin'] !== '*') {
    result.tests.corsHeaders.issues.push(`Access-Control-Allow-Origin mismatch: got "${headers['access-control-allow-origin']}", expected "${origin}"`);
  }

  if (!headers['access-control-allow-methods']?.includes('POST')) {
    result.tests.corsHeaders.issues.push('Access-Control-Allow-Methods missing POST');
  }

  if (!headers['access-control-allow-headers']?.includes('content-type')) {
    result.tests.corsHeaders.issues.push('Access-Control-Allow-Headers missing content-type');
  }

  if (headers['access-control-allow-credentials'] !== 'true') {
    result.tests.corsHeaders.issues.push('Access-Control-Allow-Credentials should be "true" for session cookies');
  }

  if (!headers['vary']?.includes('Origin')) {
    result.tests.corsHeaders.issues.push('Missing Vary: Origin header (prevents cache poisoning)');
  }

  result.tests.corsHeaders.passed = result.tests.corsHeaders.issues.length === 0;

  // Test 3: Attempt actual POST (will fail with bad credentials, but should not have CORS error)
  console.log(`[PREFLIGHT-${correlationId}] Test 3: Sending POST request...`);
  try {
    const postResponse = await fetch(authUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlybmRpZnNic21wdm1wdWRnbGNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwNjA1NDUsImV4cCI6MjA3NDYzNjU0NX0.OBtOjMTiZrgV08ttxiIeT48_ITJ_C88gz_kO-2eLUEk'
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'testpassword123'
      }),
      credentials: 'include'
    });

    result.tests.postRequest.success = true; // Got a response (even if 401)
    result.tests.postRequest.statusCode = postResponse.status;
    
    console.log(`[PREFLIGHT-${correlationId}] POST status: ${postResponse.status}`);

  } catch (error) {
    result.tests.postRequest.error = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[PREFLIGHT-${correlationId}] POST failed:`, error);
    
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      result.recommendation.push('❌ CORS/Network error on POST - preflight likely failed');
    }
  }

  // Generate recommendations
  if (!result.tests.optionsRequest.success) {
    result.recommendation.push('❌ OPTIONS request failed - Supabase Auth CORS not configured for this origin');
    result.recommendation.push('→ ACTION: Add this origin to Supabase Dashboard → Authentication → URL Configuration → Additional Redirect URLs');
    result.recommendation.push(`→ Add: ${origin}/**`);
  }

  if (result.tests.corsHeaders.issues.length > 0) {
    result.recommendation.push('❌ CORS headers incomplete or incorrect:');
    result.tests.corsHeaders.issues.forEach(issue => {
      result.recommendation.push(`  - ${issue}`);
    });
    result.recommendation.push('→ ACTION: Verify Supabase Auth URL configuration includes this origin');
  }

  if (result.tests.optionsRequest.success && result.tests.corsHeaders.passed && result.tests.postRequest.success) {
    result.recommendation.push('✅ Preflight PASSED - CORS configured correctly');
    result.recommendation.push('✅ POST request succeeded - auth flow should work');
  }

  // Output result
  console.log('\n═══════════════════════════════════════════════════');
  console.log('PREFLIGHT DIAGNOSTIC RESULT');
  console.log('═══════════════════════════════════════════════════');
  console.log(`Correlation ID: ${correlationId}`);
  console.log(`Origin: ${origin}`);
  console.log(`Timestamp: ${result.timestamp}`);
  console.log('\nTEST RESULTS:');
  console.log(`  OPTIONS: ${result.tests.optionsRequest.success ? '✅ PASS' : '❌ FAIL'} (${result.tests.optionsRequest.statusCode || 'no response'})`);
  console.log(`  CORS Headers: ${result.tests.corsHeaders.passed ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`  POST Request: ${result.tests.postRequest.success ? '✅ PASS' : '❌ FAIL'} (${result.tests.postRequest.statusCode || 'no response'})`);
  
  console.log('\nRECOMMENDATIONS:');
  result.recommendation.forEach(rec => console.log(`  ${rec}`));
  console.log('═══════════════════════════════════════════════════\n');

  return result;
}

// Export for use in console
if (typeof window !== 'undefined') {
  (window as any).runPreflightDiagnostic = runPreflightDiagnostic;
  console.log('✅ Preflight diagnostic loaded. Run: await runPreflightDiagnostic()');
}

export { runPreflightDiagnostic };
