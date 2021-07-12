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
  let dsApiClient = new docusign.ApiClient();
  dsApiClient.setBasePath(args.basePath);
  dsApiClient.addDefaultHeader("Authorization", "Bearer " + args.accessToken);

  // Step 2. Construct the request body
  const workflow = docusign.Workflow.constructFromObject({
    workflowStatus: "in_progress",
  });
  const envelopeDefinition = docusign.EnvelopeDefinition.constructFromObject({
    workflow,
  });

  // Step 3. Call the eSignature API
  // Exceptions will be caught by the calling function
  const envelopesApi = new docusign.EnvelopesApi(dsApiClient);
  const result = await envelopesApi.update(args.accountId, args.envelopeId, {
    envelopeDefinition,
    resendEnvelope: true,
  });

  return { envelopeId: result.envelopeId };
};

module.exports = { unpauseSignatureWorkflow };
