/**
 * @file
 * Example 001: Getting the monitoring data
 * @author DocuSign
 */

const docusign = require('docusign-monitor');

const path = require('path')
    , nf = require('node-fetch')
    , dsConfig = require('../../config/index.js').config
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
      basePath: 'https://lens-d.docusign.net/api/v2.0/datasets/monitor/stream?',
      version: '2.0',
      dataset: 'monitor'
    },
    results = null;

  try {
    results = await eg001GetMonitoringData.worker(args)
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
      message: `Results from DataSet:getStream method:`,
      json: JSON.stringify(results).replace(/'/g,'')
    });
  }
}

/**
 * This function does the work of getting the monitoring data
 */
eg001GetMonitoringData.worker = async(args) => {
  // Data for this method
  // args.basePath
  // args.accessToken

  // Step 2 start
  let dsApiClient = new docusign.ApiClient();
  dsApiClient.setBasePath(args.basePath);
  dsApiClient.addDefaultHeader("Authorization", "Bearer " + args.accessToken);
  // Step 2 end

  // Step 3 start
  const datasetApi = new docusign.DataSetApi(dsApiClient);
  const result = await datasetApi.getStream(args.version, args.dataset);
  //Step 3 end

  return result;
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