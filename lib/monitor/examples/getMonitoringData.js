/**
 * @file
 * Example 001: Getting the monitoring data
 * @author DocuSign
 */

const request = require('request')

const getMonitoringData = exports

/**
 * This function does the work of getting the monitoring data
 */
getMonitoringData.getData = async(args) => {
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
      responseResult = body;
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
