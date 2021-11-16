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
    , dsConfig = require('../config/index.js').config
    , passport = require('passport')
    , baseUriSuffix = '/restapi'
    , tokenReplaceMinGet = 60; // For a form Get, the token must expire at least this number of
      // minutes later or it will be replaced

    ;

/**
 * Manages OAuth Authentication Code Grant with DocuSign.
 * @constructor
 * @param {object} req - The request object.
 */
let DSAuthCodeGrant = function _DSAuthCodeGrant(req) {
  // private globals
  this._debug_prefix = 'DSAuthCodeGrant';
  this._accessToken = req.user && req.user.accessToken;   // The bearer token. Get it via #checkToken
  this._refreshToken = req.user && req.user.refreshToken;   // Note, the refresh token is not used in this example.
  // For production use, you'd want to store the refresh token in non-volatile storage since it is
  // good for 30 days. You'd probably want to encrypt it too.
  this._tokenExpiration = req.user && req.user.tokenExpirationTimestamp;  // when does the token expire?
  this._debug = true;  // ### DEBUG ### setting

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
    req.session.authMethod = 'grand-auth';
    passport.authenticate('docusign')(req, res, next);
}

DSAuthCodeGrant.prototype.oauth_callback1 = (req, res, next) => {
    // This callback URL is used for the login flow
    passport.authenticate('docusign', { failureRedirect: '/ds/login' })(req, res, next)
}
DSAuthCodeGrant.prototype.oauth_callback2 = function _oauth_callback2(req, res, next) {
    this._accessToken = req.user.accessToken;
    console.log(`Received access_token: |${req.user.accessToken}|`);
    console.log(`Expires at ${req.user.tokenExpirationTimestamp.format("dddd, MMMM Do YYYY, h:mm:ss a")}`);
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
      let eg = req.session.eg;
      req.session.eg = null;
      res.redirect(`/${eg}`);
    } else {res.redirect('/')}
}

/**
 * Clears the DocuSign authentication session token
 * https://account-d.docusign.com/oauth/logout
 * @function
 */
DSAuthCodeGrant.prototype.logout = function _logout (req, res) {
  let logoutCB = encodeURIComponent(res.locals.hostUrl + '/ds/logoutCallback')
    , oauthServer = dsConfig.dsOauthServer
    , client_id = dsConfig.dsClientId
    , logoutURL = `${oauthServer}/logout?client_id=${client_id}&redirect_uri=${logoutCB}&response_mode=logout_redirect`
    ;
  //console.log (`Redirecting to ${logoutURL}`);
  //res.redirect(logoutURL);

  // Currently, the OAuth logout API method has a bug: ID-3276
  // Until the bug is fixed, just do a logout from within this app:
  this.logoutCallback(req, res);
}

/**
 * Clears the user information including the tokens.
 * @function
 */
DSAuthCodeGrant.prototype.logoutCallback = function _logout (req, res) {
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
  this._tokenExpiration = null;
  req.session.accountId = null;
  req.session.accountName = null;
  req.session.basePath = null;
}

/**
 * Find the accountId, accountName, and baseUri that will be used.
 * The dsConfig.targetAccountId may be used to find a specific account (if the user has access to it).
 * Side effect: store in the session
 * @function
 * @param req the request object
 */
DSAuthCodeGrant.prototype.getDefaultAccountInfo = function _getDefaultAccountInfo(req) {
    const targetAccountId = dsConfig.targetAccountId
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
    req.session.accountId = account.account_id;
    req.session.accountName = account.account_name;
    req.session.basePath = account.base_uri + baseUriSuffix;
    console.log(`Using account ${account.account_id}: ${account.account_name}`);
}

/**
 * This is the key method for the object.
 * It should be called before any API call to DocuSign.
 * It checks that the existing access token can be used.
 * If the existing token is expired or doesn't exist, then
 * a new token will be obtained from DocuSign by telling the
 * user that they must authenticate themself.
 * @function
 * @param integer bufferMin How long must the access token be valid
 * @returns boolean tokenOK
 */
DSAuthCodeGrant.prototype.checkToken = function _checkToken(bufferMin = tokenReplaceMinGet) {
  let noToken = !this._accessToken || !this._tokenExpiration
    , now = moment()
    , needToken = noToken || moment(this._tokenExpiration).subtract(
        bufferMin, 'm').isBefore(now)
    ;
  if (this._debug) {
    if (noToken) {this._debug_log('checkToken: Starting up--need a token')}
    if (needToken && !noToken) {this._debug_log('checkToken: Replacing old token')}
    if (!needToken) {this._debug_log('checkToken: Using current token')}
  }

  return (!needToken)
}

/**
 * Store the example number in session storage so it will be
 * used after the user is authenticated
 * @function
 * @param object req The request object
 * @param string eg The example number that should be started after authentication
 */
DSAuthCodeGrant.prototype.setEg = function _setEg(req, eg) {
  req.session.eg = eg
}


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

