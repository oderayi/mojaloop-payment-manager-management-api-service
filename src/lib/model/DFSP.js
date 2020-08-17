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

class DFSP {
    constructor(opts) {
        this._db = opts.db;
        this._logger = opts._logger;
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
    async getDfspDetails(dfspId) {
        this._logger.log(`Looking up in DB for dfspId: ${dfspId}`);
        const row = await this._db('dfsps').where('id', dfspId);
        this._logger.log(`Returned result from DB: ${util.inspect(row)}`);
        return DFSP._convertToApiFormat(row);
    }

}

module.exports = DFSP;