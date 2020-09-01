/**************************************************************************
 *  (C) Copyright ModusBox Inc. 2020 - All rights reserved.               *
 *                                                                        *
 *  This file is made available under the terms of the license agreement  *
 *  specified in the corresponding source code repository.                *
 *                                                                        *
 *  ORIGINAL AUTHOR:                                                      *
 *       Murthy Kakarlamudi - murthy@modusbox.com                   *
 **************************************************************************/

const { DFSPCertificateModel } = require('@modusbox/mcm-client');

class CertificatesModel {
    constructor(opts) {
        this._logger = opts.logger;
        this._mcmClientDFSPCertModel = new DFSPCertificateModel({
            dfspId: opts.dfspId,
            logger: opts.logger,
            hubEndpoint: opts.mcmServerEndpoint,
        });
    }

    async uploadServerCertificates(envId, body) {
        return this._mcmClientDFSPCertModel.uploadServerCertificates({
            envId,
            entry: body
        });
    }

    async uploadClientCSR(envId, body) {
        console.log(`data in Certificates Model: ${body}`);
        return this._mcmClientDFSPCertModel.createCSR({
            envId,
            csr: body
        });
    }
}

module.exports = CertificatesModel;
