/**
 * @file
 * Example 32: Pause a signature workflow
 * @author DocuSign
 */

const fs = require("fs-extra");
const docusign = require("docusign-esign");

/**
 * Work with creating of the envelope
 * @param {Object} args Arguments for creating envelope
 * @return {Object} The object with value of envelopeId or error
 */
const pauseSignatureWorkflow = async (args) => {
  // Step 1. Construct your API headers
  let dsApiClient = new docusign.ApiClient();
  dsApiClient.setBasePath(args.basePath);
  dsApiClient.addDefaultHeader("Authorization", "Bearer " + args.accessToken);

  const envelopeDefinition = makeEnvelop(args.envelopeArgs);

  // Step 2. Call the eSignature API
  // Exceptions will be caught by the calling function
  const envelopesApi = new docusign.EnvelopesApi(dsApiClient);
  const envelope = await envelopesApi.createEnvelope(args.accountId, {
    envelopeDefinition,
  });

  const { envelopeId } = envelope;
  console.log(`Envelope was created. EnvelopeId ${envelopeId}`);
  return { envelopeId };
};

/**
 * Creates envelope
 * @function
 * @param {Object} args The parameter for envelope definition
 * @return {docusign.EnvelopeDefinition} The envelope definition
 */
const makeEnvelop = (args) => {
  // Step 3. Construct the request body

  // Read and encode file. Put encoded value to Document entity.
  // The reads could raise an exception if the file is not available!
  const documentTxtExample = fs.readFileSync(args.docFile);
  const encodedExampleDocument =
    Buffer.from(documentTxtExample).toString("base64");
  const document = docusign.Document.constructFromObject({
    documentBase64: encodedExampleDocument,
    name: "Welcome",
    fileExtension: "txt",
    documentId: 1,
  });

  // Create signHere fields (also known as tabs) on the documents
  const signHere1 = docusign.SignHere.constructFromObject({
    documentId: 1,
    pageNumber: 1,
    tabLabel: "Sign Here",
    xPosition: 200,
    yPosition: 200,
  });
  const signHere2 = docusign.SignHere.constructFromObject({
    documentId: 1,
    pageNumber: 1,
    tabLabel: " Sign Here",
    xPosition: 300,
    yPosition: 200,
  });

  // Create the signer recipient models
  // routingOrder (lower means earlier) determines the order of deliveries
  // to the recipients.
  // Also add the tabs model (including the sign_here tabs) to the signer
  const signer1 = docusign.Signer.constructFromObject({
    email: args["signer1Email"],
    name: args["signer1Name"],
    recipientId: 1,
    routingOrder: 1,
    tabs: docusign.Tabs.constructFromObject({
      signHereTabs: [signHere1],
    }),
  });
  const signer2 = docusign.Signer.constructFromObject({
    email: args["signer2Email"],
    name: args["signer2Name"],
    recipientId: 2,
    routingOrder: 2,
    tabs: docusign.Tabs.constructFromObject({
      signHereTabs: [signHere2],
    }),
  });

  // The envelope has two recipients: recipient 1 - signer1 and recipient 2 - signer2.
  // The envelope will be sent first to the signer1.
  // After it is signed, a signature workflow will be paused.
  // After resuming (unpause) the signature workflow will send to the second recipient
  const recipients = docusign.Recipients.constructFromObject({
    signers: [signer1, signer2],
  });

  // Create a workflow model
  // Signature workflow will be paused after it is signed by the first signer
  const workflowStep = docusign.WorkflowStep.constructFromObject({
    action: "pause_before",
    triggerOnItem: "routing_order",
    itemId: 2,
  });
  const workflow = docusign.Workflow.constructFromObject({
    workflowSteps: [workflowStep],
  });

  // Put our created values (document, status, workflow, recipients)
  // to our EnvelopeDefinition object.
  // Request that the envelope be sent by setting status to "sent".
  // To request that the envelope be created as a draft, set status to "created"
  return docusign.EnvelopeDefinition.constructFromObject({
    emailSubject: "EnvelopeWorkflowTest",
    documents: [document],
    status: args.status,
    workflow,
    recipients,
  });
};

module.exports = { pauseSignatureWorkflow };
