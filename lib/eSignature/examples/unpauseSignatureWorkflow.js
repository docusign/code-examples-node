/**
 * @file
 * Example 33: Unpause a signature workflow
 * @author DocuSign
 */

const docusign = require("docusign-esign");

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
  dsApiClient.addDefaultHeader("Authorization", "Bearer " + args.accessToken);
  //ds-snippet-end:eSign33Step2

  // Step 2. Construct the request body
  //ds-snippet-start:eSign33Step3
  const workflow = docusign.Workflow.constructFromObject({
    workflowStatus: "in_progress",
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
  });
  //ds-snippet-end:eSign33Step4

  return { envelopeId: result.envelopeId };
};

module.exports = { unpauseSignatureWorkflow };
