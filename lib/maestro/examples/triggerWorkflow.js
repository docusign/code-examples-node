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

  const triggerUrl = workflow.triggerUrl.toString();
  const mtidIndex = triggerUrl.indexOf("mtid");
  const mtsecIndex = triggerUrl.indexOf("&mtsec");
  const mtid = triggerUrl.substring(mtidIndex+5, mtsecIndex);
  const mtsec = triggerUrl.substring(mtsecIndex+7)
  const basePath = triggerUrl.substring(0,triggerUrl.indexOf("/accounts"));

  console.log(basePath);

  const options = {
    mtid: mtid,
    mtsec: mtsec
  }

  console.log(options);

  const dsApiClient = new docusign.ApiClient();
  dsApiClient.setBasePath(basePath);
  dsApiClient.addDefaultHeader('Authorization', `Bearer ${args.accessToken}`);

  console.log("before call");

  const workflowTriggerApi = new docusign.WorkflowTriggerApi(dsApiClient);
  const response =
    await workflowTriggerApi.triggerWorkflow(
      triggerPayload,
      args.accountId,
      options
    );

  console.log(response);

  return response;
};

module.exports = { getWorkflowDefinitions, getWorkflowDefinition, triggerWorkflow };
