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

  let dsApiClient = new docusign.ApiClient();
  dsApiClient.setBasePath(args.basePath);
  dsApiClient.addDefaultHeader("Authorization", "Bearer " + args.accessToken);
  let envelopesApi = new docusign.EnvelopesApi(dsApiClient);

  // Step 1. EnvelopeDocuments::list.
  // Exceptions will be caught by the calling function
  let results = await envelopesApi.listDocuments(
    args.accountId,
    args.envelopeId,
    null
  );
  return results;
};

module.exports = { getDocuments };
