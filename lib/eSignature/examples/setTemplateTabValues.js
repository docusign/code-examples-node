/**
 * @file
 * Example 017: Set template tab (field) values and an envelope custom field value
 * @author DocuSign
 */

const docusign = require("docusign-esign");

/**
 * This function does the work of creating the envelope
 * @param {object} args
 */
const setTemplateTabValues = async (args) => {
  // Data for this method
  // args.basePath
  // args.accessToken
  // args.accountId
  // args.envelopeArgs.signerEmail
  // args.envelopeArgs.signerName
  // args.envelopeArgs.signerClientId
  // args.envelopeArgs.dsReturnUrl

  // 1. Create envelope definition
  let envelopeArgs = args.envelopeArgs,
    envelopeDefinition = makeEnvelope(envelopeArgs);

  // 2. Create the envelope
  let dsApiClient = new docusign.ApiClient();
  dsApiClient.setBasePath(args.basePath);
  dsApiClient.addDefaultHeader("Authorization", "Bearer " + args.accessToken);
  let envelopesApi = new docusign.EnvelopesApi(dsApiClient),
    results = await envelopesApi.createEnvelope(args.accountId, {
      envelopeDefinition: envelopeDefinition,
    }),
    envelopeId = results.envelopeId;
  // 3. create the recipient view, the embedded signing
  let viewRequest = docusign.RecipientViewRequest.constructFromObject({
    returnUrl: envelopeArgs.dsReturnUrl,
    authenticationMethod: "none",
    email: envelopeArgs.signerEmail,
    userName: envelopeArgs.signerName,
    clientUserId: envelopeArgs.signerClientId,
  });

  // 4. Call the CreateRecipientView API
  // Exceptions will be caught by the calling function
  results = await envelopesApi.createRecipientView(args.accountId, envelopeId, {
    recipientViewRequest: viewRequest,
  });

  return { envelopeId: envelopeId, redirectUrl: results.url };
};

/**
 * Creates envelope from the template
 * @function
 * @param {Object} args
 * @returns {Envelope} An envelope definition
 * @private
 */
function makeEnvelope(args) {
  // Data for this method
  // args.signerEmail
  // args.signerName
  // args.signerClientId
  // args.ccEmail
  // args.ccName
  // args.templateId

  // The envelope has two recipients.
  // recipient 1 - signer
  // recipient 2 - cc
  // This method sets values for many of the template's tabs.
  // It also adds a new tab, and adds a custom metadata field

  // create the envelope definition with the template id
  let envelopeDefinition = docusign.EnvelopeDefinition.constructFromObject({
    templateId: args.templateId,
    status: "sent",
  });

  // Set the values for the fields in the template
  // List item
  let list1 = docusign.List.constructFromObject({
    value: "green",
    documentId: "1",
    pageNumber: "1",
    tabLabel: "list",
  });

  // Checkboxes
  let check1 = docusign.Checkbox.constructFromObject({
      tabLabel: "ckAuthorization",
      selected: "true",
    }),
    check3 = docusign.Checkbox.constructFromObject({
      tabLabel: "ckAgreement",
      selected: "true",
    });
  // The NOde.js SDK has a bug so it cannot create a Number tab at this time.
  //number1 = docusign.Number.constructFromObject({
  //    tabLabel: "numbersOnly", value: '54321'});
  let radioGroup = docusign.RadioGroup.constructFromObject({
    groupName: "radio1",
    // You only need to provide the radio entry for the entry you're selecting
    radios: [
      docusign.Radio.constructFromObject({ value: "white", selected: "true" }),
    ],
  });
  let text = docusign.Text.constructFromObject({
    tabLabel: "text",
    value: "Jabberwocky!",
  });

  // We can also add a new tab (field) to the ones already in the template:
  let textExtra = docusign.Text.constructFromObject({
    document_id: "1",
    page_number: "1",
    x_position: "280",
    y_position: "172",
    font: "helvetica",
    font_size: "size14",
    tab_label: "added text field",
    height: "23",
    width: "84",
    required: "false",
    bold: "true",
    value: args.signerName,
    locked: "false",
    tab_id: "name",
  });

  // Pull together the existing and new tabs in a Tabs object:
  let tabs = docusign.Tabs.constructFromObject({
    checkboxTabs: [check1, check3], // numberTabs: [number1],
    radioGroupTabs: [radioGroup],
    textTabs: [text, textExtra],
    listTabs: [list1],
  });
  // Create the template role elements to connect the signer and cc recipients
  // to the template
  let signer = docusign.TemplateRole.constructFromObject({
    email: args.signerEmail,
    name: args.signerName,
    roleName: "signer",
    clientUserId: args.signerClientId, // change the signer to be embedded
    tabs: tabs, // Set tab values
  });
  // Create a cc template role.
  let cc = docusign.TemplateRole.constructFromObject({
    email: args.ccEmail,
    name: args.ccName,
    roleName: "cc",
  });
  // Add the TemplateRole objects to the envelope object
  envelopeDefinition.templateRoles = [signer, cc];
  // Create an envelope custom field to save the our application's
  // data about the envelope
  let customField = docusign.TextCustomField.constructFromObject({
      name: "app metadata item",
      required: "false",
      show: "true", // Yes, include in the CoC
      value: "1234567",
    }),
    customFields = docusign.CustomFields.constructFromObject({
      textCustomFields: [customField],
    });
  envelopeDefinition.customFields = customFields;

  return envelopeDefinition;
}

module.exports = { setTemplateTabValues };
