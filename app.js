const express = require('express'),
    path = require('path'),
    pino = require('pino'),
    cookieParser = require('cookie-parser'),
    nodeToolsJsPath = './util',
    nodeModulesServerPath = './modules_server',
    { v4: uuidv4 } = require('uuid'),
    EAS = require(`${nodeToolsJsPath}/expressAppSettings.js`);

global.globalLogger = pino({
    level: 'info',
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true
      }
    }
});

require('dotenv').config();

const app = express();

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended: false}));

global.globalStatusCodes = require(`${nodeToolsJsPath}/statusCodes.js`);

// Malformed requests
EAS.malformedCheck(app)

EAS.genericWebAppConfig(app, {
    bodySize: '5mb'
});


// Disable cache for XHR requests
EAS.disableXHRCaching(app);


app.use(function (req, res, next) {
    if (!path.extname(req.originalUrl)) {
        globalLogger.info("  #URL Request: %s %s %s", req.method, req.originalUrl)
    }

    if(!req.cookies?.sessionId){
      res.cookie('sessionId', uuidv4(), { maxAge: 60*60*1000 });
    }
    next()
});


// Static files
app.use(express.static(path.resolve(__dirname, "public")));


// Main app

const mainApp = new express.Router();

[
  `${nodeModulesServerPath}/streamApp.js`,
  `${nodeModulesServerPath}/mainApp.js`
].forEach(function (file) {
    let rtr = require(file);

    if (!Array.isArray(rtr)) {
        rtr = [rtr];
    }

    rtr.forEach(function (subRouter) {
        app.use(subRouter.scope, subRouter.router)
    });
});

// Catch all for un-responded requests
app.use(function (req, res, next) {
    globalLogger.warn(`404: ${req.originalUrl}`)

    if (!!path.extname(req.originalUrl) || req.xhr) {

        globalStatusCodes.status404(req, res)

    } else {
        res.status(404).end()

    }

});

EAS.processListeners();

app.use(EAS.errorHandler);

EAS.listen(app, process.env.APP_PORT);

module.exports = app;
