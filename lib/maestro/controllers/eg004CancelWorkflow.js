/**
 * @file
 * Example 004: How to cancel a Maestro workflow
 * @author DocuSign
 */

const path = require('path');
const { formatString, API_TYPES } = require('../../utils.js');
const { getExampleByNumber } = require('../../manifestService');
const dsConfig = require('../../../config/index.js').config;
const { cancelWorkflow } = require('../examples/cancelWorkflow');

const eg004CancelWorkflow = exports;
const exampleNumber = 4;
const eg = `mae00${exampleNumber}`; // This example reference.
const api = API_TYPES.MAESTRO;
const mustAuthenticate = '/ds/mustAuthenticate';
const minimumBufferMin = 3;

/**
 * Trigger workflow
 * @param {object} req Request obj
 * @param {object} res Response obj
 */
eg004CancelWorkflow.createController = async (req, res) => {
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

  const example = getExampleByNumber(res.locals.manifest, exampleNumber, api);
  try {
    const result = await cancelWorkflow(args);

    res.render('pages/example_done', {
      title: example.ExampleName,
      message: formatString(example.ResultsPageText, req.session.instanceId),
      json: JSON.stringify(result)
    });
  } catch (error) {
    const errorCode = error?.response?.statusCode;
    const errorMessage = error?.response?.body?.message;
    const errorInfo = formatString(example.CustomErrorTexts[1].ErrorMessage, req.session.workflowId);

    return res.render('pages/error', { err: error, errorCode, errorMessage, errorInfo });
  }
};

/**
 * Form page for this application
 */
eg004CancelWorkflow.getController = async (req, res) => {
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
  if (!req.session.workflowId) {
    const errorCode = '404';
    const errorMessage = 'No workflow ID found';
    const errorInfo = example.CustomErrorTexts[0].ErrorMessage;
    return res.render('pages/error', { errorCode, errorMessage, errorInfo });
  }

  const sourceFile =
    path.basename(__filename)[5].toLowerCase() +
    path.basename(__filename).substr(6);

  res.render('pages/maestro-examples/eg004CancelWorkflow', {
    eg: eg,
    csrfToken: req.csrfToken(),
    example: example,
    sourceFile: sourceFile,
    sourceUrl: dsConfig.githubExampleUrl + 'maestro/examples/' + sourceFile,
    documentation: dsConfig.documentation + eg,
    showDoc: dsConfig.documentation,
  });
};
