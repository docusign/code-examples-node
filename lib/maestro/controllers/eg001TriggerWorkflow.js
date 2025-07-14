/**
 * @file
 * Example 001: How to trigger a Maestro workflow
 * @author DocuSign
 */

const path = require('path');
const validator = require('validator');
const { formatString, API_TYPES } = require('../../utils.js');
const { getExampleByNumber } = require('../../manifestService');
const dsConfig = require('../../../config/index.js').config;
const { getMaestroWorkflows, triggerWorkflow } = require('../examples/triggerWorkflow');

const eg001TriggerWorkflow = exports;
const exampleNumber = 1;
const eg = `mae00${exampleNumber}`; // This example reference.
const api = API_TYPES.MAESTRO;
const mustAuthenticate = '/ds/mustAuthenticate';
const minimumBufferMin = 3;
const workflowName = 'Example workflow - send invite to signer';


/**
 * Trigger workflow
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
    accessToken: req.user.accessToken,
    basePath: dsConfig.maestroApiUrl,
    accountId: req.session.accountId,
  };

  const example = getExampleByNumber(res.locals.manifest, exampleNumber, api);
  try {
    const workflows = await getMaestroWorkflows(args);

    if (workflows.data && workflows.data.length > 0) {
        const workflow = workflows.data.find(wf => wf.status === 'active' && wf.name === workflowName);
        if (workflow) {
            const { instanceUrl, instanceId } = await triggerWorkflow(args, workflow.id);
            req.session.workflowId = workflow.id;
            req.session.instanceId = instanceId;

            return res.render('pages/maestro-examples/eg001EmbedWorkflow', {
                title: example.ExampleName,
                message: formatString(example.ResultsPageText, JSON.stringify(instanceId)),
                instanceUrl,
            });
        }
    }

    const errorCode = '404';
    const errorMessage = 'No active workflow found';
    const errorInfo = example.CustomErrorTexts[0].ErrorMessage;
    return res.render('pages/error', { errorCode, errorMessage, errorInfo });
  } catch (error) {
    const errorCode = error?.response?.statusCode;
    const errorMessage = error?.response?.body?.message;
    return res.render('pages/error', { err: error, errorCode, errorMessage });
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
