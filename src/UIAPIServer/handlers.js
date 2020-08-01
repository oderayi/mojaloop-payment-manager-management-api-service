/**************************************************************************
 *  (C) Copyright ModusBox Inc. 2019 - All rights reserved.               *
 *                                                                        *
 *  This file is made available under the terms of the license agreement  *
 *  specified in the corresponding source code repository.                *
 *                                                                        *
 *  ORIGINAL AUTHOR:                                                      *
 *       Murthy Kakarlamudi - murthy@modusbox.com                         *
 **************************************************************************/

'use strict';

// const Model = require('@internal/model').UIAPIServerModel;
const {
    Balances,
} = require('@internal/model');
const config = require('./config');


const healthCheck = async(ctx) => {
    ctx.response.status = 200;
    ctx.response.body = JSON.stringify({'status':'ok'});
};

const getBalances = async(ctx) => {
    const balances = new Balances({
        config: config
    });
    ctx.response.status = 200;
    ctx.response.body = balances.findBalances(ctx.request.url, ctx.request.headers, ctx.request.query);
};


module.exports = {
    '/health': {
        get: healthCheck
    },
    '/balances': {
        get: getBalances,
    }
};
