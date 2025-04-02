/**
 * @file
 * Example 001: Set connected fields
 * @author DocuSign
 */

const axios = require('axios');
const fs = require('fs-extra');
const docusign = require('docusign-esign');

/**
 * This function does the work of retrieving the tab groups
 * @param {object} args
 */
const getTabGroups = async (args) => {
  //ds-snippet-start:ConnectedFields1Step2
  const headers = {
    Authorization: 'Bearer ' + args.accessToken,
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
  //ds-snippet-end:ConnectedFields1Step2

  //ds-snippet-start:ConnectedFields1Step3
  const url = `${args.basePath}/v1/accounts/${args.accountId}/connected-fields/tab-groups`;
  const response = await axios.get(url, { headers });
  const responseData = response.data;

  let uniqueApps = [];
  if (responseData && responseData.length > 0) {
    uniqueApps = [...new Map(responseData.map(item => [item.appId, item])).values()];
  }
  //ds-snippet-end:ConnectedFields1Step3

  return uniqueApps;
};

/**
 * This function does the work of creating the envelope
 * @param {object} args
 */
const sendEnvelope = async (args) => {
  // Data for this method
  // args.basePath
  // args.accessToken
  // args.accountId

  //ds-snippet-start:ConnectedFields1Step6
  let dsApiClient = new docusign.ApiClient();
  dsApiClient.setBasePath(args.basePath);
  dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + args.accessToken);
  let envelopesApi = new docusign.EnvelopesApi(dsApiClient);

  // Step 1. Make the envelope request body
  const envelope = makeEnvelope(args.envelopeArgs);

  // Step 2. call Envelopes::create API method
  // Exceptions will be caught by the calling function
  const results = await envelopesApi.createEnvelope(args.accountId, {
    envelopeDefinition: envelope,
  });
  //ds-snippet-end:ConnectedFields1Step6

  const envelopeId = results.envelopeId;
  console.log(`Envelope was created. EnvelopeId ${envelopeId}`);

  return { envelopeId: envelopeId };
};

/**
 * This function gets the verification data for selected extension app
 * @param {string} selectedAppId the GUID of selected extension app
 * @param {array} apps the list of extension apps
 * @returns {Object} Verification data
 */
//ds-snippet-start:ConnectedFields1Step4
const extractVerificationData = (selectedAppId, apps) => {
  const selectedApp = apps.filter(app => app.appId === selectedAppId)[0];

  return {
    appId: selectedApp.appId,
    extensionGroupId: selectedApp.tabs[0].extensionData.extensionGroupId,
    publisherName: selectedApp.tabs[0].extensionData.publisherName,
    applicationName: selectedApp.tabs[0].extensionData.applicationName,
    actionName: selectedApp.tabs[0].extensionData.actionName,
    actionInputKey: selectedApp.tabs[0].extensionData.actionInputKey,
    actionContract: selectedApp.tabs[0].extensionData.actionContract,
    extensionName: selectedApp.tabs[0].extensionData.extensionName,
    extensionContract: selectedApp.tabs[0].extensionData.extensionContract,
    requiredForExtension: selectedApp.tabs[0].extensionData.requiredForExtension,
    tabLabel: selectedApp.tabs.map((tab) => tab.tabLabel).join(', '),
    connectionKey: selectedApp.tabs[0].extensionData.connectionInstances
      ? selectedApp.tabs[0].extensionData.connectionInstances[0].connectionKey
      : '',
    connectionValue: selectedApp.tabs[0].extensionData.connectionInstances
      ? selectedApp.tabs[0].extensionData.connectionInstances[0].connectionValue
      : '',
  };
};
//ds-snippet-end:ConnectedFields1Step4

/**
 * Creates envelope
 * @function
 * @param {Object} args parameters for the envelope:
 * @returns {Envelope} An envelope definition
 * @private
 */

//ds-snippet-start:ConnectedFields1Step5
function makeEnvelope(args) {
  // Data for this method
  // args.signerEmail
  // args.signerName
  // args.signerClientId
  // docFile

  // document 1 (pdf) has tag /sn1/
  //
  // The envelope has one recipients.
  // recipient 1 - signer

  let docPdfBytes;
  // read file from a local directory
  // The read could raise an exception if the file is not available!
  docPdfBytes = fs.readFileSync(args.docFile);

  // create the envelope definition
  let env = new docusign.EnvelopeDefinition();
  env.emailSubject = 'Please sign this document';

  // add the documents
  let doc = new docusign.Document();
  let docb64 = Buffer.from(docPdfBytes).toString('base64');
  doc.documentBase64 = docb64;
  doc.name = 'Lorem Ipsum'; // can be different from actual file name
  doc.fileExtension = 'pdf';
  doc.documentId = '1';

  // The order in the docs array determines the order in the envelope
  env.documents = [doc];

  // Create a signer recipient to sign the document, identified by name and email
  let signer = docusign.Signer.constructFromObject({
    email: args.signerEmail,
    name: args.signerName,
    recipientId: 1,
  });

  // Create signHere fields (also known as tabs) on the documents,
  // We're using anchor (autoPlace) positioning
  //
  // The DocuSign platform seaches throughout your envelope's
  // documents for matching anchor strings.
  let signHere = docusign.SignHere.constructFromObject({
    anchorString: '/sn1/',
    anchorYOffset: '10',
    anchorUnits: 'pixels',
    anchorXOffset: '20',
  });

  const extensionData = {
    extensionGroupId: args.verificationData.extensionGroupId,
    publisherName: args.verificationData.publisherName,
    applicationId: args.verificationData.appId,
    applicationName: args.verificationData.applicationName,
    actionName: args.verificationData.actionName,
    actionContract: args.verificationData.actionContract,
    extensionName: args.verificationData.extensionName,
    extensionContract: args.verificationData.extensionContract,
    requiredForExtension: args.verificationData.requiredForExtension,
    actionInputKey: args.verificationData.actionInputKey,
    extensionPolicy: 'None',
    connectionInstances: [
      {
        connectionKey: args.verificationData.connectionKey,
        connectionValue: args.verificationData.connectionValue,
      }
    ]
  };
  let textTab = docusign.Text.constructFromObject({
    requireInitialOnSharedChange: false,
    requireAll: false,
    name: args.verificationData.applicationName,
    required: true,
    locked: false,
    disableAutoSize: false,
    maxLength: 4000,
    tabLabel: args.verificationData.tabLabel,
    font: 'lucidaconsole',
    fontColor: 'black',
    fontSize: 'size9',
    documentId: '1',
    recipientId: '1',
    pageNumber: '1',
    xPosition: '273',
    yPosition: '191',
    width: '84',
    height: '22',
    templateRequired: false,
    tabType: 'text',
  });
  // Tabs are set per recipient / signer
  let signerTabs = docusign.Tabs.constructFromObject({
    signHereTabs: [signHere],
    textTabs: [textTab]
  });
  signer.tabs = signerTabs;

  // Add the recipient to the envelope object
  let recipients = docusign.Recipients.constructFromObject({
    signers: [signer],
  });
  recipients.signers[0].tabs.textTabs[0].extensionData = extensionData;
  env.recipients = recipients;

  // Request that the envelope be sent by setting |status| to "sent".
  // To request that the envelope be created as a draft, set to "created"
  env.status = 'sent';

  return env;
}
//ds-snippet-end:ConnectedFields1Step5

module.exports = { getTabGroups, sendEnvelope, extractVerificationData };
