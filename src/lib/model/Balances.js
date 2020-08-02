/**************************************************************************
 *  (C) Copyright ModusBox Inc. 2020 - All rights reserved.               *
 *                                                                        *
 *  This file is made available under the terms of the license agreement  *
 *  specified in the corresponding source code repository.                *
 *                                                                        *
 *  ORIGINAL AUTHOR:                                                      *
 *       Murthy Kakarlamudi - murthy@modusbox.com                   *
 **************************************************************************/

const { MojaloopRequests } = require('@mojaloop/sdk-standard-components');
const util = require('util');

 class Balances {
    constructor(config,logger) {
        this._logger = logger;
        this._requests = new MojaloopRequests({
            logger: logger,
            peerEndpoint: config.peerEndpoint,
            dfspId: config.dfspId,
            tls: config.tls,
            jwsSign: config.jwsSign,
            jwsSigningKey: config.jwsSigningKey,
            wso2Auth: config.wso2Auth
        });
    }

    /**
     *
     * @param opts {Object}
     * @param [opts.startTimestamp] {string}
     * @param [opts.endTimestamp] {string}
     * @param [opts.institution] {string}
     * @param [opts.batchId] {number}
     * @param [opts.status] {string}
     */
    async findBalances(url,headers,query) {
        try {
            const res = await this._requests.getCustom(url, headers, query);
            await this._logger.push({statusCode: res.statusCode, headers: res.headers}).log('GET request sent successfully');
            return res;
        }
        catch(err) {
            
            return reject(err);
        }
    }
 }

 module.exports = Balances;