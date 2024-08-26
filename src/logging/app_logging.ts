import pino from 'pino';

export const appLog = pino({
    level: process.env.PINO_LOG_LEVEL || 'info',
    redact: { paths: ['tokens.access_token', 'message.token'], censor: '[HIDDEN]' },
    formatters: {
        level: (label) => {
            return { level: label.toUpperCase() };
        },
    },
    timestamp: pino.stdTimeFunctions.isoTime,
});
