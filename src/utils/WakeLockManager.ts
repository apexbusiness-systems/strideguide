/**
 * WakeLockManager - Prevents screen dimming during guidance
 * Uses Screen Wake Lock API with graceful fallback
 */

class WakeLockManagerClass {
  private wakeLock: WakeLockSentinel | null = null;
  private wakeLockSupported = 'wakeLock' in navigator;

  async request(): Promise<void> {
    if (!this.wakeLockSupported) {
      console.warn('Wake Lock API not supported');
      throw new Error('Wake Lock not supported');
    }

    try {
      this.wakeLock = await navigator.wakeLock.request('screen');
      
      this.wakeLock.addEventListener('release', () => {
        console.log('Wake lock released');
      });

      // Re-acquire wake lock when page becomes visible
      document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
      
      console.log('Screen wake lock acquired');
    } catch (error) {
      console.error('Failed to acquire wake lock:', error);
      throw error;
    }
  }

  release(): void {
    if (this.wakeLock) {
      this.wakeLock.release();
      this.wakeLock = null;
    }

    document.removeEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
  }

  private async handleVisibilityChange(): Promise<void> {
    if (this.wakeLock !== null && document.visibilityState === 'visible') {
      try {
        await this.request();
      } catch (error) {
        console.error('Failed to re-acquire wake lock:', error);
      }
    }
  }

  isActive(): boolean {
    return this.wakeLock !== null && !this.wakeLock.released;
  }

  isSupported(): boolean {
    return this.wakeLockSupported;
  }

  getHelpText(): string {
    if (!this.wakeLockSupported) {
      return 'Wake Lock is not supported on this device. Please manually keep your screen on during guidance.';
    }
    
    return 'If screen dimming still occurs, check your device power settings and browser permissions.';
  }
}

export const WakeLockManager = new WakeLockManagerClass();