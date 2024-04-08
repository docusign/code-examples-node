/**
 * @file
 * Example 042: Request a signature by email with document generation
 * @author DocuSign
 */

const fs = require('fs-extra');
const docusign = require('docusign-esign');

/**
 * This function does the work of creating the envelope with document generation
 */
const sendEnvelope = async (args) => {
  const dsApiClient = new docusign.ApiClient();
  dsApiClient.setBasePath(args.basePath);
  dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + args.accessToken);
  const templatesApi = new docusign.TemplatesApi(dsApiClient);
  const envelopesApi = new docusign.EnvelopesApi(dsApiClient);

  const accountId = args.accountId;
  const envelopeArgs = args.envelopeArgs;

  //ds-snippet-start:eSign42Step2
  const templateData = makeTemplate();
  const template = await templatesApi.createTemplate(accountId, { envelopeTemplate: templateData });
  const templateId = template.templateId;
  //ds-snippet-end:eSign42Step2

  //ds-snippet-start:eSign42Step3
  const documentData = templateDocument(envelopeArgs);
  const documentId = '1';
  await templatesApi.updateDocument(accountId, templateId, documentId, { envelopeDefinition: documentData });
  //ds-snippet-end:eSign42Step3

  //ds-snippet-start:eSign42Step4
  const tabs = recipientTabs(envelopeArgs);
  const recipientId = '1';
  await templatesApi.createTabs(accountId, templateId, recipientId, { templateTabs: tabs });
  //ds-snippet-end:eSign42Step4

  //ds-snippet-start:eSign42Step5
  const envelopeData = makeEnvelope(templateId, envelopeArgs);
  const envelope = await envelopesApi.createEnvelope(accountId, { envelopeDefinition: envelopeData });
  const envelopeId = envelope.envelopeId;
  //ds-snippet-end:eSign42Step5

  //ds-snippet-start:eSign42Step6
  const docGenFormFieldsResponse = await envelopesApi.getEnvelopeDocGenFormFields(accountId, envelopeId);
  const documentIdGuid = docGenFormFieldsResponse.docGenFormFields[0].documentId;
  //ds-snippet-end:eSign42Step6

  //ds-snippet-start:eSign42Step7
  const formFieldsData = formFields(documentIdGuid, envelopeArgs);
  await envelopesApi.updateEnvelopeDocGenFormFields(accountId, envelopeId, { docGenFormFieldRequest: formFieldsData });
  //ds-snippet-end:eSign42Step7

  //ds-snippet-start:eSign42Step8
  const sendEnvelopeReq = docusign.Envelope.constructFromObject({
    status: 'sent',
  });
  return await envelopesApi.update(accountId, envelopeId, { envelope: sendEnvelopeReq });
  //ds-snippet-end:eSign42Step8
};

/**
 * Creates envelope template object
 * @returns {docusign.EnvelopeTemplate} Template object
 */
//ds-snippet-start:eSign42Step2
const makeTemplate = () => {
  const signer = docusign.Signer.constructFromObject({
    roleName: 'signer',
    recipientId: '1',
    routingOrder: '1',
  });
  const recipients = docusign.Recipients.constructFromObject({
    signers: [signer]
  });

  // create the envelope template model
  const templateRequest = docusign.EnvelopeTemplate.constructFromObject({
    name: 'Example document generation template',
    description: 'Example template created via the API',
    emailSubject: 'Please sign this document',
    shared: 'false',
    recipients: recipients,
    status: 'created'
  });

  return templateRequest;
};
//ds-snippet-end:eSign42Step2

/**
 * Creates an envelope definition with document
 * @param {object} args Parameters for the envelope
 * @returns {docusign.EnvelopeDefinition} An envelope definition with document
 */
//ds-snippet-start:eSign42Step3
const templateDocument = (args) => {
  // read file
  const docBytes = fs.readFileSync(args.docFile);

  // create the document object
  const document = docusign.Document.constructFromObject({
    documentBase64: Buffer.from(docBytes).toString('base64'),
    name: 'OfferLetterDemo.docx',
    fileExtension: 'docx',
    documentId: 1,
    order: 1,
    pages: 1,
  });

  const envelopeDefinition = docusign.EnvelopeDefinition.constructFromObject({
    documents: [document],
  });

  return envelopeDefinition;
};
//ds-snippet-end:eSign42Step3

/**
 * Creates recipient tabs
 * @returns {docusign.Tabs} Recipient tabs
 */
//ds-snippet-start:eSign42Step4
const recipientTabs = () => {
  const signHere = docusign.SignHere.constructFromObject({
    anchorString: 'Employee Signature',
    anchorUnits: 'pixels',
    anchorXOffset: '5',
    anchorYOffset: '-22'
  });

  const dateSigned = docusign.DateSigned.constructFromObject({
    anchorString: 'Date',
    anchorUnits: 'pixels',
    anchorYOffset: '-22'
  });

  const tabs = docusign.Tabs.constructFromObject({
    signHereTabs: [signHere],
    dateSignedTabs: [dateSigned]
  });

  return tabs;
};
//ds-snippet-end:eSign42Step4

/**
 * Creates draft envelope
 * @param {string} templateId Template ID
 * @param {object} args Parameters for the envelope
 * @returns {docusign.EnvelopeDefinition} Draft envelope
 */
//ds-snippet-start:eSign42Step5
const makeEnvelope = (templateId, args) => {
  // create the signer model
  const signer = docusign.TemplateRole.constructFromObject({
    email: args.candidateEmail,
    name: args.candidateName,
    roleName: 'signer'
  });

  // create the envelope model
  const envelopeDefinition = docusign.EnvelopeDefinition.constructFromObject({
    templateRoles: [signer],
    status: 'created',
    templateId: templateId
  });

  return envelopeDefinition;
};
//ds-snippet-end:eSign42Step5

/**
 * Creates document generation form field request
 * @param {string} documentId Document ID
 * @param {object} args Parameters for the envelope
 * @returns {docusign.DocGenFormFieldRequest} Document generation form field request
 */
//ds-snippet-start:eSign42Step7
const formFields = (documentId, args) => {
  const docGenFormFieldRequest = {
    docGenFormFields: [
      {
        documentId: documentId,
        docGenFormFieldList: [
          docusign.DocGenFormField.constructFromObject({
            name: 'Candidate_Name',
            value: args.candidateName
          }),
          docusign.DocGenFormField.constructFromObject({
            name: 'Manager_Name',
            value: args.managerName
          }),
          docusign.DocGenFormField.constructFromObject({
            name: 'Job_Title',
            value: args.jobTitle
          }),
          docusign.DocGenFormField.constructFromObject({
            name: 'Start_Date',
            value: args.startDate
          }),
          {
            name: 'Compensation_Package',
            type: 'TableRow',
            rowValues: [
              {
                docGenFormFieldList: [
                  {
                    name: 'Compensation_Component',
                    value: 'Salary'
                  },
                  {
                    name: 'Details',
                    value: args.salary
                  }
                ]
              },
              {
                docGenFormFieldList: [
                  {
                    name: 'Compensation_Component',
                    value: 'Bonus'
                  },
                  {
                    name: 'Details',
                    value: 'You will be eligible for a bonus of up to 20 percent based on your performance.'
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  };

  return docGenFormFieldRequest;
};
//ds-snippet-end:eSign42Step7

module.exports = { sendEnvelope };
