/**************************************************************************
 *  (C) Copyright ModusBox Inc. 2020 - All rights reserved.               *
 *                                                                        *
 *  This file is made available under the terms of the license agreement  *
 *  specified in the corresponding source code repository.                *
 *                                                                        *
 *  ORIGINAL AUTHOR:                                                      *
 *       Murthy Kakarlamudi - murthy@modusbox.com                   *
 **************************************************************************/
const { ServerCertificatesModel : MCMClientServerCertificatesModel} = require('@modusbox/mcm-client');

class ServerCertificatesModel {
    constructor(opts) {
        this._dfspId = opts.dfspId;
        this._logger = opts.logger;
    }

    async uploadServerCertificates(envId, body) {
        return MCMClientServerCertificatesModel.uploadServerCertificates({
            envId,
            dfspId: this._dfspId,
            entry: body
        });
    }
}

module.exports = ServerCertificatesModel;