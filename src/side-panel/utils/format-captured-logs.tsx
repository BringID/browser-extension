import { CapturedLog } from "../types";

function formatCapturedLogs(
  logs: CapturedLog[]
): string {
  return logs
    .map(entry => {
      const timestamp = entry.timestamp;
      const level = entry.method.toUpperCase();

      const formattedArgs = entry.args
        .map(arg => {
          if (typeof arg === "string") return arg;

          try {
            return JSON.stringify(arg);
          } catch {
            return String(arg);
          }
        })
        .join(" ");

      return `${timestamp} ${level}: ${formattedArgs}`;
    })
    .join("\n\n");
}

export default formatCapturedLogs