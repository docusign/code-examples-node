const docusign = require('docusign-admin');
const fs = require('fs');

const createBulkImportRequest = async(args) => {
  // Step 2 start
  const apiClient = new docusign.ApiClient();
  apiClient.setBasePath(args.basePath);
  apiClient.addDefaultHeader("Authorization", "Bearer " + args.accessToken);
  // Step 2 end

  // Step 3 start
  const bulkImportsApi = new docusign.BulkImportsApi(apiClient);

  // get the user data from the csv file
  let userData = fs.readFileSync(args.csvFilePath).toString();

  // replace all {account_id} occurrences with the actual account id value
  userData = Buffer.from(userData.replace(/{account_id}/g, args.accountId));

  return await bulkImportsApi.createBulkImportAddUsersRequest(args.organizationId, userData);
  // Step 3 end
}

const checkStatus = async(args) => {
  const apiClient = new docusign.ApiClient();
  apiClient.setBasePath(args.basePath);
  apiClient.addDefaultHeader("Authorization", "Bearer " + args.accessToken);

  const bulkImportsApi = new docusign.BulkImportsApi(apiClient);

  // Step 4 start
  return await bulkImportsApi.getBulkUserImportRequest(args.organizationId, args.importId);
  // Step 4 end
}

module.exports = { createBulkImportRequest, checkStatus};
