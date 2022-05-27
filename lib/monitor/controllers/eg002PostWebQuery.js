/**
 * @file
 * Example 002: Post web query
 * @author DocuSign
 */

const path = require('path');
const validator = require('validator');
const { postQuery } = require('../examples/postWebQuery');
const dsConfig = require('../../../config/index.js').config;

const eg002PostWebQuery = exports;
const eg = 'eg002'; // This example reference.
const mustAuthenticate = '/ds/mustAuthenticate';
const minimumBufferMin = 3;

/**
 * Create the envelope
 * @param {object} req Request obj
 * @param {object} res Response obj
 */
 eg002PostWebQuery.createController = async(req, res) => {
  // Step 1. Check the token
  const tokenOK = req.dsAuth.checkToken(minimumBufferMin);
  if (!tokenOK) {
    req.flash('info', 'Sorry, you need to re-authenticate.');
    // Save the current operation so it will be resumed after authentication
    req.dsAuth.setEg(req, eg);
    res.redirect(mustAuthenticate);
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

    res.render('pages/error', { err: error, errorCode, errorMessage });
  }
  if (results) {
    res.render('pages/example_done', {
      title: "Query monitoring data with filters",
      h1: "Query monitoring data with filters",
      message: `Results from DataSet:postWebQuery method:`,
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
  const tokenOK = req.dsAuth.checkToken();
  const currentDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 10);

  if (tokenOK) {
    sourceFile = (path.basename(__filename))[5].toLowerCase() + (path.basename(__filename)).substr(6);
    res.render('pages/monitor-examples/eg002PostWebQuery', {
      eg: eg,
      csrfToken: req.csrfToken(),
      title: "Query monitoring data with filters",
      sourceFile: sourceFile,
      sourceUrl: dsConfig.githubExampleUrl + "monitor/examples/" + sourceFile,
      documentation: dsConfig.documentation + eg,
      showDoc: dsConfig.documentation,
      currentDate: currentDate.toISOString().substring(0,10),
      startDate: startDate.toISOString().substring(0,10)
    });
  } else {
    // Save the current operation so it will be resumed after authentication
    req.dsAuth.setEg(req, eg);
    res.redirect(mustAuthenticate);
  }
}
