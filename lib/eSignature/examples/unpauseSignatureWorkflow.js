/**
 * @file
 * Example 33: Unpause a signature workflow
 * @author DocuSign
 */

const docusign = require('docusign-esign');

/**
 * Work with creating of the envelope
 * @param {Object} args Arguments for creating envelope
 * @return {Object} The object with value of envelopeId or error
 */
const unpauseSignatureWorkflow = async (args) => {
  // Step 1. Construct your API headers
  //ds-snippet-start:eSign33Step2
  let dsApiClient = new docusign.ApiClient();
  dsApiClient.setBasePath(args.basePath);
  dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + args.accessToken);
  //ds-snippet-end:eSign33Step2

  // Step 2. Construct the request body
  //ds-snippet-start:eSign33Step3
  const workflow = docusign.Workflow.constructFromObject({
    workflowStatus: 'in_progress',
  });
  const envelopeDefinition = docusign.EnvelopeDefinition.constructFromObject({
    workflow,
  });
  //ds-snippet-end:eSign33Step3

  // Step 3. Call the eSignature API
  // Exceptions will be caught by the calling function
  //ds-snippet-start:eSign33Step4
  const envelopesApi = new docusign.EnvelopesApi(dsApiClient);
  const result = await envelopesApi.update(args.accountId, args.envelopeId, {
    envelopeDefinition,
    resendEnvelope: true,
  }, (error, data, response) => {
      const headers = response?.headers;

      const remaining = headers?.['x-ratelimit-remaining'];
      const reset = headers?.['x-ratelimit-reset'];

      if (remaining && reset) {
        const resetInstant = new Date(Number(reset) * 1000);

        console.log(`API calls remaining: ${remaining}`);
        console.log(`Next Reset: ${resetInstant.toISOString()}`);
      }
  });
  //ds-snippet-end:eSign33Step4

  return { envelopeId: result.data.envelopeId };
};

module.exports = { unpauseSignatureWorkflow };
