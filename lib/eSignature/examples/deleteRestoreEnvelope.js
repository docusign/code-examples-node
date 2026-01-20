/**
 * @file
 * Example 45: Delete and Restore an Envelope
 * @author DocuSign
 */

const docusign = require('docusign-esign');

/**
 * Moves the envelope to a specified folder
 */
const deleteEnvelope = async (args) => {
  //ds-snippet-start:eSign45Step2
  const dsApiClient = new docusign.ApiClient();
  dsApiClient.setBasePath(args.basePath);
  dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + args.accessToken);
  const foldersApi = new docusign.FoldersApi(dsApiClient);
  //ds-snippet-end:eSign45Step2

  //ds-snippet-start:eSign45Step3
  const foldersRequest = docusign.FoldersRequest.constructFromObject({
    envelopeIds: [args.envelopeId],
  });
  //ds-snippet-end:eSign45Step3

  //ds-snippet-start:eSign45Step4
  var response = await foldersApi.moveEnvelopes(args.accountId, args.deleteFolderId, { foldersRequest }, (error, data, response) => {
      const headers = response?.headers;

      const remaining = headers?.['x-ratelimit-remaining'];
      const reset = headers?.['x-ratelimit-reset'];

      if (remaining && reset) {
        const resetInstant = new Date(Number(reset) * 1000);

        console.log(`API calls remaining: ${remaining}`);
        console.log(`Next Reset: ${resetInstant.toISOString()}`);
      }
  });
  return response.data;
  //ds-snippet-end:eSign45Step4
};

const moveEnvelopeToFolder = async (args) => {
  const dsApiClient = new docusign.ApiClient();
  dsApiClient.setBasePath(args.basePath);
  dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + args.accessToken);
  const foldersApi = new docusign.FoldersApi(dsApiClient);

  //ds-snippet-start:eSign45Step6
  const foldersRequest = docusign.FoldersRequest.constructFromObject({
    envelopeIds: [args.envelopeId],
    fromFolderId: args.fromFolderId,
  });

  var response = await foldersApi.moveEnvelopes(args.accountId, args.folderId, { foldersRequest }, (error, data, response) => {
      const headers = response?.headers;

      const remaining = headers?.['x-ratelimit-remaining'];
      const reset = headers?.['x-ratelimit-reset'];

      if (remaining && reset) {
        const resetInstant = new Date(Number(reset) * 1000);

        console.log(`API calls remaining: ${remaining}`);
        console.log(`Next Reset: ${resetInstant.toISOString()}`);
      }
  });
  return response.data;
  //ds-snippet-end:eSign45Step6
};

/**
 * Retrieves the list of folders
 */
const getFolders = async (args) => {
  const dsApiClient = new docusign.ApiClient();
  dsApiClient.setBasePath(args.basePath);
  dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + args.accessToken);
  const foldersApi = new docusign.FoldersApi(dsApiClient);

  //ds-snippet-start:eSign45Step5
  response = await foldersApi.list(args.accountId, (error, data, response) => {
      const headers = response?.headers;

      const remaining = headers?.['x-ratelimit-remaining'];
      const reset = headers?.['x-ratelimit-reset'];

      if (remaining && reset) {
        const resetInstant = new Date(Number(reset) * 1000);

        console.log(`API calls remaining: ${remaining}`);
        console.log(`Next Reset: ${resetInstant.toISOString()}`);
      }
  });
  return response.data;
  //ds-snippet-end:eSign45Step5
};

module.exports = { deleteEnvelope, moveEnvelopeToFolder, getFolders };
