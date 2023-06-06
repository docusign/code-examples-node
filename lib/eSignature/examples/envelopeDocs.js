/**
 * @file
 * Example 006: List an envelope's documents
 * @author DocuSign
 */

const docusign = require("docusign-esign");

/**
 * This function does the work of listing the envelope's documents
 * @param {object} args object
 */
const getDocuments = async (args) => {
  // Data for this method
  // args.basePath
  // args.accessToken
  // args.accountId
  // args.envelopeId

  //ds-snippet-start:eSign6Step2
  let dsApiClient = new docusign.ApiClient();
  dsApiClient.setBasePath(args.basePath);
  dsApiClient.addDefaultHeader("Authorization", "Bearer " + args.accessToken);
  //ds-snippet-end:eSign6Step2

  //ds-snippet-start:eSign6Step3
  let envelopesApi = new docusign.EnvelopesApi(dsApiClient);

  let results = await envelopesApi.listDocuments(
    args.accountId,
    args.envelopeId,
    null
  );
  //ds-snippet-end:eSign6Step3
  return results;
};

module.exports = { getDocuments };
