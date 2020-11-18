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

        //  let envStatus = [
        //   {
        //     phase: 'BUSINESS_SETUP',
        //     steps: [
        //       {
        //         identifier: 'ID_GENERATION',
        //         status: 'IN_PROGRESS',
        //       }
        //     ]
        //   },
        //   {
        //     phase: 'TECNICAL_SETUP',
        //     steps: [
        //       {
        //         identifier: 'ENDPOINTS',
        //         status: 'COMPLETED',
        //       },
        //       {
        //         identifier: 'CSR_EXCHANGE',
        //         status: 'COMPLETED'
        //       },
        //       {
        //         identifier: 'CERTIFICATE_AUTHORITY',
        //         status: 'COMPLETED'
        //       },
        //       {
        //         identifier: 'SERVER_CERTIFICATES_EXCHANGE',
        //         status: 'COMPLETED'
        //       },
        //       {
        //         identifier: 'JWS_CERTIFICATES',
        //         status: 'COMPLETED'
        //       }
        //     ]
        //   }
        //  ];

        let envStatus = this._mcmDFSPEnvConfigModel.findStatus({
            envId : envId
        });

        console.log('returned envStatus:');
        console.log(JSON.stringify(envStatus));

        return envStatus;
    }


}

module.exports = EnvironmentStatusModel;