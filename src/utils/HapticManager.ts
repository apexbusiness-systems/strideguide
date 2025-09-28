/**
 * HapticManager - Provides haptic feedback with platform detection
 * Android: Uses navigator.vibrate() with patterns
 * iOS: Falls back to audio cues (vibration not supported in Safari)
 */

interface VibrationPattern {
  hot: number[];
  cold: number[];
  found: number[];
  warning: number[];
  success: number[];
}

class HapticManagerClass {
  private isSupported = 'vibrate' in navigator;
  private isAndroid = /Android/i.test(navigator.userAgent);
  private isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

  private patterns: VibrationPattern = {
    hot: [50, 50, 50, 50, 50], // Rapid pulses for "getting warmer"
    cold: [200], // Single long pulse for "getting colder"
    found: [100, 50, 100, 50, 100], // Success pattern
    warning: [300, 100, 300], // Alert pattern
    success: [50, 50, 50, 50, 50, 50, 50] // Celebration pattern
  };

  vibrate(patternName: keyof VibrationPattern): void {
    if (!this.isSupported) {
      console.log('Vibration not supported, using audio fallback');
      return;
    }

    // iOS Safari doesn't support vibration, even if navigator.vibrate exists
    if (this.isIOS) {
      console.log('iOS detected, vibration not supported in web browsers');
      return;
    }

    const pattern = this.patterns[patternName];
    
    try {
      navigator.vibrate(pattern);
    } catch (error) {
      console.error('Vibration failed:', error);
    }
  }

  vibrateCustom(duration: number): void {
    if (!this.isSupported || this.isIOS) {
      return;
    }

    try {
      navigator.vibrate(Math.min(Math.max(duration, 10), 1000)); // Clamp between 10ms and 1s
    } catch (error) {
      console.error('Custom vibration failed:', error);
    }
  }

  // Intensity-based vibration for proximity feedback
  vibrateProximity(intensity: number): void {
    if (!this.isSupported || this.isIOS) {
      return;
    }

    // Map intensity (0-1) to vibration strength
    const duration = Math.floor(intensity * 200 + 50); // 50-250ms
    const pause = Math.floor((1 - intensity) * 300 + 100); // 100-400ms pause
    
    const pattern = intensity > 0.8 ? this.patterns.hot : [duration, pause];
    
    try {
      navigator.vibrate(pattern);
    } catch (error) {
      console.error('Proximity vibration failed:', error);
    }
  }

  stopVibration(): void {
    if (this.isSupported && !this.isIOS) {
      try {
        navigator.vibrate(0);
      } catch (error) {
        console.error('Failed to stop vibration:', error);
      }
    }
  }

  isVibrationSupported(): boolean {
    return this.isSupported && !this.isIOS;
  }

  getPlatformInfo(): { platform: string; vibrationSupported: boolean } {
    let platform = 'unknown';
    
    if (this.isAndroid) platform = 'android';
    else if (this.isIOS) platform = 'ios';
    else platform = 'desktop';

    return {
      platform,
      vibrationSupported: this.isVibrationSupported()
    };
  }
}

export const HapticManager = new HapticManagerClass();