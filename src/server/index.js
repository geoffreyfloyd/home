import path from 'path';
import express from 'express';
import socketServer from './socket-server';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import methodOverride from 'method-override';
import session from 'express-session';
import PrettyError from 'pretty-error';

import Operator from '../libs/operator';
import config from '../../home.config';
import appsConfig from '../../apps.config';

const DEBUG = process.argv.indexOf('--release') === -1;
var port = require('../../server.config')(DEBUG).port;
const server = global.server = express();

//
// Register Node.js middleware
// -----------------------------------------------------------------------------
var publicPath = path.resolve(__dirname, '../../build');
server.use('/static', express.static(publicPath));
server.use('/media', express.static(path.resolve(__dirname, './media')));
server.use('/favicon.ico', express.static(path.resolve(__dirname, './root/favicon.ico')));
server.use(cookieParser());
server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json());

server.use(methodOverride());
server.use(session({
   resave: true,
   saveUninitialized: false,
   secret: config.sessionSecret,
}));

//
// Set View Template Provider
// -----------------------------------------------------------------------------
server.set('views', path.resolve(__dirname, './views'));
server.set('view engine', 'pug');

//
// Enable CORS
// -----------------------------------------------------------------------------
server.use((req, res, next) => {
   res.setHeader('Access-Control-Allow-Origin', '*');
   res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
   res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
   next();
});

//
// Configure Operator core
// -----------------------------------------------------------------------------
var operatorConfig = { ...config, ...appsConfig };
var operator = new Operator(operatorConfig, server, express, socketServer, ensureAuthenticated, ensureAuthorized, { publicPath: publicPath + '/' });

//
// Error handling
// -----------------------------------------------------------------------------
const pe = new PrettyError();
pe.skipNodeFiles();
pe.skipPackage('express');

server.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
   console.log(pe.render(err)); // eslint-disable-line no-console
   const statusCode = err.status || 500;
   res.status(statusCode);
   res.render('error', {
      message: err.message,
      stack: process.env.NODE_ENV === 'production' ? '' : err.stack,
   });
});

//
// Launch the server
// -----------------------------------------------------------------------------
server.listen(port, () => {
   console.log(`HTTP Server is listening on port ${port}`);
});

/**
 * Simple route middleware to ensure user is authenticated.
 * Use this route middleware on any resource that needs to be protected.  If
 * the request is authenticated (typically via a persistent login session),
 * the request will proceed.  Otherwise, the user will be redirected to the
 * login page.
 */
function ensureAuthenticated (req, res, next) {
   // Check is user is authenticated. Continue if authenticated,
   // and redirect to google auth if not authenticated.
   var isAuth = DEBUG || req.isAuthenticated();
   if (isAuth || (req.session.passport && req.session.passport.user && req.session.passport.user.providerId)) {
      if (!isAuth) {
         console.log('req.isAuthenticated returning false even though a user is present');
      }
      return next();
   }
   // Set requested URL to redirect path for use after authentication
   req.session.redirectTo = req.url;
   res.redirect('/auth/google');
}

const allowConsumersOnReadOnlyUrls = ['/', '/bits', '/strips'];

function ensureAuthorized (req, res, next) {
   if (DEBUG) {
      return next();
   }
   var authorizedUsers = operator.config.users.producers.slice();
   if (allowConsumersOnReadOnlyUrls.indexOf(req.url) > -1) {
      authorizedUsers = authorizedUsers.concat(operator.config.users.consumers.slice());
   }
   if (authorizedUsers.indexOf(req.user.providerId) > -1) {
      console.log(`Granted access for ${req.url} to ${req.user.providerId}`);
      return next();
   }
   console.log(`Denied access for ${req.url} to ${req.user.providerId}`);
}
