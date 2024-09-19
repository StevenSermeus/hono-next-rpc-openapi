import { createLogger, format, transports } from 'winston';

export const logger = createLogger({
  level: 'info',
  defaultMeta: { service: 'hono-api' },
  format: format.combine(format.timestamp(), format.json(), format.colorize()),
  transports: [new transports.Console()],
});

if (process.env.NODE_ENV == 'test' && process.env.CI === 'true') {
  logger.silent = true;
}
