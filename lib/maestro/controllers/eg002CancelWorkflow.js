/**
 * @file
 * Example 002: How to cancel a Maestro workflow instance
 * @author DocuSign
 */

const path = require('path');
const { formatString, API_TYPES } = require('../../utils.js');
const { getExampleByNumber } = require('../../manifestService');
const dsConfig = require('../../../config/index.js').config;
const { cancelWorkflowInstance } = require('../examples/cancelWorkflow');

const eg002CancelWorkflow = exports;
const exampleNumber = 2;
const eg = `mseg00${exampleNumber}`; // This example reference.
const api = API_TYPES.MAESTRO;
const mustAuthenticate = '/ds/mustAuthenticate';
const minimumBufferMin = 3;


/**
 * Cancel workflow instance
 * @param {object} req Request obj
 * @param {object} res Response obj
 */
eg002CancelWorkflow.createController = async (req, res) => {
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
  const args = {
    instanceId: req.session.instanceId,
    accessToken: req.user.accessToken,
    basePath: dsConfig.maestroApiIrl,
    accountId: req.session.accountId,
  };
  let results = null;

  try {
    results = await cancelWorkflowInstance(args);
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
    // which need an envelopeId
    const example = getExampleByNumber(res.locals.manifest, exampleNumber, api);
    res.render('pages/example_done', {
      title: example.ExampleName,
      message: formatString(example.ResultsPageText, JSON.stringify(req.session.instanceId)),
      json: JSON.stringify(results),
    });
  }
};

/**
 * Form page for this application
 */
eg002CancelWorkflow.getController = async (req, res) => {
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
  const sourceFile =
    path.basename(__filename)[5].toLowerCase() +
    path.basename(__filename).substr(6);
  res.render('pages/maestro-examples/eg002CancelWorkflow', {
    eg: eg,
    csrfToken: req.csrfToken(),
    example: example,
    workflowId: req.session.workflowId,
    instanceId: req.session.instanceId,
    sourceFile: sourceFile,
    sourceUrl: dsConfig.githubExampleUrl + 'maestro/examples/' + sourceFile,
    documentation: dsConfig.documentation + eg,
    showDoc: dsConfig.documentation,
  });
};


