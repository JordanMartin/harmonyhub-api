import { createLogger, transports, format, loggers } from 'winston';

const logger = createLogger({
    level: 'debug',
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