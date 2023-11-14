/**
 * @file
 * Example 012: How to clone an account
 * @author DocuSign
 */

const path = require('path');
const validator = require('validator');
const dsConfig = require('../../../config/index.js').config;
const { cloneAccount, getAccounts } = require('../examples/cloneAccount');
const { getOrganizationId } = require('../getOrganizationId.js');
const { getExampleByNumber } = require('../../manifestService');
const { API_TYPES } = require('../../utils.js');

const eg012CloneAccount = exports;
const exampleNumber = 12;
const eg = `aeg0${exampleNumber}`; // This example reference.
const api = API_TYPES.ADMIN;
const mustAuthenticate = '/ds/mustAuthenticate';
const minimumBufferMin = 3;

/**
 * Clone an account
 * @param {object} req Request obj
 * @param {object} res Response obj
 */
eg012CloneAccount.createController = async (req, res) => {
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

  const { body } = req;
  const args = {
      accessToken: req.user.accessToken,
      basePath: dsConfig.adminAPIUrl,
      organizationId: req.session.organizationId,
      sourceAccountId: validator.escape(body.sourceAccountId),
      targetAccountName: validator.escape(body.targetAccountName),
      targetAccountFirstName: validator.escape(body.targetAccountFirstName),
      targetAccountLastName: validator.escape(body.targetAccountLastName),
      targetAccountEmail: validator.escape(body.targetAccountEmail),
    };

  let results = null;

  try {
    results = await cloneAccount(args);
  } catch (error) {
    // we can pull the DocuSign error code and message from the response body
    const errorBody = error?.response?.body;
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
     json: JSON.stringify(results)
   });
  }
};

/**
 * Form page for this application
 */
eg012CloneAccount.getController = async (req, res) => {
  // Check that the authentication token is ok with a long buffer time.
  // If needed, now is the best time to ask the user to authenticate
  // since they have not yet entered any information into the form.

  const isTokenOK = req.dsAuth.checkToken();
  if (!isTokenOK) {
    // Save the current operation so it will be resumed after authentication
    req.dsAuth.setEg(req, eg);
    return res.redirect(mustAuthenticate);
  }

  try {
    await getOrganizationId(req);
    const args = {
      accessToken: req.user.accessToken,
      basePath: dsConfig.adminAPIUrl,
      organizationId: req.session.organizationId
    };

    const accounts = await getAccounts(args);

    const example = getExampleByNumber(res.locals.manifest, exampleNumber, api);
    const sourceFile = (path.basename(__filename))[5].toLowerCase() + (path.basename(__filename)).substr(6);
    res.render('pages/admin-examples/eg012CloneAccount', {
      eg: eg,
      csrfToken: req.csrfToken(),
      example: example,
      sourceFile: sourceFile,
      sourceUrl: dsConfig.githubExampleUrl + 'admin/examples/' + sourceFile,
      documentation: dsConfig.documentation + eg,
      showDoc: dsConfig.documentation,
      accounts: accounts.assetGroupAccounts,
    });
  } catch (error) {
    const errorCode = error?.response?.body?.errorCode;
    const errorMessage = error?.response?.body?.message;

    // In production, may want to provide customized error messages and
    // remediation advice to the user.
    res.render('pages/error', { err: error, errorCode, errorMessage });
  }
};
