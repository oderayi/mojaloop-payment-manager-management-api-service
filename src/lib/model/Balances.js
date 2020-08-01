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

 class Balances {
    constructor(config) {
        this.config = config;
        this.mockData = config.mockData;
        this._requests = new MojaloopRequests({
            logger: this._logger,
            peerEndpoint: config.peerEndpoint,
            dfspId: config.dfspId,
            tls: config.tls,
            jwsSign: config.jwsSign,
            jwsSignPutParties: config.jwsSignPutParties,
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
    findBalances(url,headers,query) {
        if (this.mockData) {
            return mock.getTransfers(opts);
        }
        try {
            const res = await this._requests.getCustom('/reports/balances', headers, query, true);
            this._logger.push({ peer: res }).log('Party lookup sent to peer');

            return res;
        }
        catch(err) {
            
            return reject(err);
        }
    }
 }

 module.exports = Balances;