/**************************************************************************
 *  (C) Copyright ModusBox Inc. 2020 - All rights reserved.               *
 *                                                                        *
 *  This file is made available under the terms of the license agreement  *
 *  specified in the corresponding source code repository.                *
 *                                                                        *
 *  ORIGINAL AUTHOR:                                                      *
 *       Murthy Kakarlamudi - murthy@modusbox.com                   *
 **************************************************************************/

const { DFSPCertificateModel, ConnectorModel, HubCertificateModel } = require('@modusbox/mcm-client');
const { EmbeddedPKIEngine } = require('mojaloop-connection-manager-pki-engine');


class CertificatesModel {
    constructor(opts) {
        this._logger = opts.logger;
        this._envId = opts.envId;
        this._storage = opts.storage;
        this._wsUrl = opts.wsUrl;

        this._mcmClientDFSPCertModel = new DFSPCertificateModel({
            dfspId: opts.dfspId,
            logger: opts.logger,
            hubEndpoint: opts.mcmServerEndpoint
        });

        this._certificateModel = new HubCertificateModel({
            dfspId: opts.dfspId,
            logger: opts.logger,
            hubEndpoint: opts.mcmServerEndpoint,
        });      

        this._connectorModel = new ConnectorModel(opts);
    }

    async uploadClientCSR(body) {
        return this._mcmClientDFSPCertModel.uploadCSR({
            envId : this._envId,
            csr: body,
        });
    }

    async createClientCSR(csrParameters) {
        const createdCSR = await this._mcmClientDFSPCertModel.createCSR({
            envId : this._envId,
            csrParameters: csrParameters
        });

        //FIXME: createdCSR.key value should be saved in vault. Not being saved now in storage since secrets type in kubernetes are read-only

        return createdCSR;
    }

    /**
     * Gets uploaded DFSP CSRs and certificates
     */
    async getCertificates() {
        return this._mcmClientDFSPCertModel.getCertificates({
            envId : this._envId,
        });
    }

    /**
     * Gets uploaded DFSP CA
     */
    async getDFSPCA() {
        return this._mcmClientDFSPCertModel.getDFSPCA({
            envId : this._envId,
        });
    }

    /**
     * Upload DFSP CA
     */
    async uploadDFSPCA(body) {
        return this._mcmClientDFSPCertModel.uploadDFSPCA({
            envId : this._envId,
            entry: body,
        });
    }

    /**
     * Get DFSP Server Certificates
     * @param
     */
    async getDFSPServerCertificates() {
        return this._mcmClientDFSPCertModel.getDFSPServerCertificates({
            envId : this._envId,
        });
    }

    async uploadServerCertificates(body) {
        return this._mcmClientDFSPCertModel.uploadServerCertificates({
            envId : this._envId,
            entry: body,
        });
    }

    /**
     * Gets all JWS certificate
     */
    async getAllJWSCertificates() {
        return this._mcmClientDFSPCertModel.getAllJWSCertificates({
            envId : this._envId,
        });
    }

    async signInboundEnrollment(inboundEnrollmentId) {
        return this._mcmClientDFSPCertModel.signInboundEnrollment({
            envId : this._envId,
            inboundEnrollmentId
        });
    }

    async exchangeInboundSdkConfiguration(csr, dfspCaPath) {
        console.log('about to sign csr and exchange with sdk :: ');
        const dfspCA = await this._storage.getSecret(dfspCaPath);

        if (dfspCA) {
            const embeddedPKIEngine = new EmbeddedPKIEngine(dfspCA, csr.key);
            const cert = await embeddedPKIEngine.sign(csr.csr);
            this._logger.log('Certificate created and signed :: ', cert);

            //key generated with csr is encrypted
            const decryptedCsrPrivateKey = await embeddedPKIEngine.decryptKey(csr.key);

            console.log('exchangeInboundSdkConfiguration :: ');
            await this._connectorModel.reconfigureInboundSdk(decryptedCsrPrivateKey, cert, dfspCA);

            return cert;

        } else {
            throw new Error('Not signing dfsp own csr since dfsp CA  certificate is null or empty');
        }
    }

    async exchangeOutboundSdkConfiguration(inboundEnrollmentId, key) {

        const inboundEnrollmentSigned = await this.signInboundEnrollment(inboundEnrollmentId);
        // FIXME: Check inboundEnrollmentSigned.state === CERT_SIGNED
        this._logger.push({inboundEnrollmentSigned}).log('inboundEnrollmentSigned');
    
        //retrieve hub CA 
        const rootHubCA = await this._certificateModel.getRootHubCA({
            envId : this._envId
        });
        this._logger.push({cert: rootHubCA.certificate}).log('hubCA');

        console.log('exchangeInboundSdkConfiguration :: ');
        await this._connectorModel.reconfigureOutboundSdk(rootHubCA.certificate, key, inboundEnrollmentSigned.certificate);
    }    

    /**
     * Gets uploaded JWS certificate
     */
    async getDFSPJWSCertificates() {
        return this._mcmClientDFSPCertModel.getDFSPJWSCertificates({
            envId : this._envId,
        });
    }

    /**
     * Upload DFSP JWS
     */
    async uploadJWS(body) {
        return this._mcmClientDFSPCertModel.uploadJWS({
            envId : this._envId,
            entry: body,
        });
    }

    /**
     * Update DFSP JWS
     */
    async updateJWS(body) {
        return this._mcmClientDFSPCertModel.updateJWS({
            envId : this._envId,
            entry: body,
        });
    }

    /**
     * Delete DFSP JWS
     */
    async deleteJWS() {
        return this._mcmClientDFSPCertModel.deleteJWS({
            envId : this._envId,
        });
    }

}

module.exports = CertificatesModel;
