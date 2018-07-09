/** 
 * @file
 * This file implements the <tt>DSAuthCodeGrant</tt> class.
 * It handles the OAuth Authorization Code Grant flow.
 * It also looks up the user's default account and baseUrl
 * 
 * For the purposes of this example, it ignores the refresh
 * token that is returned from DocuSign. In production, 
 * depending on your use case, you can store and then use the
 * refresh token instead of requiring the user to re-authenticate.
 * @author DocuSign
*/

'use strict';

const moment = require('moment')
    , path = require('path')
    , docusign = require('docusign-esign')
    , ds_config = require('../ds_configuration.js').config
    , passport = require('passport')
    , {promisify} = require('util') // http://2ality.com/2017/05/util-promisify.html
    , baseUriSuffix = '/restapi'
    ;
/**
 * Manages OAuth Authentication Code Grant with DocuSign.
 * @constructor
 * @param {object} req - The request object.
 */
let DSAuthCodeGrant = function _DSAuthCodeGrant(req) {
  // private globals
  this._debug_prefix = 'DSAuthCodeGrant';
  this._tokenReplaceMin = 30; // The token must expire at least this number of
                               // minutes later or it will be replaced
  this._accessToken = req.user && req.user.accessToken;   // The bearer token. Get it via #checkToken
  this._refreshToken = req.user && req.user.refreshToken;   // Note, the refresh token is not used in this example.
  // For production use, you'd want to store the refresh token in non-volatile storage since it is 
  // good for 30 days. You'd probably want to encrypt it too.
  this._tokenExpiration = req.user && req.user.expires;  // when does the token expire?
  this._accountId = req.session && req.session.accountId; // current account
  this._accountName = req.session && req.session.accountName; // current account's name
  this._basePath = req.session && req.session.basePath; // current base path. eg https://na2.docusign.net/restapi
  this._dsApiClient = null; // the docusign sdk instance
  this._dsConfig = null;
  this._debug = true;  // ### DEBUG ### setting

  // INITIALIZE
  this._dsApiClient = new docusign.ApiClient();
  if (this._basePath) {
    this._dsApiClient.setBasePath(this._basePath);
  }
} // end of DSAuthCodeGrant constructor function

// Public constants
/**
 * Exception when setting an account
 * @constant
*/
DSAuthCodeGrant.prototype.Error_set_account = "Error_set_account";
/**
 * Exception: Could not find account information for the user
 * @constant
*/
DSAuthCodeGrant.prototype.Error_account_not_found = "Could not find account information for the user";
/**
 * Exception when getting a token, "invalid grant"
 * @constant
*/
DSAuthCodeGrant.prototype.Error_invalid_grant = 'invalid_grant'; // message when bad client_id is provided

// public functions
DSAuthCodeGrant.prototype.login = function (req, res, next) {
    // Reset
    this.internalLogout(req, res);
    passport.authenticate('docusign')(req, res, next);
}

DSAuthCodeGrant.prototype.oauth_callback1 = (req, res, next) => {
    passport.authenticate('docusign', { failureRedirect: '/ds/login' })(req, res, next)
}
DSAuthCodeGrant.prototype.oauth_callback2 = function _oauth_callback2(req, res, next) {
    console.log(`Received access_token: ${req.user.accessToken.substring(0,15)}...`);
    console.log(`Expires at ${req.user.expires.format("dddd, MMMM Do YYYY, h:mm:ss a")}`);
    req.flash('info', 'You have authenticated with DocuSign.');


    // The DocuSign Passport strategy looks up the user's account information via OAuth::userInfo.
    // See https://developers.docusign.com/esign-rest-api/guides/authentication/user-info-endpoints
    // The data includes the user's information and information on the accounts the user has access too.
    //
    // To make an API or SDK call, the accountId and base url are needed.
    //
    // A user can (and often) belongs to multiple accounts.
    // You can search for a specific account the user has, or
    // give the user the choice of account to use, or use
    // the user's default account. This example looks for a specific account or the default account.
    //
    // The baseUri changes rarely so it can (and should) be cached.
    //
    // req.user holds the result of the DocuSign OAuth call and the OAuth::userInfo method,
    // except for the expires element. 
    // req.user.accessToken: "eyJ0Xbz....vXXFw7IlVwfDRA"
    // req.user.accounts:  An array of accounts that the user has access to
    //     An example account:
    //      {account_id: "8118f2...8a", 
    //      is_default: false, 
    //      account_name: "Xylophone World", 
    //      base_uri: "https://demo.docusign.net"}  (Note: does not include '/restapi/v2')
    // created: "2015-05-20T11:48:23.363"  // when was the user's record created
    // email: "name@example.com" // the user's email
    // The expires element is added in function _processDsResult in file index.js. 
    // It is the datetime when the token will expire:
    // expires: Moment {_isAMomentObject: true, _isUTC: false, _pf: {…}, _locale: Locale, _d: Tue Jun 26 2018 04:05:37 GMT+0300 (IDT), …}
    // expiresIn: 28800  // when the token will expire, in seconds, from when the OAuth response is sent by DocuSign
    // family_name: "LastName" // the user's last name
    // given_name: "Larry" // the user's first name
    // name: "Larry LastName"
    // provider: "docusign"
    // refreshToken: "eyJ0eXAiOiJ...HB4Q" // Can be used to obtain a new set of access and response tokens. 
    // The lifetime for the refreshToken is typically 30 days
    // sub: "...5fed18870" // the user's id in guid format

    this.getDefaultAccountInfo(req);

    // If an example was requested, but authentication was needed (and done),
    // Then do the example's GET now.
    // Else redirect to home
    if (req.session.eg) {
      let qp = `eg=${req.session.eg}`;
      req.session.eg = null;
      res.redirect(`go&${qp}`)
    } else {res.redirect('/')}  
}

/**
 * Clears the user information including the tokens.
 * To clear the DocuSign authentication session token, call 
 * https://account-d.docusign.com/oauth/logout
 * @function
 */
DSAuthCodeGrant.prototype.logout = function _logout (req, res) {
    req.logout(); // see http://www.passportjs.org/docs/logout/
    this.internalLogout(req, res);
    req.flash('info', 'You have logged out.');
    res.redirect('/');
}

/**
 * Clears the object's and session's user information including the tokens.
 * @function
 */
DSAuthCodeGrant.prototype.internalLogout = function _internalLogout(req, res) {
  this._accessToken = null;
  this._refreshToken = null;
  this._tokenExpiration = null;
  this._accountId = null;
  this._accountName = null;
  this._basePath = null;
  req.session.accountId = null;
  req.session.accountName = null;
  req.session.basePath = null;
}

/**
 * Find the accountId, accountName, and baseUri that will be used.
 * The ds_config.targetAccountId may be used to find a specific account (if the user has access to it).
 * Side effect: store in the session
 * @function
 * @param req the request object
 */
DSAuthCodeGrant.prototype.getDefaultAccountInfo = function _getDefaultAccountInfo(req) {
    const targetAccountId = ds_config.targetAccountId
        , accounts = req.user.accounts
        ;
    
    let account = null; // the account we want to use
    // Find the account...
    if (targetAccountId) {
        account = accounts.find(a => a.account_id == targetAccountId);
        if (!account) {
            throw new Error(this.Error_account_not_found)
        }
    } else {
        account = accounts.find(a => a.is_default);        
    }

    // Save the account information
    this._accountId = account.account_id;
    this._accountName = account.account_name;
    this._basePath = account.base_uri + baseUriSuffix;

    req.session.accountId = this._accountId;
    req.session.accountName = this._accountName;
    req.session.basePath = this._basePath;

    this._dsApiClient.setBasePath(this._basePath);
    this._debug_log(`Using account ${this._accountId}: ${this._accountName}`);
}

/**
 * Returns a promise method, {method_name}_promise, that is a
 * promisfied version of the method parameter.
 * The promise method is created if it doesn't already exist.
 * It is cached via attachment to the parent object.
 * @function
 * @param obj An object that has method method_name
 * @param method_name The string name of the existing method
 * @returns {promise} a promise version of the <tt>method_name</tt>.
 */
DSAuthCodeGrant.prototype.make_promise = function _make_promise(obj, method_name){
  let promise_name = method_name + '_promise';
  if (!(promise_name in obj)) {
    obj[promise_name] = promisify(obj[method_name]).bind(obj)
  }
  return obj[promise_name]
}

/**
 * This is the key method for the object.
 * It should be called before any API call to DocuSign.
 * It checks that the existing access token can be used.
 * If the existing token is expired or doesn't exist, then
 * a new token will be obtained from DocuSign by telling the
 * user that they must authenticate themself.
 * @function
 * @returns boolean needToken
 */
DSAuthCodeGrant.prototype.checkToken = function _checkToken() {
  let noToken = !this._accessToken || !this._tokenExpiration
    , now = moment()
    , needToken = noToken || this._tokenExpiration.subtract(
        this._tokenReplaceMin, 'm').isBefore(now)
    ;
  if (this._debug) {
    if (noToken) {this._debug_log('checkToken: Starting up--need a token')}
    if (needToken && !noToken) {this._debug_log('checkToken: Replacing old token')}
    if (!needToken) {this._debug_log('checkToken: Using current token')}
  }

  return needToken
}

/**
 * Getter for the object's <tt>dsApiClient</tt>
 * @function
 * @returns {DSApiClient} dsApiClient
 */
DSAuthCodeGrant.prototype.getDSApi = function(){return this._dsApiClient};

/**
 * Getter for the <tt>accountId</tt>
 * @function
 * @returns {string} accountId
 */
DSAuthCodeGrant.prototype.getAccountId   = function(){return this._accountId};

/**
 * Getter for the <tt>accountName</tt>
 * @function
 * @returns {string} accountName
 */
DSAuthCodeGrant.prototype.getAccountName = function(){return this._accountName};

/**
 * Getter for the <tt>baseUri</tt>
 * @function
 * @returns {string} baseUri
*/
DSAuthCodeGrant.prototype.getBaseUrl     = function(){return this._baseUrl};

/**
 * If in debug mode, prints message to the console
 * @function
 * @param {string} m The message to be printed
 * @private
 */
DSAuthCodeGrant.prototype._debug_log = function(m){
  if (!this._debug) {return}
  console.log(this._debug_prefix + ': ' + m)
}

/**
 * If in debug mode, prints message and object to the console
 * @function
 * @param {string} m The message to be printed
 * @param {object} obj The object to be pretty-printed
 * @private
 */
DSAuthCodeGrant.prototype._debug_log_obj = function (m, obj){
  if (!this._debug) {return}
  console.log(this._debug_prefix + ': ' + m + "\n" + JSON.stringify(obj, null, 4))
}


module.exports = DSAuthCodeGrant;  // SET EXPORTS for the module.

