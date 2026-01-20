/**
 * @file
 * Example 004: Get an envelope's basic information and status
 * @author DocuSign
 */

const docusign = require('docusign-esign');

/**
 * This function does the work of getting the envelope information
 * @param {object} args
 */
const getEnvelope = async (args) => {
  // Data for this method
  // args.basePath
  // args.accessToken
  // args.accountId
  // args.envelopeId

  //ds-snippet-start:eSign4Step2
  let dsApiClient = new docusign.ApiClient();
  dsApiClient.setBasePath(args.basePath);
  dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + args.accessToken);
  let envelopesApi = new docusign.EnvelopesApi(dsApiClient);
    let results = null;

  // Step 1. Call Envelopes::get
  // Exceptions will be caught by the calling function
  results = await envelopesApi.getEnvelope(
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
   //ds-snippet-end:eSign4Step2
   return results.data;
};

module.exports = { getEnvelope };
