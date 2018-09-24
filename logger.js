// Logger Configure
let winston = require('winston');
let logger = function(logfilename){
    return new winston.createLogger({
        transports: [
            new (winston.transports.File)({
                timestamp: 'true',
                filename: logfilename
            })
        ]
    });
};
