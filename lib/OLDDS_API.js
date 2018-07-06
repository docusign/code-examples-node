// DS_API.js
//
// This object-oriented module provides access to the DocuSign API.
// It is instantiated as Middleware for Express.
// It adds an object to the req object:
// * ds_api -- this object, used to provide helper functions for calling the API
//
// This object has state data for the current express web call that wants to
// use the DocuSign API
//
// JS Prototype-based class: see https://javascript.info/class-patterns#prototype-based-classes

'use strict';

const moment = require('moment')
    , path = require('path')
    , {promisify} = require('util') // http://2ality.com/2017/05/util-promisify.html
    , rp = require('request-promise')
    , docusign = require('docusign-esign')
    , ds_config = require('../ds_configuration.js').config
    , ds = require('./ds.js')
    , base_uri_suffix = '/restapi'
    ;

let DS_API = function _DS_API(req) {
  // private globals
  this._debug_prefix = 'DS_API';
  this._token_replace_min = 10; // The token must expire at least this number of
                                // minutes later or it will be replaced
  this._user_id = null;         // Current logged in user
  this._ds_api_client = null; // the docusign sdk instance
  this._debug = ds_config.debug;
  this._users_db = null;

  // Initialization
  req.ds_api = this;
} // end of DS_API Initialize function

// Public constants
DS_API.prototype.Error_set_account = "Error_set_account";
DS_API.prototype.Error_account_not_found = "Could not find account information for the user";
DS_API.prototype.Error_invalid_grant = 'invalid_grant'; // message when bad client_id is provided

// public middleware functions

// get_token
// This async method is called as middleware.
// First check access token.
// If no token then need to save the current call
// data and redirect the user to authenticate with DocuSign.
DS_API.prototype.get_token = async function(req, res, next){
  this._user_id = ds.get_user_id(req);
  this._debug_log('#get_token: Start');

  let ds_data = _.get(req, 'session.ds_data', false);
  // Data consistency check: does the user_id for the DS data match the current user?
  if (ds_data && ds_data.user_id !== this._user_id) {
    // Problem! Why doesn't the ds_data's user id match the current user??
    // Solution: delete ds_data
    this._debug_log('#get_token: user_id from session and ds_data do NOT match!!');
    delete req.session.ds_data;
    ds_data = false;
  }

  // determine what is next...
  let access_token     = _.get(ds_data, 'access_token', false)
    , token_expiration = _.get(ds_data, 'token_expiration', false)
    , base_uri         = _.get(ds_data, 'base_uri', false)
    , now              = moment()
    , have_valid_token = access_token && token_expiration && base_uri &&
        now.add(this._token_replace_min, 'm').isBefore(token_expiration)
    ;

  if (have_valid_token) {
    // Create instance of DocuSign API, set base_uri, and access_token
    let base_path = `${base_uri}${base_uri_suffix}`;
    this._ds_api_client = new docusign.ApiClient();
    this._ds_api_client.setBasePath(base_path);
    this._ds_api_client.addDefaultHeader('Authorization', 'Bearer ' + access_token);
    this._debug_log('#get_token: Current token is good.');
    next();
    return
  }

  // Use refresh_token if we have one
  this._users_db = ds.open_db();
  let {refresh_token, account_id} = ds.user_db_get(this._users_db, this._user_id);
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment

  let token_result = false;
  if (refresh_token) {
    this._debug_log('#get_token: Trying to refresh the tokens...');
    let expires_in;
    token_result = await this.do_token_refresh(refresh_token);
    this._debug_log_obj('#get_token: Refresh result:', token_result);
    if (token_result) {
      // Success! We refreshed the token.
      // Overwrite access_token, refresh_token, ds_data with
      // the refreshed info.
      expires_in = token_result.expires_in;
      access_token = token_result.access_token;
      refresh_token = token_result.refresh_token;
      // Check that new expiration time is far enough in the future.
      if (expires_in < (this._token_replace_min * 60)){
        // Uh oh! We have new tokens but they are about to expire!
        token_result = false; // We don't have a (good) result
        this._debug_log('#get_token: Refreshed tokens are short lived; ignoring.');
      }
    }
    if (token_result) {
      // Get the UserInfo
      ds_data = await this.call_userInfo(access_token);
      if (ds_data){
        this._debug_log('#get_token: Received userInfo.');
        ds_data.expires_in = expires_in;
        ds_data.access_token = access_token;
        ds_data.refresh_token = refresh_token;
        ds.ds_auth_info_save(req, ds_data, account_id, this.users_db);
        let base_path = `${ds_data.base_uri}${base_uri_suffix}`;
        this._ds_api_client = new docusign.ApiClient();
        this._ds_api_client.setBasePath(base_path);
        this._ds_api_client.addDefaultHeader('Authorization', 'Bearer ' + access_token);
        this._debug_log('#get_token: Completely refreshed tokens!');
        next();
        return
      }
    } else {
      // Failure! The refresh token didn't work.
      // Clear it from the users db
      ds.user_db_delete = (this._users_db, this._user_id);
    }
  }

  // At this point, we don't have a token and refresh didn't work
  // (or we don't have a refresh token)
  // So we will save the current request in the session and
  // do an internal redirect to a "Please authenticate with DocuSign" page
  this._freeze_request(req);
  // Internal redirect: see https://expressjs.com/en/api.html#req.originalUrl
  // and https://stackoverflow.com/a/22081112/64904
  this._debug_log('#get_token: redirecting to authenticate');
  res.redirect('/ds/must_authenticate');
}

/**
 * Freeze the request by storing it in the session.frozen_req object
 */
DS_API.prototype._freeze_request = function(req){
  // If the interrupted request was a GET, then we'll
  // resume it.
  // If the interrupted request was a POST/PUT/PATCH/DELETE,
  // we could save the incoming parameters and resume the
  // operation. However, for this example, we will cancel
  // the request, request authentication, and then
  // redirect to the matching GET page.
  // Eg. GET send_envelope =>> POST send_envelope and
  // if no token is available for the POST then, after
  // the user authenticates, redirect to the GET page.
  //
  // It should be rare to not have an access token for the
  // POST page since we ensure that we have a token with a
  // fairly long live at the start of the GET page. This
  // pattern minimzes the chances of needing to re-enter
  // a form's data.
  return;
}

/**
 * do_token_refresh attempts to refresh the tokens
 * See https://developers.docusign.com/esign-rest-api/guides/authentication/oauth2-code-grant#using-refresh-tokens
 */
DS_API.prototype.do_token_refresh = function(refresh_token){
  let url = `${ds_config.ds_authentication_url}/oauth/token`;
  return (rp.post(url, {
      auth: {user: ds_config.ds_client_id, pass: ds_config.ds_client_secret},
      form: {grant_type: 'refresh_token', refresh_token: refresh_token},
      json: true
    })
    .catch((err) => {
      console.log (`ERROR while refreshing tokens: ${err}`);
      return Promise.resolve(false)})
  )
}

/**
 * Calls OAuth::userInfo to look up user info
 * See https://developers.docusign.com/esign-rest-api/guides/authentication/user-info-endpoints
 *
 * Currently, the SDK does not include this method. It will the future.
 * @returns a promise with result from the userInfo API method
 */
DS_API.prototype.call_userInfo = function(access_token){
  let url = `${ds_config.ds_authentication_url}/oauth/userinfo`;
  return (rp.get(url, {
      auth: {bearer: access_token},
      json: true
    })
    .catch((err) => {
      console.log (`ERROR while calling OAuth::userInfo: ${err}`);
      return Promise.resolve(false)})
  )
}

/**
 * resume_call looks in the session to see if a prior request
 * was interrupted to have the user authenticate.
 * If so, the call is redirected to the interrupted call.
 */
DS_API.prototype.resume_call = function(req, res, next){
  next();
}










// // public functions
// DS_API.prototype.clear_token = function(){ // "logout" function
//   this._token_expiration = false;
//   this._token = false;
// };
//
// // Can't use arrow functions since we need access to this
// DS_API.prototype.set_debug = function(debug){this._debug = debug};
// DS_API.prototype.get_debug = function(){return this._debug};
// DS_API.prototype.get_ds_api = function(){return this._ds_api};
//
// DS_API.prototype.get_account_id   = function(){return this._account_id};
// DS_API.prototype.get_account_name = function(){return this._account_name};
// DS_API.prototype.get_base_uri     = function(){return this._base_uri};
// DS_API.prototype.get_user         = function(){return this._user};
// DS_API.prototype.get_ds_config    = function(){return this._ds_config};
// DS_API.prototype.get_app_dir      = function(){return this._app_dir};
//
// /**
//  * @func set_account
//  * Configures to use a specific account_id, account_name, and base_uri
//  * @param account_id the account_id in guid format
//  * @param account_name the account_name
//  * @param base_uri the base_uri for the account
//  */
// DS_API.prototype.set_account =
//   function _set_account(account_id, account_name, base_uri){
//   this._account_id = account_id;
//   this._account_name = account_name;
//   this._base_uri = base_uri;
//
//   // Set the base_uri for the SDK
//   let base_path = `${base_uri}${base_uri_suffix}`;
//   this._ds_api.setBasePath(base_path);
//
//   this._debug_log(`Using account ${this._account_id}: ${this._account_name}`);
// }
//
// /**
//  * @func find_account
//  * Finds an account_id that will be used
//  * SIDE-EFFECTS:
//  * - A bearer token will be checked and obtained / refreshed if needbe;
//  * - The user's account information will be looked up via an userInfo API call.
//  * @param target_account_id the desired account. If false, then the
//  *        user's default account will be used.
//  *        If the account is not false and is not available,
//  *        an error will be thrown.
//  * @returns  a promise with result: an object {account_id, account_name, base_uri}
//  *           with the account information.
//  */
// DS_API.prototype.find_account = function _find_account(target_account_id){
//   //this._debug_log_obj("target_account_id:", target_account_id);
//   return (
//     this.check_token()
//     .then((token_result) => this.call_userInfo(token_result))
//     .then((userInfo_result) => this._find_account_internal(
//       {userInfo_result: userInfo_result, target_account_id: target_account_id}))
//   )
// }
//
// /**
//  * @func _find_account_internal
//  * Calls OAuth::userInfo to look up account info
//  * SIDE-EFFECTS:
//  * - Sets the ds_js.user object
//  * - Sets the ds_js account and base_uri info
//  * - Sets the SDK's base url
//  * @param target_account_id the desired account. If false, then the
//  *        user's default account will be used.
//  *        If the account is not false and is not available,
//  *        an error will be thrown.
//  * @returns  a promise
//  */
//
// DS_API.prototype._find_account_internal = function(args){
//   const {userInfo_result, target_account_id} = args;
//
//   //this._debug_log_obj("user_info:", userInfo_result);
//   this._user = userInfo_result; // save for client's use
//
//   let account_info;
//   if (target_account_id === false) {
//     // find the default account
//     account_info = _.find(this._user.accounts, 'is_default');
//   } else {
//     // find the matching account
//     account_info = _.find(this._user.accounts, ['account_id', target_account_id]);
//   }
//   if (typeof account_info === 'undefined') {
//     let err = new Error(this.Error_account_not_found);
//     err.name = this.Error_set_account;
//     throw err;
//   }
//
//   let {account_id, account_name, base_uri} = account_info;
//   this.set_account(account_id, account_name, base_uri)
//   return Promise.resolve({
//     account_id: this._account_id,
//     account_name: this._account_name,
//     base_uri: this._base_uri})
// }
//
// /**
//  * Calls OAuth::userInfo to look up user info
//  * See https://developers.docusign.com/esign-rest-api/guides/authentication/user-info-endpoints
//  *
//  * Currently, the SDK does not include this method. It will the future.
//  * @returns a promise with result from the userInfo API method
//  */
// DS_API.prototype.call_userInfo = function(token_result){
//   let url = `${this._ds_config.authentication_url}/oauth/userinfo`;
//   return (rp.get(url, {
//       auth: {bearer: token_result.token},
//       json: true
//     })
//   )
// }
//
// /**
//  * Creates a new method, {method_name}_promise, that is a
//  * promisfied version of the method.
//  * The new method is attached to the parent object
//  * @param obj An object that has method method_name
//  * @param method_name The string version of the existing method
//  * @returns  the promise method.
//  */
// DS_API.prototype.make_promise = function _make_promise(obj, method_name){
//   let promise_name = method_name + '_promise';
//   if (!(promise_name in obj)) {
//     obj[promise_name] = promisify(obj[method_name]).bind(obj)
//   }
//   return obj[promise_name]
// }
//
// /**
//  * A bearer token will be obtained / refreshed as needed.
//  * SIDE EFFECT: Sets the bearer token that the SDK will use
//  * @returns  a promise with result:
//  *  {token_received, need_token, token, token_expiration}
//  */
// DS_API.prototype.check_token = function _check_token() {
//   let no_token = !this._token || !this._token_expiration
//     , now = moment()
//     , need_token = no_token || this._token_expiration.add(
//         this._token_replace_min, 'm').isBefore(now)
//     , result =
//         {token_received: null, need_token: null,
//         token: this._token, token_expiration: this._token_expiration}
//     ;
//   if (this._debug) {
//     if (no_token) {this._debug_log('check_token: Starting up--need a token')}
//     if (need_token && !no_token) {this._debug_log('check_token: Replacing old token')}
//     if (!need_token) {this._debug_log('check_token: Using current token')}
//   }
//
//   if (!need_token) {
//     result.need_token = false;
//     // Ensure that the token is in the *current* DocuSign API object
//     this._ds_api.addDefaultHeader('Authorization', 'Bearer ' + this._token);
//     return Promise.resolve(result)
//   }
//
//   // We need a new token. We will use the DocuSign SDK's function.
//   const private_key_file = path.resolve(this._app_dir, this._ds_config.private_key_file);
//
//   return (
//     this.make_promise(this._ds_api, 'configureJWTAuthorizationFlow')(
//       private_key_file, this._ds_config.aud, this._ds_config.client_id,
//       this._ds_config.impersonated_user_guid, this._jwt_life_sec)
//     .catch (e => {
//       e.name = this.Error_JWT_get_token;
//         // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/name
//       // if we can pull out an error from the response body, then do so:
//       let err = _.get(e, 'response.body.error', false);
//       if (err) {e.message = err}
//       throw e;
//     })
//     .then (result => {
//       //this._debug_log_obj('JWT result: ', result);
//       // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment
//       let expires_in;
//       ({access_token: this._token, expires_in} = result.body);
//       this._token_expiration = moment().add(expires_in, 's');
//       this._debug_log(`check_token: Token received! Expiration: ${this._token_expiration.format()}`);
//       return Promise.resolve({token_received: true, need_token: true,
//         token: this._token, token_expiration: this._token_expiration})
//     })
//   )
// }
//
// // for testing:
// DS_API.prototype.test_set_jwt_life_sec =
//   function(jwt_life_sec_arg){this._jwt_life_sec = jwt_life_sec_arg};
// DS_API.prototype.test_get_token = function(){return this._token};
// DS_API.prototype.test_get_token_expiration = function(){return this._token_expiration};
// DS_API.prototype.test_clear_account_user = function(){
//   this._user = {};
//   this._account_id = null; // current account
//   this._account_name = null; // current account's name
//   this._base_uri = null; // eg https://na2.docusign.net
// }

/**
 * If debug is true, prints debug msg to console
 */
DS_API.prototype._debug_log = function(m){
  if (!this._debug) {return}
  console.log(this._debug_prefix + ': ' + m)
}

DS_API.prototype._debug_log_obj = function (m, obj){
  if (!this._debug) {return}
  console.log(this._debug_prefix + ': ' + m + "\n" + JSON.stringify(obj, null, 4))
}


module.exports = DS_API;  // SET EXPORTS for the module.
