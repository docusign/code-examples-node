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
  let dsApiClient = new docusign.ApiClient();
  dsApiClient.setBasePath(args.basePath);
  dsApiClient.addDefaultHeader("Authorization", "Bearer " + args.accessToken);
  const datasetApi = new docusign.DataSetApi(dsApiClient);

  const result = await datasetApi.getStream(args.version, args.dataset);

  return result;
}

module.exports = { getMonitoringData };
