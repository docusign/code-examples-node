/**
 * @file
 * Example 003: How to get the status of a Maestro workflow instance
 * @author DocuSign
 */

const path = require('path');
const { formatString, API_TYPES } = require('../../utils.js');
const { getExampleByNumber } = require('../../manifestService');
const dsConfig = require('../../../config/index.js').config;
const { getWorkflowInstance } = require('../examples/getWorkflowStatus');

const eg002CancelWorkflow = exports;
const exampleNumber = 3;
const eg = `mseg00${exampleNumber}`; // This example reference.
const api = API_TYPES.MAESTRO;
const mustAuthenticate = '/ds/mustAuthenticate';
const minimumBufferMin = 3;


/**
 * Get workflow instance status
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
    workflowId: req.session.workflowId,
    instanceId: req.session.instanceId,
    accessToken: req.user.accessToken,
    basePath: dsConfig.maestroApiUrl,
    accountId: req.session.accountId,
  };
  let results = null;

  try {
    results = await getWorkflowInstance(args);
  } catch (error) {
    const errorCode = error?.response?.statusCode;
    const errorMessage = error?.response?.body?.message;
    let errorInfo;

    // use custom error message if Maestro is not enabled for the account
    if (errorCode === 403) {
      errorInfo = formatString(res.locals.manifest.SupportingTexts.ContactSupportToEnableFeature, 'Maestro');
    }

    return res.render('pages/error', { err: error, errorCode, errorMessage, errorInfo });
  }
  if (results) {
    // which need an envelopeId
    const example = getExampleByNumber(res.locals.manifest, exampleNumber, api);
    res.render('pages/example_done', {
      title: example.ExampleName,
      message: formatString(example.ResultsPageText, JSON.stringify(results.instanceState)),
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
  res.render('pages/maestro-examples/eg003GetWorkflowStatus', {
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
