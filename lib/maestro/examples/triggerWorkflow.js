/**
 * @file
 * Example 001: How to trigger a Maestro workflow
 * @author DocuSign
 */

const docusign = require('docusign-maestro');
const { makePostRequest, getParameterValueFromUrl } = require('../../utils');

const getWorkflowDefinitions = async (args) => {
  const dsApiClient = new docusign.ApiClient();
  dsApiClient.setBasePath(args.basePath);
  dsApiClient.addDefaultHeader('Authorization', `Bearer ${args.accessToken}`);

  const workflowManagementApi = new docusign.WorkflowManagementApi(dsApiClient);
  const workflowDefinitions = await workflowManagementApi.getWorkflowDefinitions(args.accountId, { status: 'active' });

  return workflowDefinitions;
};

const getWorkflowDefinition = async (args) => {
  const dsApiClient = new docusign.ApiClient();
  dsApiClient.setBasePath(args.basePath);
  dsApiClient.addDefaultHeader('Authorization', `Bearer ${args.accessToken}`);

  const workflowManagementApi = new docusign.WorkflowManagementApi(dsApiClient);
  const workflowDefinition = await workflowManagementApi.getWorkflowDefinition(args.accountId, args.workflowId);

  return workflowDefinition;
};

const triggerWorkflow = async (workflow, args) => {
  const dsApiClient = new docusign.ApiClient();
  dsApiClient.setBasePath(args.basePath);
  dsApiClient.addDefaultHeader('Authorization', `Bearer ${args.accessToken}`);

  const workflowTriggerApi = new docusign.WorkflowTriggerApi(dsApiClient);

  const mtid = getParameterValueFromUrl(workflow.triggerUrl, 'mtid');
  const mtsec = getParameterValueFromUrl(workflow.triggerUrl, 'mtsec');

  const triggerPayload = docusign.TriggerPayload.constructFromObject({
    instanceName: args.instanceName,
    participant: {},
    payload: {
      signerEmail: args.signerEmail,
      signerName: args.signerName,
      ccEmail: args.ccEmail,
      ccName: args.ccName
    },
    metadata: {}
  });

  const triggerResponse = await workflowTriggerApi.triggerWorkflow(triggerPayload, args.accountId, args.workflowId, { mtid, mtsec });

  return triggerResponse;
};

module.exports = { getWorkflowDefinitions, getWorkflowDefinition, triggerWorkflow };
