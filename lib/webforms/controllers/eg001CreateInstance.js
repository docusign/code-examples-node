/**
 * @file
 * Example 001: Create and embed an instance of a Web Form
 * @author DocuSign
 */

const path = require('path');
const { API_TYPES, replaceTemplateId } = require('../../utils.js');
const { getExampleByNumber } = require('../../manifestService');
const dsConfig = require('../../../config/index.js').config;
const { createWebFormInstance, createWebFormTemplate, listWebForms } = require('../examples/createInstance');

const eg001CreateInstance = exports;
const exampleNumber = 1;
const eg = `weg00${exampleNumber}`; // This example reference.
const api = API_TYPES.WEBFORMS;
const mustAuthenticate = '/ds/mustAuthenticate';
const minimumBufferMin = 3;
const demoDocsPath = path.resolve(__dirname, '../../../demo_documents');
const docFile = 'World_Wide_Corp_Web_Form.pdf';
const webFormConfigFile = 'web-form-config.json';

/**
 * Create the web form template
 * @param {object} req Request obj
 * @param {object} res Response obj
 */
eg001CreateInstance.createWebFormTemplate = async (req, res) => {
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
    accessToken: req.user.accessToken,
    basePath: req.session.basePath,
    accountId: req.session.accountId,
    templateName: 'Web Form Example Template',
    docFile: path.resolve(demoDocsPath, docFile),
  };
  let webFormTemplateId = null;

  try {
    webFormTemplateId = await createWebFormTemplate(args);
    replaceTemplateId(path.resolve(demoDocsPath, webFormConfigFile), webFormTemplateId);
  } catch (error) {
    const errorBody = error && error.response && error.response.body;
    // we can pull the DocuSign error code and message from the response body
    const errorCode = errorBody && errorBody.errorCode;
    const errorMessage = errorBody && errorBody.message;
    // In production, may want to provide customized error messages and
    // remediation advice to the user.
    return res.render('pages/error', { err: error, errorCode, errorMessage });
  }
  if (webFormTemplateId) {
    req.session.webFormTemplateId = webFormTemplateId;
    return res.redirect(`/${eg}webForm`);
  }
};

/**
 * Create the web form instance
 * @param {object} req Request obj
 * @param {object} res Response obj
 */
eg001CreateInstance.createWebFormInstance = async (req, res) => {
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
    accessToken: req.user.accessToken,
    basePath: dsConfig.webformsApiUrl,
    accountId: req.session.accountId,
    clientUserId: '1234-5678-abcd-ijkl',
    formName: 'Web Form Example Template',
  };
  let results = null;

  try {
    const forms = await listWebForms(args);
    results = await createWebFormInstance(forms.items[0].id, args);
  } catch (error) {
    const errorBody = error && error.response && error.response.body;
    // we can pull the DocuSign error code and message from the response body
    const errorCode = errorBody && errorBody.errorCode;
    const errorMessage = errorBody && errorBody.message;
    // In production, may want to provide customized error messages and
    // remediation advice to the user.
    return res.render('pages/error', { err: error, errorCode, errorMessage });
  }
  if (results) {
    const example = getExampleByNumber(res.locals.manifest, exampleNumber, api);

    return res.render('pages/webforms-examples/eg001WebFormEmbed', {
      example: example,
      instanceToken: results.instanceToken,
      integrationKey: dsConfig.dsClientId,
      formUrl: results.formUrl,
    });
  }
};

/**
 * Form page for this application
 */
eg001CreateInstance.getController = (req, res) => {
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
  return res.render('pages/webforms-examples/eg001CreateInstance', {
    eg: eg,
    csrfToken: req.csrfToken(),
    example: example,
    sourceFile: sourceFile,
    sourceUrl: dsConfig.githubExampleUrl + 'webforms/examples/' + sourceFile,
    documentation: dsConfig.documentation + eg,
    showDoc: dsConfig.documentation,
  });
};

/**
 * Form page for this application
 */
eg001CreateInstance.getWebFormCreateController = (req, res) => {
  // Check that the authentication token is ok with a long buffer time.
  // If needed, now is the best time to ask the user to authenticate
  // since they have not yet entered any information into the form.
  const isTokenOK = req.dsAuth.checkToken();
  if (!isTokenOK) {
    // Save the current operation so it will be resumed after authentication
    req.dsAuth.setEg(req, eg);
    return res.redirect(mustAuthenticate);
  }

  if (!req.session.webFormTemplateId) {
    return res.redirect(`/${eg}`);
  }

  const example = getExampleByNumber(res.locals.manifest, exampleNumber, api);
  const additionalPageData = example.AdditionalPage.find(p => p.Name === 'create_web_form');
  return res.render('pages/webforms-examples/eg001WebFormCreate', {
    eg: eg,
    csrfToken: req.csrfToken(),
    title: example.ExampleName,
    description: additionalPageData.ResultsPageText,
    example: example,
  });
};
