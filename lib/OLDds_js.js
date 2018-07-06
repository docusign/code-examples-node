// ds_js.js
//
// This module provides helper methods for using the DocuSign JS SDK
//
//

let   fs = require('fs')
    , moment = require('moment')
    , {promisify} = require('util') // http://2ality.com/2017/05/util-promisify.html
    , _ = require('lodash')
    ;
const ds_js = exports;

// private globals
let   debug_prefix = 'ds_js'
    , user = {} // object with user data from the UserInfo method
    , check_token = null // function that provides a token
    , account_id = null // current account
    , account_name = null // current account's name
    , base_uri = null // eg https://na2.docusign.net
    , ds_api = null; // the docusign sdk instance
    ;

const base_uri_suffix = '/restapi';

// public variables
ds_js.debug = false;
ds_js.ds_config = null;  // configuration info. Set via ds_js.set_ds_config
ds_js.app_dir = null; // root dir for the app. Set via ds_js.set_ds_config

ds_js.Error_set_account = "Error_set_account";
ds_js.Error_account_not_found = "Could not find account information for the user";


// functions
ds_js.set_check_token_function = (func) => {check_token = func}
ds_js.check_token = () => check_token();

ds_js.set_debug = (debug_arg) => {ds_js.debug = debug_arg};
ds_js.set_ds_api = (ds_api_arg) => {ds_api = ds_api_arg};
ds_js.get_ds_api = () => ds_api;
ds_js.set_ds_config = (config, app_dir_arg) => {
  ds_js.ds_config = config;
  ds_js.app_dir = app_dir_arg;
};
ds_js.get_account_id   = () => account_id;
ds_js.get_account_name = () => account_name;
ds_js.get_base_uri     = () => base_uri;
ds_js.get_user         = () => user;

// test support
ds_js.test = {};
ds_js.test.clear_account_user = () => {
  user = {};
  account_id = null; // current account
  account_name = null; // current account's name
  base_uri = null; // eg https://na2.docusign.net
}

/**
 * Creates a new method, {method_name}_promise, that is a
 * promisfied version of the method.
 * The new method is attached to the parent object
 * @param obj An object that has method method_name
 * @param method_name The string version of the existing method
 * @returns  the promise method.
 */
ds_js.make_promise = function _make_promise(obj, method_name){
  let promise_name = method_name + '_promise';
  if (!(promise_name in obj)) {
    obj[promise_name] = promisify(obj[method_name]).bind(obj)
  }
  return obj[promise_name]
}

/**
 * Configures and checks the account_id that will be used
 * SIDE-EFFECTS:
 * - A bearer token will be obtained / refreshed;
 * - The user's information will be looked up.
 * @param target_account_id the desired account. If false, then the
 *        user's default account will be used.
 *        If the account is not false and is not available,
 *        an error will be thrown.
 * @returns  a promise with value of the account that will be used.
 */
ds_js.set_account = (target_account_id) => {
  return (
    ds_js.check_token()
    .then((token_result) => call_userInfo(token_result))
    .then((userInfo_result) => set_account_internal(
      {userInfo_result: userInfo_result, target_account_id: target_account_id}))
  )
}

/**
 * Calls OAuth::userInfo to look up account info
 * SIDE-EFFECTS:
 * - Sets the ds_js.user object
 * - Sets the ds_js account and base_uri info
 * - Sets the SDK's base url
 * @param target_account_id the desired account. If false, then the
 *        user's default account will be used.
 *        If the account is not false and is not available,
 *        an error will be thrown.
 * @returns  a promise
 */

function set_account_internal(args){
  const {userInfo_result, target_account_id} = args;

  user = userInfo_result; // save for client's use

  let account_info;
  if (target_account_id === false) {
    // find the default account
    account_info = _.find(user.accounts, 'is_default');
  } else {
    // find the matching account
    account_info = _.find(user.accounts, ['account_id', target_account_id]);
  }
  if (typeof account_info === 'undefined') {
    let err = new Error(ds_js.Error_account_not_found);
    err.name = ds_js.Error_set_account;
    throw err;
  }

  ({account_id, account_name, base_uri} = account_info);

  // Set the base_uri for the SDK
  let base_path = `${base_uri}${base_uri_suffix}`;
  ds_api.setBasePath(base_path);

  //debug_log_obj("user_info:", userInfo_result);
  //debug_log_obj("target_account_id:", target_account_id);
  debug_log(`Using account ${account_id}: ${account_name}`);
  return Promise.resolve({account_id, account_name, base_uri})
}

/**
 * If debug is true, prints debug msg to console
 */
function debug_log (m){
  if (!ds_js.debug) {return}
  console.log(debug_prefix + ': ' + m)
}

function debug_log_obj (m, obj){
  if (!ds_js.debug) {return}
  console.log(debug_prefix + ': ' + m + "\n" + JSON.stringify(obj, null, 4))
}
