/**************************************************************************
 *  (C) Copyright ModusBox Inc. 2020 - All rights reserved.               *
 *                                                                        *
 *  This file is made available under the terms of the license agreement  *
 *  specified in the corresponding source code repository.                *
 *                                                                        *
 *  ORIGINAL AUTHOR:                                                      *
 *       Murthy Kakarlamudi - murthy@modusbox.com                   *
 **************************************************************************/

const { HubEndpointModel,HubCertificateModel, EnvironmentModel } = require('@modusbox/mcm-client');

class Hub {
    constructor(opts) {
        this._logger = opts.logger;
        this._envId = opts.envId;
        this._dfspId = opts.dfspId;
        this._endpointModel = new HubEndpointModel({
            dfspId: opts.dfspId,
            logger: opts.logger,
            hubEndpoint: opts.mcmServerEndpoint,
        });
        this._certificateModel = new HubCertificateModel({
            dfspId: opts.dfspId,
            logger: opts.logger,
            hubEndpoint: opts.mcmServerEndpoint,
        });
        this._environmentModel = new EnvironmentModel({
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

    /**
     *  Get all environments
     */
    async getEnvironments() {
        return this._environmentModel.findAll();
    }    

    /**
     * Gets Hub CAs
     */
    async getHubCAS() {
        return this._certificateModel.getHubCAS({
            envId : this._envId,
        });
    }

    /**
     * Gets root Hub CA
     */
    async getRootHubCA() {
        return this._certificateModel.getRootHubCA({
            envId : this._envId,
        });
    }    

    /**
     *
     * @param opts {Object}
     * @param [opts.direction] {string}
     * @param [opts.type] {string}
     * @param [opts.state] {string}
     */
    async getServerCertificates(opts) {
        return this._certificateModel.getServerCertificates({
            envId : this._envId,
            ...opts,
        });
    }

}

module.exports = Hub;
