/**************************************************************************
 *  (C) Copyright ModusBox Inc. 2020 - All rights reserved.               *
 *                                                                        *
 *  This file is made available under the terms of the license agreement  *
 *  specified in the corresponding source code repository.                *
 *                                                                        *
 *  ORIGINAL AUTHOR:                                                      *
 *       Murthy Kakarlamudi - murthy@modusbox.com                   *
 **************************************************************************/

const { DFSPEnvConfigModel } = require('@modusbox/mcm-client');

class DFSP {
    constructor(opts) {
        this._logger = opts.logger;
        this._envId = opts.conf.envId;
        this._dfspId = opts.conf.dfspId;
        this._mcmDFSPEnvConfigModel = new DFSPEnvConfigModel({
            dfspId: opts.dfspId,
            logger: opts.logger,
            hubEndpoint: opts.mcmServerEndpoint,
        });
    }

    static _convertToApiFormat(dfsp) {
        return {
            id: dfsp.dfsp_id,
        };
    }

    /**
     *
     */
    async getDfspDetails() {
        const fspList = await this._mcmDFSPEnvConfigModel.getDFSPList({
            envId : this._envId
        });
        return fspList.filter(fsp => fsp.id === this._dfspId)[0];
    }

}

module.exports = DFSP;
