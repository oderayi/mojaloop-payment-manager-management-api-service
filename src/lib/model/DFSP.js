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
const { DFSPEnvConfigModel } = require('@modusbox/mcm-client');

class DFSP {
    constructor(opts) {
        this._db = opts.db;
        this._mcmServerEndpoint = opts.conf.mcmServerEndpoint;
        this._agent = new http.Agent({
            keepAlive: true
        });
        this._logger = opts.logger;
        this._envId = opts.conf.envId;
        this._dfspId = opts.conf.dfspId;
        this._mcmDFSPEnvConfigModel = new DFSPEnvConfigModel({
            dfspId: opts.conf.dfspId,
            logger: opts.logger,
            hubEndpoint: opts.conf.mcmServerEndpoint,        
        });
    }

    static _convertToApiFormat(dfsp) {
        return {
            id: dfsp.dfsp_id,
            
        };
    }

    /**
     *
     * @param id {string}
     */
    async getDfspDetails() {
        this._logger.log(`Extracting all the FSPs for environment ${this._envId}`);
        // const fspList = await this._get(`/environments/${opts.envId}/dfsps`);
        const fspList = await this._mcmDFSPEnvConfigModel.getDFSPList({
            envId : this._envId
        });
        this._logger.log(`Returned result from DB: ${util.inspect(fspList)}`);
        let retFsp;
        console.log(`this_dfspId: ${this._dfspId}`);
        fspList.filter( fsp => {
            retFsp =  fsp.id === this._dfspId?fsp:undefined;
        });
        console.log(`retFsp: ${util.inspect(retFsp)}`);
        return retFsp;
    }

}

module.exports = DFSP;