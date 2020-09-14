/**************************************************************************
 *  (C) Copyright ModusBox Inc. 2019 - All rights reserved.               *
 *                                                                        *
 *  This file is made available under the terms of the license agreement  *
 *  specified in the corresponding source code repository.                *
 *                                                                        *
 *  ORIGINAL AUTHOR:                                                      *
 *       Murthy Kakarlamudi - murthy@modusbox.com                         *
 **************************************************************************/

const {
    Transfer,
    Balances,
    DFSP,
    Hub,
    CertificatesModel,
} = require('@internal/model');


const healthCheck = async(ctx) => {
    ctx.body = JSON.stringify({'status':'ok'});
};

const getTransfers = async (ctx) => {
    const { startTimestamp, endTimestamp, institution, status, batchId, limit, offset } = ctx.query;
    const transfer = new Transfer({
        db: ctx.state.db,
        logger: ctx.state.logger,
    });
    ctx.body = await transfer.findAll({ startTimestamp, endTimestamp, institution, status, batchId, limit, offset });
};

const getTransfer = async (ctx) => {
    const transfer = new Transfer({
        db: ctx.state.db,
        logger: ctx.state.logger,
    });
    ctx.body = await transfer.findOne(ctx.params.transferId);
};

const getTransferStatusSummary = async (ctx) => {
    const { startTimestamp, endTimestamp } = ctx.query;
    const transfer = new Transfer({
        db: ctx.state.db,
        logger: ctx.state.logger,
    });
    ctx.body = await transfer.statusSummary({ startTimestamp, endTimestamp });
};

const getHourlyFlow = async (ctx) => {
    const { hoursPrevious } = ctx.query;
    const transfer = new Transfer({
        db: ctx.state.db,
        logger: ctx.state.logger,
        conf: ctx.state.conf,
    });
    ctx.body = await transfer.hourlyFlow({ hoursPrevious });
};

const getTransfersSuccessRate = async (ctx) => {
    const { minutePrevious } = ctx.query;
    const transfer = new Transfer({
        db: ctx.state.db,
        logger: ctx.state.logger,
        conf: ctx.state.conf,
    });
    ctx.body = await transfer.successRate({ minutePrevious });
};

const getTransfersAvgResponseTime = async (ctx) => {
    const { minutePrevious } = ctx.query;
    const transfer = new Transfer({
        db: ctx.state.db,
        logger: ctx.state.logger,
        conf: ctx.state.conf,
    });
    ctx.body = transfer.avgResponseTime({ minutePrevious });
};

const getBalances = async(ctx) => {
    const { dfspId, mcmServerEndpoint } = ctx.state.conf;
    const balances = new Balances({
        dfspId,
        mcmServerEndpoint,
        logger: ctx.state.logger,
    });
    ctx.body = await balances.findBalances(ctx.request.query);
};

const getDFSPDetails = async(ctx) => {
    const { envId, dfspId, mcmServerEndpoint } = ctx.state.conf;
    const dfsp = new DFSP({
        envId,
        dfspId,
        mcmServerEndpoint,
        logger: ctx.state.logger,
    });
    ctx.body = await dfsp.getDfspDetails();
};

const getDFSPEndpoints = async(ctx) => {
    const { direction, type, state } = ctx.query;
    const { dfspId, mcmServerEndpoint } = ctx.state.conf;
    const dfsp = new DFSP({
        dfspId,
        mcmServerEndpoint,
        envId: ctx.params.envId,
        logger: ctx.state.logger,
    });
    ctx.body = await dfsp.getEndpoints({ direction, type, state });
};

const createDFSPEndpoints = async(ctx) => {
    const { dfspId, mcmServerEndpoint } = ctx.state.conf;
    const dfsp = new DFSP({
        dfspId,
        mcmServerEndpoint,
        envId: ctx.params.envId,
        logger: ctx.state.logger,
    });
    ctx.body = await dfsp.createEndpoints(ctx.request.body);
};

const getHubEndpoints = async(ctx) => {
    const { direction, type, state } = ctx.query;
    const { dfspId, mcmServerEndpoint } = ctx.state.conf;
    const hub = new Hub({
        dfspId,
        mcmServerEndpoint,
        envId: ctx.params.envId,
        logger: ctx.state.logger,
    });
    ctx.body = await hub.getEndpoints({ direction, type, state });
};

const uploadClientCSR = async(ctx) => {
    const { dfspId, mcmServerEndpoint } = ctx.state.conf;
    const certModel = new CertificatesModel({
        dfspId,
        mcmServerEndpoint,
        envId: ctx.params.envId,
        logger: ctx.state.logger,
    });
    ctx.body = await certModel.uploadClientCSR(ctx.request.body.clientCSR);
};

const getClientCertificates = async(ctx) => {
    const { dfspId, mcmServerEndpoint } = ctx.state.conf;
    const certModel = new CertificatesModel({
        dfspId,
        mcmServerEndpoint,
        envId: ctx.params.envId,
        logger: ctx.state.logger,
    });
    ctx.body = await certModel.getCertificates();
};

const getDFSPCA = async(ctx) => {
    const { dfspId, mcmServerEndpoint } = ctx.state.conf;
    const certModel = new CertificatesModel({
        dfspId,
        mcmServerEndpoint,
        envId: ctx.params.envId,
        logger: ctx.state.logger,
    });
    ctx.body = await certModel.getDFSPCA();
};

const uploadDFSPCA = async(ctx) => {
    const { dfspId, mcmServerEndpoint } = ctx.state.conf;
    const certModel = new CertificatesModel({
        dfspId,
        mcmServerEndpoint,
        envId: ctx.params.envId,
        logger: ctx.state.logger,
    });
    ctx.body = await certModel.uploadDFSPCA(ctx.request.body);
};

const getHubCAS = async(ctx) => {
    const { dfspId, mcmServerEndpoint } = ctx.state.conf;
    const hub = new Hub({
        dfspId,
        mcmServerEndpoint,
        envId: ctx.params.envId,
        logger: ctx.state.logger,
    });
    ctx.body = await hub.getHubCAS();
};

/**
 * Get DFSP Server Certificates
 * @param {*} ctx
 */
const getDFSPServerCertificates = async(ctx) => {
    const { dfspId, mcmServerEndpoint } = ctx.state.conf;
    const certModel = new CertificatesModel({
        dfspId,
        mcmServerEndpoint,
        envId: ctx.params.envId,
        logger: ctx.state.logger,
    });
    ctx.body = await certModel.getDFSPServerCertificates();
};

const uploadServerCertificates = async(ctx) => {
    const { dfspId, mcmServerEndpoint } = ctx.state.conf;
    const certModel = new CertificatesModel({
        dfspId,
        mcmServerEndpoint,
        envId: ctx.params.envId,
        logger: ctx.state.logger,
    });
    ctx.body = await certModel.uploadServerCertificates(ctx.request.body);
};

const getAllJWSCertificates = async(ctx) => {
    const { dfspId, mcmServerEndpoint } = ctx.state.conf;
    const certModel = new CertificatesModel({
        dfspId,
        mcmServerEndpoint,
        envId: ctx.params.envId,
        logger: ctx.state.logger,
    });
    ctx.body = await certModel.getAllJWSCertificates();
};

const getJWSCertificates = async(ctx) => {
    const { dfspId, mcmServerEndpoint } = ctx.state.conf;
    const certModel = new CertificatesModel({
        dfspId,
        mcmServerEndpoint,
        envId: ctx.params.envId,
        logger: ctx.state.logger,
    });
    ctx.body = await certModel.getDFSPJWSCertificates();
};

const uploadJWSCertificates = async(ctx) => {
    const { dfspId, mcmServerEndpoint } = ctx.state.conf;
    const certModel = new CertificatesModel({
        dfspId,
        mcmServerEndpoint,
        envId: ctx.params.envId,
        logger: ctx.state.logger,
    });
    ctx.body = await certModel.uploadJWS(ctx.request.body);
};

const updateJWSCertificates = async(ctx) => {
    const { dfspId, mcmServerEndpoint } = ctx.state.conf;
    const certModel = new CertificatesModel({
        dfspId,
        mcmServerEndpoint,
        envId: ctx.params.envId,
        logger: ctx.state.logger,
    });
    ctx.body = await certModel.updateJWS(ctx.request.body);
};

const deleteJWSCertificates = async(ctx) => {
    const { dfspId, mcmServerEndpoint } = ctx.state.conf;
    const certModel = new CertificatesModel({
        dfspId,
        mcmServerEndpoint,
        envId: ctx.params.envId,
        logger: ctx.state.logger,
    });
    ctx.body = await certModel.deleteJWS();
};

const getHubServerCertificates = async(ctx) => {
    const { direction, type, state } = ctx.query;
    const { dfspId, mcmServerEndpoint } = ctx.state.conf;
    const hub = new Hub({
        dfspId,
        mcmServerEndpoint,
        envId: ctx.params.envId,
        logger: ctx.state.logger,
    });
    ctx.body = await hub.getServerCertificates({ direction, type, state });
};


module.exports = {
    '/health': {
        get: healthCheck
    },
    '/transfers': {
        get: getTransfers,
    },
    '/transfers/{transferId}': {
        get: getTransfer,
    },
    '/transferStatusSummary': {
        get: getTransferStatusSummary,
    },
    '/hourlyFlow': {
        get: getHourlyFlow,
    },
    '/minuteSuccessfulTransferPerc': {
        get: getTransfersSuccessRate,
    },
    '/minuteAverageTransferResponseTime': {
        get: getTransfersAvgResponseTime,
    },
    '/balances': {
        get: getBalances,
    },
    '/dfsp': {
        get: getDFSPDetails,
    },
    '/environments/{envId}/dfsp/endpoints': {
        get: getDFSPEndpoints,
        post: createDFSPEndpoints,
    },
    '/environments/{envId}/hub/endpoints': {
        get: getHubEndpoints,
    },
    '/environments/{envId}/dfsp/servercerts': {
        get: getDFSPServerCertificates,
        post: uploadServerCertificates,
    },
    '/environments/{envId}/dfsp/alljwscerts': {
        get: getAllJWSCertificates,
    },
    '/environments/{envId}/dfsp/jwscerts': {
        get: getJWSCertificates,
        post: uploadJWSCertificates,
        put: updateJWSCertificates,
        delete: deleteJWSCertificates,
    },
    '/environments/{envId}/dfsp/clientcerts': {
        get: getClientCertificates,
        post: uploadClientCSR,
    },
    '/environments/{envId}/dfsp/ca': {
        get: getDFSPCA,
        post: uploadDFSPCA,
    },
    '/environments/{envId}/hub/cas': {
        get: getHubCAS,
    },
    '/environments/{envId}/hub/servercerts': {
        get: getHubServerCertificates,
    },
};
