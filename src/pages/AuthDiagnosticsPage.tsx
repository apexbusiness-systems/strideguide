import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle, XCircle, RefreshCw } from "lucide-react";

export default function AuthDiagnosticsPage() {
  const [diagnostics, setDiagnostics] = useState<Record<string, unknown> | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const runDiagnostics = async () => {
    setIsLoading(true);
    const results: Record<string, unknown> = {};

    // 1. Current origin
    results.origin = window.location.origin;

    // 2. Service Worker status
    if ('serviceWorker' in navigator) {
      results.swController = navigator.serviceWorker.controller?.scriptURL || null;
      const regs = await navigator.serviceWorker.getRegistrations();
      results.swRegistrations = regs.map(r => ({
        scope: r.scope,
        script: r.active?.scriptURL || null,
        state: r.active?.state || null
      }));
    } else {
      results.swController = 'NOT_SUPPORTED';
      results.swRegistrations = [];
    }

    // 3. Supabase health check
    const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').replace(/\/$/, '');
    results.supabaseUrl = supabaseUrl ? supabaseUrl.replace(/[^/]+\.[^/]+\.supabase\.co/g, '***.supabase.co') : 'Not configured';
    
    try {
      if (!supabaseUrl) {
        results.healthStatus = 0;
        results.healthText = 'VITE_SUPABASE_URL not configured';
        return results;
      }
      const healthResp = await fetch(`${supabaseUrl}/auth/v1/health`, { cache: 'no-store' });
      results.healthStatus = healthResp.status;
      results.healthText = await healthResp.text();
    } catch (err: unknown) {
      const error = err as Error;
      results.healthStatus = 'FAILED';
      results.healthText = err.message;
      results.healthError = err.name;
    }

    // 4. Real sign-in attempt (dummy credentials)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: 'test-diagnostic@example.com',
        password: 'dummy-password-12345',
      });
      
      if (error) {
        results.authError = error.message;
        results.authStatus = error.status;
        results.authName = error.name;
      } else {
        results.authError = 'UNEXPECTED_SUCCESS';
      }
    } catch (err: unknown) {
      const error = err as Error;
      results.authError = err.message;
      results.authName = err.name;
      results.authStack = err.stack;
      
      // 5. Detect preflight vs credentials issue
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        results.preflightBlocked = true;
        results.hint = 'CORS/OPTIONS blocked - check Supabase redirect URLs';
      } else if (err.status === 400 || err.status === 401) {
        results.preflightBlocked = false;
        results.hint = 'Credentials invalid (expected for dummy login)';
      }
    }

    // 6. Current session
    try {
      const { data } = await supabase.auth.getSession();
      results.session = data.session ? {
        user: data.session.user?.email || 'MASKED',
        expiresAt: data.session.expires_at
      } : null;
    } catch (err: unknown) {
      const error = err as Error;
      results.sessionError = err.message;
    }

    setDiagnostics(results);
    setIsLoading(false);
  };

  const unregisterSW = async () => {
    if ('serviceWorker' in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map(r => r.unregister()));
      
      if ('caches' in window) {
        const names = await caches.keys();
        await Promise.all(names.map(n => caches.delete(n)));
      }
      
      alert('Service Worker unregistered and caches cleared. Reload page.');
      window.location.reload();
    }
  };

  const ResultRow = ({ label, value, status }: { label: string; value: string; status: 'success' | 'error' | 'warning' }) => {
    const Icon = status === 'success' ? CheckCircle : status === 'error' ? XCircle : AlertCircle;
    const bgColor = status === 'success' ? 'bg-green-500/20 border-green-500' : status === 'error' ? 'bg-red-500/20 border-red-500' : 'bg-yellow-500/20 border-yellow-500';
    const textColor = status === 'success' ? 'text-green-700 dark:text-green-300' : status === 'error' ? 'text-red-700 dark:text-red-300' : 'text-yellow-700 dark:text-yellow-300';

    return (
      <div className={`p-4 rounded-lg border-2 ${bgColor} flex items-start gap-3`}>
        <Icon className={`h-6 w-6 mt-0.5 flex-shrink-0 ${textColor}`} />
        <div className="flex-1">
          <div className="font-semibold text-sm mb-1">{label}</div>
          <div className={`text-sm font-mono ${textColor}`}>{value}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Auth Diagnostics</span>
              <div className="flex gap-2">
                <Button onClick={runDiagnostics} disabled={isLoading} size="sm">
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  {isLoading ? 'Running...' : 'Run Diagnostics'}
                </Button>
                <Button onClick={unregisterSW} variant="destructive" size="sm">
                  Unregister SW
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {!diagnostics && (
              <p className="text-muted-foreground text-center py-8">
                Click "Run Diagnostics" to start
              </p>
            )}

            {diagnostics && (
              <>
                <ResultRow 
                  label="Current Origin" 
                  value={diagnostics.origin}
                  status="success"
                />

                <ResultRow 
                  label="Service Worker Controller" 
                  value={diagnostics.swController || 'NONE'}
                  status={diagnostics.swController ? 'warning' : 'success'}
                />

                <ResultRow 
                  label="SW Registrations" 
                  value={`${diagnostics.swRegistrations.length} active (${JSON.stringify(diagnostics.swRegistrations)})`}
                  status={diagnostics.swRegistrations.length === 0 ? 'success' : 'warning'}
                />

                <ResultRow 
                  label="Supabase Project" 
                  value={diagnostics.supabaseUrl}
                  status="success"
                />

                <ResultRow 
                  label="Supabase Health Endpoint" 
                  value={`Status: ${diagnostics.healthStatus} | Response: ${diagnostics.healthText}`}
                  status={diagnostics.healthStatus === 200 ? 'success' : 'error'}
                />

                <ResultRow 
                  label="Auth Test (Dummy Credentials)" 
                  value={`Error: ${diagnostics.authError || 'NONE'} | Status: ${diagnostics.authStatus || 'N/A'} | Name: ${diagnostics.authName || 'N/A'}`}
                  status={diagnostics.authError?.includes('Invalid') ? 'success' : 'error'}
                />

                {diagnostics.preflightBlocked !== undefined && (
                  <ResultRow 
                    label="Preflight/CORS Detection" 
                    value={diagnostics.hint}
                    status={diagnostics.preflightBlocked ? 'error' : 'success'}
                  />
                )}

                <ResultRow 
                  label="Current Session" 
                  value={diagnostics.session ? `User: ${diagnostics.session.user} | Expires: ${diagnostics.session.expiresAt}` : 'NO SESSION'}
                  status={diagnostics.session ? 'success' : 'warning'}
                />

                {diagnostics.preflightBlocked && (
                  <div className="bg-red-500/10 border-2 border-red-500 rounded-lg p-4 mt-4">
                    <h3 className="font-bold text-red-700 dark:text-red-300 mb-2">🚨 PREFLIGHT BLOCKED</h3>
                    <p className="text-sm text-red-600 dark:text-red-400">
                      The browser's OPTIONS preflight request is being blocked. This prevents authentication.
                      <br /><br />
                      <strong>Fix:</strong> Go to Supabase Dashboard → Authentication → URL Configuration and add:
                      <br />
                      - Site URL: <code className="bg-black/20 px-2 py-1 rounded">{window.location.origin}</code>
                      <br />
                      - Redirect URLs: <code className="bg-black/20 px-2 py-1 rounded">{window.location.origin}/**</code>
                    </p>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
