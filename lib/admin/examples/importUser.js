const docusign = require('docusign-admin');
const fs = require('fs');

const createBulkImportRequest = async(args) => {
  //ds-snippet-start:Admin4Step2
  const apiClient = new docusign.ApiClient();
  apiClient.setBasePath(args.basePath);
  apiClient.addDefaultHeader("Authorization", "Bearer " + args.accessToken);
  //ds-snippet-end:Admin4Step2

  //ds-snippet-start:Admin4Step3
  const bulkImportsApi = new docusign.BulkImportsApi(apiClient);

  // get the user data from the csv file
  let userData = fs.readFileSync(args.csvFilePath).toString();

  // replace all {account_id} occurrences with the actual account id value
  userData = Buffer.from(userData.replace(/{account_id}/g, args.accountId));

  return await bulkImportsApi.createBulkImportAddUsersRequest(args.organizationId, userData);
  //ds-snippet-end:Admin4Step3
}

const checkStatus = async(args) => {
  const apiClient = new docusign.ApiClient();
  apiClient.setBasePath(args.basePath);
  apiClient.addDefaultHeader("Authorization", "Bearer " + args.accessToken);

  const bulkImportsApi = new docusign.BulkImportsApi(apiClient);

  //ds-snippet-start:Admin4Step4
  return await bulkImportsApi.getBulkUserImportRequest(args.organizationId, args.importId);
  //ds-snippet-end:Admin4Step4
}

module.exports = { createBulkImportRequest, checkStatus};
