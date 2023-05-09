/**
 * @file
 * Example 042: Request a signature by email with document generation
 * @author DocuSign
 */

const fs = require("fs-extra");
const docusign = require("docusign-esign");

/**
 * This function does the work of creating the envelope with document generation
 */
const sendEnvelope = async (args) => {
  const dsApiClient = new docusign.ApiClient();
  dsApiClient.setBasePath(args.basePath);
  dsApiClient.addDefaultHeader("Authorization", "Bearer " + args.accessToken);
  const templatesApi = new docusign.TemplatesApi(dsApiClient);
  const envelopesApi = new docusign.EnvelopesApi(dsApiClient);

  const accountId = args.accountId;
  const envelopeArgs = args.envelopeArgs;

  // Step 1. Create the template
  const templateData = makeTemplate();
  const template = await templatesApi.createTemplate(accountId, { envelopeTemplate: templateData });
  const templateId = template.templateId;

  // Step 2. Update template document
  const documentData = templateDocument(envelopeArgs);
  const documentId = '1';
  await templatesApi.updateDocument(accountId, templateId, documentId, { envelopeDefinition: documentData });

  // Step 3. Update recipient tabs
  const tabs = recipientTabs(envelopeArgs);
  const recipientId = '1';
  await templatesApi.createTabs(accountId, templateId, recipientId, { templateTabs: tabs });

  // Step 4. Create draft envelope
  const envelopeData = makeEnvelope(templateId, envelopeArgs);
  const envelope = await envelopesApi.createEnvelope(accountId, { envelopeDefinition: envelopeData });
  const envelopeId = envelope.envelopeId;

  // Step 5. Get the document id
  const docGenFormFieldsResponse = await envelopesApi.getEnvelopeDocGenFormFields(accountId, envelopeId);
  const documentIdGuid = docGenFormFieldsResponse.docGenFormFields[0].documentId;

  // Step 6. Merge the data fields
  const formFieldsData = formFields(documentIdGuid, envelopeArgs);
  await envelopesApi.updateEnvelopeDocGenFormFields(accountId, envelopeId, { docGenFormFieldRequest: formFieldsData });

  // Step 7. Send the envelope
  const sendEnvelopeReq = docusign.Envelope.constructFromObject({
    status: 'sent',
  });
  return await envelopesApi.update(accountId, envelopeId, { envelope: sendEnvelopeReq })
  
};

/**
 * Creates envelope template object
 * @returns {docusign.EnvelopeTemplate} Template object
 */
const makeTemplate = () => {
  const signer = docusign.Signer.constructFromObject({
    roleName: "signer",
    recipientId: "1",
    routingOrder: "1",
  });
  const recipients = docusign.Recipients.constructFromObject({
    signers: [signer]
  });

  // create the envelope template model
  const templateRequest = docusign.EnvelopeTemplate.constructFromObject({
    name: "Example document generation template",
    description: "Example template created via the API",
    emailSubject: "Please sign this document",
    shared: "false",
    recipients: recipients,
    status: "created"
  });

  return templateRequest;
};

/**
 * Creates an envelope definition with document 
 * @param {object} args Parameters for the envelope
 * @returns {docusign.EnvelopeDefinition} An envelope definition with document
 */
const templateDocument = (args) => {
  // read file
  const docBytes = fs.readFileSync(args.docFile);

  // create the document object
  const document = docusign.Document.constructFromObject({
    documentBase64: Buffer.from(docBytes).toString("base64"),
    name: "OfferLetterDemo.docx",
    fileExtension: "docx",
    documentId: 1,
    order: 1,
    pages: 1,
  });

  const envelopeDefinition = docusign.EnvelopeDefinition.constructFromObject({
    documents: [document],
  });

  return envelopeDefinition
};

/**
 * Creates recipient tabs
 * @returns {docusign.Tabs} Recipient tabs
 */
const recipientTabs = () => {
  const signHere = docusign.SignHere.constructFromObject({
    anchorString: "Employee Signature",
    anchorUnits: "pixels",
    anchorXOffset: "5",
    anchorYOffset: "-22"
  });

  const dateSigned = docusign.DateSigned.constructFromObject({
    anchorString: "Date",
    anchorUnits: "pixels",
    anchorYOffset: "-22"
  });

  const tabs = docusign.Tabs.constructFromObject({
    signHereTabs: [signHere],
    dateSignedTabs: [dateSigned]
  });
  
  return tabs;
};

/**
 * Creates draft envelope
 * @param {string} templateId Template ID
 * @param {object} args Parameters for the envelope
 * @returns {docusign.EnvelopeDefinition} Draft envelope
 */
const makeEnvelope = (templateId, args) => {
  // create the signer model
  const signer = docusign.TemplateRole.constructFromObject({
    email: args.candidateEmail,
    name: args.candidateName,
    roleName: "signer"
  });

  // create the envelope model
  const envelopeDefinition = docusign.EnvelopeDefinition.constructFromObject({
    templateRoles: [signer],
    status: "created",
    templateId: templateId
  });

  return envelopeDefinition;
};

/**
 * Creates document generation form field request
 * @param {string} documentId Document ID 
 * @param {object} args Parameters for the envelope
 * @returns {docusign.DocGenFormFieldRequest} Document generation form field request
 */
const formFields = (documentId, args) => {
  const docGenFormFieldRequest = docusign.DocGenFormFieldRequest.constructFromObject({
    docGenFormFields: [
      docusign.DocGenFormFields.constructFromObject({
        documentId: documentId,
        docGenFormFieldList: [
          docusign.DocGenFormField.constructFromObject({
            name: "Candidate_Name",
            value: args.candidateName
          }),
          docusign.DocGenFormField.constructFromObject({
            name: "Manager_Name",
            value: args.managerName
          }),
          docusign.DocGenFormField.constructFromObject({
            name: "Job_Title",
            value: args.jobTitle
          }),
          docusign.DocGenFormField.constructFromObject({
            name: "Salary",
            value: args.salary
          }),
          docusign.DocGenFormField.constructFromObject({
            name: "Start_Date",
            value: args.startDate
          }),
        ]
      })
    ]
  });

  return docGenFormFieldRequest;
};

module.exports = { sendEnvelope };
