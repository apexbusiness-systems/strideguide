/**
 * Production Logger - Enterprise-grade logging with security controls
 * Prevents sensitive data exposure while maintaining debugging capability
 */

interface LogLevel {
  ERROR: 'ERROR';
  WARN: 'WARN';
  INFO: 'INFO';
  DEBUG: 'DEBUG';
}

interface LogEntry {
  level: keyof LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
  userId?: string;
  sessionId?: string;
}

class ProductionLogger {
  private isDevelopment = import.meta.env.MODE === 'development' || import.meta.env.DEV;
  private logBuffer: LogEntry[] = [];
  private maxBufferSize = 100;

  /**
   * Sanitize data before logging to prevent sensitive info exposure
   */
  private sanitize(data: unknown): unknown {
    if (typeof data === 'string') {
      return data
        .replace(/\b[\w.-]+@[\w.-]+\.\w+\b/g, '[EMAIL_REDACTED]')
        .replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '[PHONE_REDACTED]')
        .replace(/\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g, '[CARD_REDACTED]')
        .replace(/Bearer\s+\w+/g, 'Bearer [TOKEN_REDACTED]')
        .replace(/"password"\s*:\s*"[^"]*"/g, '"password":"[REDACTED]"');
    }

    if (typeof data === 'object' && data !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(data)) {
        if (['password', 'token', 'secret', 'key', 'auth'].some(sensitive =>
          key.toLowerCase().includes(sensitive))) {
          sanitized[key] = '[REDACTED]';
        } else {
          sanitized[key] = this.sanitize(value);
        }
      }
      return sanitized;
    }

    return data;
  }

  /**
   * Create standardized log entry
   */
  private createLogEntry(
    level: keyof LogLevel,
    message: string,
    context?: Record<string, unknown>
  ): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      context: context ? this.sanitize(context) as Record<string, unknown> : undefined,
      sessionId: this.getSessionId(),
    };
  }

  /**
   * Get current session ID (implementation depends on your session management)
   */
  private getSessionId(): string {
    // In a real implementation, this would get the actual session ID
    return 'session_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Add to buffer and optionally send to external service
   */
  private addToBuffer(entry: LogEntry): void {
    this.logBuffer.push(entry);
    
    if (this.logBuffer.length > this.maxBufferSize) {
      this.logBuffer.shift(); // Remove oldest entry
    }

    // In production, send critical errors to monitoring service
    if (!this.isDevelopment && entry.level === 'ERROR') {
      this.sendToMonitoringService(entry);
    }
  }

  /**
   * Send to external monitoring service (Sentry, LogRocket, etc.)
   */
  private async sendToMonitoringService(entry: LogEntry): Promise<void> {
    try {
      // Example integration - replace with your monitoring service
      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
      });
    } catch (error) {
      // Fallback to console in production if monitoring fails
      console.error('Failed to send log to monitoring service:', error);
    }
  }

  /**
   * Public logging methods
   */
  error(message: string, context?: Record<string, unknown>): void {
    const entry = this.createLogEntry('ERROR', message, context);
    this.addToBuffer(entry);

    if (this.isDevelopment) {
      console.error(`[${entry.timestamp}] ERROR: ${message}`, entry.context || '');
    }
  }

  warn(message: string, context?: Record<string, unknown>): void {
    const entry = this.createLogEntry('WARN', message, context);
    this.addToBuffer(entry);

    if (this.isDevelopment) {
      console.warn(`[${entry.timestamp}] WARN: ${message}`, entry.context || '');
    }
  }

  info(message: string, context?: Record<string, unknown>): void {
    const entry = this.createLogEntry('INFO', message, context);
    this.addToBuffer(entry);

    if (this.isDevelopment) {
      console.info(`[${entry.timestamp}] INFO: ${message}`, entry.context || '');
    }
  }

  debug(message: string, context?: Record<string, unknown>): void {
    if (!this.isDevelopment) return; // Never log debug in production

    const entry = this.createLogEntry('DEBUG', message, context);
    console.debug(`[${entry.timestamp}] DEBUG: ${message}`, entry.context || '');
  }

  /**
   * Get recent logs for debugging
   */
  getRecentLogs(level?: keyof LogLevel): LogEntry[] {
    if (level) {
      return this.logBuffer.filter(entry => entry.level === level);
    }
    return [...this.logBuffer];
  }

  /**
   * Clear log buffer
   */
  clearBuffer(): void {
    this.logBuffer = [];
  }
}

// Export singleton instance
export const logger = new ProductionLogger();

// Helper functions for easy migration from console.log
export const logError = (message: string, context?: Record<string, unknown>) => logger.error(message, context);
export const logWarn = (message: string, context?: Record<string, unknown>) => logger.warn(message, context);
export const logInfo = (message: string, context?: Record<string, unknown>) => logger.info(message, context);
export const logDebug = (message: string, context?: Record<string, unknown>) => logger.debug(message, context);