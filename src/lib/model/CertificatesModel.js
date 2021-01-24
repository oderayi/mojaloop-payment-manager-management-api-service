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
const ConnectorManager = require('./ConnectorManager');


class CertificatesModel {
    constructor(opts) {
        this._logger = opts.logger;
        this._envId = opts.envId;
        this._storage = opts.storage;
        this._wsUrl = opts.wsUrl;
        this._wsPort = opts.wsPort;
        this._db = opts.db;

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

        this._connectorManager = new ConnectorManager(opts);
    }

    async uploadClientCSR(body) {
        return this._mcmClientDFSPCertModel.uploadCSR({
            envId : this._envId,
            csr: body,
        });
    }

    async createCSR(csrParameters) {
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

    async getClientCertificate(inboundEnrollmentId) {
        return this._mcmClientDFSPCertModel.getClientCertificate({
            envId : this._envId,
            inboundEnrollmentId
        });
    }

    async exchangeInboundSdkConfiguration(csr, dfspCaPath) {
        const dfspCA = await this._storage.getSecret(dfspCaPath);

        if (dfspCA) {
            const embeddedPKIEngine = new EmbeddedPKIEngine(dfspCA, csr.key);
            const cert = await embeddedPKIEngine.sign(csr.csr);
            this._logger.log('Certificate created and signed :: ', cert);

            //key generated with csr is encrypted
            try {
                const decryptedCsrPrivateKey = await embeddedPKIEngine.decryptKey(csr.key);
                this._logger.log('private key was decrypted :: ');

                //Save in redis decrypted private key
                // FIXME: (in the future will be in Vault)
                const cache = this._db.redisCache;
                await cache.set(`serverPrivateKey_${this._envId}`, {key: decryptedCsrPrivateKey});

                await this._connectorManager.reconfigureInboundSdk(decryptedCsrPrivateKey, cert, dfspCA);

            } catch (error) {
                this._logger.log('Error decrypting or reconfiguring inbound sdk', error);
                throw error;

            }


        } else {
            throw new Error('Not signing dfsp own csr since dfsp CA  certificate is null or empty');
        }
    }

    async exchangeOutboundSdkConfiguration(inboundEnrollmentId, key) {
        let exchanged = false;
        const inboundEnrollment = await this.getClientCertificate(inboundEnrollmentId);
        this._logger.push({inboundEnrollment}).log('inboundEnrollment');
        if(inboundEnrollment.state === 'CERT_SIGNED'){
            //retrieve hub CA 
            // const rootHubCA = await this._certificateModel.getRootHubCA({
            //     envId : this._envId
            // });
            const objHubCA = await this._certificateModel.getHubCAS({
                envId : this._envId
            });
            // const caChain = `${objHubCA[0].intermediateChain}${objHubCA[0].rootCertificate}`.replace(/\n/g,'');
            // this._logger.push({cert: caChain }).log('hubCA');

            const caChain = '-----BEGIN CERTIFICATE-----'+
            'MIIGcTCCBFmgAwIBAgIUDNZrl7UsV9PyiCOjOqP4/bys5UUwDQYJKoZIhvcNAQEL'+
            'BQAwTDERMA8GA1UEChMITW9kdXNCb3gxHDAaBgNVBAsTE0luZnJhc3RydWN0dXJl'+
            'IFRlYW0xGTAXBgNVBAMTEG1vamFsb29wIFJvb3QgQ0EwHhcNMjEwMTE4MTM0NjE2'+
            'WhcNMjYwMTE3MTM0NjQ2WjB4MREwDwYDVQQKEwhNb2R1c0JveDEcMBoGA1UECxMT'+
            'SW5mcmFzdHJ1Y3R1cmUgVGVhbTFFMEMGA1UEAxM8bW9qYWxvb3AubGFicy5tb2ph'+
            'bG9vcC1oYWNrYXRob24uaW8uaW50ZXJuYWwgSW50ZXJtZWRpYXRlIENBMIICIjAN'+
            'BgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEArA8uxgOTe7aF+Jsw/lUV5kncnOzO'+
            'qDf4Q7nAgnYBMvM5v6FtBhRPkAz49SD2o2LqTnIlU364QwebRCY7ZUCFSs6hfffs'+
            'shYCSH507vMAhvNzjYN5pFuQX1/XZl2jPB/Tj8E0BY12TNq4eRtYmijoQZir5noP'+
            'UQ7qcnvAf+4ni3iNYlotuavDDhDN28PxlBYX/2SC8N/Cs1pw/ucxwhdFXkOTqyau'+
            'JI8jwExQXq/Cgr3BAbxsdkzxpSn9IfwhpdUktpzL9Tgk7os/tKjnfBe8Xf1QJJ44'+
            'wA7QqXock1I3LTmzCNoFKWnQUsNZ2AMct+FATj7EwCbcqtoMLg0vucOAXWwk7b3Z'+
            'VLgpjl1OdMSE2Zu0gpBj6QjrcRaQYEKOKDDaaXtmrUHsLfnT0FhA3Fdfsb5LPmDS'+
            'TDmJOKYgGUic5oQxwFErMp6H+eOSW1l8Gjy6+cOp0RY1QncYLYlU55bzlDDUlhNe'+
            '5CdMWqMVUVJm1U2eDHzgGB7EiPHl/TgqdFWZPn2GxwcVoHsyXjXap0M5eSzrazAD'+
            'ROmrA/MrKp0G8Ahx41TeAyyRShjl4pJ7uwXOgUiWxXNsacCG5OrWyfjSEyotgWxl'+
            'tLdoFxeaId8Sh9dtN0ulopS4RaMjBlcVAPD2dgciTA+V2o2LNq3yd2sdXWnsDqkG'+
            '3a3aCWIk2gwbwgsCAwEAAaOCAR0wggEZMA4GA1UdDwEB/wQEAwIBBjAPBgNVHRMB'+
            'Af8EBTADAQH/MB0GA1UdDgQWBBTRRWiRnHQhuQJGuScoluryCfI43DAfBgNVHSME'+
            'GDAWgBTXKIFbfE4hZsDP9ekjl+vmT6DaZzBfBggrBgEFBQcBAQRTMFEwTwYIKwYB'+
            'BQUHMAKGQ2h0dHA6Ly92YXVsdC5tb2phbG9vcC5sYWJzLm1vamFsb29wLWhhY2th'+
            'dGhvbi5pby5pbnRlcm5hbC92MS9wa2kvY2EwVQYDVR0fBE4wTDBKoEigRoZEaHR0'+
            'cDovL3ZhdWx0Lm1vamFsb29wLmxhYnMubW9qYWxvb3AtaGFja2F0aG9uLmlvLmlu'+
            'dGVybmFsL3YxL3BraS9jcmwwDQYJKoZIhvcNAQELBQADggIBAG540Rp0YkBAEbDt'+
            'durlIwO4FiDu85DGGWg3UHhfG389F9QLuy/FN6PGj3NP8ozZUlmA0TiVHX+Jexfk'+
            'eMgmmjN5WDMKlzBJg7ZkW5cDjcYF5a9Ew35MbPPlz/7P1ofjd87cZlIz+enJKC5o'+
            'lu1P1MWhAJWFR/e+5NapPgnSV/EGn+mQqhVdkRmcy32Tz5AzAEes1oYOk1WgcPUb'+
            '6oSdyHOSQpm7KjBBe6QtDNpToilcRi+noBrGDYECF3YylmgmxJEUMua6OsdBQeKd'+
            'WGNxWfz+qdpnNdugrOdR0hgaeMGPxwyh4ksjl30ZWadfyiF128bLE0atEsG/3bqH'+
            'bgamI022EjC/7BNffb6ZQMjpx/tlc5iMS59Vg0pZ9rT9BDMic7uGE9OJCWUiG0uz'+
            'FpfqfHwSd9SymG8tdBxDkpeNf8g4AX0N5jm5l1YLbWuFULE8wBYEEN+Nl5J49vPu'+
            'Qq6whxF0Qu8bY9ZUvx5hCy+P2ge/f/eln80ObB3azuzGpEtB4ctHJjHFKXjhNgF/'+
            'MT5njFYXt2Ur906UH518ruL+lR8aLD/ayEPSHxnFtAi2dVbe9+HIz4M6VO6OrNiF'+
            'xGXn4RJGrE87byIsfZoOFdu0VY5HG2RWcTLToOv0UcW+YS4+P02bzXR11BfNTNiG'+
            '3RmIFHDB7N8E/uvqybCw+P+7N7Vy'+
            '-----END CERTIFICATE-----'+
            '-----BEGIN CERTIFICATE-----'+
            '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'+
            '-----END CERTIFICATE-----';

            await this._connectorManager.reconfigureOutboundSdk(caChain, key, inboundEnrollment.certificate);
            exchanged = true;
        }
        return exchanged;
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
