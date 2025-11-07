/**
 * Service Worker Diagnostic & Emergency Unregister
 * For troubleshooting auth issues on mobile data
 */

export class ServiceWorkerDiagnostic {
  
  static async getStatus() {
    if (!('serviceWorker' in navigator)) {
      return { supported: false, registrations: [] };
    }

    const registrations = await navigator.serviceWorker.getRegistrations();
    
    return {
      supported: true,
      controller: navigator.serviceWorker.controller?.scriptURL || null,
      registrations: registrations.map(reg => ({
        scope: reg.scope,
        scriptURL: reg.active?.scriptURL || null,
        state: reg.active?.state || null,
        updateViaCache: reg.updateViaCache
      })),
      online: navigator.onLine,
      connection: (navigator as Navigator & { connection?: { effectiveType?: string } }).connection?.effectiveType || 'unknown'
    };
  }

  static async unregisterAll(): Promise<boolean> {
    if (!('serviceWorker' in navigator)) {
      return false;
    }

    const registrations = await navigator.serviceWorker.getRegistrations();
    const results = await Promise.all(
      registrations.map(reg => reg.unregister())
    );
    
    return results.every(r => r === true);
  }

  static async forceUpdate(): Promise<void> {
    if (!('serviceWorker' in navigator)) {
      return;
    }

    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map(reg => reg.update()));
  }

  static async clearCachesAndReload(): Promise<void> {
    // Unregister all service workers
    await this.unregisterAll();
    
    // Clear all caches
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
    }
    
    // Hard reload
    window.location.reload();
  }
}

// Expose globally for console debugging
if (typeof window !== 'undefined') {
  (window as Window & { swDiagnostic: typeof ServiceWorkerDiagnostic }).swDiagnostic = ServiceWorkerDiagnostic;
}
