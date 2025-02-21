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
    new winston.transports.File({ filename: 'app.log' }), // Log to file
  ],
});

module.exports = logger;
