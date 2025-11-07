/**
 * Performance Budget Monitoring
 * Tracks and enforces performance budgets
 */

export interface PerformanceBudget {
  // Page load metrics (in ms)
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  ttfb?: number; // Time to First Byte

  // Bundle sizes (in bytes)
  jsBundle?: number;
  cssBundle?: number;
  totalBundle?: number;

  // API performance (in ms)
  apiResponseTime?: number;

  // Resource counts
  maxRequests?: number;
  maxImages?: number;
}

export interface PerformanceMetrics {
  lcp: number;
  fid: number;
  cls: number;
  ttfb: number;
  jsSize: number;
  cssSize: number;
  totalSize: number;
  requestCount: number;
  imageCount: number;
  timestamp: number;
}

export const DEFAULT_BUDGET: PerformanceBudget = {
  lcp: 2500, // 2.5s
  fid: 100, // 100ms
  cls: 0.1, // 0.1
  ttfb: 600, // 600ms
  jsBundle: 500 * 1024, // 500KB
  cssBundle: 100 * 1024, // 100KB
  totalBundle: 1 * 1024 * 1024, // 1MB
  apiResponseTime: 500, // 500ms
  maxRequests: 50,
  maxImages: 20,
};

export class PerformanceBudgetMonitor {
  private budget: PerformanceBudget;
  private violations: string[] = [];

  constructor(budget: PerformanceBudget = DEFAULT_BUDGET) {
    this.budget = { ...DEFAULT_BUDGET, ...budget };
  }

  /**
   * Collect current performance metrics
   */
  async collectMetrics(): Promise<PerformanceMetrics> {
    const metrics: Partial<PerformanceMetrics> = {
      timestamp: Date.now(),
    };

    // Web Vitals
    if ('PerformanceObserver' in window) {
      // LCP
      const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
      if (lcpEntries.length > 0) {
        metrics.lcp = lcpEntries[lcpEntries.length - 1].startTime;
      }

      // FID (using First Input entry)
      const fidEntries = performance.getEntriesByType('first-input');
      if (fidEntries.length > 0) {
        const entry = fidEntries[0] as PerformanceEventTiming;
        metrics.fid = entry.processingStart - entry.startTime;
      }

      // CLS (approximate)
      const clsEntries = performance.getEntriesByType('layout-shift');
      metrics.cls = clsEntries.reduce((sum, entry) => {
        const layoutShift = entry as PerformanceEntry & { value: number; hadRecentInput: boolean };
        if (!layoutShift.hadRecentInput) {
          return sum + layoutShift.value;
        }
        return sum;
      }, 0);
    }

    // TTFB
    const navigationEntries = performance.getEntriesByType('navigation');
    if (navigationEntries.length > 0) {
      const nav = navigationEntries[0] as PerformanceNavigationTiming;
      metrics.ttfb = nav.responseStart - nav.requestStart;
    }

    // Resource sizes
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];

    metrics.jsSize = resources
      .filter(r => r.name.endsWith('.js'))
      .reduce((sum, r) => sum + (r.transferSize || 0), 0);

    metrics.cssSize = resources
      .filter(r => r.name.endsWith('.css'))
      .reduce((sum, r) => sum + (r.transferSize || 0), 0);

    metrics.totalSize = resources.reduce((sum, r) => sum + (r.transferSize || 0), 0);

    metrics.requestCount = resources.length;
    metrics.imageCount = resources.filter(r =>
      r.initiatorType === 'img' || r.name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)
    ).length;

    return metrics as PerformanceMetrics;
  }

  /**
   * Check if metrics are within budget
   */
  checkBudget(metrics: PerformanceMetrics): boolean {
    this.violations = [];

    // Check LCP
    if (this.budget.lcp && metrics.lcp > this.budget.lcp) {
      this.violations.push(
        `LCP: ${Math.round(metrics.lcp)}ms exceeds budget of ${this.budget.lcp}ms`
      );
    }

    // Check FID
    if (this.budget.fid && metrics.fid > this.budget.fid) {
      this.violations.push(
        `FID: ${Math.round(metrics.fid)}ms exceeds budget of ${this.budget.fid}ms`
      );
    }

    // Check CLS
    if (this.budget.cls && metrics.cls > this.budget.cls) {
      this.violations.push(
        `CLS: ${metrics.cls.toFixed(3)} exceeds budget of ${this.budget.cls}`
      );
    }

    // Check TTFB
    if (this.budget.ttfb && metrics.ttfb > this.budget.ttfb) {
      this.violations.push(
        `TTFB: ${Math.round(metrics.ttfb)}ms exceeds budget of ${this.budget.ttfb}ms`
      );
    }

    // Check JS size
    if (this.budget.jsBundle && metrics.jsSize > this.budget.jsBundle) {
      this.violations.push(
        `JS Bundle: ${this.formatBytes(metrics.jsSize)} exceeds budget of ${this.formatBytes(this.budget.jsBundle)}`
      );
    }

    // Check CSS size
    if (this.budget.cssBundle && metrics.cssSize > this.budget.cssBundle) {
      this.violations.push(
        `CSS Bundle: ${this.formatBytes(metrics.cssSize)} exceeds budget of ${this.formatBytes(this.budget.cssBundle)}`
      );
    }

    // Check total size
    if (this.budget.totalBundle && metrics.totalSize > this.budget.totalBundle) {
      this.violations.push(
        `Total Bundle: ${this.formatBytes(metrics.totalSize)} exceeds budget of ${this.formatBytes(this.budget.totalBundle)}`
      );
    }

    // Check request count
    if (this.budget.maxRequests && metrics.requestCount > this.budget.maxRequests) {
      this.violations.push(
        `Request Count: ${metrics.requestCount} exceeds budget of ${this.budget.maxRequests}`
      );
    }

    // Check image count
    if (this.budget.maxImages && metrics.imageCount > this.budget.maxImages) {
      this.violations.push(
        `Image Count: ${metrics.imageCount} exceeds budget of ${this.budget.maxImages}`
      );
    }

    return this.violations.length === 0;
  }

  /**
   * Get budget violations
   */
  getViolations(): string[] {
    return this.violations;
  }

  /**
   * Log performance report
   */
  async logReport(): Promise<void> {
    const metrics = await this.collectMetrics();
    const withinBudget = this.checkBudget(metrics);

    console.group('🎯 Performance Budget Report');
    console.log('Timestamp:', new Date(metrics.timestamp).toISOString());
    console.log('Status:', withinBudget ? '✅ Within Budget' : '❌ Budget Exceeded');

    console.group('Web Vitals');
    console.log(`LCP: ${Math.round(metrics.lcp)}ms (budget: ${this.budget.lcp}ms)`);
    console.log(`FID: ${Math.round(metrics.fid)}ms (budget: ${this.budget.fid}ms)`);
    console.log(`CLS: ${metrics.cls.toFixed(3)} (budget: ${this.budget.cls})`);
    console.log(`TTFB: ${Math.round(metrics.ttfb)}ms (budget: ${this.budget.ttfb}ms)`);
    console.groupEnd();

    console.group('Bundle Sizes');
    console.log(`JS: ${this.formatBytes(metrics.jsSize)} (budget: ${this.formatBytes(this.budget.jsBundle || 0)})`);
    console.log(`CSS: ${this.formatBytes(metrics.cssSize)} (budget: ${this.formatBytes(this.budget.cssBundle || 0)})`);
    console.log(`Total: ${this.formatBytes(metrics.totalSize)} (budget: ${this.formatBytes(this.budget.totalBundle || 0)})`);
    console.groupEnd();

    console.group('Resources');
    console.log(`Requests: ${metrics.requestCount} (budget: ${this.budget.maxRequests})`);
    console.log(`Images: ${metrics.imageCount} (budget: ${this.budget.maxImages})`);
    console.groupEnd();

    if (this.violations.length > 0) {
      console.group('⚠️ Budget Violations');
      this.violations.forEach(v => console.warn(v));
      console.groupEnd();
    }

    console.groupEnd();
  }

  /**
   * Format bytes for display
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }
}

// Global monitor instance
export const perfBudget = new PerformanceBudgetMonitor();

// Auto-log performance report in development
if (import.meta.env.DEV) {
  // Wait for page load
  window.addEventListener('load', () => {
    setTimeout(() => {
      perfBudget.logReport();
    }, 3000); // Wait 3s for all metrics to be collected
  });
}
