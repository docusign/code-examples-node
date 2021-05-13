/**
 * @file
 * Example 001: Getting the monitoring data
 * @author DocuSign
 */

const path = require('path')
    , getMonitoringData = require('../examples/getMonitoringData')
    , dsConfig = require('../../../config/index.js').config
    ;

const eg001GetMonitoringData = exports
    , eg = 'eg001' // This example reference.
    , mustAuthenticate = '/ds/mustAuthenticate'
    , minimumBufferMin = 3
    ;

/**
 * Create the envelope
 * @param {object} req Request obj
 * @param {object} res Response obj
 */
eg001GetMonitoringData.createController = async(req, res) => {
  // Step 1. Check the token
  // At this point we should have a good token. But we
  // double-check here to enable a better UX to the user.
  let tokenOK = req.dsAuth.checkToken(minimumBufferMin);
  if (!tokenOK) {
    req.flash('info', 'Sorry, you need to re-authenticate.');
    // Save the current operation so it will be resumed after authentication
    req.dsAuth.setEg(req, eg);
    res.redirect(mustAuthenticate);
  }

  let args = {
      accessToken: req.user.accessToken,
      requestUrl: 'https://lens-d.docusign.net/api/v2.0/datasets/monitor/stream?'
    },
    results = null;

  try {
    results = await getMonitoringData.getData(args)
  } catch (error) {
    // we can pull the DocuSign error code and message from the response body
    let errorBody = error && error.response && error.response.body
      , errorCode = errorBody && errorBody.errorCode
      , errorMessage = errorBody && errorBody.message
      ;
    // In production, may want to provide customized error messages and
    // remediation advice to the user.
    res.render('pages/error', { err: error, errorCode: errorCode, errorMessage: errorMessage });
  }
  if (results) {
    res.render('pages/example_done', {
      title: "Monitoring data",
      h1: "Monitoring data result",
      message: `Results from DataSet:GetStreamForDataset method:`,
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
  let tokenOK = req.dsAuth.checkToken();
  if (tokenOK) {
    res.render('pages/monitor-examples/eg001GetMonitoringData', {
      eg: eg,
      csrfToken: req.csrfToken(),
      title: "Getting monitoring data",
      sourceFile: path.basename(__filename),
      sourceUrl: dsConfig.githubExampleUrl + "monitor/" + path.basename(__filename),
      documentation: dsConfig.documentation + eg,
      showDoc: dsConfig.documentation
    });
  } else {
    // Save the current operation so it will be resumed after authentication
    req.dsAuth.setEg(req, eg);
    res.redirect(mustAuthenticate);
  }
}
