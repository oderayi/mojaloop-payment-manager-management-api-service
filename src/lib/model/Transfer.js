/**************************************************************************
 *  (C) Copyright ModusBox Inc. 2020 - All rights reserved.               *
 *                                                                        *
 *  This file is made available under the terms of the license agreement  *
 *  specified in the corresponding source code repository.                *
 *                                                                        *
 *  ORIGINAL AUTHOR:                                                      *
 *       Yevhen Kyriukha - yevhen.kyriukha@modusbox.com                   *
 **************************************************************************/

class Transfer {
    constructor(opts) {
        this._db = opts.db;
    }

    static STATUSES = {
        null: 'PENDING',
        1: 'SUCCESS',
        0: 'ERROR',
    };

    static _convertToApiFormat(transfer) {
        return {
            id: transfer.id,
            batchId: transfer.batch_id,
            institution: transfer.dfsp,
            direction: transfer.direction > 0 ? 'OUTBOUND' : 'INBOUND',
            currency: transfer.currency,
            amount: transfer.amount,
            type: 'P2P',
            status: Transfer.STATUSES[transfer.success],
            initiatedTimestamp: new Date(transfer.created_at).toISOString(),
            confirmationNumber: 0, // TODO: Implement
            sender: transfer.sender,
            recipient: transfer.recipient,
            details: transfer.details,
        };
    }

    /**
     *
     * @param opts {Object}
     * @param [opts.startTimestamp] {string}
     * @param [opts.endTimestamp] {string}
     * @param [opts.institution] {string}
     * @param [opts.batchId] {number}
     * @param [opts.status] {string}
     * @param [opts.limit] {number}
     * @param [opts.offset] {number}
     */
    async findAll(opts) {
        const DEFAULT_LIMIT = 100;

        const query = this._db('transfer').whereRaw('true');
        if (opts.startTimestamp) {
            query.andWhere('created_at', '>=', new Date(opts.startTimestamp).getTime());
        }
        if (opts.endTimestamp) {
            query.andWhere('created_at', '<', new Date(opts.endTimestamp).getTime());
        }
        if (opts.institution) {
            query.andWhere('dfsp', 'ILIKE', `%${opts.institution}%`);
        }
        if (opts.batchId) {
            query.andWhere('batchId', 'ILIKE', `%${opts.batchId}%`);
        }
        if (opts.status) {
            if (opts.status === 'PENDING') {
                query.andWhereRaw('success IS NULL');
            } else {
                query.andWhere('success', opts.status === 'SUCCESS');
            }
        }
        if (opts.offset) {
            query.offset(opts.offset);
        }
        query.limit(opts.limit || DEFAULT_LIMIT);
        query.orderBy('created_at');

        const rows = await query;
        return rows.map(Transfer._convertToApiFormat);
    }

    /**
     *
     * @param id {string}
     */
    async findOne(id) {
        const row = await this._db('transfer').where('id', id);
        return Transfer._convertToApiFormat(row);
    }

    /**
     *
     * @param opts {Object}
     * @param [opts.minutePrevious] {number}
     */
    async successRate(opts) {
        const now = Date.now();
        const statQuery = (successOnly) => {
            const query = this._db('transfer')
                .count('id as count')
                .select(this._db.raw('MIN(((created_at) / (60 * 1000)) * 60 * 1000) as timestamp'))  // trunc (milli)seconds
                .whereRaw(`(${now} - created_at) < ${(opts.minutePrevious || 10) * 60 * 1000}`);
            if (successOnly) {
                query.andWhere('success', true);
            }
            query.groupByRaw('created_at / (60 * 1000)');
            return query;
        };

        const successStat = await statQuery(true);
        const allStat = await statQuery(false);
        return allStat.map(({timestamp, count}) => {
            const successRow = successStat.find(row => row.timestamp === timestamp);
            const successCount = successRow ? successRow.count : 0;
            return {
                timestamp,
                percentage: Math.trunc((successCount / count) * 100),
            };
        });
    }

    /**
     *
     * @param opts {Object}
     * @param [opts.minutePrevious] {number}
     */
    async avgResponseTime(opts) {
        const now = Date.now();
        const avgRespTimeQuery = () => {
            return this._db('transfer')
                .select(this._db.raw('AVG(completed_at - created_at) as averageResponseTime'))  // trunc (milli)seconds
                .select(this._db.raw('MIN(((created_at) / (60 * 1000)) * 60 * 1000) as timestamp'))  // trunc (milli)seconds
                .whereRaw(`(${now} - created_at) < ${(opts.minutePrevious || 10) * 60 * 1000}`)
                .andWhereRaw('success IS NOT NULL')
                .groupByRaw('created_at / (60 * 1000)');
        };

        return avgRespTimeQuery();
    }

    /**
     *
     * @param opts {Object}
     * @param [opts.hoursPrevious] {number}
     */
    async hourlyFlow(opts) {
        const now = Date.now();
        const flowQuery = () => {
            return this._db('transfer')
                .select('direction', 'currency')
                .sum('amount as sum')
                .select(this._db.raw('MIN(((created_at) / (3600 * 1000)) * 3600 * 1000) as timestamp'))  // trunc (milli)seconds
                .whereRaw(`(${now} - created_at) < ${(opts.hoursPrevious || 10) * 3600 * 1000}`)
                // .andWhere('success', true)
                .groupByRaw('created_at / (3600 * 1000), currency, direction');
        };

        const flowStat = await flowQuery();
        const stat = {};
        for (const row of flowStat) {
            const k = `${row.timestamp}_${row.currency}`;
            if (!stat[k]) {
                stat[k] = {
                    timestamp: row.timestamp,
                    currency: row.currency,
                    inbound: 0,
                    outbound: 0,
                };
            }
            if (row.direction > 0) {
                stat[k].outbound = row.sum;
            } else {
                stat[k].inbound = row.sum;
            }
        }
        return Object.values(stat);
    }

    /**
     *
     * @param opts {Object}
     * @param [opts.startTimestamp] {string}
     * @param [opts.endTimestamp] {string}
     */
    async statusSummary(opts) {
        const statusQuery = () => {
            const query = this._db('transfer')
                .select('success')
                .count('id as count').whereRaw('true');
            if (opts.startTimestamp) {
                query.andWhere('created_at', '>=', new Date(opts.startTimestamp).getTime());
            }
            if (opts.endTimestamp) {
                query.andWhere('created_at', '<', new Date(opts.endTimestamp).getTime());
            }
            query.groupBy('success');
            return query;
        };
        const rows = await statusQuery();
        return rows
            .map((row) => ({
                status: Transfer.STATUSES[row.success],
                count: row.count,
            }))
            .sort((a, b) => a.status.localeCompare(b.status));
    }
}

Transfer.cachedKeys = [];

module.exports = Transfer;
