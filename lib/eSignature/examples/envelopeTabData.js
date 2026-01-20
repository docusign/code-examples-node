/**
 * @file
 * Example 015: Get an envelope's tab (field) data
 * @author DocuSign
 */

const docusign = require('docusign-esign');

/**
 * This function does the work of getting the envelope information
 * @param {object} args
 */
const getEnvelopeFormData = async (args) => {
  // Data for this method
  // args.basePath
  // args.accessToken
  // args.accountId
  // args.envelopeId

  //ds-snippet-start:eSign15Step2
  let dsApiClient = new docusign.ApiClient();
  dsApiClient.setBasePath(args.basePath);
  dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + args.accessToken);
  let envelopesApi = new docusign.EnvelopesApi(dsApiClient);
    let results = null;
  //ds-snippet-end:eSign15Step2

  // Step 1. Call EnvelopeFormData::get
  // Exceptions will be caught by the calling function
  //ds-snippet-start:eSign15Step3
  results = await envelopesApi.getFormData(args.accountId, args.envelopeId, (error, data, response) => {
      const headers = response?.headers;

      const remaining = headers?.['x-ratelimit-remaining'];
      const reset = headers?.['x-ratelimit-reset'];

      if (remaining && reset) {
        const resetInstant = new Date(Number(reset) * 1000);

        console.log(`API calls remaining: ${remaining}`);
        console.log(`Next Reset: ${resetInstant.toISOString()}`);
      }
  });
  //ds-snippet-end:eSign15Step3
  return results.data;
};

module.exports = { getEnvelopeFormData };
