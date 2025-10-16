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
  return await foldersApi.moveEnvelopes(args.accountId, args.deleteFolderId, { foldersRequest });
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

  return await foldersApi.moveEnvelopes(args.accountId, args.folderId, { foldersRequest });
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
  return await foldersApi.list(args.accountId);
  //ds-snippet-end:eSign45Step5
};

module.exports = { deleteEnvelope, moveEnvelopeToFolder, getFolders };
