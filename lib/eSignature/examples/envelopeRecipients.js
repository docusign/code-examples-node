/**
 * @file
 * Example 005: envelope list recipients
 * @author DocuSign
 */

const docusign = require("docusign-esign");

/**
 * This function does the work of listing the envelope's recipients
 * @param {object} args object
 */
const listRecipients = async (args) => {
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
  // Step 1. EnvelopeRecipients::list.
  // Exceptions will be caught by the calling function
  results = await envelopesApi.listRecipients(
    args.accountId,
    args.envelopeId,
    null
  );
  return results;
};

module.exports = { listRecipients };
