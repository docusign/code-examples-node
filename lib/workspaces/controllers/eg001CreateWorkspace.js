/**
 * @file
 * Example 001: Create a workspace
 * @author DocuSign
 */

const path = require('path');
const { createWorkspace } = require('../../workspaces/examples/createWorkspace');
const validator = require('validator');
const { getExampleByNumber } = require('../../manifestService');
const dsConfig = require('../../../config/index').config;
const { API_TYPES, formatString } = require('../../utils');

const eg001CreateWorkspace = exports;
const exampleNumber = 1;
const eg = `work00${exampleNumber}`; // This example reference.
const api = API_TYPES.WORKSPACES;
const mustAuthenticate = '/ds/mustAuthenticate';
const minimumBufferMin = 3;
/**
 * Create a workspace
 * @param {object} req Request obj
 * @param {object} res Response obj
 */
eg001CreateWorkspace.createController = async (req, res) => {
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
    basePath: req.session.basePath,
    accountId: req.session.accountId,
    workspaceName: validator.escape(body.workspaceName),
  };
  let results = null;

  try {
    results = await createWorkspace(args);
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
    req.session.workspaceId = results.workspaceId;
    req.session.workspaceCreatorId = results.createdByUserId;

    const example = getExampleByNumber(res.locals.manifest, exampleNumber, api);
    res.render('pages/example_done', {
      title: example.ExampleName,
      message: formatString(example.ResultsPageText, results.workspaceId),
      json: JSON.stringify(results),
    });
  }
};

/**
 * Form page for this application
 */
eg001CreateWorkspace.getController = async (req, res) => {
  // Check that the authentication token is ok with a long buffer time.
  // If needed, now is the best time to ask the user to authenticate
  // since they have not yet entered any information into the form.
  const isTokenOK = req.dsAuth.checkToken();
  if (!isTokenOK) {
    // Save the current operation so it will be resumed after authentication
    req.dsAuth.setEg(req, eg);
    return res.redirect(mustAuthenticate);
  }

  const example = getExampleByNumber(res.locals.manifest, exampleNumber, api);
  const sourceFile = (path.basename(__filename))[5].toLowerCase() + (path.basename(__filename)).substr(6);
  res.render('pages/workspaces-examples/eg001CreateWorkspace', {
    eg: eg,
    csrfToken: req.csrfToken(),
    example: example,
    sourceFile: sourceFile,
    sourceUrl: dsConfig.githubExampleUrl + 'workspaces/examples/' + sourceFile,
    documentation: dsConfig.documentation + eg,
    showDoc: dsConfig.documentation
  });
};