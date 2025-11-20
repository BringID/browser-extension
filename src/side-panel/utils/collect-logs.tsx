import { CapturedLog } from "../types";

function collectLogs(
  onLog?: (entry: CapturedLog) => void
): CapturedLog[] {
  if ((window as any).__consolePatched) {
    console.warn('collectLogs already initialized');
    return (window as any).__logBuffer || [];
  }

  (window as any).__consolePatched = true;

  const logBuffer: CapturedLog[] = [];
  (window as any).__logBuffer = logBuffer;

  const methods: Array<CapturedLog['method']> = [
    'log',
    'error',
    'warn',
    'info',
    'debug'
  ];

  let isLogging = false;

  methods.forEach(method => {
    const original = console[method].bind(console);

    console[method] = (...args: unknown[]): void => {
      if (isLogging) return; // prevent infinite recursion
      isLogging = true;
      try {
        const entry: CapturedLog = {
          method,
          args,
          timestamp: new Date().toISOString()
        };

        logBuffer.push(entry);
        if (onLog) onLog(entry);

        original(...args);
      } finally {
        isLogging = false;
      }
    };
  });

  window.addEventListener('error', (event: ErrorEvent) => {
    const entry: CapturedLog = {
      method: 'error',
      args: [event.message, event.filename, event.lineno, event.colno],
      timestamp: new Date().toISOString()
    };
    logBuffer.push(entry);
    if (onLog) onLog(entry);
  });

  window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
    const entry: CapturedLog = {
      method: 'error',
      args: ['Unhandled promise rejection', event.reason],
      timestamp: new Date().toISOString()
    };
    logBuffer.push(entry);
    if (onLog) onLog(entry);
  });

  return logBuffer;
}

export default collectLogs