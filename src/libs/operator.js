import Gnodes from '../libs/gnodes/index.js';
var uuid = require('uuid');
var fs = require('bluebird').promisifyAll(require('fs-extra'));
var path = require('path');

/**
* Set header to tell client that we're
* sending json data in our response body
*/
function jsonResponse (req, res, next) {
   res.setHeader('Content-Type', 'application/json');
   next();
}

const DEBUG = process.argv.indexOf('--release') === -1;
const VERBOSE = process.argv.indexOf('--verbose') > -1;

class Operator {
   constructor (config, server, express, socketServer, authenticate, authorize, stats) {
      this.server = server;
      this.socketServer = socketServer;
      this.authenticate = authenticate;
      this.authorize = authorize;
      this.reactRouterConfig = { routes: [] };
      this.stats = stats;
      this.db = null;
      this.fs = fs;
      this.gooeys = [];
      this.commands = [];
      this.contexts = [];
      this.config = config;
      this.newline = '\r\n';
      this.dataSchema = {};
      this.jsonResponse = jsonResponse;
      // Connect to Gnodes DB
      this.connectToData();
      // Configure passport middleware
      this.configurePassport();
      // Configure HTTP Routes
      this.configureRoutes();
      // Static serve Gnode DB for reference files/images
      server.use('/my', express.static(config.repoPath));
      // Static serve local dirs set in config
      config.dirs.forEach(dir => server.use('/' + dir.mnt, express.static(dir.path)));
   }

   newId () {
      return uuid.v4();
   }

   configureRoutes () {
      // Set HTTP Routes for each app
      Object.keys(this.config.apps).forEach(appKey => {
         var appPath = this.config.apps[appKey];
         var entryPoints;

         // Register HTTP API Points
         require(path.join(appPath, 'api.js'))(this);

         // Register HTTP UI Entry Points
         entryPoints = require(path.join(appPath, 'ui.js'));
         Object.keys(entryPoints).forEach(uiKey => {
            var entry = entryPoints[uiKey];
            // Set HTTP Route for each entry point in the app
            this.server.get(entry.route, this.authenticate, this.authorize, (req, res) => {
               // Set app entry and params
               var data = {
                  entry: DEBUG ? (`http://localhost:3000/static/${appKey}-${uiKey}.js`) : (`/static/${appKey}-${uiKey}.js`),
                  params: req.params,
               };
               res.render(entry.view, data);
            });
         });
      });
   }

   configurePassport () {
      if (!this.config || !this.config.passport) {
         return;
      }

      //
      var passport = require('passport');

      // Setup Sessions and Passport OAuth
      this.server.use(passport.initialize());
      this.server.use(passport.session());

      // Passport session setup.
      //   To support persistent login sessions, Passport needs to be able to
      //   serialize users into and deserialize users out of the session.  Typically,
      //   this will be as simple as storing the user ID when serializing, and finding
      //   the user by ID when deserializing.  However, since this example does not
      //   have a database of user records, the complete Google profile is
      //   serialized and deserialized.
      passport.serializeUser((user, done) => {
         done(null, user);
      });

      passport.deserializeUser((obj, done) => {
         done(null, obj);
      });

      var google = this.config.passport.google;
      if (google) {
         var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
         passport.use(new GoogleStrategy({
            clientID: google.id,
            clientSecret: google.secret,
            callbackURL: google.callback,
         }, (accessToken, refreshToken, profile, done) => {
            // asynchronous verification, for effect...
            process.nextTick(() => {
               var error, user;

               // Just make sure the user is the one we expect
               // if (profile.id === google.profileId) {
               error = null;
               user = {
                  profileUrl: profile.photos.length > 0 ? profile.photos[0].value : null,
                  userName: profile.displayName,
                  provider: 'google',
                  providerId: profile.id,
               };
               // }
               // else {
               //    error = new Error("Invalid user");
               //    user = null;
               // }

               return done(error, user);
            });
         }));

         // GET /auth/google
         //   Use passport.authenticate() as route middleware to authenticate the
         //   request.  The first step in Google authentication will involve
         //   redirecting the user to google.com.  After authorization, Google
         //   will redirect the user back to this application at /auth/google/callback
         this.server.get('/auth/google',
            passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.login'] }), () => {
               // The request will be redirected to Google for authentication
               // so this function will not be called.
            });

         // GET /auth/google/callback
         //   Use passport.authenticate() as route middleware to authenticate the
         //   request. If authentication fails, the user will be redirected back to the
         //   login page. Otherwise, the primary route function function will be called
         this.server.get('/signin-google',
            passport.authenticate('google', { failureRedirect: '/login' }),
            (req, res) => {
               // Here user exists
               // res.set('token', req.user.token);
               var redirectTo = req.session.redirectTo ? req.session.redirectTo : '/';
               delete req.session.redirectTo; // eslint-disable-line no-param-reassign

               console.log(`Redirecting authenticated user to ${redirectTo}`);
               res.redirect(redirectTo);
            });
      }
   }

   getDb (callback) {
      if (this.db) {
         callback(this.db);
      }
      else {
         this.dbConnectRequests = this.dbConnectRequests || [];
         this.dbConnectRequests.push(callback);
      }
   }

   onConnected () {
      if (this.dbConnectRequests && this.dbConnectRequests.length) {
         while (this.dbConnectRequests.length > 0) {
            var request = this.dbConnectRequests.splice(0, 1)[0];
            request(this.db);
         }
      }
   }

   connectToData () {
      if (!this.db) {
         var me = this;
         Gnodes.open(this.config).done(db => {
            if (me.dbReady) {
               me.dbReady();
            }
            me.db = db;
            me.onConnected();
         });
      }
   }

   createBridge (req, res) {
      return new OperatorBridge(this, req, res);
   }

   addSchema (schema) {
      Object.assign(this.dataSchema, schema);
   }

   registerCommand (kind/* , route, cmd */) {
      if (kind) {
         this.commands.push(kind);
      }
   }
}

class OperatorBridge {
   constructor (operator, req, res) {
      this.operator = operator;
      this.req = req;
      this.res = res;
   }

   done (type, result, context) {
      var ctx = {
         processId: uuid.v4(),
      };

      Object.assign(ctx, context);

      var response = {
         status: 'OK',
         date: (new Date()).toISOString(),
         type,
         result,
         setContext: ctx,
      };
      this.res.end(JSON.stringify(response));
   }

   fail (errMsg) {
      var response = {
         status: 'ERR',
         date: (new Date()).toISOString(),
         type: 'text',
         result: errMsg,
      };
      this.res.end(JSON.stringify(response));
   }
}

export default Operator;
