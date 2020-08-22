/**************************************************************************
 *  (C) Copyright ModusBox Inc. 2019 - All rights reserved.               *
 *                                                                        *
 *  This file is made available under the terms of the license agreement  *
 *  specified in the corresponding source code repository.                *
 *                                                                        *
 *  ORIGINAL AUTHOR:                                                      *
 *       Murthy Kakarlamudi - murthy@modusbox.com                         *
 **************************************************************************/

const Koa = require('koa');

const http = require('http');
const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');

const { Logger, Transports } = require('@internal/log');

const Validate = require('@internal/validate');
const database = require('@internal/database');
const router = require('@internal/router');
const handlers = require('./handlers');
const middlewares = require('./middlewares');

class UIAPIServer {
    constructor(conf) {
        this._conf = conf;
        this._api = null;
        this._server = null;
        this._logger = null;
    }

    async setupApi() {
        this._api = new Koa();
        this._logger = await this._createLogger();
        const specPath = path.join(__dirname, 'api.yaml');
        const apiSpecs = yaml.load(fs.readFileSync(specPath));
        const validator = new Validate();
        await validator.initialise(apiSpecs);

        this._db = await database({
            ...this._conf,
            logger: this._logger,
        });

        this._api.use(middlewares.createErrorHandler());

        const sharedState = { conf: this._conf };
        this._api.use(middlewares.createLogger(this._logger, sharedState));
        this._api.use(middlewares.createRequestValidator(validator));
        this._api.use(async (ctx, next) => {
            ctx.state.db = this._db;
            await next();
        });
        this._api.use(router(handlers));
        this._api.use(middlewares.createResponseBodyHandler());

        this._server = this._createServer();
        return this._server;
    }

    async start() {
        await new Promise((resolve) => this._server.listen(this._conf.inboundPort, resolve));
        this._logger.log(`Serving inbound API on port ${this._conf.inboundPort}`);

    }

    async stop() {
        if (!this._server) {
            return;
        }
        await new Promise(resolve => this._server.close(resolve));
        console.log('inbound shut down complete');
    }

    async _createLogger() {
        const transports = await Promise.all([Transports.consoleDir()]);
        // Set up a logger for each running server
        return new Logger({
            context: {
                app: 'mojaloop-payment-manager-management-api-service'
            },
            space: this._conf.logIndent,
            transports,
        });
    }

    _createServer() {
        return http.createServer(this._api.callback());
    }

}

module.exports = UIAPIServer;
