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
    CertificatesModel,
} = require('@internal/model');




const healthCheck = async(ctx) => {
    ctx.response.status = 200;
    ctx.response.body = JSON.stringify({'status':'ok'});
};

const getTransfers = async (ctx) => {
    const { startTimestamp, endTimestamp, institution, status, batchId, limit, offset } = ctx.query;
    const transfer = new Transfer({
        db: ctx.state.db,
        logger: ctx.state.logger,
    });
    ctx.response.status = 200;
    ctx.response.body = await transfer.findAll({ startTimestamp, endTimestamp, institution, status, batchId, limit, offset });
};

const getTransfer = async (ctx) => {
    const transfer = new Transfer({
        db: ctx.state.db,
        logger: ctx.state.logger,
    });
    ctx.response.status = 200;
    ctx.response.body = await transfer.findOne(ctx.state.path.params.transferId);
};

const getTransferStatusSummary = async (ctx) => {
    const { startTimestamp, endTimestamp } = ctx.query;
    const transfer = new Transfer({
        db: ctx.state.db,
        logger: ctx.state.logger,
    });
    ctx.response.status = 200;
    ctx.response.body = await transfer.statusSummary({ startTimestamp, endTimestamp });
};

const getHourlyFlow = async (ctx) => {
    const { hoursPrevious } = ctx.state.path.params;
    const transfer = new Transfer({
        db: ctx.state.db,
        logger: ctx.state.logger,
        conf: ctx.state.conf,
    });
    ctx.response.status = 200;
    ctx.response.body = await transfer.hourlyFlow({ hoursPrevious });
};

const getTransfersSuccessRate = async (ctx) => {
    const { minutePrevious } = ctx.state.path.params;
    const transfer = new Transfer({
        db: ctx.state.db,
        logger: ctx.state.logger,
        conf: ctx.state.conf,
    });
    ctx.response.status = 200;
    ctx.response.body = await transfer.successRate({ minutePrevious });
};

const getTransfersAvgResponseTime = async (ctx) => {
    const { minutePrevious } = ctx.state.path.params;
    const transfer = new Transfer({
        db: ctx.state.db,
        logger: ctx.state.logger,
        conf: ctx.state.conf,
    });
    ctx.response.status = 200;
    ctx.response.body = transfer.avgResponseTime({ minutePrevious });
};

const getBalances = async(ctx) => {
    const { dfspId, mcmServerEndpoint } = ctx.state.conf;
    const balances = new Balances({
        dfspId,
        mcmServerEndpoint,
        logger: ctx.state.logger,
    });
    ctx.response.status = 200;
    ctx.response.body = await balances.findBalances(ctx.request.query);
};

const getDFSPDetails = async(ctx) => {
    const { dfspId, mcmServerEndpoint } = ctx.state.conf;
    const dfsp = new DFSP({
        dfspId,
        mcmServerEndpoint,
        logger: ctx.state.logger,
    });
    ctx.response.status = 200;
    ctx.response.body = await dfsp.getDfspDetails();
};

const uploadServerCertificates = async(ctx) => {
    const { dfspId, mcmServerEndpoint } = ctx.state.conf;
    const certModel = new CertificatesModel({
        dfspId,
        mcmServerEndpoint,
        logger: ctx.state.logger,
    });
    ctx.response.status = 200;
    ctx.response.body = await certModel.uploadServerCertificates(ctx.state.path.params.envId, ctx.request.body);
};

const uploadClientCSR = async(ctx) => {
    const { dfspId, mcmServerEndpoint } = ctx.state.conf;
    const certModel = new CertificatesModel({
        dfspId,
        mcmServerEndpoint,
        logger: ctx.state.logger,
    });
    ctx.response.status = 200;
    ctx.response.body = await certModel.uploadClientCSR(ctx.state.path.params.envId, ctx.request.body.clientCSR);
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
    '/environments/{envId}/dfsp/servercerts': {
        post: uploadServerCertificates,
    },
    '/environments/{envId}/dfsp/clientcerts': {
        post: uploadClientCSR,
    }
};
