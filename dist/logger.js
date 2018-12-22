"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var winston_1 = require("winston");
var logger = winston_1.createLogger({
    level: process.env.LOG_LEVEL || 'warn',
    format: winston_1.format.combine(winston_1.format.colorize(), winston_1.format.splat(), winston_1.format.simple()),
    transports: [
        new winston_1.transports.Console()
    ]
});
exports.logger = logger;
