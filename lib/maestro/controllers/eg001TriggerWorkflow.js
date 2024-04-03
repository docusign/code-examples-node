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
const { getWorkflowDefinitions, getWorkflowDefinition, triggerWorkflow } = require('../examples/triggerWorkflow');
const { createWorkflow, publishWorkflow } = require('../workflowUtils.js');

const eg001TriggerWorkflow = exports;
const exampleNumber = 1;
const eg = `mseg00${exampleNumber}`; // This example reference.
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
    workflowId: req.session.workflowId,
    accessToken: req.user.accessToken,
    basePath: dsConfig.maestroApiUrl,
    accountId: req.session.accountId,
  };
  let results = null;

  try {
    const workflow = await getWorkflowDefinition(args);
    results = await triggerWorkflow(workflow, args);
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
    req.session.instanceId = results.instanceId; // Save for use by other examples
    // which need an envelopeId
    const example = getExampleByNumber(res.locals.manifest, exampleNumber, api);
    res.render('pages/example_done', {
      title: example.ExampleName,
      message: formatString(example.ResultsPageText, JSON.stringify(results.envelopeId)),
      json: JSON.stringify(results),
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

  const example = getExampleByNumber(res.locals.manifest, exampleNumber, api);
  const additionalPageData = example.AdditionalPage.filter(p => p.Name === 'publish_workflow')[0];
  const sourceFile =
    path.basename(__filename)[5].toLowerCase() +
    path.basename(__filename).substr(6);

  const args = {
    templateId: req.session.templateId,
    accessToken: req.user.accessToken,
    basePath: dsConfig.maestroApiUrl,
    accountId: req.session.accountId,
  };

  try {
    const workflows = await getWorkflowDefinitions(args);

    if (workflows.count > 0) {
      const workflow = workflows.value
        .filter(workflow => workflow.name === workflowName)
        .sort((wf1, wf2) => wf2.lastUpdatedDate - wf1.lastUpdatedDate)[0];
      if (workflow) {
        req.session.workflowId = workflow.id;
      }
    }

    // if there is no workflow, then create one
    if (!req.session.workflowId) {
      if (!req.session.templateId) {
        return res.render('pages/maestro-examples/eg001TriggerWorkflow', {
          eg: eg,
          csrfToken: req.csrfToken(),
          example: example,
          templateOk: false,
          sourceFile: sourceFile,
          sourceUrl: dsConfig.githubExampleUrl + 'maestro/examples/' + sourceFile,
          documentation: dsConfig.documentation + eg,
          showDoc: dsConfig.documentation,
        });
      }

      req.session.workflowId = await createWorkflow(args);

      const consentUrl = await publishWorkflow(args, req.session.workflowId);
      if (consentUrl) {
        return res.render('pages/maestro-examples/eg001PublishWorkflow', {
          example,
          consentUrl,
          message: additionalPageData.ResultsPageText,
          csrfToken: req.csrfToken(),
        });
      }
    }
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

  res.render('pages/maestro-examples/eg001TriggerWorkflow', {
    eg: eg,
    csrfToken: req.csrfToken(),
    example: example,
    sourceFile: sourceFile,
    templateOk: true,
    sourceUrl: dsConfig.githubExampleUrl + 'maestro/examples/' + sourceFile,
    documentation: dsConfig.documentation + eg,
    showDoc: dsConfig.documentation,
  });
};

/**
 * Publish workflow page
 */
eg001TriggerWorkflow.publishController = async (req, res) => {
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
  const additionalPageData = example.AdditionalPage.filter(p => p.Name === 'publish_workflow')[0];

  try {
    const args = {
      accessToken: req.user.accessToken,
      basePath: dsConfig.maestroApiUrl,
      accountId: req.session.accountId,
    };
    const consentUrl = await publishWorkflow(args, req.session.workflowId);
    if (consentUrl) {
      return res.render('pages/maestro-examples/eg001PublishWorkflow', {
        example,
        consentUrl,
        message: additionalPageData.ResultsPageText,
        csrfToken: req.csrfToken(),
      });
    }
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

  const sourceFile =
    path.basename(__filename)[5].toLowerCase() +
    path.basename(__filename).substr(6);
  res.render('pages/maestro-examples/eg001TriggerWorkflow', {
    eg: eg,
    csrfToken: req.csrfToken(),
    example: example,
    sourceFile: sourceFile,
    templateOk: true,
    sourceUrl: dsConfig.githubExampleUrl + 'maestro/examples/' + sourceFile,
    documentation: dsConfig.documentation + eg,
    showDoc: dsConfig.documentation,
  });
};
