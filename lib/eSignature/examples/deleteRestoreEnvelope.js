/**
 * @file
 * Example 45: Delete and Restore an Envelope
 * @author DocuSign
 */

const docusign = require('docusign-esign');

/**
 * Moves the envelope to a specified folder
 */
const moveEnvelope = async (args) => {
  //ds-snippet-start:eSign45Step2
  const dsApiClient = new docusign.ApiClient();
  dsApiClient.setBasePath(args.basePath);
  dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + args.accessToken);
  const foldersApi = new docusign.FoldersApi(dsApiClient);
  //ds-snippet-end:eSign45Step2

  //ds-snippet-start:eSign45Step3
  const fromFolderId = args.fromFolderId;
  const foldersRequest = docusign.FoldersRequest.constructFromObject({
    envelopeIds: [args.envelopeId],

    // add fromFolderId parameter if its value is provided
    ...(fromFolderId && { fromFolderId }),
  });
  //ds-snippet-end:eSign45Step3

  //ds-snippet-start:eSign45Step4
  return await foldersApi.moveEnvelopes(args.accountId, args.folderId, { foldersRequest });
  //ds-snippet-end:eSign45Step4
};

module.exports = { moveEnvelope };
