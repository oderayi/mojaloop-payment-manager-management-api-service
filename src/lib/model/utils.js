/**************************************************************************
 *  (C) Copyright ModusBox Inc. 2020 - All rights reserved.               *
 *                                                                        *
 *  This file is made available under the terms of the license agreement  *
 *  specified in the corresponding source code repository.                *
 *                                                                        *
 *  ORIGINAL AUTHOR:                                                      *
 *       Yevhen Kyriukha - yevhen.kyriukha@modusbox.com                   *
 **************************************************************************/


// Strip all beginning and end forward-slashes from each of the arguments, then join all the
// stripped strings with a forward-slash between them. If the last string ended with a
// forward-slash, append that to the result.
exports.buildUrl = (...args) => {
    return args
        .filter(e => e !== undefined)
        .map(s => s.replace(/(^\/*|\/*$)/g, '')) /* This comment works around a problem with editor syntax highglighting */
        .join('/')
        + ((args[args.length - 1].slice(-1) === '/') ? '/' : '');
};

