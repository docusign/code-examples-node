/**
 * @file
 * Example 001: How to trigger a Maestro workflow
 * @author DocuSign
 */

const docusign = require('docusign-maestro');
const { makePostRequest } = require('../../utils');

const getWorkflowDefinitions = async (args) => {
  const dsApiClient = new docusign.ApiClient();
  dsApiClient.setBasePath(args.basePath);
  dsApiClient.addDefaultHeader('Authorization', `Bearer ${args.accessToken}`);

  const workflowManagementApi = new docusign.WorkflowManagementApi(dsApiClient);
  const workflowDefinition = await workflowManagementApi.getWorkflowDefinitions(args.accountId);

  return workflowDefinition;
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

  const response = await makePostRequest(workflow.triggerUrl, triggerPayload, {
    headers: {
      Authorization: `Bearer ${args.accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  return response;
};

module.exports = { getWorkflowDefinitions, getWorkflowDefinition, triggerWorkflow };
