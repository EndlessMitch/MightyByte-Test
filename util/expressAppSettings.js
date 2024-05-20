const comp = require('compression'),
bodyParser = require('body-parser'),
statusCodes = require('./statusCodes'),
async = require('async'),
fs = require('fs'),
path = require('path');

let appServerInstance = null;

module.exports = {
    genericWebAppConfig: (app, conf) => {
        app.use(
            comp({
                filter: (req, res) => {
                    if (conf.compressionFilter) {
                        return conf.compressionFilter(comp, req, res);
                    } else {
                        return comp.filter(req, res);
                    }
                },
            })
        );

        app.enable('trust proxy');
        app.disable('x-powered-by');
        app.use(bodyParser.urlencoded({extended: false, limit: conf.bodySize}));
        app.use(bodyParser.text({type: 'text/plain'}));
        app.use(bodyParser.json({limit: conf.bodySize}));
    },

    disableXHRCaching: (app) => {
        app.use((req, res, next) => {
            if (req.xhr) {
                ['If-Modified-Since', 'If-None-Match'].forEach((h) => {
                    delete req.headers[h];
                    delete req.headers[h.toLowerCase()];
                });

                const oSetHeader = res.setHeader;

                res.setHeader(
                    'Cache-Control',
                    'max-age=0, private, no-cache, no-store, must-revalidate, post-check=0, pre-check=0'
                );
                res.setHeader('Expires', '-1');
                res.setHeader('Pragma', 'no-cache');
                res.status(200);

                res.setHeader = (tag, value) => {
                    if (tag !== 'ETag') {
                        //oSetHeader.apply(res, arguments);
                    }
                };
            }
            next();
        });
    },

    malformedCheck: (app) => {
        app.use((req, res, next) => {
            let err = null;

            try {
                decodeURIComponent(req.path);
            } catch (e) {
                err = e;
            }

            if (err) {
                globalLogger.warn(`Malformed request: ${req.originalUrl}`);
                return statusCodes.status404(req, res);
            }

            next();
        });
    },

    listen: (app, port, cb = () => {}) => {
        const localInstance = app.listen(port);
        appServerInstance = localInstance;
        globalLogger.info(`App started on port ${port} http`);
        cb(localInstance);
    },

    errorHandler: (err, req, res, next) => {
        if (res.headersSent) {
            return next(err);
        }
        globalLogger.error(req.originalUrl);
        if (err) {
            globalLogger.error(err.stack);
        }
        res.status(500);
        res.end();
    },

    processListeners: () => {
        const exitHandler = (options) => {
            globalLogger.info('App exit triggered');

            if (appServerInstance) {
                appServerInstance.close();
            }

            setTimeout(() => {
                process.exit(process.pid);
            }, 1500);
        };

        process.on('uncaughtException', (err) => {
            globalLogger.error(err && err.stack ? err.stack : err);
        });

        process.on('SIGINT', exitHandler.bind(null, {exit: true}));
        process.on('SIGTERM', exitHandler.bind(null, {exit: true}));
        process.on('SIGUSR1', exitHandler.bind(null, {exit: true}));
        process.on('SIGUSR2', exitHandler.bind(null, {exit: true}));
    },
};
