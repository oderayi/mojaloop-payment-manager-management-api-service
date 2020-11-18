/**************************************************************************
 *  (C) Copyright ModusBox Inc. 2020 - All rights reserved.               *
 *                                                                        *
 *  This file is made available under the terms of the license agreement  *
 *  specified in the corresponding source code repository.                *
 *                                                                        *
 *  ORIGINAL AUTHOR:                                                      *
 *       Juan Correa - juan.correa@modusbox.com                           *
 **************************************************************************/

const { DFSPEnvConfigModel } = require('@modusbox/mcm-client');

class EnvironmentStatusModel {
    /**
     *
     * @param props {object}
     * @param [props.mockData] {boolean}
     * @param props.logger {object}
     * @param props.managementEndpoint {string}
     */
    constructor(opts) {
        this._envId = opts.envId;
        this._logger = opts.logger;
        this._mcmDFSPEnvConfigModel = new DFSPEnvConfigModel({
            envId: opts.envId,
            logger: opts.logger,
            hubEndpoint: opts.mcmServerEndpoint,
        });
    }

    /**
     *
     * @param envId {string}
     */
    async findOne(envId) {

        let envStatus = this._mcmDFSPEnvConfigModel.findStatus({
            envId : envId
        });

        return envStatus;
    }


}

module.exports = EnvironmentStatusModel;