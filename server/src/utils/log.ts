function log(type: string, message: string) {
  if (process.env.VITEST) return;
  console.log(`[${type}] [${new Date().toLocaleString()}] - ${message}`);
}

export const logger = {
  debug(message: string) {
    log("DEBUG", message);
  },
  info(message: string) {
    log("INFO", message);
  },
  warn(message: string) {
    log("WARN", message);
  },
  error(message: string) {
    log("ERROR", message);
  }
};
