import { CapturedLog } from "../types";

async function copyLogBufferToClipboard(
  buffer: Array<CapturedLog>,
  asJson = true
): Promise<void> {
  try {
    let text: string;

    if (asJson) {
      // Pretty-print JSON
      text = JSON.stringify(buffer, null, 2);
    } else {
      // Simple text format
      text = buffer
        .map(
          entry =>
            `[${entry.timestamp}] [${entry.method.toUpperCase()}] ${entry.args
              .map(arg =>
                typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
              )
              .join(' ')}`
        )
        .join('\n');
    }

    await navigator.clipboard.writeText(text);
    console.info('Log buffer copied to clipboard');
  } catch (err) {
    console.error('Failed to copy log buffer to clipboard:', err);
  }
}

export default copyLogBufferToClipboard