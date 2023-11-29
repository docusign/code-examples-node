/**
 * @file
 * Example 001: Validate webhook message using HMAC
 * @author DocuSign
 */

const path = require('path');
const validator = require('validator');
const { formatString, API_TYPES } = require('../../utils.js');
const { getExampleByNumber } = require('../../manifestService');
const dsConfig = require('../../../config/index.js').config;
const { computeHash } = require('../examples/validateWebhookMessage');

const eg001ValidateWebhookMessage = exports;
const exampleNumber = 1;
const eg = `cneg00${exampleNumber}`; // This example reference.
const api = API_TYPES.CONNECT;
const mustAuthenticate = '/ds/mustAuthenticateJWT';

/**
 * Create the envelope
 * @param {object} req Request obj
 * @param {object} res Response obj
 */
eg001ValidateWebhookMessage.createController = async (req, res) => {
  // Call the worker method
  const { body } = req;
  const args = {
    secret: validator.escape(body.secret),
    payload: body.payload,
  };
  let results = null;

  try {
    results = computeHash(args);
  } catch (error) {
    const errorCode = error?.code;
    const errorMessage = error?.message;
    // In production, may want to provide customized error messages and
    // remediation advice to the user.
    res.render('pages/error', { err: error, errorCode, errorMessage });
  }
  if (results) {
    const example = getExampleByNumber(res.locals.manifest, exampleNumber, api);
    res.render('pages/example_done', {
      title: example.ExampleName,
      message: formatString(example.ResultsPageText, results),
    });
  }
};

/**
 * Form page for this application
 */
eg001ValidateWebhookMessage.getController = (req, res) => {
  const example = getExampleByNumber(res.locals.manifest, exampleNumber, api);
  const sourceFile =
    path.basename(__filename)[5].toLowerCase() +
    path.basename(__filename).substr(6);
  res.render('pages/connect-examples/eg001ValidateWebhookMessage', {
    eg: eg,
    csrfToken: req.csrfToken(),
    example: example,
    sourceFile: sourceFile,
    sourceUrl: dsConfig.githubExampleUrl + 'connect/examples/' + sourceFile,
    documentation: dsConfig.documentation + eg,
    showDoc: dsConfig.documentation,
  });
};
