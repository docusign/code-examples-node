#!/usr/bin/env node

const express = require('express')
  , session = require('express-session')  // https://github.com/expressjs/session
  , bodyParser = require('body-parser')
  , cookieParser = require('cookie-parser')
  , MemoryStore = require('memorystore')(session) // https://github.com/roccomuso/memorystore
  , path = require('path')
  , DSAuthCodeGrant = require('./lib/DSAuthCodeGrant')
  , DsJwtAuth = require('./lib/DSJwtAuth')
  , passport = require('passport')
  , DocusignStrategy = require('passport-docusign')
  , docOptions = require('./config/documentOptions.json')
  , docNames = require('./config/documentNames.json')
  , dsConfig = require('./config/index.js').config
  , commonControllers = require('./lib/commonControllers')
  , flash = require('express-flash')
  , helmet = require('helmet') // https://expressjs.com/en/advanced/best-practice-security.html
  , moment = require('moment')
  , csrf = require('csurf') // https://www.npmjs.com/package/csurf
    , eg001 = require('./eg001EmbeddedSigning')
    , eg002 = require('./lib/eSignature/eg002SigningViaEmail')
    , eg003 = require('./lib/eSignature/eg003ListEnvelopes')
    , eg004 = require('./lib/eSignature/eg004EnvelopeInfo')
    , eg005 = require('./lib/eSignature/eg005EnvelopeRecipients')
    , eg006 = require('./lib/eSignature/eg006EnvelopeDocs')
    , eg007 = require('./lib/eSignature/eg007EnvelopeGetDoc')
    , eg008 = require('./lib/eSignature/eg008CreateTemplate')
    , eg009 = require('./lib/eSignature/eg009UseTemplate')
    , eg010 = require('./lib/eSignature/eg010SendBinaryDocs')
    , eg011 = require('./lib/eSignature/eg011EmbeddedSending')
    , eg012 = require('./lib/eSignature/eg012EmbeddedConsole')
    , eg013 = require('./lib/eSignature/eg013AddDocToTemplate')
    , eg014 = require('./lib/eSignature/eg014CollectPayment')
    , eg015 = require('./lib/eSignature/eg015EnvelopeTabData')
    , eg016 = require('./lib/eSignature/eg016SetTabValues')
    , eg017 = require('./lib/eSignature/eg017SetTemplateTabValues')
    , eg018 = require('./lib/eSignature/eg018EnvelopeCustomFieldData')
    , eg019 = require('./lib/eSignature/eg019AccessCodeAuthentication')
    , eg020 = require('./lib/eSignature/eg020SmsAuthentication')
    , eg021 = require('./lib/eSignature/eg021PhoneAuthentication')
    , eg022 = require('./lib/eSignature/eg022KbaAuthentication')
    , eg023 = require('./lib/eSignature/eg023IdvAuthentication')
    , eg024 = require('./lib/eSignature/eg024CreatePermission')
    , eg025 = require('./lib/eSignature/eg025PermissionSetUserGroup')
    , eg026 = require('./lib/eSignature/eg026PermissionChangeSingleSetting')
    , eg027 = require('./lib/eSignature/eg027DeletePermission')
    , eg028 = require('./lib/eSignature/eg028CreateBrand')
    , eg029 = require('./lib/eSignature/eg029ApplyBrandToEnvelope')
    , eg030 = require('./lib/eSignature/eg030ApplyBrandToTemplate')
    , eg031 = require('./lib/eSignature/eg031BulkSendEnvelopes')
  , eg001rooms = require('./lib/rooms/eg001CreateRoomWithData')
  , eg002rooms = require('./lib/rooms/eg002CreateRoomFromTemplate')
  , eg003rooms = require('./lib/rooms/eg003ExportDataFromRoom')
  , eg004rooms = require('./lib/rooms/eg004AddingFormToRoom')
  , eg005rooms = require('./lib/rooms/eg005GetRoomsWithFilters')
  , eg006rooms = require('./lib/rooms/eg006CreateExternalFormFillSession')
  ;

const PORT = process.env.PORT || 5000
  , HOST = process.env.HOST || 'localhost'
  , max_session_min = 180
  , csrfProtection = csrf({ cookie: true })
  ;

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
    res.locals.dsConfig = { ...dsConfig, docOptions: docOptions, docNames: docNames };
    res.locals.hostUrl = hostUrl; // Used by DSAuthCodeGrant#logout
    next()
  })) // Send user info to views
  .use(flash())
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  // Add an instance of DSAuthCodeGrant to req
  .use((req, res, next) => {
    req.dsAuthCodeGrant = new DSAuthCodeGrant(req);
    req.dsAuthJwt = new DsJwtAuth(req);
    req.dsAuth = req.dsAuthCodeGrant;
    if (req.session.authMethod === 'jwt-auth') {
      req.dsAuth = req.dsAuthJwt;
    }
    next()
  })
  // Routes
  .get('/', commonControllers.indexController)
  .get('/ds/login', commonControllers.login)
  .get('/ds/callback', [dsLoginCB1, dsLoginCB2]) // OAuth callbacks. See below
  .get('/ds/logout', commonControllers.logout)
  .get('/ds/logoutCallback', commonControllers.logoutCallback)
  .get('/ds/mustAuthenticate', commonControllers.mustAuthenticateController)
  .get('/ds-return', commonControllers.returnController)
  .use(csrfProtection) // CSRF protection for the following routes
  ;
if (dsConfig.examplesApi !== 'rooms') {
  app.get('/eg001', eg001.getController)
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
    .get('/eg015', eg015.getController)
    .post('/eg015', eg015.createController)
    .get('/eg016', eg016.getController)
    .post('/eg016', eg016.createController)
    .get('/eg017', eg017.getController)
    .post('/eg017', eg017.createController)
    .get('/eg018', eg018.getController)
    .post('/eg018', eg018.createController)
    .get('/eg019', eg019.getController)
    .post('/eg019', eg019.createController)
    .get('/eg020', eg020.getController)
    .post('/eg020', eg020.createController)
    .get('/eg021', eg021.getController)
    .post('/eg021', eg021.createController)
    .get('/eg022', eg022.getController)
    .post('/eg022', eg022.createController)
    .get('/eg023', eg023.getController)
    .post('/eg023', eg023.createController)
    .get('/eg024', eg024.getController)
    .post('/eg024', eg024.createController)
    .get('/eg025', eg025.getController)
    .post('/eg025', eg025.createController)
    .get('/eg026', eg026.getController)
    .post('/eg026', eg026.createController)
    .get('/eg027', eg027.getController)
    .post('/eg027', eg027.createController)
    .get('/eg028', eg028.getController)
    .post('/eg028', eg028.createController)
    .get('/eg029', eg029.getController)
    .post('/eg029', eg029.createController)
    .get('/eg030', eg030.getController)
    .post('/eg030', eg030.createController)
    .get('/eg031', eg031.getController)
    .post('/eg031', eg031.createController)
    ;
} else {
  app.get('/eg001rooms', eg001rooms.getController)
  .post('/eg001rooms', eg001rooms.createController)
  .get('/eg002rooms', eg002rooms.getController)
  .post('/eg002rooms', eg002rooms.createController)
  .get('/eg003rooms', eg003rooms.getController)
  .post('/eg003rooms', eg003rooms.createController)
  .get('/eg004rooms', eg004rooms.getController)
  .post('/eg004rooms', eg004rooms.createController)
  .get('/eg005rooms', eg005rooms.getController)
  .post('/eg005rooms', eg005rooms.createController)
  .get('/eg006rooms', eg006rooms.getController)
  .post('/eg006rooms', eg006rooms.createController)
}

function dsLoginCB1(req, res, next) { req.dsAuthCodeGrant.oauth_callback1(req, res, next) }
function dsLoginCB2(req, res, next) { req.dsAuthCodeGrant.oauth_callback2(req, res, next) }

/* Start the web server */
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

let scope = "signature";
if (dsConfig.examplesApi === 'rooms') {
  scope += " dtr.rooms.read dtr.rooms.write dtr.documents.read dtr.documents.write dtr.profile.read dtr.profile.write dtr.company.read dtr.company.write room_forms";
}
// Configure passport for DocusignStrategy
let docusignStrategy = new DocusignStrategy({
  production: dsConfig.production,
  clientID: dsConfig.dsClientId,
  scope: scope,
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
