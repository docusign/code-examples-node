// dsJwtAuth.js

/**
 * @file
 * This file handles the JWT authentication with DocuSign.
 * It also looks up the user's account and base_url
 * via the OAuth::userInfo method.
 * See https://developers.docusign.com/esign-rest-api/guides/authentication/user-info-endpoints userInfo method.
 * @author DocuSign
 */

 'use strict';
 let DsJwtAuth = function _DsJwtAuth(req) {
     // private globals
     this._debug_prefix = 'DsJwtAuth';
     this.accessToken = req.user && req.user.accessToken;
     this.accountId = req.user && req.user.accountId;
     this.accountName = req.user && req.user.accountName;
     this.basePath = req.user && req.user.basePath;
     this._tokenExpiration = req.user && req.user.tokenExpirationTimestamp;
     this.scopes = 'signature dtr.rooms.read dtr.rooms.write dtr.documents.read dtr.documents.write dtr.profile.read dtr.profile.write dtr.company.read dtr.company.write room_forms click.manage click.send webforms_read webforms_instance_read webforms_instance_write aow_manage';

     // For production use, you'd want to store the refresh token in non-volatile storage since it is
     // good for 30 days. You'd probably want to encrypt it too.
     this._debug = true; // ### DEBUG ### setting

 };

 const moment = require('moment');
      const fs = require('fs');
      const docusign = require('docusign-esign');
      const dsConfig = require('./config.js').config;
      const tokenReplaceMin = 10; // The accessToken must expire at least this number of
      const tokenReplaceMinGet = 30;
      const rsaKey = fs.readFileSync(dsConfig.privateKeyLocation);
      const passport = require('passport');
      const session = require('express-session') // https://github.com/expressjs/session
     ; const MemoryStore = require('memorystore')(session); // https://github.com/roccomuso/memorystore
      const bodyParser = require('body-parser');
      const flash = require('express-flash')

     ;

     const max_session_min = 180;

 /**
  * This is the key method for the object.
  * It should be called before any API call to DocuSign.
  * It checks that the existing access accessToken can be used.
  * If the existing accessToken is expired or doesn't exist, then
  * a new accessToken will be obtained from DocuSign by using
  * the JWT flow.
  *
  * This is an async function so call it with await.
  *
  * SIDE EFFECT: Sets the access accessToken that the SDK will use.
  * SIDE EFFECT: If the accountId et al is not set, then this method will
  *              also get the user's information
  * @function
  */
 DsJwtAuth.prototype.checkToken = function _checkToken(bufferMin = tokenReplaceMinGet) {
     let noToken = !this.accessToken || !this._tokenExpiration;
          let now = moment();
          let needToken = noToken || moment(this._tokenExpiration).subtract(
             bufferMin, 'm').isBefore(now)
         ;
     if (this._debug) {
         if (noToken) { this._debug_log('checkToken: Starting up--need a token'); }
         if (needToken && !noToken) { this._debug_log('checkToken: Replacing old token'); }
         if (!needToken) { this._debug_log('checkToken: Using current token'); }
     }

     return (!needToken);
 };

 /**
  * Async function to obtain a accessToken via JWT grant
  *
  * RETURNS {accessToken, tokenExpirationTimestamp}
  *
  * We need a new accessToken. We will use the DocuSign SDK's function.
  */
 DsJwtAuth.prototype.getToken = async function _getToken() {
     // Data used
     // dsConfig.dsClientId
     // dsConfig.impersonatedUserGuid
     // dsConfig.privateKey
     // dsConfig.dsOauthServer

     const jwtLifeSec = 10 * 60; // requested lifetime for the JWT is 10 min
         const dsApi = new docusign.ApiClient();
     dsApi.setOAuthBasePath(dsConfig.dsOauthServer.replace('https://', '')); // it should be domain only.
     const results = await dsApi.requestJWTUserToken(dsConfig.dsClientId,
         dsConfig.impersonatedUserGuid, this.scopes, rsaKey,
         jwtLifeSec);

     const expiresAt = moment().add(results.body.expires_in, 's').subtract(tokenReplaceMin, 'm');
     this.accessToken = results.body.access_token;
     this._tokenExpiration = expiresAt;
     return {
         accessToken: results.body.access_token,
         tokenExpirationTimestamp: expiresAt
     };
 };

 /**
  * Sets the following variables:
  * DsJwtAuth.accountId
  * DsJwtAuth.accountName
  * DsJwtAuth.basePath
  * DsJwtAuth.userName
  * DsJwtAuth.userEmail
  * @function _getAccount
  * @returns {promise}
  * @promise
  */
 DsJwtAuth.prototype.getUserInfo = async function _getUserInfo(){
     // Data used:
     // dsConfig.targetAccountId
     // dsConfig.dsOauthServer
     // DsJwtAuth.accessToken

     const dsApi = new docusign.ApiClient();
          const targetAccountId = dsConfig.targetAccountId;
          const baseUriSuffix = '/restapi';

     dsApi.setOAuthBasePath(dsConfig.dsOauthServer.replace('https://', '')); // it have to be domain name
     const results = await dsApi.getUserInfo(this.accessToken);

     let accountInfo;
     if (!targetAccountId) {
         // find the default account
         accountInfo = results.accounts.find(account =>
             account.isDefault === 'true');
     } else {
         // find the matching account
         accountInfo = results.accounts.find(account => account.accountId === targetAccountId);
     }
     if (typeof accountInfo === 'undefined') {
         throw new Error(`Target account ${targetAccountId} not found!`);
     }

     this.accountId = accountInfo.accountId;
     this.accountName = accountInfo.accountName;
     this.basePath = accountInfo.baseUri + baseUriSuffix;
     return {
         accountId: this.accountId,
         basePath: this.basePath,
         accountName: this.accountName
     };
 };


 /**
  * Clears the accessToken. Same as logging out
  * @function
  */
 DsJwtAuth.prototype.clearToken = function(){ // "logout" function
     this._tokenExpiration = false;
     this.accessToken = false;
 };

 /**
  * Store the example number in session storage so it will be
  * used after the user is authenticated
  * @function
  * @param req {object} The request object
  * @param eg {string} The example number that should be started after authentication
  */
 DsJwtAuth.prototype.setEg = function _setEg(req, eg) {
     req.session.eg = eg;
 };

 /**
  * Login user
  * @function
  */
 DsJwtAuth.prototype.login = function(req, res, next) {
     this.internalLogout(req, res);
     req.session.authMethod = 'jwt-auth';
     const log = async () => {
         const auth = await this.getToken();
         const user = await this.getUserInfo();
         req.session.accountId = user.accountId;
         req.session.accountName = user.accountName;
         req.session.basePath = user.basePath;
         return {
             ...auth,
             ...user
         };
     };
     log()
     .then(user => {
         req.login(user, (err) => {
             if (err) { return next(err); }
             if (req.session.eg) {
                 let eg = req.session.eg;
                 req.session.eg = null;
                 res.redirect(`/${eg}`);
             } else {
                 res.redirect('/');
             }
         });
     })
     .catch(e => {
         console.log(e);
         let body = e.response && e.response.body;
         let logoutCB = encodeURIComponent(e.response.locals.hostUrl + '/ds/callback');
         if (body) {
             // DocuSign API problem
             if (body.error && body.error === 'consent_required') {
                 // Consent problem
                 let consent_scopes = this.scopes + ' impersonation';
                     let consent_url = `${dsConfig.dsOauthServer}/oauth/auth?response_type=code&` +
                         `scope=${consent_scopes}&client_id=${dsConfig.dsClientId}&` +
                         `redirect_uri=${logoutCB}`;
                 res.redirect(consent_url);
             } else {
                 // Some other DocuSign API problem
                 this._debug_log(`\nAPI problem: Status code ${e.response.status}, message body:
                 ${JSON.stringify(body, null, 4)}\n\n`);
             }
         } else {
             // Not an API problem
             throw e;
         }
     });
 };

 /**
  * Clears the object's and session's user information including the tokens.
  * @function
  */
 DsJwtAuth.prototype.internalLogout = function _internalLogout(req, res) {
     this._tokenExpiration = null;
     req.session.accountId = null;
     req.session.accountName = null;
     req.session.basePath = null;
 };

 /**
  * Clears the user information including the tokens.
  * @function
  */
 DsJwtAuth.prototype.logoutCallback = function _logoutCallback(req, res) {
    req.logout(function(err) {
      if (err) {
        throw err;
      }
    }); // see http://www.passportjs.org/docs/logout/
    this.internalLogout(req, res);
      req.flash('info', 'You have logged out.');
      res.redirect('/');
 };

 /**
  * Clears the DocuSign authentication session token
  * https://account-d.docusign.com/oauth/logout
  * @function
  */
 DsJwtAuth.prototype.logout = function _logout(req, res) {
     this.logoutCallback(req, res);
 };

 /**
  * If in debug mode, prints message to the console
  * @function
  * @param {string} m The message to be printed
  * @private
  */
 DsJwtAuth.prototype._debug_log = function(m){
     if (!this._debug) { return; }
     console.log(this._debug_prefix + ': ' + m);
 };

 function UseDSAuth(app, hostUrl) {
     app.use(session({
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
     .use((req, res, next) => {
       res.locals.user = req.user;
       res.locals.session = req.session;
       res.locals.dsConfig = { ...dsConfig };
       res.locals.hostUrl = hostUrl; // Used by DSAuthCodeGrant#logout
       next();
     })// Send user info to views
     .use(flash())
     // Add an instance of DSAuthCodeGrant to req
     .use((req, res, next) => {
       req.dsAuthCodeGrant = new DsJwtAuth(req);
       req.dsAuth = req.dsAuthCodeGrant;
       if (req.session.authMethod === 'jwt-auth') {
         req.dsAuth = req.dsAuthJwt;
       }
       next();
     });
   }

   module.exports = { UseDSAuth }; // SET EXPORTS for the module.
