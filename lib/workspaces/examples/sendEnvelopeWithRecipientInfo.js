/**
 * @file
 * Example 003: Send an Workspace Envelope with Recipient Info
 * @author DocuSign
 */

const iam = require('@docusign/iam-sdk');
const docusign = require('docusign-esign');

/**
 * Creates a workspace envelope
 * @param {*} args Workspace envelope args
 * @returns Create workspace envelope response
 */
const createEnvelope = async (args) => {
  //ds-snippet-start:Workspaces3Step2
  const client = new iam.IamClient({ accessToken: args.accessToken });
  //ds-snippet-end:Workspaces3Step2

  //ds-snippet-start:Workspaces3Step3
  const workspaceEnvelopeForCreate = {
    envelopeName: 'Example Workspace Envelope',
    documentIds: [args.documentId],
  };
  //ds-snippet-end:Workspaces3Step3

  //ds-snippet-start:Workspaces3Step4
  return await client.workspaces1.workspaces.createWorkspaceEnvelope({
    accountId: args.accountId,
    workspaceId: args.workspaceId,
    workspaceEnvelopeForCreate
  });
  //ds-snippet-end:Workspaces3Step4
};

/**
 * Sends a workspace envelope
 * @param {*} args Envelope args
 * @returns Envelope update summary
 */
const sendEnvelope = async (args) => {
  const dsApiClient = new docusign.ApiClient();
  dsApiClient.setBasePath(args.basePath);
  dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + args.accessToken);
  const envelopesApi = new docusign.EnvelopesApi(dsApiClient);

  const envelopeDefinition = makeEnvelope(args);

  //ds-snippet-start:Workspaces3Step6
  return await envelopesApi.update(args.accountId, args.envelopeId, { envelopeDefinition });
  //ds-snippet-end:Workspaces3Step6
};

/**
 * Creates an envelope definition
 * @param {*} args Envelope args
 * @returns An envelope definition
 * @private
 */
const makeEnvelope = (args) => {
  //ds-snippet-start:Workspaces3Step5
  const signHereTab = docusign.SignHere.constructFromObject({
    anchorString: '/sn1/',
    anchorUnits: 'pixels',
    anchorXOffset: '20',
    anchorYOffset: '10'
  });

  const tabs = docusign.Tabs.constructFromObject({
    signHere: [signHereTab]
  });

  const signer = docusign.Signer.constructFromObject({
    email: args.signerEmail,
    name: args.signerName,
    recipientId: '1',
    routingOrder: '1',
    tabs,
  });

  const recipients = docusign.Recipients.constructFromObject({
    signers: [signer]
  });

  const envelopeDefinition = docusign.EnvelopeDefinition.constructFromObject({
    emailSubject: 'Please sign this document',
    recipients,
    status: 'sent',
  });

  return envelopeDefinition;
  //ds-snippet-end:Workspaces3Step5
};

module.exports = { createEnvelope, sendEnvelope };
