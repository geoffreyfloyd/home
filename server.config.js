/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-2016 Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

/* eslint-disable max-len */
/* jscs:disable maximumLineLength */
const DEBUG = process.argv.indexOf('--release') === -1;

export const socketPort = DEBUG ? 8080 : 8181;
export const port = DEBUG ? 8081 : 80;
export const host = process.env.WEBSITE_HOSTNAME || `localhost:${port}`;
