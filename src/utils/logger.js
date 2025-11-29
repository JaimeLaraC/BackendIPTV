const winston = require('winston');
const path = require('path');

// Definir niveles de log y colores
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};

const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'white',
};

winston.addColors(colors);

// Formato de log
const format = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
    winston.format.colorize({ all: true }),
    winston.format.printf(
        (info) => `${info.timestamp} ${info.level}: ${info.message}`,
    ),
);

// Transportes (dónde guardar los logs)
const transports = [
    // Consola
    new winston.transports.Console(),

    // Archivo de errores
    new winston.transports.File({
        filename: path.join(__dirname, '../../logs/error.log'),
        level: 'error',
        format: winston.format.combine(
            winston.format.uncolorize(),
            winston.format.json()
        )
    }),

    // Archivo de todos los logs
    new winston.transports.File({
        filename: path.join(__dirname, '../../logs/all.log'),
        format: winston.format.combine(
            winston.format.uncolorize(),
            winston.format.json()
        )
    }),
];

const logger = winston.createLogger({
    level: process.env.NODE_ENV === 'development' ? 'debug' : 'warn',
    levels,
    format,
    transports,
});

module.exports = logger;
