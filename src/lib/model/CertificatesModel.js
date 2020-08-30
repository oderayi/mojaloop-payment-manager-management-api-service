/**************************************************************************
 *  (C) Copyright ModusBox Inc. 2020 - All rights reserved.               *
 *                                                                        *
 *  This file is made available under the terms of the license agreement  *
 *  specified in the corresponding source code repository.                *
 *                                                                        *
 *  ORIGINAL AUTHOR:                                                      *
 *       Murthy Kakarlamudi - murthy@modusbox.com                   *
 **************************************************************************/
const { DFSPCertificateModel} = require('@modusbox/mcm-client');
const util = require('util');
const { request } = require('@mojaloop/sdk-standard-components');


class CertificatesModel {
    constructor(opts) {
        console.log(`opts.conf.mcmServerEndpoint: ${util.inspect(opts.conf.mcmServerEndpoint)}`);
        this._dfspId = opts.conf.dfspId;
        this._logger = opts.logger;
        this._mcmServerEndpoint = opts.conf.mcmServerEndpoint;
        this._mcmClientDFSPCertModel = new DFSPCertificateModel({
            dfspId: opts.conf.dfspId,
            logger: opts.logger,
            hubEndpoint: opts.conf.mcmServerEndpoint,        
        });
    }

    _buildUrl(...args) {
        return args
                .filter(e => e !== undefined)
                .map(s => s.replace(/(^\/*|\/*$)/g, '')) /* This comment works around a problem with editor syntax highglighting */
                .join('/')
            + ((args[args.length - 1].slice(-1) === '/') ? '/' : '');
    }

    _post(url, body) {
        const reqOpts = {
            method: 'POST',
            uri: this._buildUrl(this._mcmServerEndpoint, url),
            body: JSON.stringify(body),
            headers: {'Content-Type' : 'application/json'}
        };

        try {
            console.log(`making post request to url: ${reqOpts.uri} with body: ${util.inspect(reqOpts.body)}`);
            const res =  request({...reqOpts, agent: this._agent});
            return res;
        }
        catch (e) {
            console.log(`error in post: ${util.inspect(e)}`);
            throw e;
        }
    }

    async uploadServerCertificates(envId, body) {
        console.log(`in uploadServerCertificates body: ${JSON.stringify(body)}`);
        const res = await this._mcmClientDFSPCertModel.uploadServerCertificates({
            envId,
            dfspId: this._dfspId,
            entry: body
        });
        //const res = await this._post(`/environments/${envId}/dfsps/${this._dfspId}/servercerts`, body);
        console.log(`in uploadServerCertificates res: ${util.inspect(res)}`);
        return res;
    }

    async uploadClientCSR(envId, body) {
        console.log(`in uploadClientCSR body: ${JSON.stringify(body)}`);
        const res = await this._mcmClientDFSPCertModel.createCSR({
            envId,
            csr: body
        });
        //const res = await this._post(`/environments/${envId}/dfsps/${this._dfspId}/servercerts`, body);
        console.log(`in uploadClientCSR res: ${util.inspect(res)}`);
        return res;
    }
}

module.exports = CertificatesModel;