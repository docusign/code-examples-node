/**
 * @file
 * Example 002: Post web query
 * @author DocuSign
 */

const docusign = require('docusign-monitor');

/**
 * This function does the work of getting the monitoring data with filters
 */
const postQuery = async (args) => {

  // Step 2 start
  let dsApiClient = new docusign.ApiClient();
  dsApiClient.setBasePath(args.basePath);
  dsApiClient.addDefaultHeader("Authorization", "Bearer " + args.accessToken);
  const datasetApi = new docusign.DataSetApi(dsApiClient);
  // Step 2 end

  // Step 4 start
  const queryData = getQuery(args);
  const result = await datasetApi.postWebQuery(queryData, args.version, args.dataset);
  // Step 4 end

  return result;
}

// Step 3 start
const getQuery = (args) => {
  return {
    "filters": [
      {
        "FilterName": "Time",
        "BeginTime": args.startDate,
        "EndTime": args.endDate
      },
      {
        "FilterName": "Has",
        "ColumnName": "AccountId",
        "Value": args.accountId
      }
    ],
    "aggregations": [
      {
        "aggregationName": "Raw",
        "limit": "1",
        "orderby": [
          "Timestamp, desc"
        ]
      }
    ]
  }
}
// Step 3 end
module.exports = { postQuery };
