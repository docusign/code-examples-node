/**
 * @file
 * Example 009: Send envelope using a template
 * @author DocuSign
 */

const docusign = require("docusign-esign");

/**
 * This function does the work of creating the envelope
 * @param {object} args object
 */
const sendEnvelopeFromTemplate = async (args) => {
  // Data for this method
  // args.basePath
  // args.accessToken
  // args.accountId

  let dsApiClient = new docusign.ApiClient();
  dsApiClient.setBasePath(args.basePath);
  dsApiClient.addDefaultHeader("Authorization", "Bearer " + args.accessToken);
  let envelopesApi = new docusign.EnvelopesApi(dsApiClient);

  // Step 1. Make the envelope request body
  let envelope = makeEnvelope(args.envelopeArgs);

  // Step 2. call Envelopes::create API method
  // Exceptions will be caught by the calling function
  let results = await envelopesApi.createEnvelope(args.accountId, {
    envelopeDefinition: envelope,
  });

  return results;
};

/**
 * Creates envelope from the template
 * @function
 * @param {Object} args object
 * @returns {Envelope} An envelope definition
 * @private
 */
function makeEnvelope(args) {
  // Data for this method
  // args.signerEmail
  // args.signerName
  // args.ccEmail
  // args.ccName
  // args.templateId

  // The envelope has two recipients.
  // recipient 1 - signer
  // recipient 2 - cc

  // create the envelope definition
  let env = new docusign.EnvelopeDefinition();
  env.templateId = args.templateId;

  // Create template role elements to connect the signer and cc recipients
  // to the template
  // We're setting the parameters via the object creation
  let signer1 = docusign.TemplateRole.constructFromObject({
    email: args.signerEmail,
    name: args.signerName,
    roleName: "signer",
  });

  // Create a cc template role.
  // We're setting the parameters via setters
  let cc1 = new docusign.TemplateRole();
  cc1.email = args.ccEmail;
  cc1.name = args.ccName;
  cc1.roleName = "cc";

  // Add the TemplateRole objects to the envelope object
  env.templateRoles = [signer1, cc1];
  env.status = "sent"; // We want the envelope to be sent

  return env;
}

module.exports = { sendEnvelopeFromTemplate };
