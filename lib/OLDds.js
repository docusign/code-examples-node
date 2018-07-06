// ds.js
//
// These methods support OAuth authorization with DocuSign
// and support sending envelopes. They do not maintain any state
//
//

const fs = require('fs')
    , path = require('path')
    , moment = require('moment')
    , docusign = require('docusign-esign')
    , passport = require('passport')
    , DB = require('better-sqlite3')
    , ds_config = require('../ds_configuration.js').config
    ;

const ds = exports;

const debug = ds_config.debug  // should debug statements be printed?
    , debug_prefix = 'ds'
    , demo_doc_path = 'demo_documents'
    , doc_2_docx = 'World_Wide_Corp_Battle_Plan_Trafalgar.docx'
    , doc_3_pdf  = 'World_Wide_Corp_lorem.pdf'
    ;

// public variables
ds.Error_send_envelope_1 = "Error_send_envelope_1";
ds.Error_account_not_found = "Could not find account information for the user";

/**
 * OAuth support
 *
 */

// This function is specific to the use authentication used.
// This example version works with GitHub authentication.
ds.get_user_id = (req) =>  _.get(req, 'user.id', false)
    // "id" field name is specific to GitHub authorization!

// Login to DocuSign via OAuth Authorization Code Grant
ds.login = (req, res) => {
  passport.authorize('docusign',
    {failureFlash: true, production: ds_config.production})(req, res);
}

// OAuth Authorization Code Grant callback methods
ds.oauth_callback = [login_callback_1, login_callback_2]
function login_callback_1(req, res, next){
  passport.authorize('docusign', { failureRedirect: '/ds/login' })(req, res, next)
}
function login_callback_2(req, res, next){
  // Successful authorization. Save in session and db;
  // redirect to DocuSign settings page.

  // req.account holds the result of DocuSign OAuth::userInfo and tokens.
  ds.ds_auth_info_save(req, req.account);
  req.flash('info', 'You have logged in to DocuSign');
  res.redirect('/settings/docusign');
  next();
};

// Logout from DocuSign:
// Delete entry from User database and remove ds_data from session
ds.logout = (req, res, next) => {
  if ('ds_data' in req.session){
    ds.user_db_delete(null, req.session.ds_data.user_id);
    delete req.session.ds_data;
  }
  req.flash('info', 'You have logged out from DocuSign');
  res.redirect('/settings/docusign');
  next();
}

ds.delete_session_data = (req, res, next) => {
  if ('ds_data' in req.session){
    delete req.session.ds_data;
  }
  req.flash('info', 'You have deleted DocuSign session data');
  res.redirect('/settings/docusign');
  next();
}

// delete_user_data -- this is a test method.
// It deletes the users database.
ds.delete_user_data = (req, res, next) => {
  try {
    fs.unlinkSync(ds_config.dbms_file)
  }
  catch (err) {
    if (err.code !== 'ENOENT') {
      throw err;
    }
  }
  req.flash('info', 'You have deleted the DocuSign refresh token db');
  res.redirect('/settings/docusign');
  next();
}

/**
 * Determine account_id, account_name, base_uri
 * from default or specific account_id
 * Save ds_data in session
 * Save refresh token in db
 * @param req request object from express
 * @param ds_data object with DS info on user and current account, etc
 * @param account_id Optional. If set, the account_id that should be used
 * @param user_db Obtional. If set, the SQLite db handle
 */
ds.ds_auth_info_save = (req, ds_data, account_id, user_db) => {
  // Add the user id
  ds_data.user_id = ds.get_user_id(req);
  if (account_id) {
    ds_data = ds.use_specific_account_settings(ds_data, account_id);
  } else {
    ds_data = ds.use_default_account_settings(ds_data);
  }
  ds_data.token_expiration = moment().add(ds_data.expires_in, 's');
  let refresh_token = ds_data.refresh_token;
  delete ds_data.refresh_token; // no need for it to be in the session data.

  // At this point, some InfoSec departments may want to have the access_token
  // encrypted at rest...
  // We will skip that for this example.
  req.session.ds_data = ds_data; // store in the session
  // Store refresh token and default account in permanent storage
  ds.user_db_put(user_db, ds_data.user_id, refresh_token, ds_data.account_id);
}

// Add/reset fields account_id, account_name, base_uri to the object's default
ds.use_default_account_settings = (ds_data) => {
  let default_account = _.find(ds_data.accounts, (o) => o.is_default);
  ds_data.account_id   = default_account.account_id;
  ds_data.account_name = default_account.account_name;
  ds_data.base_uri     = default_account.base_uri;
  return ds_data;
}

// Add/reset fields account_id, account_name, base_uri to specific
// account. If the account is not found, use default
ds.use_specific_account_settings = (ds_data, account_id) => {
  let account_info =
    _.find(ds_data.accounts, (o) => o.account_id === account_id);
  if (account_info) {
    ds_data.account_id   = account_info.account_id;
    ds_data.account_name = account_info.account_name;
    ds_data.base_uri     = account_info.base_uri;
  } else {
    debug_log (`ds.use_specific_account_settings: Could not find account ${account_id}`);
    ds_data = ds.use_default_account_settings(ds_data);
  }
  return ds_data;
}

/**
 * Database methods
 *
 */

// Stores the refresh token and current account_id in permanent storage
// since the data can be used across server restarts
// SQLite library docs: https://github.com/JoshuaWise/better-sqlite3/wiki/API
// Some InfoSec departments may want the refresh_token encrypted
ds.user_db_put = (db, user_id, refresh_token, account_id) => {
  if(!db) {db = ds.open_db()}
  // Save/update the user's data
  let sql = `REPLACE INTO users (user_id, refresh_token, account_id)
             VALUES (?, ?, ?);`
    , r = db.prepare(sql).run(user_id, refresh_token, account_id);
}

ds.user_db_get = (db, user_id) => {
  if(!db) {db = ds.open_db()}
  // Get the user's data
  let sql = `SELECT user_id, refresh_token, account_id FROM users
             WHERE user_id = ?;`
    , r = db.prepare(sql).get(user_id);
  if (!r){
    // No result, return false values
    r = {user_id: false, refresh_token: false, account_id: false};
  }
  return r;
}

// Delete user's row from the database
ds.user_db_delete = (db, user_id) => {
  if(!db) {db = ds.open_db()}
  // delete the user's data
  let sql = `DELETE FROM users WHERE user_id = ?;`
    , r = db.prepare(sql).run(user_id);
}

// Open or create db connection
// Returns a db object
// If the db doesn't exist then it will be created
ds.open_db = () => {
  let db;

  try {
    db = new DB(ds_config.dbms_file, {fileMustExist: true})
  }
  catch (err) {
    if (err.code !== "SQLITE_CANTOPEN") {throw err}
  }
  if(!db) {
    // Need to create the database with its schema
    db = new DB(ds_config.dbms_file);
    let r = db.prepare(db_users_schema).run();
  }
  return db;
}


/**
* Controllers
*
*/
ds.index_controller = (req, res) => {
  res.render('pages/index', {title: "Home"});
}
ds.ds_settings_controller = (req, res) => {
  // res.ds_access_token = req.session.ds_data && req.session.ds_data.access_token;
  // let {refresh_token: res.ds_refresh_token} =
  //   ds.user_db_get(null, ds.get_user_id(req););
  //
  // res.render('pages/ds_settings', {title: "DocuSign Settings"});
}
ds.settings_other_controller = (req, res) => {
  res.render('pages/settings_other', {title: "Other Settings"});
}
ds.envelope_1_form_controller = (req, res) => {
  res.render('pages/envelope_1_form', {title: "Envelope 1"});
}
ds.must_authenticate_controller = (req, res) => {
  res.render('pages/ds_must_authenticate', {title: "Authenticate with DocuSign"});
}
ds.ds_settings_clear_all_sessions_controller = (req, res) => {
  req.memory_store.clear();
  // See line 235 of https://github.com/roccomuso/memorystore/blob/master/lib/memorystore.js
  req.flash('info', 'All sessions were reset');
  res.render('pages/index', {title: "home"});

}

/**
 * Creates and sends envelope_1
 * @param args parameters for the envelope:
 * - signer_email, signer_name, cc_email, cc_name,
 * @returns  a promise
 */
ds.send_envelope_1 = async (args) => {
    let env = create_envelope_1(args);
    await ds_js.check_token();
    let envelopesApi = new docusign.EnvelopesApi(ds_js.get_ds_api())
      , create_envelope_p = ds_js.make_promise(envelopesApi, 'createEnvelope')
      , results = await create_envelope_p(
          ds_js.get_account_id(), {envelopeDefinition: env});
    return results
}

function create_envelope_1(args) {
  // document 1 (html) has tag **signature_1**
  // document 2 (docx) has tag /sn1/
  // document 3 (pdf) has tag /sn1/
  //
  // The envelope has two recipients.
  // recipient 1 - signer
  // recipient 2 - cc
  // The envelope will be sent first to the signer.
  // After it is signed, a copy is sent to the cc person.

  let doc_2_docx_bytes, doc_3_pdf_bytes;
  // read files from a local directory
  // The reads could raise an exception if the file is not available!
  doc_2_docx_bytes =
    fs.readFileSync(path.resolve(ds_js.app_dir, demo_doc_path, doc_2_docx));
  doc_3_pdf_bytes =
    fs.readFileSync(path.resolve(ds_js.app_dir, demo_doc_path, doc_3_pdf));

  // create the envelope definition
  let env = new docusign.EnvelopeDefinition();
  env.emailSubject = 'Please sign this document sent from Node SDK';

  // add the documents
  let doc_1 = new docusign.Document()
    , doc_2 = new docusign.Document()
    , doc_3 = new docusign.Document()
    , doc_1_b64 = Buffer.from(envelope_1_document_1(args)).toString('base64')
    , doc_2_b64 = Buffer.from(doc_2_docx_bytes).toString('base64')
    , doc_3_b64 = Buffer.from(doc_3_pdf_bytes).toString('base64')
    ;

  doc_1.documentBase64 = doc_1_b64;
  doc_1.name = 'Order acknowledgement'; // can be different from actual file name
  doc_1.fileExtension = 'html'; // Source data format. Signed docs are always pdf.
  doc_1.documentId = '1'; // a label used to reference the doc
  doc_2.documentBase64 = doc_2_b64;
  doc_2.name = 'Battle Plan'; // can be different from actual file name
  doc_2.fileExtension = 'docx';
  doc_2.documentId = '2';
  doc_3.documentBase64 = doc_3_b64;
  doc_3.name = 'Lorem Ipsum'; // can be different from actual file name
  doc_3.fileExtension = 'pdf';
  doc_3.documentId = '3';

  // The order in the docs array determines the order in the envelope
  env.documents = [doc_1, doc_2, doc_3];

  // create a signer recipient to sign the document, identified by name and email
  // We're setting the parameters via the object creation
  let signer_1 = docusign.Signer.constructFromObject({email: args.signer_email,
    name: args.signer_name, recipientId: '1', routingOrder: '1'});
  // routingOrder (lower means earlier) determines the order of deliveries
  // to the recipients. Parallel routing order is supported by using the
  // same integer as the order for two or more recipients.

  // create a cc recipient to receive a copy of the documents, identified by name and email
  // We're setting the parameters via setters
  let cc_1 = new docusign.CarbonCopy();
  cc_1.email = args.cc_email;
  cc_1.name = args.cc_name;
  cc_1.routingOrder = '2';
  cc_1.recipientId = '2';

  // Create signHere fields (also known as tabs) on the documents,
  // We're using anchor (autoPlace) positioning
  //
  // The DocuSign platform seaches throughout your envelope's
  // documents for matching anchor strings. So the
  // sign_here_2 tab will be used in both document 2 and 3 since they
  // use the same anchor string for their "signer 1" tabs.
  let sign_here_1 = docusign.SignHere.constructFromObject({
        anchorString: '**signature_1**',
        anchorYOffset: '10', anchorUnits: 'pixels',
        anchorXOffset: '20'})
    , sign_here_2 = docusign.SignHere.constructFromObject({
        anchorString: '/sn1/',
        anchorYOffset: '10', anchorUnits: 'pixels',
        anchorXOffset: '20'})
    ;

  // Tabs are set per recipient / signer
  let signer_1_tabs = docusign.Tabs.constructFromObject({
    signHereTabs: [sign_here_1, sign_here_2]});
  signer_1.tabs = signer_1_tabs;

  // Add the recipients to the envelope object
  let recipients = docusign.Recipients.constructFromObject({
    signers: [signer_1],
    carbonCopies: [cc_1]});
  env.recipients = recipients;

  // Request that the envelope be sent by setting |status| to "sent".
  // To request that the envelope be created as a draft, set to "created"
  env.status = 'sent';

  return env;
}

function envelope_1_document_1(args) {
  return `
  <!DOCTYPE html>
  <html>
      <head>
        <meta charset="UTF-8">
      </head>
      <body style="font-family:sans-serif;margin-left:2em;">
      <h1 style="font-family: &quot;Trebuchet MS&quot;, Helvetica, sans-serif;
          color: darkblue;margin-bottom: 0;">World Wide Corp</h1>
      <h2 style="font-family: &quot;Trebuchet MS&quot;, Helvetica, sans-serif;
        margin-top: 0px;margin-bottom: 3.5em;font-size: 1em;
        color: darkblue;">Order Processing Division</h2>
      <h4>Ordered by ${args.signer_name}</h4>
      <p style="margin-top:0em; margin-bottom:0em;">Email: ${args.signer_email}</p>
      <p style="margin-top:0em; margin-bottom:0em;">Copy to: ${args.cc_name}, ${args.cc_email}</p>
      <p style="margin-top:3em;">
Candy bonbon pastry jujubes lollipop wafer biscuit biscuit. Topping brownie sesame snaps sweet roll pie. Croissant danish biscuit soufflé caramels jujubes jelly. Dragée danish caramels lemon drops dragée. Gummi bears cupcake biscuit tiramisu sugar plum pastry. Dragée gummies applicake pudding liquorice. Donut jujubes oat cake jelly-o. Dessert bear claw chocolate cake gummies lollipop sugar plum ice cream gummies cheesecake.
      </p>
      <!-- Note the anchor tag for the signature field is in white. -->
      <h3 style="margin-top:3em;">Agreed: <span style="color:white;">**signature_1**/</span></h3>
      </body>
  </html>
`
}

/**
 * If debug is true, prints debug msg to console
 */
function debug_log (m){
  if (!debug) {return}
  console.log(debug_prefix + ': ' + m)
}

function debug_log_obj (m, obj){
  if (!debug) {return}
  console.log(debug_prefix + ': ' + m + "\n" + JSON.stringify(obj, null, 4))
}
