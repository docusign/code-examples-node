/**
 * @file
 * Example 001: Getting the monitoring data
 * @author DocuSign
 */

const path = require('path')
    , request = require('request')
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
      requestUrl: 'https://lens-d.docusign.net/api/v2.0/datasets/monitor/stream?'
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
      h1: "Monitoring data",
      message: `Monitoring data obtained successfully.`,
      json: JSON.stringify(results).replace(/'/g,'')
    });
  }
}

/**
 * This function does the work of getting the monitoring data
 */
eg001GetMonitoringData.worker = async(args) => {
  // Data for this method
  // args.requestUrl
  // args.accessToken


const requestOptions = {
    method: 'GET',
// step 2 start
    headers: {
      'Authorization': `Bearer ${args.accessToken}`,
      'Content-Type': 'application/json'
    },
// step 2 end
    json: true
  };

// step 3 start
const limit = 2;
let cursorValue = '';
let complete = false;
let results = [];
do {
  const requestParams = `cursor=${cursorValue}&limit=${limit}`;

  let endCursor = '';
    let responseResult = null;

    await doRequest(args.requestUrl + requestParams, requestOptions).then((body) => {
      endCursor = body.endCursor;
      responseResult = body.data;
    }).catch((error) => {
      throw error;
    });

    if (endCursor === cursorValue) {
      complete = true;
    } else {
      cursorValue = endCursor;
      results.push(responseResult);
    }

  } while (!complete);
// step 3 end
  return results;
}

/**
 * Does the request
 * @function
 * @private
 * @param {string} url request url
 * @param {Object} options request options
 * @returns {Promise} A promise with request results
 */
function doRequest(url, options) {
  return new Promise(function (resolve, reject) {
    request(url, options, function (error, res, body) {
      if (!error) {
        resolve(body);
      } else {
        reject(error);
      }
    });
  });
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
