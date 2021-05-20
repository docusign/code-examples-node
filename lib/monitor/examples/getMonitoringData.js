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

  const options = {
    cursor: args.cursor,
    limit: args.limit
  };

  const result = await datasetApi.getStreamForDataset(args.version, args.dataset, options);

  return result;
}

module.exports = { getMonitoringData };
