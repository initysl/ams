const winston = require('winston');
const { format } = require('date-fns');

const formatTimestamp = () => {
  return format(new Date(), 'yyyy-MM-dd hh:mm:ss a');
};

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: formatTimestamp }),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level.toUpperCase()}]: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(), // Log to console
    // Hosted filesystems are ephemeral and can be read-only; in production the
    // platform captures stdout, so the file transport only adds a failure mode.
    ...(process.env.NODE_ENV === 'production'
      ? []
      : [new winston.transports.File({ filename: 'app.log' })]),
  ],
});

// A transport error must never take down the process.
logger.on('error', (err) => console.error('Logger transport error:', err));

module.exports = logger;
