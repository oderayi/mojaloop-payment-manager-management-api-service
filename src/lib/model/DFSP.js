/**************************************************************************
 *  (C) Copyright ModusBox Inc. 2020 - All rights reserved.               *
 *                                                                        *
 *  This file is made available under the terms of the license agreement  *
 *  specified in the corresponding source code repository.                *
 *                                                                        *
 *  ORIGINAL AUTHOR:                                                      *
 *       Murthy Kakarlamudi - murthy@modusbox.com                   *
 **************************************************************************/
const util = require('util');
const { request } = require('@mojaloop/sdk-standard-components');
const { buildUrl } = require('./utils');
const http = require('http');

class DFSP {
    constructor(opts) {
        this._db = opts.db;
        this._conf = opts.conf,
        this._agent = new http.Agent({
            keepAlive: true
        });
        this._logger = opts.logger;
    }

    static _convertToApiFormat(dfsp) {
        return {
            id: dfsp.dfsp_id,
            
        };
    }

    _get(url, query = {}) {
        Object.entries(query).forEach(([k, v]) => {
            if (v === undefined) {
                delete query[k];
            }
        });
        const reqOpts = {
            method: 'GET',
            uri: buildUrl(this._conf.mcmServerEndpoint, url),
            qs: query,
            headers: this._conf.mcmAPIToken,
        };

        return request({...reqOpts, agent: this._agent});
    }

    /**
     *
     * @param id {string}
     */
    async getDfspDetails(opts) {
        this._logger.log(`Extracting all the FSPs for environment dev`);
        // const fspList = await this._get(`/environments/${opts.envId}/dfsps`);
        const fspList = await this._get(`/environments/1/dfsps`);
        this._logger.log(`Returned result from DB: ${util.inspect(fspList)}`);
        return fspList;
    }

}

module.exports = DFSP;