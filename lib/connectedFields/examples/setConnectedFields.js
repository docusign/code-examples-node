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

  const filteredApps = responseData.filter(app =>
    app.tabs?.some(tab =>
      (tab.extensionData?.actionContract?.includes('Verify')) ||
      (tab.tabLabel?.includes('connecteddata'))
    )
  );

  let uniqueApps = [];
  if (filteredApps.length > 0) {
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
  //ds-snippet-start:ConnectedFields1Step6

  const envelopeId = results.envelopeId;
  console.log(`Envelope was created. EnvelopeId ${envelopeId}`);

  return { envelopeId: envelopeId };
};
//ds-snippet-end:eSign1Step6

/**
 * This function gets the verification data for selected extension app
 * @param {string} selectedAppId the GUID of selected extension app
 * @param {array} tab the extension tab
 * @returns {Object} Verification data
 */
//ds-snippet-start:ConnectedFields1Step4
const extractVerificationData = (selectedAppId, tab) => {
  const extensionData = tab.extensionData;

  return {
    appId: selectedAppId,
    extensionGroupId: extensionData.extensionGroupId,
    publisherName: extensionData.publisherName,
    applicationName: extensionData.applicationName,
    actionName: extensionData.actionName,
    actionInputKey: extensionData.actionInputKey,
    actionContract: extensionData.actionContract,
    extensionName: extensionData.extensionName,
    extensionContract: extensionData.extensionContract,
    requiredForExtension: extensionData.requiredForExtension,
    tabLabel: tab.tabLabel,
    connectionKey: extensionData.connectionInstances ? extensionData.connectionInstances[0].connectionKey : '',
    connectionValue: extensionData.connectionInstances ? extensionData.connectionInstances[0].connectionValue : '',
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

  // create the envelope definition
  let env = new docusign.EnvelopeDefinition();
  env.emailSubject = 'Please sign this document';

  // read file from a local directory
  // The read could raise an exception if the file is not available!
  const docPdfBytes = fs.readFileSync(args.docFile);

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
  let signer = new docusign.Signer();
  signer.email = args.signerEmail;
  signer.name = args.signerName;
  signer.recipientId = '1';
  signer.routingOrder = '1';

  // Create signHere fields (also known as tabs) on the documents,
  // We're using anchor (autoPlace) positioning
  //
  // The DocuSign platform seaches throughout your envelope's
  // documents for matching anchor strings.
  let signHere = new docusign.SignHere();
  signHere.anchorString = '/sn1/';
  signHere.anchorYOffset = '10';
  signHere.anchorUnits = 'pixels';
  signHere.anchorXOffset = '20';

  let textTabs = [];
  for (const tab of args.app.tabs.filter(t => !t.tabLabel.includes('SuggestionInput'))) {
    const verificationData = extractVerificationData(args.appId, tab);
    const textTab = makeTextTab(verificationData, textTabs.length);

    textTabs.push(textTab);
  }

  // Tabs are set per recipient / signer
  let signerTabs = new docusign.Tabs();
  signerTabs.signHereTabs = [signHere];
  signerTabs.textTabs = textTabs;

  signer.tabs = signerTabs;

  // Add the recipient to the envelope object
  let recipients = new docusign.Recipients();
  recipients.signers = [signer];

  env.recipients = recipients;

  // Request that the envelope be sent by setting |status| to "sent".
  // To request that the envelope be created as a draft, set to "created"
  env.status = 'sent';

  return env;
}

const getExtensionData = (verificationData) => ({
  extensionGroupId: verificationData.extensionGroupId,
  publisherName: verificationData.publisherName,
  applicationId: verificationData.appId,
  applicationName: verificationData.applicationName,
  actionName: verificationData.actionName,
  actionContract: verificationData.actionContract,
  extensionName: verificationData.extensionName,
  extensionContract: verificationData.extensionContract,
  requiredForExtension: verificationData.requiredForExtension,
  actionInputKey: verificationData.actionInputKey,
  extensionPolicy: 'MustVerifyToSign',
  connectionInstances: [
    {
      connectionKey: verificationData.connectionKey,
      connectionValue: verificationData.connectionValue,
    },
  ],
});

const makeTextTab = (verificationData, textTabsCount) => ({
  requireInitialOnSharedChange: false,
  requireAll: false,
  name: verificationData.applicationName,
  required: true,
  locked: false,
  disableAutoSize: false,
  maxLength: 4000,
  tabLabel: verificationData.tabLabel,
  font: 'lucidaconsole',
  fontColor: 'black',
  fontSize: 'size9',
  documentId: '1',
  recipientId: '1',
  pageNumber: '1',
  xPosition: `${70 + 100 * Math.floor(textTabsCount / 10)}`,
  yPosition: `${560 + 20 * (textTabsCount % 10)}`,
  width: '84',
  height: '22',
  templateRequired: false,
  tabType: 'text',
  tooltip: verificationData.actionInputKey,
  extensionData: getExtensionData(verificationData)
});
//ds-snippet-end:ConnectedFields1Step5

module.exports = { getTabGroups, sendEnvelope, extractVerificationData };
