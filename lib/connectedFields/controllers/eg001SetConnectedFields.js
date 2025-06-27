/**
 * @file
 * Example 001: Set connected fields
 * @author DocuSign
 */

const path = require('path');
const { getTabGroups, sendEnvelope, filterData } = require('../examples/setConnectedFields');
const validator = require('validator');
const { getExampleByNumber } = require('../../manifestService');
const dsConfig = require('../../../config/index.js').config;
const { API_TYPES } = require('../../utils.js');

const eg001SetConnectedFields = exports;
const exampleNumber = 1;
const eg = `feg00${exampleNumber}`; // This example reference.
const api = API_TYPES.CONNECTED_FIELDS;
const mustAuthenticate = '/ds/mustAuthenticate';
const minimumBufferMin = 3;
const demoDocsPath = path.resolve(__dirname, '../../../demo_documents');
const pdfFile = 'World_Wide_Corp_lorem.pdf';

/**
 * Create the envelope, the embedded signing, and then redirect to the DocuSign signing
 * @param {object} req Request obj
 * @param {object} res Response obj
 */
eg001SetConnectedFields.createController = async (req, res) => {
  // Step 1. Check the token
  // At this point we should have a good token. But we
  // double-check here to enable a better UX to the user.
  const isTokenOK = req.dsAuth.checkToken(minimumBufferMin);
  if (!isTokenOK) {
    req.flash('info', 'Sorry, you need to re-authenticate.');
    // Save the current operation so it will be resumed after authentication
    req.dsAuth.setEg(req, eg);
    return res.redirect(mustAuthenticate);
  }

  // Step 2. Call the worker method
  const { body } = req;
  const selectedAppId = validator.escape(body.appId);
  const selectedApp = req.session.apps.find(app => app.appId === selectedAppId);
  const envelopeArgs = {
    signerEmail: validator.escape(body.signerEmail),
    signerName: validator.escape(body.signerName),
    docFile: path.resolve(demoDocsPath, pdfFile),
    appId: selectedAppId,
    app: selectedApp,
  };
  const args = {
    accessToken: req.user.accessToken,
    basePath: req.session.basePath,
    accountId: req.session.accountId,
    envelopeArgs: envelopeArgs,
  };

  let results = null;
  try {
    results = await sendEnvelope(args);
  } catch (error) {
    const errorBody = error && error.response && error.response.body;
    // we can pull the DocuSign error code and message from the response body
    const errorCode = errorBody && errorBody.errorCode;
    const errorMessage = errorBody && errorBody.message;
    // In production, may want to provide customized error messages and
    // remediation advice to the user.
    res.render('pages/error', { err: error, errorCode, errorMessage });
  }
  if (results) {
    req.session.envelopeId = results.envelopeId; // Save for use by other examples
    // which need an envelopeId
    const example = getExampleByNumber(res.locals.manifest, exampleNumber, api);
    res.render('pages/example_done', {
      title: example.ExampleName,
      message: formatString(example.ResultsPageText, results.envelopeId),
    });
  }
};

 /**
  * Form page for this application
  */
 eg001SetConnectedFields.getController = async (req, res) => {
  // Check that the authentication token is ok with a long buffer time.
  // If needed, now is the best time to ask the user to authenticate
  // since they have not yet entered any information into the form.
  const isTokenOK = req.dsAuth.checkToken();
  if (!isTokenOK) {
    // Save the current operation so it will be resumed after authentication
    req.dsAuth.setEg(req, eg);
    return res.redirect(mustAuthenticate);
  }

  const args = {
    accessToken: req.user.accessToken,
    basePath: dsConfig.iamBasePath,
    accountId: req.session.accountId,
  };
  let tabGroups = await getTabGroups(args);
  tabGroups = filterData(tabGroups);

  const example = getExampleByNumber(res.locals.manifest, exampleNumber, api);
  if (tabGroups.length === 0) {
    const additionalPageData = example.AdditionalPage.filter(p => p.Name === 'no_verification_app')[0];

    return res.render('pages/example_done', {
      title: example.ExampleName,
      message: additionalPageData?.ResultsPageText,
    });
  }
  req.session.apps = tabGroups;

  const sourceFile =
    path.basename(__filename)[5].toLowerCase() +
    path.basename(__filename).substr(6);
  res.render('pages/connected-fields/eg001SetConnectedFields', {
    eg: eg,
    csrfToken: req.csrfToken(),
    example: example,
    sourceFile: sourceFile,
    sourceUrl: dsConfig.githubExampleUrl + 'connectedFields/examples/' + sourceFile,
    documentation: dsConfig.documentation + eg,
    showDoc: dsConfig.documentation,
    apps: tabGroups,
  });

};
