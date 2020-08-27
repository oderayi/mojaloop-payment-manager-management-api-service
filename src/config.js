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

const fs = require('fs');
require('dotenv').config();
const { from } = require('env-var');
const yaml = require('js-yaml');

function getFileContent(path) {
    if (!fs.existsSync(path)) {
        throw new Error('File doesn\'t exist');
    }
    return fs.readFileSync(path);
}

const env = from(process.env, {
    asFileContent: (path) => getFileContent(path),
    asFileListContent: (pathList) => pathList.split(',').map((path) => getFileContent(path)),
    asYamlConfig: (path) => yaml.load(getFileContent(path)),
});

module.exports = {
    inboundPort: env.get('INBOUND_LISTEN_PORT').default('9000').asPortNumber(),
    logIndent: env.get('LOG_INDENT').default('2').asIntPositive(),
    runMigrations: env.get('RUN_DB_MIGRATIONS').default('true').asBool(),
    cacheHost: env.get('CACHE_HOST').default('172.17.0.4').asString(),
    cachePort: env.get('CACHE_PORT').default(6379).asPortNumber(),
    tls: {
        inbound: {
            mutualTLS: {
                enabled: env.get('INBOUND_MUTUAL_TLS_ENABLED').default('false').asBool(),
            },
            creds: {
                ca: env.get('IN_CA_CERT_PATH').asFileListContent(),
                cert: env.get('IN_SERVER_CERT_PATH').asFileContent(),
                key: env.get('IN_SERVER_KEY_PATH').asFileContent(),
            },
        },
        outbound: {
            mutualTLS: {
                enabled: env.get('OUTBOUND_MUTUAL_TLS_ENABLED').default('false').asBool(),
            },
            creds: {
                ca: env.get('OUT_CA_CERT_PATH').asFileListContent(),
                cert: env.get('OUT_CLIENT_CERT_PATH').asFileContent(),
                key: env.get('OUT_CLIENT_KEY_PATH').asFileContent(),
            },
        }
    },
    peerEndpoint: env.get('PEER_ENDPOINT').required().asString(),
    mcmServerEndpoint: env.get('MCM_SERVER_ENDPOINT').required().asString(),
    mcmAPIToken: env.get('MCM_API_TOKEN').required().asString(),
};
