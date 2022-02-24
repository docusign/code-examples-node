/**
 * @file
 * Example 34: Use conditional recipients
 * @author DocuSign
 */

const fs = require("fs-extra");
const docusign = require("docusign-esign");

/**
 * Work with creating of the envelope
 * @param {Object} args Arguments for creating envelope
 * @return {Object} The object with value of envelopeId or error
 */
const useConditionalRecipients = async (args) => {
  // Step 1. Construct your API headers
  let dsApiClient = new docusign.ApiClient();
  dsApiClient.setBasePath(args.basePath);
  dsApiClient.addDefaultHeader("Authorization", "Bearer " + args.accessToken);

  const envelopeDefinition = makeEnvelope(args.envelopeArgs);

  // Step 3. Call the eSignature API
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
const makeEnvelope = (args) => {
  // Step 2. Construct the request body

  // Read and encode file. Put encoded value to Document entity.
  // The reads could raise an exception if the file is not available!
  const documentTxtExample = fs.readFileSync(args.docFile);
  const encodedExampleDocument =
    Buffer.from(documentTxtExample).toString("base64");
  const document = docusign.Document.constructFromObject({
    documentBase64: encodedExampleDocument,
    name: "Welcome",
    fileExtension: "txt",
    documentId: 1
  });

  // Create signHere fields (also known as tabs) on the documents
  const signHere1 = docusign.SignHere.constructFromObject({
    documentId: 1,
    pageNumber: 1,
    tabLabel: "Sign Here",
    xPosition: 200,
    yPosition: 200
  });
  const signHere2 = docusign.SignHere.constructFromObject({
    documentId: 1,
    pageNumber: 1,
    tabLabel: " Sign Here",
    recipientId: 2,
    xPosition: 300,
    yPosition: 200
  });

  // Create checkbox field on the documents
  const checkbox = docusign.Checkbox.constructFromObject({
    documentId: 1,
    pageNumber: 1,
    name: "ClickToApprove",
    selected: false,
    tabLabel: "ApproveWhenChecked",
    xPosition: 50,
    yPosition: 50
  });

  // Create the signer recipient models
  // Also add the tabs model (including the sign_here tabs) to the signer
  const signer1 = docusign.Signer.constructFromObject({
    email: args["signer1Email"],
    name: args["signer1Name"],
    recipientId: 1,
    routingOrder: 1,
    roleName: "Purchaser",
    tabs: docusign.Tabs.constructFromObject({
      signHereTabs: [signHere1],
      checkboxTabs: [checkbox]
    })
  });
  const signer2 = docusign.Signer.constructFromObject({
    name: "Approver",
    recipientId: 2,
    routingOrder: 2,
    roleName: "Approver",
    tabs: docusign.Tabs.constructFromObject({
      signHereTabs: [signHere2]
    })
  });

  const recipients = docusign.Recipients.constructFromObject({
    signers: [signer1, signer2]
  });

  // Create recipientOption and recipientGroup models
  const signer2a = docusign.RecipientOption.constructFromObject({
    email: args["signer2aEmail"],
    name: args["signer2aName"],
    roleName: "Signer when not checked",
    recipientLabel: "signer2a"
  });
  const signer2b = docusign.RecipientOption.constructFromObject({
    email: args["signer2bEmail"],
    name: args["signer2bName"],
    roleName: "Signer when checked",
    recipientLabel: "signer2b"
  });
  const recipientGroup = docusign.RecipientGroup.constructFromObject({
    groupName: "Approver",
    groupMessage: "Members of this group approve a workflow",
    recipients: [signer2a, signer2b]
  });

  // Create conditionalRecipientRuleFilter models
  const filter1 = docusign.ConditionalRecipientRuleFilter.constructFromObject({
    scope: "tabs",
    recipientId: 1,
    tabId: "ApprovalTab",
    operator: "equals",
    value: false,
    tabLabel: "ApproveWhenChecked",
    tabType: "checkbox"
  });
  const filter2 = docusign.ConditionalRecipientRuleFilter.constructFromObject({
    scope: "tabs",
    recipientId: 1,
    tabId: "ApprovalTab",
    operator: "equals",
    value: true,
    tabLabel: "ApproveWhenChecked",
    tabType: "checkbox"
  });

  // Create conditionalRecipientRuleCondition models
  const condition1 =
    docusign.ConditionalRecipientRuleCondition.constructFromObject({
      filters: [filter1],
      order: 1,
      recipientLabel: "signer2a"
    });
  const condition2 =
    docusign.ConditionalRecipientRuleCondition.constructFromObject({
      filters: [filter2],
      order: 2,
      recipientLabel: "signer2b"
    });

  // Create conditionalRecipientRule model
  const conditionalRecipient =
    docusign.ConditionalRecipientRule.constructFromObject({
      conditions: [condition1, condition2],
      recipientGroup: recipientGroup,
      recipientId: 2,
      order: 0
    });

  // Create recipientRouting model
  const recipientRouting = docusign.RecipientRouting.constructFromObject({
    rules: docusign.RecipientRules.constructFromObject({
      conditionalRecipients: [conditionalRecipient]
    })
  });

  // Create a workflow model
  const workflowStep = docusign.WorkflowStep.constructFromObject({
    action: "pause_before",
    triggerOnItem: "routing_order",
    itemId: 2,
    status: "pending",
    recipientRouting: recipientRouting
  });
  const workflow = docusign.Workflow.constructFromObject({
    workflowSteps: [workflowStep]
  });

  // Request that the envelope be sent by setting status to "sent".
  // To request that the envelope be created as a draft, set status to "created"
  return docusign.EnvelopeDefinition.constructFromObject({
    emailSubject: "EnvelopeWorkflowTest",
    documents: [document],
    status: args.status,
    workflow,
    recipients
  });
}

module.exports = { useConditionalRecipients };
