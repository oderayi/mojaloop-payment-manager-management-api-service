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
    const { hoursPrevious } = ctx.params;
    const transfer = new Transfer({
        db: ctx.state.db,
        logger: ctx.state.logger,
        conf: ctx.state.conf,
    });
    ctx.body = await transfer.hourlyFlow({ hoursPrevious });
};

const getTransfersSuccessRate = async (ctx) => {
    const { minutePrevious } = ctx.params;
    const transfer = new Transfer({
        db: ctx.state.db,
        logger: ctx.state.logger,
        conf: ctx.state.conf,
    });
    ctx.body = await transfer.successRate({ minutePrevious });
};

const getTransfersAvgResponseTime = async (ctx) => {
    const { minutePrevious } = ctx.params;
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
    const { direction, type, state } = ctx.params;
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
    const { direction, type, state } = ctx.params;
    const { dfspId, mcmServerEndpoint } = ctx.state.conf;
    const hub = new Hub({
        dfspId,
        mcmServerEndpoint,
        envId: ctx.params.envId,
        logger: ctx.state.logger,
    });
    ctx.body = await hub.getEndpoints({ direction, type, state });
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

const uploadClientCSR = async(ctx) => {
    const { dfspId, mcmServerEndpoint } = ctx.state.conf;
    const certModel = new CertificatesModel({
        dfspId,
        mcmServerEndpoint,
        envId: ctx.params.envId,
        logger: ctx.state.logger,
    });
    console.log(`data in uploadClientCSR in handler: ${ctx.request.body.clientCSR}`);
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
    '/dfsps/{dfspId}': {
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
        post: uploadServerCertificates,
    },
    '/environments/{envId}/dfsp/clientcerts': {
        get: getClientCertificates,
        post: uploadClientCSR,
    }
};
