/**************************************************************************
 *  (C) Copyright ModusBox Inc. 2020 - All rights reserved.               *
 *                                                                        *
 *  This file is made available under the terms of the license agreement  *
 *  specified in the corresponding source code repository.                *
 *                                                                        *
 *  ORIGINAL AUTHOR:                                                      *
 *       Yevhen Kyriukha - yevhen.kyriukha@modusbox.com                   *
 **************************************************************************/

const { Logger } = require('@internal/log');
const database = require('@internal/database');

const transferTemplate = require('./data/transferTemplate');

const createTestDb = async () => {
    const logTransports = [() => {}];
    const logger = new Logger({ context: { app: 'model-unit-tests-cache' }, space: 4, transports: logTransports });
    return database({
        cacheHost: 'dummyhost',
        cachePort: 1234,
        logger,
        runMigrations: true,
        manualSync: true,
    });
};

const addTransferToCache = async (db, opts) => {
    const transfer = JSON.parse(JSON.stringify(transferTemplate));
    transfer.transferId = opts.transferId || transfer.transferId;
    transfer.amountType = opts.amountType || transfer.amountType;
    transfer.currency = opts.currency || transfer.currency;
    transfer.amount = opts.amount || transfer.amount;
    transfer.transactionType = opts.transactionType || transfer.transactionType;
    transfer.currentState = opts.currentState || transfer.currentState;
    transfer.initiatedTimestamp = opts.initiatedTimestamp || transfer.initiatedTimestamp;
    if (opts.isPending) {
        delete transfer.fulfil;
    } else {
        transfer.fulfil.completedTimestamp = opts.completedTimestamp || transfer.fulfil.completedTimestamp;
    }

    await db.redisCache.set(`transferModel_${opts.transferId}`, JSON.stringify(transfer));

    return transfer;
};

module.exports = {
    createTestDb,
    addTransferToCache,
};
