/**
 * @file
 * Example 001: Getting the monitoring data
 * @author DocuSign
 */

const path = require('path');
const { getMonitoringData } = require('../examples/getMonitoringData');
const dsConfig = require('../../../config/index.js').config;

const eg001GetMonitoringData = exports;
const eg = 'eg001'; // This example reference.
const mustAuthenticate = '/ds/mustAuthenticate';
const minimumBufferMin = 3;

/**
 * Create the envelope
 * @param {object} req Request obj
 * @param {object} res Response obj
 */
eg001GetMonitoringData.createController = async(req, res) => {
  // Step 1. Check the token
  // At this point we should have a good token. But we
  // double-check here to enable a better UX to the user.
  const tokenOK = req.dsAuth.checkToken(minimumBufferMin);
    if (!tokenOK) {
      req.flash('info', 'Sorry, you need to re-authenticate.');
      // Save the current operation so it will be resumed after authentication
      req.dsAuth.setEg(req, eg);
      res.redirect(mustAuthenticate);
    }

    const args = {
      accessToken: req.user.accessToken,
      basePath: dsConfig.monitorApiUrl,
      accountId: req.session.accountId,
      version: '2.0',
      dataset: 'monitor',
    };
    let results = null;

  try {
    results = await getMonitoringData(args);
  } catch (error) {
    // we can pull the DocuSign error code and message from the response body
    const errorBody = error && error.response && error.response.body;
    const errorCode = errorBody && errorBody.errorCode;
    const errorMessage = errorBody && errorBody.message;

    // In production, may want to provide customized error messages and
    // remediation advice to the user.
    res.render('pages/error', { err: error, errorCode, errorMessage });
  }
  if (results) {
    res.render('pages/example_done', {
      title: "Monitoring data",
      h1: "Monitoring data result",
      message: `Results from DataSet:getStream method:`,
      json: JSON.stringify(results).replace(/'/g,'')
    });
  }
}

/**
 * Form page for this application
 */
eg001GetMonitoringData.getController = (req, res) => {
  // Check that the authentication token is ok with a long buffer time.
  // If needed, now is the best time to ask the user to authenticate
  // since they have not yet entered any information into the form.
  const tokenOK = req.dsAuth.checkToken();
  if (tokenOK) {
    sourceFile = (path.basename(__filename))[5].toLowerCase() + (path.basename(__filename)).substr(6);
    res.render('pages/monitor-examples/eg001GetMonitoringData', {
      eg: eg,
      csrfToken: req.csrfToken(),
      title: "Getting monitoring data",
      sourceFile: sourceFile,
      sourceUrl: dsConfig.githubExampleUrl + "monitor/examples/" + sourceFile,
      documentation: dsConfig.documentation + eg,
      showDoc: dsConfig.documentation
    });
  } else {
    // Save the current operation so it will be resumed after authentication
    req.dsAuth.setEg(req, eg);
    res.redirect(mustAuthenticate);
  }
}
