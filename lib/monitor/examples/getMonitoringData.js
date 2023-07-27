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
  dsApiClient.addDefaultHeader("Authorization", "Bearer " + args.accessToken);
  //ds-snippet-end:Monitor1Step2

  //ds-snippet-start:Monitor1Step3
  const datasetApi = new docusign.DataSetApi(dsApiClient);
  const result = await datasetApi.getStream(args.version, args.dataset);
  //ds-snippet-end:Monitor1Step3

  return result;
}

module.exports = { getMonitoringData };
