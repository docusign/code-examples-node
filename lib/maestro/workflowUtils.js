const axios = require('axios');
const uuid = require('uuid');

async function createWorkflow(args, templateId) {
  const basePath = 'https://demo.services.docusign.net';
  const endpoint = `/aow-manage/v1.0/management/accounts/${args.accountId}/workflowDefinitions`;
  const url = new URL(endpoint, basePath);
  const headers = {
    Authorization: `Bearer ${args.accessToken}`,
    'Content-Type': 'application/json',
  };

  const workflowDefinition = constructWorkflowDefinition(args, templateId);
  const response = await axios.post(url.href, { workflowDefinition }, { headers });

  return response.data;
}

async function publishWorkflow(args, workflowId) {
  const basePath = 'https://demo.services.docusign.net';
  const endpoint = `/aow-manage/v1.0/management/accounts/${args.accountId}/workflowDefinitions/${workflowId}/publish?isPreRunCheck=true`;
  const url = new URL(endpoint, basePath);
  const headers = {
    Authorization: `Bearer ${args.accessToken}`,
    'Content-Type': 'application/json',
  };

  try {
    await axios.post(url.href, {}, { headers });
  } catch (error) {
    const isConsentRequired = error?.response?.data?.message?.toLowerCase() === 'consent required'
      || error?.data?.message?.toLowerCase() === 'consent required';
    if (isConsentRequired) {
      return error?.response?.data?.consentUrl || error?.data?.consentUrl;
    } else {
      throw error;
    }
  }
}

const constructWorkflowDefinition = (args, templateId) => {
  const signerId = uuid.v4();
  const ccId = uuid.v4();
  const triggerId = 'wfTrigger';
  const dacIdField = `dacId_${triggerId}`;
  const idField = `id_${triggerId}`;
  const signerNameField = `signerName_${triggerId}`;
  const signerEmailField = `signerEmail_${triggerId}`;
  const ccNameField = `ccName_${triggerId}`;
  const ccEmailField = `ccEmail_${triggerId}`;

  const participants = {
    [signerId]: {
      participantRole: 'Signer'
    },
    [ccId]: {
      participantRole: 'CC'
    }
  };

  const trigger = {
    name: 'Get_URL',
    type: 'API',
    httpType: 'Get',
    id: triggerId,
    input: {
      metadata: {
        customAttributes: {}
      },
      payload: {
        [dacIdField]: {
          source: 'step',
          propertyName: 'dacId',
          stepId: triggerId
        },
        [idField]: {
          source: 'step',
          propertyName: 'id',
          stepId: triggerId
        },
        [signerNameField]: {
          source: 'step',
          propertyName: 'signerName',
          stepId: triggerId
        },
        [signerEmailField]: {
          source: 'step',
          propertyName: 'signerEmail',
          stepId: triggerId
        },
        [ccNameField]: {
          source: 'step',
          propertyName: 'ccName',
          stepId: triggerId
        },
        [ccEmailField]: {
          source: 'step',
          propertyName: 'ccEmail',
          stepId: triggerId
        }
      },
      participants: {}
    },
    output: {
      [dacIdField]: {
        source: 'step',
        propertyName: 'dacId',
        stepId: triggerId
      }
    }
  };

  const variables = {
    [dacIdField]: {
      source: 'step',
      propertyName: 'dacId',
      stepId: triggerId
    },
    [idField]: {
      source: 'step',
      propertyName: 'id',
      stepId: triggerId
    },
    [signerNameField]: {
      source: 'step',
      propertyName: 'signerName',
      stepId: triggerId
    },
    [signerEmailField]: {
      source: 'step',
      propertyName: 'signerEmail',
      stepId: triggerId
    },
    [ccNameField]: {
      source: 'step',
      propertyName: 'ccName',
      stepId: triggerId
    },
    [ccEmailField]: {
      source: 'step',
      propertyName: 'ccEmail',
      stepId: triggerId
    },
    envelopeId_step2: {
      source: 'step',
      propertyName: 'envelopeId',
      stepId: 'step2',
      type: 'String'
    },
    combinedDocumentsBase64_step2: {
      source: 'step',
      propertyName: 'combinedDocumentsBase64',
      stepId: 'step2',
      type: 'File'
    },
    'fields.signer.text.value_step2': {
      source: 'step',
      propertyName: 'fields.signer.text.value',
      stepId: 'step2',
      type: 'String'
    }
  };

  const step2 = {
    id: 'step2',
    name: 'Get Signatures',
    moduleName: 'ESign',
    configurationProgress: 'Completed',
    type: 'DS-Sign',
    config: {
      participantId: signerId,
    },
    input: {
      isEmbeddedSign: true,
      documents: [
        {
          type: 'FromDSTemplate',
          eSignTemplateId: templateId,
        },
      ],
      emailSubject: 'Please sign this document',
      emailBlurb: '',
      recipients: {
        signers: [
          {
            defaultRecipient: 'false',
            tabs: {
              signHereTabs: [
                {
                  stampType: 'signature',
                  name: 'SignHere',
                  tabLabel: 'Sign Here',
                  scaleValue: '1',
                  optional: 'false',
                  documentId: '1',
                  recipientId: '1',
                  pageNumber: '1',
                  xPosition: '191',
                  yPosition: '148',
                  tabId: '1',
                  tabType: 'signhere',
                },
              ],
              textTabs: [
                {
                  requireAll: 'false',
                  value: '',
                  required: 'false',
                  locked: 'false',
                  concealValueOnDocument: 'false',
                  disableAutoSize: 'false',
                  tabLabel: 'text',
                  font: 'helvetica',
                  fontSize: 'size14',
                  localePolicy: {},
                  documentId: '1',
                  recipientId: '1',
                  pageNumber: '1',
                  xPosition: '153',
                  yPosition: '230',
                  width: '84',
                  height: '23',
                  tabId: '2',
                  tabType: 'text',
                },
              ],
              checkboxTabs: [
                {
                  name: '',
                  tabLabel: 'ckAuthorization',
                  selected: 'false',
                  selectedOriginal: 'false',
                  requireInitialOnSharedChange: 'false',
                  required: 'true',
                  locked: 'false',
                  documentId: '1',
                  recipientId: '1',
                  pageNumber: '1',
                  xPosition: '75',
                  yPosition: '417',
                  width: '0',
                  height: '0',
                  tabId: '3',
                  tabType: 'checkbox',
                },
                {
                  name: '',
                  tabLabel: 'ckAuthentication',
                  selected: 'false',
                  selectedOriginal: 'false',
                  requireInitialOnSharedChange: 'false',
                  required: 'true',
                  locked: 'false',
                  documentId: '1',
                  recipientId: '1',
                  pageNumber: '1',
                  xPosition: '75',
                  yPosition: '447',
                  width: '0',
                  height: '0',
                  tabId: '4',
                  tabType: 'checkbox',
                },
                {
                  name: '',
                  tabLabel: 'ckAgreement',
                  selected: 'false',
                  selectedOriginal: 'false',
                  requireInitialOnSharedChange: 'false',
                  required: 'true',
                  locked: 'false',
                  documentId: '1',
                  recipientId: '1',
                  pageNumber: '1',
                  xPosition: '75',
                  yPosition: '478',
                  width: '0',
                  height: '0',
                  tabId: '5',
                  tabType: 'checkbox',
                },
                {
                  name: '',
                  tabLabel: 'ckAcknowledgement',
                  selected: 'false',
                  selectedOriginal: 'false',
                  requireInitialOnSharedChange: 'false',
                  required: 'true',
                  locked: 'false',
                  documentId: '1',
                  recipientId: '1',
                  pageNumber: '1',
                  xPosition: '75',
                  yPosition: '508',
                  width: '0',
                  height: '0',
                  tabId: '6',
                  tabType: 'checkbox',
                },
              ],
              radioGroupTabs: [
                {
                  documentId: '1',
                  recipientId: '1',
                  groupName: 'radio1',
                  radios: [
                    {
                      pageNumber: '1',
                      xPosition: '142',
                      yPosition: '384',
                      value: 'white',
                      selected: 'false',
                      tabId: '7',
                      required: 'false',
                      locked: 'false',
                      bold: 'false',
                      italic: 'false',
                      underline: 'false',
                      fontColor: 'black',
                      fontSize: 'size7',
                    },
                    {
                      pageNumber: '1',
                      xPosition: '74',
                      yPosition: '384',
                      value: 'red',
                      selected: 'false',
                      tabId: '8',
                      required: 'false',
                      locked: 'false',
                      bold: 'false',
                      italic: 'false',
                      underline: 'false',
                      fontColor: 'black',
                      fontSize: 'size7',
                    },
                    {
                      pageNumber: '1',
                      xPosition: '220',
                      yPosition: '384',
                      value: 'blue',
                      selected: 'false',
                      tabId: '9',
                      required: 'false',
                      locked: 'false',
                      bold: 'false',
                      italic: 'false',
                      underline: 'false',
                      fontColor: 'black',
                      fontSize: 'size7',
                    },
                  ],
                  shared: 'false',
                  requireInitialOnSharedChange: 'false',
                  requireAll: 'false',
                  tabType: 'radiogroup',
                  value: '',
                  originalValue: '',
                },
              ],
              listTabs: [
                {
                  listItems: [
                    {
                      text: 'Red',
                      value: 'red',
                      selected: 'false',
                    },
                    {
                      text: 'Orange',
                      value: 'orange',
                      selected: 'false',
                    },
                    {
                      text: 'Yellow',
                      value: 'yellow',
                      selected: 'false',
                    },
                    {
                      text: 'Green',
                      value: 'green',
                      selected: 'false',
                    },
                    {
                      text: 'Blue',
                      value: 'blue',
                      selected: 'false',
                    },
                    {
                      text: 'Indigo',
                      value: 'indigo',
                      selected: 'false',
                    },
                    {
                      text: 'Violet',
                      value: 'violet',
                      selected: 'false',
                    },
                  ],
                  value: '',
                  originalValue: '',
                  required: 'false',
                  locked: 'false',
                  requireAll: 'false',
                  tabLabel: 'list',
                  font: 'helvetica',
                  fontSize: 'size14',
                  localePolicy: {},
                  documentId: '1',
                  recipientId: '1',
                  pageNumber: '1',
                  xPosition: '142',
                  yPosition: '291',
                  width: '78',
                  height: '0',
                  tabId: '10',
                  tabType: 'list',
                },
              ],
              numericalTabs: [
                {
                  validationType: 'currency',
                  value: '',
                  required: 'false',
                  locked: 'false',
                  concealValueOnDocument: 'false',
                  disableAutoSize: 'false',
                  tabLabel: 'numericalCurrency',
                  font: 'helvetica',
                  fontSize: 'size14',
                  localePolicy: {
                    cultureName: 'en-US',
                    currencyPositiveFormat:
                      'csym_1_comma_234_comma_567_period_89',
                    currencyNegativeFormat:
                      'opar_csym_1_comma_234_comma_567_period_89_cpar',
                    currencyCode: 'usd',
                  },
                  documentId: '1',
                  recipientId: '1',
                  pageNumber: '1',
                  xPosition: '163',
                  yPosition: '260',
                  width: '84',
                  height: '0',
                  tabId: '11',
                  tabType: 'numerical',
                },
              ],
            },
            signInEachLocation: 'false',
            agentCanEditEmail: 'false',
            agentCanEditName: 'false',
            requireUploadSignature: 'false',
            name: {
              source: 'step',
              propertyName: 'signerName',
              stepId: triggerId,
            },
            email: {
              source: 'step',
              propertyName: 'signerEmail',
              stepId: triggerId,
            },
            recipientId: '1',
            recipientIdGuid: '00000000-0000-0000-0000-000000000000',
            accessCode: '',
            requireIdLookup: 'false',
            routingOrder: '1',
            note: '',
            roleName: 'signer',
            completedCount: '0',
            deliveryMethod: 'email',
            templateLocked: 'false',
            templateRequired: 'false',
            inheritEmailNotificationConfiguration: 'false',
            recipientType: 'signer',
          },
        ],
        carbonCopies: [
          {
            agentCanEditEmail: 'false',
            agentCanEditName: 'false',
            name: {
              source: 'step',
              propertyName: 'ccName',
              stepId: triggerId,
            },
            email: {
              source: 'step',
              propertyName: 'ccEmail',
              stepId: triggerId,
            },
            recipientId: '2',
            recipientIdGuid: '00000000-0000-0000-0000-000000000000',
            accessCode: '',
            requireIdLookup: 'false',
            routingOrder: '2',
            note: '',
            roleName: 'cc',
            completedCount: '0',
            deliveryMethod: 'email',
            templateLocked: 'false',
            templateRequired: 'false',
            inheritEmailNotificationConfiguration: 'false',
            recipientType: 'carboncopy',
          },
        ],
        certifiedDeliveries: [],
      },
    },
    output: {
      envelopeId_step2: {
        source: 'step',
        propertyName: 'envelopeId',
        stepId: 'step2',
        type: 'String',
      },
      combinedDocumentsBase64_step2: {
        source: 'step',
        propertyName: 'combinedDocumentsBase64',
        stepId: 'step2',
        type: 'File',
      },
      'fields.signer.text.value_step2': {
        source: 'step',
        propertyName: 'fields.signer.text.value',
        stepId: 'step2',
        type: 'String',
      },
    },
  };

  const step3 = {
    id: 'step3',
    name: 'Show a Confirmation Screen',
    moduleName: 'ShowConfirmationScreen',
    configurationProgress: 'Completed',
    triggerType: 'API',
    type: 'DS-ShowScreenStep',
    config: {
      participantId: signerId
    },
    input: {
      httpType: 'Post',
      payload: {
        participantId: signerId,
        confirmationMessage: {
          title: 'Tasks complete',
          description: 'You have completed all your workflow tasks.'
        }
      }
    },
    output: {}
  };

  const workflowDefinition = {
    workflowName: 'Example workflow - send invite to signer',
    workflowDescription: '',
    documentVersion: '1.0.0',
    schemaVersion: '1.0.0',
    accountId: args.accountId,
    participants: participants,
    trigger: trigger,
    variables: variables,
    steps: [step2, step3]
  };

  return workflowDefinition;
};

module.exports = { createWorkflow, publishWorkflow };
