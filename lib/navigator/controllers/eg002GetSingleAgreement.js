/**
 * @file
 * Example 002: Get single agreement
 * @author DocuSign
 */

const path = require('path');
const { listAgreements, getAgreement } = require('../examples/getSingleAgreement');
const validator = require('validator');
const { getExampleByNumber } = require('../../manifestService');
const dsConfig = require('../../../config/index.js').config;
const { API_TYPES } = require('../../utils.js');

const eg002GetSingleAgreement = exports;
const exampleNumber = 2;
const eg = `nav00${exampleNumber}`; // This example reference.
const api = API_TYPES.NAVIGATOR;
const mustAuthenticate = '/ds/mustAuthenticate';
const minimumBufferMin = 3;

/**
 * Get a single agreement
 * @param {object} req Request obj
 * @param {object} res Response obj
 */
eg002GetSingleAgreement.createController = async (req, res) => {
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
  const args = {
    accessToken: req.user.accessToken,
    basePath: dsConfig.iamBasePath,
    accountId: req.session.accountId,
    agreementId: validator.escape(body.agreementId),
  };

  let results = null;
  try {
    results = await getAgreement(args);
  } catch (error) {
    const errorBody = error?.body || error?.response?.body;
    // we can pull the DocuSign error code and message from the response body
    const errorCode = errorBody?.errorCode;
    const errorMessage = errorBody?.message;
    // In production, may want to provide customized error messages and
    // remediation advice to the user.
    res.render('pages/error', { err: error, errorCode, errorMessage });
  }
  if (results) {
    const example = getExampleByNumber(res.locals.manifest, exampleNumber, api);
    res.render('pages/example_done', {
      title: example.ExampleName,
      message: example.ResultsPageText,
      json: JSON.stringify(results).replace(/'/g, ''),
    });
  }
};

/**
  * Form page for this application
  */
eg002GetSingleAgreement.getController = async (req, res) => {
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

  let agreements = null;
  try {
    agreements = await listAgreements(args);
  } catch (error) {
    const errorBody = error?.body || error?.response?.body;
    // we can pull the DocuSign error code and message from the response body
    const errorCode = errorBody?.errorCode;
    const errorMessage = errorBody?.message;
    // In production, may want to provide customized error messages and
    // remediation advice to the user.
    return res.render('pages/error', { err: error, errorCode, errorMessage });
  }

  const example = getExampleByNumber(res.locals.manifest, exampleNumber, api);
  const sourceFile =
    path.basename(__filename)[5].toLowerCase() +
    path.basename(__filename).substr(6);
  res.render('pages/navigator-examples/eg002GetSingleAgreement', {
    eg: eg,
    csrfToken: req.csrfToken(),
    example: example,
    sourceFile: sourceFile,
    sourceUrl: dsConfig.githubExampleUrl + 'navigator/examples/' + sourceFile,
    documentation: dsConfig.documentation + eg,
    showDoc: dsConfig.documentation,
    agreements: agreements,
  });
};
