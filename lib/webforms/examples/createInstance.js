/**
 * @file
 * Example 001: Create and embed an instance of a Web Form
 * @author DocuSign
 */

const docusignEsign = require('docusign-esign');
const docusignWebForms = require('docusign-webforms');
const fs = require('fs-extra');

const createWebFormTemplate = async (args) => {
  //ds-snippet-start:WebForms1Step2
  const apiClient = new docusignEsign.ApiClient();
  apiClient.setBasePath(args.basePath);
  apiClient.addDefaultHeader('Authorization', 'Bearer ' + args.accessToken);
  //ds-snippet-end:WebForms1Step2

  //ds-snippet-start:WebForms1Step3
  const templatesApi = new docusignEsign.TemplatesApi(apiClient);

  const webFormsTemplates = await templatesApi.listTemplates(args.accountId, {
    searchText: args.templateName,
  }, (error, data, response) => {
      const headers = response?.headers;

      const remaining = headers?.['x-ratelimit-remaining'];
      const reset = headers?.['x-ratelimit-reset'];

      if (remaining && reset) {
        const resetInstant = new Date(Number(reset) * 1000);

        console.log(`API calls remaining: ${remaining}`);
        console.log(`Next Reset: ${resetInstant.toISOString()}`);
      }
  });

  if (webFormsTemplates.data.resultSetSize > 0) {
    return webFormsTemplates.data.envelopeTemplates[0].templateId;
  }
  //ds-snippet-end:WebForms1Step3

  const templateReqObject = makeTemplate(args);
  const template = await templatesApi.createTemplate(args.accountId, {
    envelopeTemplate: templateReqObject,
  }, (error, data, response) => {
      const headers = response?.headers;

      const remaining = headers?.['x-ratelimit-remaining'];
      const reset = headers?.['x-ratelimit-reset'];

      if (remaining && reset) {
        const resetInstant = new Date(Number(reset) * 1000);

        console.log(`API calls remaining: ${remaining}`);
        console.log(`Next Reset: ${resetInstant.toISOString()}`);
      }
  });

  return template.data.envelopeTemplates[0].templateId;
};

const createWebFormInstance = async (formId, args) => {
  const apiClient = new docusignWebForms.ApiClient();
  apiClient.setBasePath(args.basePath);
  apiClient.addDefaultHeader('Authorization', 'Bearer ' + args.accessToken);

  //ds-snippet-start:WebForms1Step4
  const webFormValues = {
    PhoneNumber: '555-555-5555',
    Yes: ['Yes'],
    Company: 'Tally',
    JobTitle: 'Programmer Writer',
  };

  const createInstanceBody = docusignWebForms.CreateInstanceRequestBody.constructFromObject({
    clientUserId: args.clientUserId,
    formValues: webFormValues,
    expirationOffset: 24,
  });
  //ds-snippet-end:WebForms1Step4

  //ds-snippet-start:WebForms1Step5
  const formInstanceManagementApi = new docusignWebForms.FormInstanceManagementApi(apiClient);
  const webForm = await formInstanceManagementApi.createInstance(createInstanceBody, args.accountId, formId, (error, data, response) => {
      const headers = response?.headers;

      const remaining = headers?.['x-ratelimit-remaining'];
      const reset = headers?.['x-ratelimit-reset'];

      if (remaining && reset) {
        const resetInstant = new Date(Number(reset) * 1000);

        console.log(`API calls remaining: ${remaining}`);
        console.log(`Next Reset: ${resetInstant.toISOString()}`);
      }
  });
  //ds-snippet-end:WebForms1Step5
  return webForm.data;
};

const listWebForms = async (args) => {
  const apiClient = new docusignWebForms.ApiClient();
  apiClient.setBasePath(args.basePath);
  apiClient.addDefaultHeader('Authorization', 'Bearer ' + args.accessToken);

  const formManagementApi = new docusignWebForms.FormManagementApi(apiClient);

  const webForms = await formManagementApi.listForms(args.accountId, { search: args.formName }, (error, data, response) => {
      const headers = response?.headers;

      const remaining = headers?.['x-ratelimit-remaining'];
      const reset = headers?.['x-ratelimit-reset'];

      if (remaining && reset) {
        const resetInstant = new Date(Number(reset) * 1000);

        console.log(`API calls remaining: ${remaining}`);
        console.log(`Next Reset: ${resetInstant.toISOString()}`);
      }
  });

  return webForms.data;
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

