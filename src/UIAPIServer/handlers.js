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

const util = require('util');
const Model = require('@internal/model').UIAPIServerModel;


const healthCheck = async(ctx) => {
    ctx.response.status = 200;
    ctx.response.body = JSON.stringify({'status':'ok'});
};


module.exports = {
    '/health': {
        get: healthCheck
    }
};
