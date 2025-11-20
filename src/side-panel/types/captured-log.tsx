type CapturedLog = {
  method: 'log' | 'error' | 'warn' | 'info' | 'debug';
  args: unknown[];
  timestamp: string;
}

export default CapturedLog