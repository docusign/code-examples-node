/**
 * @file
 * Example 001: Trigger a workflow
 * @author DocuSign
 */

const path = require('path');
const validator = require('validator');
const { formatString, API_TYPES } = require('../../utils.js');
const { getExampleByNumber } = require('../../manifestService');
const dsConfig = require('../../../config/index.js').config;
const { getWorkflowDefinition, triggerWorkflow } = require('../examples/triggerWorkflow');
const { createWorkflow, publishWorkflow } = require('../workflowUtils.js');

const eg001TriggerWorkflow = exports;
const exampleNumber = 1;
const eg = `mseg00${exampleNumber}`; // This example reference.
const api = API_TYPES.MAESTRO;
const mustAuthenticate = '/ds/mustAuthenticate';
const minimumBufferMin = 3;


/**
 * Create the envelope
 * @param {object} req Request obj
 * @param {object} res Response obj
 */
eg001TriggerWorkflow.createController = async (req, res) => {
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
    instanceName: validator.escape(body.instanceName),
    signerEmail: validator.escape(body.signerEmail),
    signerName: validator.escape(body.signerName),
    ccEmail: validator.escape(body.ccEmail),
    ccName: validator.escape(body.ccName),
    workflowId: req.session.workflowId,
    accessToken: req.user.accessToken,
    basePath: dsConfig.maestroApiIrl,
    accountId: req.session.accountId,
  };
  let results = null;

  try {
    const workflow = await getWorkflowDefinition(args);
    results = await triggerWorkflow(workflow, args);
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
      message: formatString(example.ResultsPageText, JSON.stringify(results.envelopeId)),
    });
  }
};

/**
 * Form page for this application
 */
eg001TriggerWorkflow.getController = async (req, res) => {
  // Check that the authentication token is ok with a long buffer time.
  // If needed, now is the best time to ask the user to authenticate
  // since they have not yet entered any information into the form.
  const isTokenOK = req.dsAuth.checkToken();
  if (!isTokenOK) {
    // Save the current operation so it will be resumed after authentication
    req.dsAuth.setEg(req, eg);
    return res.redirect(mustAuthenticate);
  }

  req.session.templateId = 'ae232f1f-911f-4115-8fff-6bcf47fa959a';
  // req.session.workflowId = '0d4d954c-24d1-49d9-bc7f-4467041141c4';
  const args = {
    templateId: req.session.templateId,
    accessToken: req.user.accessToken,
    basePath: dsConfig.maestroApiIrl,
    accountId: req.session.accountId,
  };
  let workflowId; // = '0d4d954c-24d1-49d9-bc7f-4467041141c4';

  // req.session.workflowId = 'c71e27eb-9ca7-4e88-8663-9bd2e76e77c7';


  // if there is no workflow, then create one
  if (!req.session.workflowId) {
    if (!req.session.templateId) {
      return res.redirect('/eg008');
    }

    req.session.workflowId = await createWorkflow(args);
  }

  if (!req.session.workflowPublished) {
    const consentUrl = await publishWorkflow(args, req.session.workflowId);
    if (consentUrl) {
      const redirectUrl = `${consentUrl}&host=${dsConfig.appUrl}/${eg}`;
      return res.redirect(redirectUrl);
    }

    req.session.workflowPublished = true;
  }

  const example = getExampleByNumber(res.locals.manifest, exampleNumber, api);
  const sourceFile =
    path.basename(__filename)[5].toLowerCase() +
    path.basename(__filename).substr(6);
  res.render('pages/maestro-examples/eg001TriggerWorkflow', {
    eg: eg,
    csrfToken: req.csrfToken(),
    example: example,
    sourceFile: sourceFile,
    sourceUrl: dsConfig.githubExampleUrl + 'maestro/examples/' + sourceFile,
    documentation: dsConfig.documentation + eg,
    showDoc: dsConfig.documentation,
  });
};


