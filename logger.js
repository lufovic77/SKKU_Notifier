// Logger Configure
let winston = require('winston');
exports.logger = function(logfilename){
    return winston.createLogger({
        transports: [
            new (winston.transports.File)({
                timestamp: 'true',
                filename: logfilename
            })
        ]
    });
};
