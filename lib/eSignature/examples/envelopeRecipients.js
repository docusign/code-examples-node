/**
 * @file
 * Example 005: envelope list recipients
 * @author DocuSign
 */

const docusign = require('docusign-esign');

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

  //ds-snippet-start:eSign5Step2
  let dsApiClient = new docusign.ApiClient();
  dsApiClient.setBasePath(args.basePath);
  dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + args.accessToken);
  let envelopesApi = new docusign.EnvelopesApi(dsApiClient);
    let results = null;
  // Step 1. EnvelopeRecipients::list.
  // Exceptions will be caught by the calling function
  results = await envelopesApi.listRecipients(
    args.accountId,
    args.envelopeId,
    null,
    (error, data, response) => {
      const headers = response?.headers;

      const remaining = headers?.['x-ratelimit-remaining'];
      const reset = headers?.['x-ratelimit-reset'];

      if (remaining && reset) {
        const resetInstant = new Date(Number(reset) * 1000);

        console.log(`API calls remaining: ${remaining}`);
        console.log(`Next Reset: ${resetInstant.toISOString()}`);
      }
  });
  //ds-snippet-end:eSign5Step2
  return results.data;
};

module.exports = { listRecipients };
