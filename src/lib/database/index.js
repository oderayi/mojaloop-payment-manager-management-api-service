/**************************************************************************
 *  (C) Copyright ModusBox Inc. 2020 - All rights reserved.               *
 *                                                                        *
 *  This file is made available under the terms of the license agreement  *
 *  specified in the corresponding source code repository.                *
 *                                                                        *
 *  ORIGINAL AUTHOR:                                                      *
 *       Yevhen Kyriukha - yevhen.kyriukha@modusbox.com                   *
 *                                                                        *
 *  CONTRIBUTORS:                                                         *
 *       James Bush - james.bush@modusbox.com                             *
 **************************************************************************/

const util = require('util');
const knex = require('knex');
const Cache = require('./cache');

const cachedFulfilledKeys = [];
const cachedPendingKeys = [];

async function syncDB({redisCache, db, logger}) {
    logger.log('Syncing cache to in-memory DB');
    const getName = (userInfo) => userInfo.displayName || `${userInfo.firstName} ${userInfo.lastName}`;
    const getTransferStatus = (data) => {
        if (data.currentState === 'succeeded') {
            return true;
        } else if (data.currentState === 'errored') {
            return false;
        } else {
            return null;
        }
    };

    const asyncForEach = async (array, callback) => {
        for (let index = 0; index < array.length; index++) {
            await callback(array[index], index, array);
        }
    };

    const cacheKey = async (key) => {
        logger.log(`syncing key ${key}`);
        const data = await redisCache.get(key);

        // Workaround for *initiatedTimestamp* until SDK populates it in Redis
        // const initiatedTimestamp = new Date(data.initiatedTimestamp).getTime();
        const initiatedTimestamp = data.initiatedTimestamp ? new Date(data.initiatedTimestamp).getTime() : new Date().getTime();

        const completedTimestamp = data.fulfil ? new Date(data.fulfil.completedTimestamp) : null;

        const row = {
            id: data.transferId,
            redis_key: key, // To be used instead of Transfer.cachedKeys
            sender: getName(data.from),
            recipient: getName(data.to),
            amount: data.amount,
            currency: data.currency,
            direction: data.amountType === 'SEND' ? 1 : -1,
            batch_id: '', // TODO: Implement
            details: data.note,
            dfsp: data.to.fspId,
            created_at: initiatedTimestamp,
            completed_at: completedTimestamp,
            success: getTransferStatus(data),
            raw: JSON.stringify(data),
        };

        logger.log(`syncing row: ${util.inspect(row)}`);

        const keyIndex = cachedPendingKeys.indexOf(key);
        if (keyIndex === -1) {
            await db('transfer').insert(row);
        } else {
            await db('transfer').where({ id: row.id }).update(row);
            cachedPendingKeys.splice(keyIndex, 1);
        }

        if (row.success === null) {
            cachedPendingKeys.push(key);
        } else {
            cachedFulfilledKeys.push(key);
        }

        // const sqlRaw = db('transfer').insert(row).toString();
        // db.raw(sqlRaw.replace(/^insert/i, 'insert or ignore')).then(resolve);
    };

    const keys = await redisCache.keys('transferModel_*');
    logger.log(`found the following transfer models in cache: ${util.inspect(keys)}`);
    const uncachedOrPendingKeys = keys.filter((x) => cachedFulfilledKeys.indexOf(x) === -1);
    await asyncForEach(uncachedOrPendingKeys, cacheKey);
    logger.log('In-memory DB sync complete');
}

async function init(config) {
    const knexConfig = {
        client: 'sqlite3',
        connection: {
            filename: ':memory:',
        },
        useNullAsDefault: true,
    };

    const db = knex(knexConfig);

    Object.defineProperty(db,
        'createTransaction',
        async () => new Promise(resolve => db.transaction(resolve)));

    if (config.runMigrations) {
        await db.migrate.latest({directory: `${__dirname}/migrations`});
    }

    const redisCache = new Cache({
        logger: config.logger,
        port: config.cachePort,
        host: config.cacheHost,
    });
    await redisCache.connect();

    const doSyncDB = () => syncDB({
        redisCache,
        db,
        logger: config.logger,
    });

    if (!config.manualSync) {
        await doSyncDB();
        const interval = setInterval(doSyncDB, (config.syncInterval || 60) * 1e3);
        db.stopSync = () => clearInterval(interval);
    } else {
        db.sync = doSyncDB;
    }
    db.redisCache = redisCache; // for testing purposes

    return db;
}

module.exports = init;
