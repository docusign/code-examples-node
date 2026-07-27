/**
 * @file
 * Example 001: Getting the monitoring data
 * @author DocuSign
 */

const docusign = require('docusign-monitor');

/**
 * This function does the work of getting the monitoring data
 */
const getMonitoringData = async (args) => {
  //ds-snippet-start:Monitor1Step2
  let dsApiClient = new docusign.ApiClient();
  dsApiClient.setBasePath(args.basePath);
  dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + args.accessToken);
  //ds-snippet-end:Monitor1Step2

  //ds-snippet-start:Monitor1Step3
  const cursorDate = new Date();
  cursorDate.setDate(cursorDate.getDate() - 1);
  const limit = 2000; // Amount of records you want to read in one request
  let functionResult = [];

  let complete = false;
  let cursorValue = cursorDate.toISOString().split('T')[0] + 'T00:00:00Z';
  let cursoredResult;
  const datasetApi = new docusign.DataSetApi(dsApiClient);

  let options = {
    limit: limit,
  };

  // Get monitoring data
  do {
    if (cursorValue != null) {
      options.cursor = cursorValue;
    }
    cursoredResult = await new Promise((resolve, reject) => {
      datasetApi.getStream('2.0', 'monitor', options, (err, data, response) => {
        if (err) return reject(err);
        resolve({ data, response });
      });
    });

    let headers = cursoredResult.response.headers;
    let remaining = headers['x-ratelimit-remaining'];
    let reset = headers['x-ratelimit-reset'];

    if (remaining && reset) {
      const resetInstant = new Date(Number(reset) * 1000);
      console.log(`API calls remaining: ${remaining}`);
      console.log(`Next Reset: ${resetInstant.toISOString()}`);
    }

    let endCursor = cursoredResult.data.endCursor;

    // If the endCursor from the response is the same as the one that you already have,
    // it means that you have reached the end of the records
    if (endCursor === cursorValue) {
      complete = true;
    } else {
      cursorValue = endCursor;
      if (cursoredResult.data.data.length !== 0) {
        functionResult.push(cursoredResult.data.data);
      }
    }
  } while (!complete);

  //ds-snippet-end:Monitor1Step3
  return functionResult;
};

module.exports = { getMonitoringData };
