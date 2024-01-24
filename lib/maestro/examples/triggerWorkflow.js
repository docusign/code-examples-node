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
  //ds-snippet-start:Maestro1Step2
  const dsApiClient = new docusign.ApiClient();
  dsApiClient.setBasePath(args.basePath);
  dsApiClient.addDefaultHeader('Authorization', `Bearer ${args.accessToken}`);
  //ds-snippet-end:Maestro1Step2

  //ds-snippet-start:Maestro1Step3
  const workflowManagementApi = new docusign.WorkflowManagementApi(dsApiClient);
  const workflowDefinition = await workflowManagementApi.getWorkflowDefinition(args.accountId, args.workflowId);

  return workflowDefinition;
};

const triggerWorkflow = async (workflow, args) => {
  const triggerUrl = workflow.triggerUrl.toString();
  //ds-snippet-end:Maestro1Step3
  //ds-snippet-start:Maestro1Step4
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
  //ds-snippet-end:Maestro1Step4

  const mtidIndex = triggerUrl.indexOf("mtid");
  const mtsecIndex = triggerUrl.indexOf("&mtsec");
  const mtid = triggerUrl.substring(mtidIndex+5, mtsecIndex);
  const mtsec = triggerUrl.substring(mtsecIndex+7)
  const basePath = triggerUrl.substring(0,triggerUrl.indexOf("/accounts"));

  const options = {
    mtid: mtid,
    mtsec: mtsec
  }

  const dsApiClient = new docusign.ApiClient();
  dsApiClient.setBasePath(basePath);
  dsApiClient.addDefaultHeader('Authorization', `Bearer ${args.accessToken}`);

  //ds-snippet-start:Maestro1Step5
  const workflowTriggerApi = new docusign.WorkflowTriggerApi(dsApiClient);
  const response =
    await workflowTriggerApi.triggerWorkflow(
      triggerPayload,
      args.accountId,
      options
    );
  //ds-snippet-end:Maestro1Step5

  return response;
};

module.exports = { getWorkflowDefinitions, getWorkflowDefinition, triggerWorkflow };
