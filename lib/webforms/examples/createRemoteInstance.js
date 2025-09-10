/**
 * @file
 * Example 002: Create a remote instance of a Web Form
 * @author DocuSign
 */

const docusignEsign = require('docusign-esign');
const docusignWebForms = require('docusign-webforms');
const fs = require('fs-extra');

const createWebFormTemplate = async (args) => {
  //ds-snippet-start:WebForms2Step2
  const apiClient = new docusignEsign.ApiClient();
  apiClient.setBasePath(args.basePath);
  apiClient.addDefaultHeader('Authorization', 'Bearer ' + args.accessToken);
  //ds-snippet-end:WebForms2Step2

  //ds-snippet-start:WebForms2Step3
  const templatesApi = new docusignEsign.TemplatesApi(apiClient);

  const webFormsTemplates = await templatesApi.listTemplates(args.accountId, {
    searchText: args.templateName,
  });

  if (webFormsTemplates.resultSetSize > 0) {
    return webFormsTemplates.envelopeTemplates[0].templateId;
  }
  //ds-snippet-end:WebForms2Step3

  const templateReqObject = makeTemplate(args);
  const template = await templatesApi.createTemplate(args.accountId, {
    envelopeTemplate: templateReqObject,
  });

  return template.envelopeTemplates[0].templateId;
};

const createWebFormInstance = async (formId, args) => {
  const apiClient = new docusignWebForms.ApiClient();
  apiClient.setBasePath(args.basePath);
  apiClient.addDefaultHeader('Authorization', 'Bearer ' + args.accessToken);

  //ds-snippet-start:WebForms2Step4
  const webFormValues = {
    PhoneNumber: '555-555-5555',
    Yes: ['Yes'],
    Company: 'Tally',
    JobTitle: 'Programmer Writer',
  };

  const recipient = {
    roleName: 'signer',
    name: args.signerName,
    email: args.signerEmail,
  };

  const createInstanceBody = {
    formValues: webFormValues,
    recipients: [recipient],
    sendOption: 'now',
  };
  //ds-snippet-end:WebForms2Step4

  //ds-snippet-start:WebForms2Step5
  const formInstanceManagementApi = new docusignWebForms.FormInstanceManagementApi(apiClient);
  const webForm = await formInstanceManagementApi.createInstance(createInstanceBody, args.accountId, formId);
  //ds-snippet-end:WebForms2Step5
  return webForm;
};

const listWebForms = async (args) => {
  const apiClient = new docusignWebForms.ApiClient();
  apiClient.setBasePath(args.basePath);
  apiClient.addDefaultHeader('Authorization', 'Bearer ' + args.accessToken);

  const formManagementApi = new docusignWebForms.FormManagementApi(apiClient);

  const webForms = await formManagementApi.listForms(args.accountId, { search: args.formName });

  return webForms;
};

const makeTemplate = (args) => {
  const docPdfBytes = fs.readFileSync(args.docFile);
  const docB64 = Buffer.from(docPdfBytes).toString('base64');

  // add the documents
  const doc = new docusignEsign.Document.constructFromObject({
    documentBase64: docB64,
    name: 'Lorem Ipsum',
    fileExtension: 'pdf',
    documentId: '1',
  });

  // Create fields
  const signHere = docusignEsign.SignHere.constructFromObject({
    documentId: '1',
    tabLabel: 'Signature',
    anchorString: '/SignHere/',
    anchorUnits: 'pixels',
    anchorXOffset: '0',
    anchorYOffset: '0',
  });
  const check = docusignEsign.Checkbox.constructFromObject({
    documentId: '1',
    tabLabel: 'Yes',
    anchorString: '/SMS/',
    anchorUnits: 'pixels',
    anchorXOffset: '0',
    anchorYOffset: '0',
  });
  const text1 = docusignEsign.Text.constructFromObject({
    documentId: '1',
    tabLabel: 'FullName',
    anchorString: '/FullName/',
    anchorUnits: 'pixels',
    anchorXOffset: '0',
    anchorYOffset: '0'
  });
  const text2 = docusignEsign.Text.constructFromObject({
    documentId: '1',
    tabLabel: 'PhoneNumber',
    anchorString: '/PhoneNumber/',
    anchorUnits: 'pixels',
    anchorXOffset: '0',
    anchorYOffset: '0'
  });
  const text3 = docusignEsign.Text.constructFromObject({
    documentId: '1',
    tabLabel: 'Company',
    anchorString: '/Company/',
    anchorUnits: 'pixels',
    anchorXOffset: '0',
    anchorYOffset: '0'
  });
  const text4 = docusignEsign.Text.constructFromObject({
    documentId: '1',
    tabLabel: 'JobTitle',
    anchorString: '/JobTitle/',
    anchorUnits: 'pixels',
    anchorXOffset: '0',
    anchorYOffset: '0'
  });
  const dateSigned = docusignEsign.DateSigned.constructFromObject({
    documentId: '1',
    tabLabel: 'DateSigned',
    anchorString: '/Date/',
    anchorUnits: 'pixels',
    anchorXOffset: '0',
    anchorYOffset: '0'
  });

  // Tabs are set per recipient / signer
  const signerTabs = docusignEsign.Tabs.constructFromObject({
    checkboxTabs: [check],
    signHereTabs: [signHere],
    textTabs: [text1, text2, text3, text4],
    dateSigned: [dateSigned]
  });

  // create a signer recipient
  const signer = docusignEsign.Signer.constructFromObject({
    roleName: 'signer',
    recipientId: '1',
    routingOrder: '1',
    tabs: signerTabs,
  });

  // Add the recipients to the env object
  const recipients = docusignEsign.Recipients.constructFromObject({
    signers: [signer],
  });

  // create the overall template definition
  const template = new docusignEsign.EnvelopeTemplate.constructFromObject({
    // The order in the docs array determines the order in the env
    documents: [doc],
    emailSubject: 'Please sign this document',
    description: 'Example template created via the API',
    name: args.templateName,
    shared: 'false',
    recipients: recipients,
    status: 'created',
  });

  return template;
};

module.exports = { createWebFormTemplate, createWebFormInstance, listWebForms };
