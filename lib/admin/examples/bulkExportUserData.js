const axios = require('axios');
const fs = require('fs');
const docusignAdmin = require('docusign-admin');

const createBulkExportRequest = async (args) => {
  //ds-snippet-start:Admin3Step2
  const apiClient = new docusignAdmin.ApiClient();
  apiClient.setBasePath(args.basePath);
  apiClient.addDefaultHeader('Authorization', 'Bearer ' + args.accessToken);
  //ds-snippet-end:Admin3Step2

  const requestBody = {
    type: 'organization_memberships_export'
  };

  //ds-snippet-start:Admin3Step3
  const bulkExportsApi = new docusignAdmin.BulkExportsApi(apiClient);
  let exportResponse = await bulkExportsApi.createUserListExport(requestBody, args.organizationId, (error, data, response) => {
      const headers = response?.headers;

      const remaining = headers?.['x-ratelimit-remaining'];
      const reset = headers?.['x-ratelimit-reset'];

      if (remaining && reset) {
        const resetInstant = new Date(Number(reset) * 1000);

        console.log(`API calls remaining: ${remaining}`);
        console.log(`Next Reset: ${resetInstant.toISOString()}`);
      }
  });
  //ds-snippet-end:Admin3Step3

  const sleep = (ms) => {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  };

  const getExportedUserData = async (exportId) => {
    //ds-snippet-start:Admin3Step4
    const bulkExportResponse = await bulkExportsApi.getUserListExport(args.organizationId, exportId, (error, data, response) => {
      const headers = response?.headers;

      const remaining = headers?.['x-ratelimit-remaining'];
      const reset = headers?.['x-ratelimit-reset'];

      if (remaining && reset) {
        const resetInstant = new Date(Number(reset) * 1000);

        console.log(`API calls remaining: ${remaining}`);
        console.log(`Next Reset: ${resetInstant.toISOString()}`);
      }
  });
    //ds-snippet-end:Admin3Step4

    //ds-snippet-start:Admin3Step5
    const dataUrl = bulkExportResponse.data.results[0].url;
    const requestOptions = {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${args.accessToken}`,
        'Content-Type': 'application/json'
      },
      responseType: 'stream'
    };

    const fileStream = fs.createWriteStream(args.filePath);
    const response = await axios(dataUrl, requestOptions);
    response.data.pipe(fileStream);

    await new Promise((resolve, reject) => {
      fileStream.on('finish', () => {
        fileStream.end();
        resolve();
      });
      fileStream.on('error', (err) => {
        console.log(err);
        reject();
      });
    });
    //ds-snippet-end:Admin3Step5
  };

  let retryCount = 10;

  while (retryCount >= 0){
    if (exportResponse.data.status === 'completed'){
      await getExportedUserData(exportResponse.data.id);
      break;
    } else {
      --retryCount;
      await sleep(5000);
      exportResponse = await bulkExportsApi.getUserListExport(args.organizationId, exportResponse.data.id, (error, data, response) => {
      const headers = response?.headers;

      const remaining = headers?.['x-ratelimit-remaining'];
      const reset = headers?.['x-ratelimit-reset'];

      if (remaining && reset) {
        const resetInstant = new Date(Number(reset) * 1000);

        console.log(`API calls remaining: ${remaining}`);
        console.log(`Next Reset: ${resetInstant.toISOString()}`);
      }
  });
    }
  }

  return exportResponse.data;
};

module.exports = { createBulkExportRequest };
