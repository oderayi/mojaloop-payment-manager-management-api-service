/**************************************************************************
 *  (C) Copyright ModusBox Inc. 2020 - All rights reserved.               *
 *                                                                        *
 *  This file is made available under the terms of the license agreement  *
 *  specified in the corresponding source code repository.                *
 *                                                                        *
 *  ORIGINAL AUTHOR:                                                      *
 *       Yevhen Kyriukha - yevhen.kyriukha@modusbox.com                   *
 **************************************************************************/

const { DFSPCertificateModel, HubCertificateModel, HubEndpointModel, AuthModel, ConnectorModel } = require('@modusbox/mcm-client');
const { EmbeddedPKIEngine } = require('mojaloop-connection-manager-pki-engine');
const util = require('util');

const DEFAULT_REFRESH_INTERVAL = 60;

class MCMStateModel {

    /**
     * @param opts {object}
     * @param opts.hubEndpoint {string}
     * @param opts.logger {object}
     * @param opts.dfspId {string}
     * @param opts.storage {object}
     * @param opts.envId {string}
     * @param opts.refreshIntervalSeconds {number}
     * @param opts.tlsServerPrivateKey {String}
     */
    constructor(opts) {
        this._dfspCertificateModel = new DFSPCertificateModel(opts);
        this._hubCertificateModel = new HubCertificateModel(opts);
        this._hubEndpointModel = new HubEndpointModel(opts);
        this._refreshIntervalSeconds = parseInt(opts.refreshIntervalSeconds) > 0 ?
            opts.refreshIntervalSeconds : DEFAULT_REFRESH_INTERVAL;
        this._storage = opts.storage;
        this._envId = opts.envId;
        this._dfspId = opts.dfspId;
        this._logger = opts.logger;
        this._authEnabled = opts.authEnabled;
        this._hubEndpoint = opts.hubEndpoint;
        this._tlsServerPrivateKey = opts.tlsServerPrivateKey;
        this._dfspCaPath = opts.dfspCaPath;

        this._authModel = new AuthModel(opts);
        this._connectorModel = new ConnectorModel(opts);
    }

    async _refresh() {
        try {
            const dfspCerts = await this._dfspCertificateModel.getCertificates({ envId: this._envId, dfpsId: this._dfspId });
            await this._storage.setSecret('dfspCerts', JSON.stringify(
                dfspCerts.filter(cert => cert.certificate).map(cert => cert.certificate)
            ));

            const jwsCerts = await this._dfspCertificateModel.getAllJWSCertificates({ envId: this._envId, dfpsId: this._dfspId });
            await this._storage.setSecret('jwsCerts', JSON.stringify(
                jwsCerts.map((cert) => ({
                    rootCertificate: cert.rootCertificate,
                    intermediateChain: cert.intermediateChain,
                    jwsCertificate: cert.jwsCertificate,
                }))
            ));

            await this.csrExchangeProcess();
            

            const hubEndpoints = await this._hubEndpointModel.findAll({ envId: this._envId, state: 'CONFIRMED' });
            await this._storage.setSecret('hubEndpoints', JSON.stringify(hubEndpoints));
        }
        catch(err) {
            this._logger.log(`Error refreshing MCM state model: ${err.stack || util.inspect(err)}`);
            //note: DONT throw at this point or we will crash our parent process!
        }
    }

    async csrExchangeProcess() {
        const hubCerts = await this.getUnprocessedCerts();
        for (const cert of hubCerts) {
            try {
                const hubCertificate = await this.signCsrAndCreateCertificate(cert.csr);
                await this.uploadCertificate(cert.id, hubCertificate);
            } catch (error) {
                console.log('Error with signing and uploading certificate', error);
            }
        }
    }

    async start() {
        await this._authModel.login();
        await this._refresh();
        this._timer = setInterval(this._refresh.bind(this), this._refreshIntervalSeconds * 10e3);
    }

    async stop() {
        clearInterval(this._timer);
    }

    async getUnprocessedCerts() {
        const hubCerts = await this._hubCertificateModel.getCertificates({ envId: this._envId });
        
        //filter all certs where cert state is CSR_LOADED
        const filteredCerts = hubCerts.filter(cert => (cert.state == 'CSR_LOADED')).map(cert =>
        { return { id: cert.id, csr: cert.csr };
        });

        return filteredCerts;
    }

    async signCsrAndCreateCertificate(csr) {
        const dfspCA = await this._storage.getSecret(this._dfspCaPath);
        const tlsServerPrivateKey = await this._storage.getSecretAsString(this._tlsServerPrivateKey);

        if (dfspCA) {
            const embeddedPKIEngine = new EmbeddedPKIEngine(dfspCA, tlsServerPrivateKey);
            const cert = await embeddedPKIEngine.sign(csr);
            this._logger.log('Certificate created and signed :: ', cert);
            return cert;

        } else {
            throw new Error('Not signing unprocessed csr since dfsp CA  certificate is null or empty');
        }

    }

    async uploadCertificate(enrollmentId, hubCertificate) {
        const body = {
            certificate: hubCertificate
        };

        return this._hubCertificateModel.uploadServerCertificate({ envId: this._envId, dfpsId: this._dfspId, enId: enrollmentId, entry: body } );

    }
}

module.exports = MCMStateModel;
