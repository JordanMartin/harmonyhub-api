import { createLogger, transports, format, loggers } from 'winston';

const logger = createLogger({
    level: process.env.LOG_LEVEL || 'warn',
    format: format.combine(
        format.colorize(),
        format.splat(),
        format.simple(),
    ),
    transports: [
        new transports.Console()
    ]
});

export { logger };