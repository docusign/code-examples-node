/**
 * @file
 * Example 018: Get an envelope's custom field data
 * @author DocuSign
 */

const docusign = require("docusign-esign");

/**
 * This function does the work of getting the envelope information
 * @param {object} args
 */
const listCustomFields = async (args) => {
  // Data for this method
  // args.basePath
  // args.accessToken
  // args.accountId
  // args.envelopeId

  let dsApiClient = new docusign.ApiClient();
  dsApiClient.setBasePath(args.basePath);
  dsApiClient.addDefaultHeader("Authorization", "Bearer " + args.accessToken);
  let envelopesApi = new docusign.EnvelopesApi(dsApiClient),
    results = null;

  // Step 1. Call EnvelopeCustomFields::get
  // Exceptions will be caught by the calling function
  results = await envelopesApi.listCustomFields(
    args.accountId,
    args.envelopeId,
    null
  );
  return results;
};

module.exports = { listCustomFields };
