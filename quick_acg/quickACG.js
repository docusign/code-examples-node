#!/usr/bin/env node

const express = require('express');
const session = require('express-session');  // https://github.com/expressjs/session
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const MemoryStore = require('memorystore')(session); // https://github.com/roccomuso/memorystore
const path = require('path');
const DSAuthCodeGrant = require('../lib/DSAuthCodeGrant');
const passport = require('passport');
const DocusignStrategy = require('passport-docusign');
const docOptions = require('../config/documentOptions.json');
const docNames = require('../config/documentNames.json');
const dsConfig = require('../config/index.js').config;
const commonControllers = require('../lib/commonControllers');
const flash = require('express-flash');
const helmet = require('helmet'); // https://expressjs.com/en/advanced/best-practice-security.html
const moment = require('moment');
const csrf = require('csurf'); // https://www.npmjs.com/package/csurf

const eg001 = require('../lib/eSignature/controllers/eg001EmbeddedSigning');

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';
const max_session_min = 180;
const csrfProtection = csrf({ cookie: true });

let hostUrl = 'http://' + HOST + ':' + PORT
if (dsConfig.appUrl != '' && dsConfig.appUrl != '{APP_URL}') { hostUrl = dsConfig.appUrl }

let app = express()
  .use(helmet())
  .use(express.static(path.join(__dirname, 'public')))
  .use(cookieParser())
  .use(session({
    secret: dsConfig.sessionSecret,
    name: 'ds-launcher-session',
    cookie: { maxAge: max_session_min * 60000 },
    saveUninitialized: true,
    resave: true,
    store: new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    })
  }))
  .use(passport.initialize())
  .use(passport.session())
  .use(bodyParser.urlencoded({ extended: true }))
  .use(((req, res, next) => {
    res.locals.user = req.user;
    res.locals.session = req.session;
    res.locals.dsConfig = { ...dsConfig, docOptions: docOptions, docNames: docNames};
    res.locals.quickACG = true; 
    res.locals.examplesApi = {"isESignatureApi":true};
    res.locals.hostUrl = hostUrl; // Used by DSAuthCodeGrant#logout
    next()
  })) // Send user info to views
  .use(flash())
  .set('views', path.join(__dirname, '../views'))
  .set('view engine', 'ejs')
  // Add an instance of DSAuthCodeGrant to req
  .use((req, res, next) => {
    req.dsAuthCodeGrant = new DSAuthCodeGrant(req);
    req.dsAuth = req.dsAuthCodeGrant;
    next()
  })
  .use(csrfProtection) // CSRF protection for the following routes
  // Routes
  .get('/', redirectEg001)
  .get('/eg001', eg001.getController)
  .post('/eg001', eg001.createController)
  .get('/ds/mustAuthenticate', redirectLogin)
  .get('/ds/login', commonControllers.login)
  .get('/ds-return', redirectReturn)
  .get('/ds/callback', [dsLoginCB1, dsLoginCB2]) // OAuth callbacks. See below
;

function redirectEg001(req, res) { return res.redirect('/eg001'); }
function redirectLogin(req, res) { return res.redirect('/ds/login'); }
function redirectReturn(req, res) { return res.redirect('/eg001'); }
function dsLoginCB1(req, res, next) { req.dsAuthCodeGrant.oauth_callback1(req, res, next) }
function dsLoginCB2(req, res, next) { req.dsAuthCodeGrant.oauth_callback2(req, res, next) }

if (dsConfig.dsClientId && dsConfig.dsClientId !== '{CLIENT_ID}' &&
  dsConfig.dsClientSecret && dsConfig.dsClientSecret !== '{CLIENT_SECRET}') {
  app.listen(PORT)
  console.log(`Listening on ${PORT}`);
  console.log(`Ready! Open ${hostUrl}`);
} else {
  console.log(`PROBLEM: You need to set the clientId (Integrator Key), and perhaps other settings as well.
You can set them in the configuration file config/appsettings.json or set environment variables.\n`);
  process.exit(); // We're not using exit code of 1 to avoid extraneous npm messages.
}

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete DocuSign profile is serialized
//   and deserialized.
passport.serializeUser(function (user, done) { done(null, user) });
passport.deserializeUser(function (obj, done) { done(null, obj) });

let scope = ["signature"];;
// Configure passport for DocusignStrategy
let docusignStrategy = new DocusignStrategy({
    production: dsConfig.production,
    clientID: dsConfig.dsClientId,
    scope: scope.join(" "),
    clientSecret: dsConfig.dsClientSecret,
    callbackURL: hostUrl + '/ds/callback',
    state: true // automatic CSRF protection.
      // See https://github.com/jaredhanson/passport-oauth2/blob/master/lib/state/session.js
  },
  function _processDsResult(accessToken, refreshToken, params, profile, done) {
    // The params arg will be passed additional parameters of the grant.
    // See https://github.com/jaredhanson/passport-oauth2/pull/84
    //
    // Here we're just assigning the tokens to the account object
    // We store the data in DSAuthCodeGrant.getDefaultAccountInfo
    let user = profile;
    user.accessToken = accessToken;
    user.refreshToken = refreshToken;
    user.expiresIn = params.expires_in;
    user.tokenExpirationTimestamp = moment().add(user.expiresIn, 's'); // The dateTime when the access token will expire
    return done(null, user);
  }
);

/**
 * The DocuSign OAuth default is to allow silent authentication.
 * An additional OAuth query parameter is used to not allow silent authentication
 */
if (!dsConfig.allowSilentAuthentication) {
  // See https://stackoverflow.com/a/32877712/64904
  docusignStrategy.authorizationParams = function (options) {
    return { prompt: 'login' };
  }
}

passport.use(docusignStrategy);
