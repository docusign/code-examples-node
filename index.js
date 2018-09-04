#!/usr/bin/env node

const express = require('express')
    , session = require('express-session')  // https://github.com/expressjs/session
    , bodyParser = require('body-parser')
    , cookieParser = require('cookie-parser')
    , MemoryStore = require('memorystore')(session) // https://github.com/roccomuso/memorystore
    , path = require('path')
    , DSAuthCodeGrant = require('./lib/DSAuthCodeGrant')
    , passport = require('passport')
    , DocusignStrategy = require('passport-docusign')
    , dsConfig = require('./ds_configuration.js').config
    , commonControllers = require('./lib/commonControllers')
    , flash = require('express-flash')
    , helmet = require('helmet') // https://expressjs.com/en/advanced/best-practice-security.html
    , moment = require('moment')
    , csp = require('helmet-csp')
    , csrf = require('csurf') // https://www.npmjs.com/package/csurf
    , eg001 = require('./lib/examples/eg001')
    , eg002 = require('./lib/examples/eg002')
    , eg003 = require('./lib/examples/eg003')
    , eg004 = require('./lib/examples/eg004')
    , eg005 = require('./lib/examples/eg005')
    , eg006 = require('./lib/examples/eg006')
    , eg007 = require('./lib/examples/eg007')
    , eg008 = require('./lib/examples/eg008')
    , eg009 = require('./lib/examples/eg009')
    , eg010 = require('./lib/examples/eg010')
    , eg011 = require('./lib/examples/eg011')
    , eg012 = require('./lib/examples/eg012')
    , eg013 = require('./lib/examples/eg013')
    , eg014 = require('./lib/examples/eg014')
    ;

const PORT = process.env.PORT || 5000
    , HOST = process.env.HOST || 'localhost'
    , hostUrl = 'http://' + HOST + ':' + PORT
    , max_session_min = 180
    , csrfProtection = csrf({ cookie: true })
    ;

let app = express()
  .use(helmet())
  .use(express.static(path.join(__dirname, 'public')))
  .use(cookieParser())
  .use(session({
    secret: dsConfig.sessionSecret,
    name: 'ds-eg03-session',
    cookie: {maxAge: max_session_min * 60000},
    saveUninitialized: true,
    resave: true,
    store: new MemoryStore({
        checkPeriod: 86400000 // prune expired entries every 24h
  })}))
  .use(passport.initialize())
  .use(passport.session())
  .use(bodyParser.urlencoded({ extended: true }))
  .use(((req, res, next) => {
    res.locals.user = req.user;
    res.locals.session = req.session;
    res.locals.dsConfig = dsConfig;
    res.locals.hostUrl = hostUrl; // Used by DSAuthCodeGrant#logout
    next()})) // Send user info to views
  .use(flash())
  .use(csp({
    // Specify directives as normal.
    directives: {
      defaultSrc: ["'none'"],
      scriptSrc: ["'self'", "https://code.jquery.com","https://cdnjs.cloudflare.com",
        "https://stackpath.bootstrapcdn.com", "https://cdn.jsdelivr.net",
        "'sha256-0NW9KKBQYh2Iv0XLsH/B9LSOfn2Z00m55p5eKSUlikE='"], // hash is for inline script for anchor lib on index page.
      styleSrc: ["'self'", "'unsafe-inline'", "https://stackpath.bootstrapcdn.com"],
      imgSrc: ["'self'", "data:"],
      //sandbox: ['allow-forms', 'allow-scripts', 'allow-modals',
      //  'allow-popups', 'allow-same-origin'], // Sandboxing does not allow PDF viewer plugin...
      objectSrc: ["'self'"],
      fontSrc: ["data:"],
      // Don't set the following
      upgradeInsecureRequests: false,
      workerSrc: false
    },
    // This module will detect common mistakes in your directives and throw errors
    // if it finds any. To disable this, enable "loose mode".
    loose: false,
    reportOnly: false,
    setAllHeaders: false,
    // Set to true if you want to disable CSP on Android where it can be buggy.
    disableAndroid: true,
    browserSniff: true
  }))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  // Add an instance of DSAuthCodeGrant to req
  .use((req, res, next) => {req.dsAuthCodeGrant = new DSAuthCodeGrant(req); next()})
  // Routes
  .get('/', commonControllers.indexController)
  .get('/ds/login', (req, res, next) => {req.dsAuthCodeGrant.login(req, res, next)})
  .get('/ds/callback', [dsLoginCB1, dsLoginCB2]) // OAuth callbacks. See below
  .get('/ds/logout', (req, res) => {req.dsAuthCodeGrant.logout(req, res)})
  .get('/ds/logoutCallback', (req, res) => {req.dsAuthCodeGrant.logoutCallback(req, res)})
  .get('/ds/mustAuthenticate', commonControllers.mustAuthenticateController)
  .get('/ds-return', commonControllers.returnController)
  .use(csrfProtection) // CSRF protection for the following routes
  .get('/eg001', eg001.getController)
  .post('/eg001', eg001.createController)
  .get('/eg002', eg002.getController)
  .post('/eg002', eg002.createController)
  .get('/eg003', eg003.getController)
  .post('/eg003', eg003.createController)
  .get('/eg004', eg004.getController)
  .post('/eg004', eg004.createController)
  .get('/eg005', eg005.getController)
  .post('/eg005', eg005.createController)
  .get('/eg006', eg006.getController)
  .post('/eg006', eg006.createController)
  .get('/eg007', eg007.getController)
  .post('/eg007', eg007.createController)
  .get('/eg008', eg008.getController)
  .post('/eg008', eg008.createController)
  .get('/eg009', eg009.getController)
  .post('/eg009', eg009.createController)
  .get('/eg010', eg010.getController)
  .post('/eg010', eg010.createController)
  .get('/eg011', eg011.getController)
  .post('/eg011', eg011.createController)
  .get('/eg012', eg012.getController)
  .post('/eg012', eg012.createController)
  .get('/eg013', eg013.getController)
  .post('/eg013', eg013.createController)
  .get('/eg014', eg014.getController)
  .post('/eg014', eg014.createController)
  ;

function dsLoginCB1 (req, res, next) {req.dsAuthCodeGrant.oauth_callback1(req, res, next)}
function dsLoginCB2 (req, res, next) {req.dsAuthCodeGrant.oauth_callback2(req, res, next)}

/* Start the web server */
if (dsConfig.dsClientId && dsConfig.dsClientId !== '{CLIENT_ID}' &&
    dsConfig.dsClientSecret && dsConfig.dsClientSecret !== '{CLIENT_SECRET}') {
  app.listen(PORT, HOST, function (err) {
    if (err) {throw err}
    console.log(`Ready! Open ${hostUrl}`);
  })
} else {
  console.log(`PROBLEM: You need to set the clientId (Integrator Key), and perhaps other settings as well. 
You can set them in the source file ds_configuration.js or set environment variables.\n`);
  process.exit(); // We're not using exit code of 1 to avoid extraneous npm messages.
}

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete DocuSign profile is serialized
//   and deserialized.
passport.serializeUser  (function(user, done) {done(null, user)});
passport.deserializeUser(function(obj,  done) {done(null, obj)});

// Configure passport for DocusignStrategy
let docusignStrategy = new DocusignStrategy({
    production: dsConfig.production,
    clientID: dsConfig.dsClientId,
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
    // We store the data in DSAuthCodeGrant.loginCallback2
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
  docusignStrategy.authorizationParams = function(options) {
    return {prompt: 'login'};
  }
}
passport.use(docusignStrategy);
