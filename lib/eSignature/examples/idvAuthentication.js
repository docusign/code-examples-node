/**
 * @file
 * Example 023: ID Verification authentication
 * @author DocuSign
 */
const fs = require("fs-extra");
const docusign = require("docusign-esign");

/**
 * This function does the work of creating the envelope
 */
const idvAuthentication = async (args) => {
  // Construct your API headers
  //ds-snippet-start:eSign23Step2
  let dsApiClient = new docusign.ApiClient();
  dsApiClient.setBasePath(args.basePath);
  dsApiClient.addDefaultHeader("Authorization", "Bearer " + args.accessToken);
  //ds-snippet-end:eSign23Step2

  // Obtain your workflowId
  //ds-snippet-start:eSign23Step3
  let accountsApi = new docusign.AccountsApi(dsApiClient);
  let workflowId = null;

  let results = await accountsApi.getAccountIdentityVerification(
    args.accountId
  );

  // Find the workflow ID corresponding to the name "DocuSign ID Verification"
  results.identityVerification.forEach(workflow => {
    if (workflow.defaultName === "DocuSign ID Verification") {
      workflowId = workflow.workflowId
    }
  });
  //ds-snippet-end:eSign23Step3

  if (workflowId === null) {
    throw new Error("IDENTITY_WORKFLOW_INVALID_ID");
  }

  args.envelopeArgs.workflowId = workflowId;

  // Construct your envelope JSON body
  //ds-snippet-start:eSign23Step4
  let envelope = makeEnvelope(args.envelopeArgs);
  //ds-snippet-end:eSign23Step4

  // Call the eSignature REST API
  //ds-snippet-start:eSign23Step5
  let envelopesApi = new docusign.EnvelopesApi(dsApiClient);
  results = await envelopesApi.createEnvelope(args.accountId, {
    envelopeDefinition: envelope,
  });
  //ds-snippet-end:eSign23Step5

  return results;
};

/**
 * Creates envelope
 * @function
 * @param {Object} args parameters for the envelope:
 * @returns {Envelope} An envelope definition
 * @private
 */
//ds-snippet-start:eSign23Step4
function makeEnvelope(args) {
  // Data for this method
  // args.signerEmail
  // args.signerName
  // docFile 

  // document 1 (pdf) has tag /sn1/
  //
  // The envelope has one recipients.
  // recipient 1 - signer

  let docPdfBytes;
  // read file from a local directory
  // The read could raise an exception if the file is not available!
  docPdfBytes = fs.readFileSync(args.docFile);

  // Create the envelope definition
  let env = new docusign.EnvelopeDefinition();
  env.emailSubject = "Please sign";
  env.emailBlurb = "Sample text for email body";
  env.status = "Sent";

  // Add a document
  let doc1 = new docusign.Document(),
    doc1b64 = Buffer.from(docPdfBytes).toString("base64");
  doc1.documentBase64 = doc1b64;
  doc1.name = "Lorem"; // can be different from actual file name
  doc1.fileExtension = "pdf";
  doc1.documentId = "1";

  env.documents = [doc1];

  // Create signHere fields (also known as tabs) on the documents,
  // We're using anchor (autoPlace) positioning
  let signHere1 = docusign.SignHere.constructFromObject({
    anchorString: "/sn1/",
    anchorYOffset: "10",
    anchorUnits: "pixels",
    anchorXOffset: "20",
  });
  // Tabs are set per recipient / signer
  let signer1Tabs = docusign.Tabs.constructFromObject({
    signHereTabs: [signHere1],
  });

  // A 1- to 8-digit integer or 32-character GUID to match recipient IDs on your own systems.
  // This value is referenced in the Tabs element below to assign tabs on a per-recipient basis.
  RecipientId = "1"; // represents your {RECIPIENT_ID}

  let signer1 = docusign.Signer.constructFromObject({
    email: args.signerEmail,
    name: args.signerName,
    recipientId: RecipientId,
    routingOrder: "1",
    deliveryMethod: "Email",
    tabs: signer1Tabs,
    identityVerification: { workflowId: args.workflowId, steps: null },
  });

  // Add the recipient to the envelope object
  let recipients = docusign.Recipients.constructFromObject({
    signers: [signer1],
  });
  env.recipients = recipients;

  return env;
}
//ds-snippet-end:eSign23Step4

module.exports = { idvAuthentication };
