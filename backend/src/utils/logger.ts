type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: unknown;
}

class Logger {
  private static instance: Logger | null = null;

  private constructor() {}

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private formatEntry(level: LogLevel, message: string, data?: unknown): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...(data !== undefined && { data }),
    };
  }

  private colorize(level: LogLevel, text: string): string {
    const colors: Record<LogLevel, string> = {
      info: '\x1b[36m',    // Cyan
      warn: '\x1b[33m',    // Yellow
      error: '\x1b[31m',   // Red
      debug: '\x1b[90m',   // Gray
    };
    const reset = '\x1b[0m';
    return `${colors[level]}${text}${reset}`;
  }

  public info(message: string, data?: unknown): void {
    const entry = this.formatEntry('info', message, data);
    console.log(
      this.colorize('info', `[${entry.timestamp}] ℹ ${entry.message}`),
      data !== undefined ? data : ''
    );
  }

  public warn(message: string, data?: unknown): void {
    const entry = this.formatEntry('warn', message, data);
    console.warn(
      this.colorize('warn', `[${entry.timestamp}] ⚠ ${entry.message}`),
      data !== undefined ? data : ''
    );
  }

  public error(message: string, data?: unknown): void {
    const entry = this.formatEntry('error', message, data);
    console.error(
      this.colorize('error', `[${entry.timestamp}] ✖ ${entry.message}`),
      data !== undefined ? data : ''
    );
  }

  public debug(message: string, data?: unknown): void {
    if (process.env.NODE_ENV === 'development') {
      const entry = this.formatEntry('debug', message, data);
      console.debug(
        this.colorize('debug', `[${entry.timestamp}] 🐛 ${entry.message}`),
        data !== undefined ? data : ''
      );
    }
  }
}

export const logger = Logger.getInstance();
