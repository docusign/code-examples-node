/**
 * @file
 * Example 002: Post web query
 * @author DocuSign
 */

const path = require('path');
const validator = require('validator');
const { postQuery } = require('../examples/postWebQuery');
const { getExampleByNumber } = require("../../manifestService");
const dsConfig = require('../../../config/index.js').config;

const eg002PostWebQuery = exports;
const exampleNumber = 2;
const eg = `eg00${exampleNumber}`; // This example reference.
const mustAuthenticate = '/ds/mustAuthenticate';
const minimumBufferMin = 3;

/**
 * Create the envelope
 * @param {object} req Request obj
 * @param {object} res Response obj
 */
 eg002PostWebQuery.createController = async(req, res) => {
  // Step 1. Check the token
  const isTokenOK = req.dsAuth.checkToken(minimumBufferMin);
  if (!isTokenOK) {
    req.flash('info', 'Sorry, you need to re-authenticate.');
    // Save the current operation so it will be resumed after authentication
    req.dsAuth.setEg(req, eg);
    return res.redirect(mustAuthenticate);
  }

  const { body } = req;
  const args = {
    accessToken: req.user.accessToken,
    basePath: dsConfig.monitorApiUrl,
    accountId: req.session.accountId,
    version: '2.0',
    dataset: 'monitor',
    startDate: validator.escape(body.startDate),
    endDate: validator.escape(body.endDate),
  };
  let results = null;

  try {
    results = await postQuery(args);
  } catch (error) {
    const errorBody = error && error.response && error.response.body;
    const errorCode = errorBody && errorBody.errorCode;
    const errorMessage = errorBody && errorBody.message;

    res.render("pages/error_monitor", { err: error, errorCode, errorMessage });
  }
  if (results) {
    const example = getExampleByNumber(res.locals.manifest, exampleNumber);
    res.render('pages/example_done', {
      title: example.ExampleName,
      message: example.ResultsPageText,
      json: JSON.stringify(results).replace(/'/g,'')
    });
  }
}

/**
 * Form page for this application
 */
 eg002PostWebQuery.getController = (req, res) => {
  // Check that the authentication token is ok with a long buffer time.
  // If needed, now is the best time to ask the user to authenticate
  // since they have not yet entered any information into the form.
  const isTokenOK = req.dsAuth.checkToken();
  const currentDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 10);

  if (!isTokenOK) {
    // Save the current operation so it will be resumed after authentication
    req.dsAuth.setEg(req, eg);
    return res.redirect(mustAuthenticate);
  }

  const example = getExampleByNumber(res.locals.manifest, exampleNumber);
  const sourceFile = (path.basename(__filename))[5].toLowerCase() + (path.basename(__filename)).substr(6);
  res.render('pages/monitor-examples/eg002PostWebQuery', {
    eg: eg,
    csrfToken: req.csrfToken(),
    example: example,
    sourceFile: sourceFile,
    sourceUrl: dsConfig.githubExampleUrl + "monitor/examples/" + sourceFile,
    documentation: dsConfig.documentation + eg,
    showDoc: dsConfig.documentation,
    currentDate: currentDate.toISOString().substring(0,10),
    startDate: startDate.toISOString().substring(0,10)
  });
}
