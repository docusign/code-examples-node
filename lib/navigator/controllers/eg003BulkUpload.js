/**
 * @file
 * Example 003: Bulk upload
 * @author DocuSign
 */

const path = require('path');
const { createBulkUploadJob, uploadDocuments, completeBulkUploadJob } = require('../examples/bulkUpload');
const { getExampleByNumber } = require('../../manifestService');
const dsConfig = require('../../../config/index.js').config;
const { API_TYPES } = require('../../utils.js');

const eg003BulkUpload = exports;
const exampleNumber = 3;
const eg = `nav00${exampleNumber}`; // This example reference.
const api = API_TYPES.NAVIGATOR;
const mustAuthenticate = '/ds/mustAuthenticate';
const minimumBufferMin = 3;
const demoDocsPath = path.resolve(__dirname, '../../../demo_documents');
const docFile = 'World_Wide_Corp_Battle_Plan_Trafalgar.docx';
const pdfFile = 'World_Wide_Corp_lorem.pdf';
const htmlFile = 'order_form.html';
const txtFile = 'Welcome.txt';
const jpgFile = 'Id.jpg';

/**
 * Create bulk upload job
 * @param {object} req Request obj
 * @param {object} res Response obj
 */
eg003BulkUpload.createController = async (req, res) => {
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
    basePath: dsConfig.iamBasePath,
    accountId: req.session.accountId,
    jobName: 'Example bulk upload job',
  };

  let results = null;
  try {
    results = await createBulkUploadJob(args);
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
    req.session.uploadUrls = results.embedded.documents.map((doc) => doc.actions.uploadDocument);
    req.session.jobId = results.id;

    const example = getExampleByNumber(res.locals.manifest, exampleNumber, api);
    res.render('pages/navigator-examples/eg003UploadDocuments', {
      eg: eg,
      csrfToken: req.csrfToken(),
      example: example,
      title: example.ExampleName,
      message: example.ResultsPageText,
    });
  }
};

/**
 * Upload documents
 * @param {object} req Request obj
 * @param {object} res Response obj
 */
eg003BulkUpload.uploadController = async (req, res) => {
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

  if (!req.session.uploadUrls || !req.session.jobId) {
    return res.redirect(eg);
  }

  // Step 2. Call the worker method
  const filePaths = [
    path.resolve(demoDocsPath, docFile),
    path.resolve(demoDocsPath, pdfFile),
    path.resolve(demoDocsPath, htmlFile),
    path.resolve(demoDocsPath, txtFile),
    path.resolve(demoDocsPath, jpgFile)
  ];

  try {
    await uploadDocuments(req.session.uploadUrls, filePaths);
  } catch (error) {
    const errorBody = error?.body || error?.response?.body;
    // we can pull the DocuSign error code and message from the response body
    const errorCode = errorBody?.errorCode;
    const errorMessage = errorBody?.message;
    // In production, may want to provide customized error messages and
    // remediation advice to the user.
    res.render('pages/error', { err: error, errorCode, errorMessage });
  }

  const example = getExampleByNumber(res.locals.manifest, exampleNumber, api);
  const additionalPageData = example.AdditionalPage.find(p => p.Name === 'upload_documents');
  res.render('pages/navigator-examples/eg003CompleteJob', {
    eg: eg,
    title: example.ExampleName,
    message: additionalPageData.ResultsPageText,
    csrfToken: req.csrfToken(),
    example: example,
  });
};

/**
 * Complete the bulk upload job
 * @param {object} req Request obj
 * @param {object} res Response obj
 */
eg003BulkUpload.completeController = async (req, res) => {
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

  if (!req.session.uploadUrls || !req.session.jobId) {
    return res.redirect(eg);
  }

  // Step 2. Call the worker method
  const args = {
    accessToken: req.user.accessToken,
    basePath: dsConfig.iamBasePath,
    accountId: req.session.accountId,
    jobId: req.session.jobId,
  };

  let results = null;
  try {
    results = await completeBulkUploadJob(args);
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
    const additionalPageData = example.AdditionalPage.find(p => p.Name === 'job_completed');
    res.render('pages/example_done', {
        title: example.ExampleName,
        message: additionalPageData.ResultsPageText,
        json: JSON.stringify(results),
    });
  }
};

/**
  * Form page for this application
  */
eg003BulkUpload.getController = async (req, res) => {
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
  res.render('pages/navigator-examples/eg003BulkUpload', {
    eg: eg,
    csrfToken: req.csrfToken(),
    example: example,
    sourceFile: sourceFile,
    sourceUrl: dsConfig.githubExampleUrl + 'navigator/examples/' + sourceFile,
    documentation: dsConfig.documentation + eg,
    showDoc: dsConfig.documentation
  });
};
