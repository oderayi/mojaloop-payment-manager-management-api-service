/**************************************************************************
 *  (C) Copyright ModusBox Inc. 2019 - All rights reserved.               *
 *                                                                        *
 *  This file is made available under the terms of the license agreement  *
 *  specified in the corresponding source code repository.                *
 *                                                                        *
 *  ORIGINAL AUTHOR:                                                      *
 *       James Bush - james.bush@modusbox.com                             *
 **************************************************************************/

const util = require('util');
const coBody = require('co-body');

const randomPhrase = require('@internal/randomphrase');
const { Errors } = require('@mojaloop/sdk-standard-components');

/**
 * Log raw to console as a last resort
 * @return {Function}
 */
const createErrorHandler = () => async (ctx, next) => {
    try {
        await next();
    } catch (err) {
        // TODO: return a 500 here if the response has not already been sent?
        console.log(`Error caught in catchall: ${err.stack || util.inspect(err, { depth: 10 })}`);
    }
};


/**
 * tag each incoming request with a unique identifier
 * @return {Function}
 */
const createRequestIdGenerator = () => async (ctx, next) => {
    ctx.request.id = randomPhrase();
    await next();
};

/**
 * Add a log context for each request, log the receipt and handling thereof
 * @param logger
 * @param sharedState
 * @return {Function}
 */
const createLogger = (logger) => async (ctx, next) => {
    ctx.state = {
        ...ctx.state
    };
    ctx.state.logger = logger.push({ request: {
        id: ctx.request.id,
        path: ctx.path,
        method: ctx.method
    }});
    ctx.state.logger.push({ body: ctx.request.body }).log('Request received');
    try {
        await next();
    } catch (err) {
        ctx.state.logger.push(err).log('Error');
    }
    await ctx.state.logger.log('Request processed');
};


/**
 * Add validation for each inbound request
 * @param validator
 * @return {Function}
 */
const createRequestValidator = (validator) => async (ctx, next) => {
    ctx.state.logger.log('Validating request');
    try {
        ctx.state.path = validator.validateRequest(ctx, ctx.state.logger);
        ctx.state.logger.log('Request passed validation');
        await next();
    } catch (err) {
        ctx.state.logger.push({ err }).log('Request failed validation.');
        // send a mojaloop spec error response
        ctx.response.status = err.httpStatusCode || 400;

        if(err instanceof Errors.MojaloopFSPIOPError) {
            // this is a specific mojaloop spec error
            ctx.response.body = err.toApiErrorObject();
            return;
        }

        // generic mojaloop spec validation error
        ctx.response.body = {
            errorInformation: {
                errorCode: '3100',
                errorDescription: `${err.dataPath ? err.dataPath + ' ' : ''}${err.message}`
            }
        };
    }
};


/**
 * Override Koa's default behaviour of returning the status code as text in the body. If we
 * haven't defined the body, we want it empty. Note that if setting this to null, Koa appears
 * to override the status code with a 204. This is correct behaviour in the sense that the
 * status code correctly corresponds to the content (none) but unfortunately the Mojaloop API
 * does not respect this convention and requires a 200.
 * @return {Function}
 */
const createResponseBodyHandler = () => async (ctx, next) => {
    if (ctx.response.body === undefined) {
        ctx.response.body = '';
    }
    return await next();
};


module.exports = {
    createErrorHandler,
    createRequestIdGenerator,
    createLogger,
    createRequestValidator,
    createResponseBodyHandler,
};
