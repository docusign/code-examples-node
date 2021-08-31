const request = require('request');
const fs = require('fs');
const docusignAdmin = require('docusign-admin');

const createBulkExportRequest = async(args) => {
  // Step 2 start
  const apiClient = new docusignAdmin.ApiClient();
  apiClient.setBasePath(args.basePath);
  apiClient.addDefaultHeader("Authorization", "Bearer " + args.accessToken);
  // Step 2 end

  const requestBody = {
    type: "organization_memberships_export"
  };

  // Step 3 start
  const bulkExportsApi = new docusignAdmin.BulkExportsApi(apiClient);
  let exportResponse = await bulkExportsApi.createUserListExport(requestBody, args.organizationId);
  // Step 3 end

  const sleep = (ms) => {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

  const getExportedUserData = async(exportId) => {
    // Step 4 start
    const bulkExportResponse = await bulkExportsApi.getUserListExport(args.organizationId, exportId);
    // Step 4 end

    // Step 5 start
    const dataUrl = bulkExportResponse.results[0].url;
    const requestOptions = {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${args.accessToken}`,
        'Content-Type': 'application/json'
      },
      json: true
    };

    const file = fs.createWriteStream(args.filePath);

    request(dataUrl, requestOptions, (err, _res, body) => {
      if(err) throw err;

      file.write(body);
      file.close();
    });
    // Step 5 end
  }

  let retryCount = 5;

  while(retryCount >= 0){
    if(exportResponse.status === "completed"){
      await getExportedUserData(exportResponse.id);
      break;
    } else {
      --retryCount;
      await sleep(5000);
      exportResponse = await bulkExportsApi.getUserListExport(args.organizationId, exportResponse.id);
    }
  }

  return exportResponse;
}

module.exports = { createBulkExportRequest };
