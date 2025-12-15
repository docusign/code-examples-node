/**
 * @file
 * Example 003: Send an Workspace Envelope with Recipient Info
 * @author DocuSign
 */

const path = require('path');
const { createEnvelope, sendEnvelope } = require('../../workspaces/examples/sendEnvelopeWithRecipientInfo');
const validator = require('validator');
const { getExampleByNumber } = require('../../manifestService');
const dsConfig = require('../../../config/index').config;
const { API_TYPES } = require('../../utils');

const eg003SendEnvelopeWithRecipientInfo = exports;
const exampleNumber = 3;
const eg = `work00${exampleNumber}`; // This example reference.
const api = API_TYPES.WORKSPACES;
const mustAuthenticate = '/ds/mustAuthenticate';
const minimumBufferMin = 3;
/**
 * Send an Workspace Envelope with Recipient Info
 * @param {object} req Request obj
 * @param {object} res Response obj
 */
eg003SendEnvelopeWithRecipientInfo.createController = async (req, res) => {
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
    workspaceId: req.session.workspaceId,
    documentId: req.session.documentId,
    signerEmail: validator.escape(body.signerEmail),
    signerName: validator.escape(body.signerName),
  };
  let results = null;

  try {
    const workspaceEnvelope = await createEnvelope(args);
    results = await sendEnvelope({ ...args, envelopeId: workspaceEnvelope.envelopeId });
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
      message: formatString(example.ResultsPageText, results.envelopeId),
    });
  }
};

/**
 * Form page for this application
 */
eg003SendEnvelopeWithRecipientInfo.getController = async (req, res) => {
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
  res.render('pages/workspaces-examples/eg003SendEnvelopeWithRecipientInfo', {
    eg: eg,
    csrfToken: req.csrfToken(),
    workspaceIdOk: !!req.session.workspaceId,
    documentIdOk: !!req.session.documentId,
    example: example,
    sourceFile: sourceFile,
    sourceUrl: dsConfig.githubExampleUrl + 'workspaces/examples/' + sourceFile,
    documentation: dsConfig.documentation + eg,
    showDoc: dsConfig.documentation
  });
};
