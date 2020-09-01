/**************************************************************************
 *  (C) Copyright ModusBox Inc. 2020 - All rights reserved.               *
 *                                                                        *
 *  This file is made available under the terms of the license agreement  *
 *  specified in the corresponding source code repository.                *
 *                                                                        *
 *  ORIGINAL AUTHOR:                                                      *
 *       Murthy Kakarlamudi - murthy@modusbox.com                   *
 **************************************************************************/

const { HubEndpointModel } = require('@modusbox/mcm-client');

class Hub {
    constructor(opts) {
        this._logger = opts.logger;
        this._envId = opts.conf.envId;
        this._dfspId = opts.conf.dfspId;
        this._endpointModel = new HubEndpointModel({
            dfspId: opts.dfspId,
            logger: opts.logger,
            hubEndpoint: opts.mcmServerEndpoint,
        });
    }

    /**
     *
     * @param opts {Object}
     * @param [opts.direction] {string}
     * @param [opts.type] {string}
     * @param [opts.state] {string}
     */
    async getEndpoints(opts) {
        return this._endpointModel.findAll({
            envId : this._envId,
            ...opts,
        });
    }

}

module.exports = Hub;
