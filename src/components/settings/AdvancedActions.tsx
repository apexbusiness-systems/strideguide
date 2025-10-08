export function AdvancedActions() {
  const purge = async () => {
    // Kill any stale caches/SW under old scope
    const keys = await caches.keys();
    await Promise.all(keys.map(k => caches.delete(k)));
    if ('serviceWorker' in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map(r => r.unregister()));
    }
    location.reload();
  };

  return (
    <div className="space-y-2">
      <button 
        className="px-3 py-2 rounded bg-neutral-900 text-white w-full hover:bg-neutral-800 transition-colors" 
        onClick={purge}
      >
        Reset App Cache
      </button>
      <p className="text-xs text-neutral-500">
        Fixes stubborn sign-in by clearing stale service worker/caches.
      </p>
    </div>
  );
}
