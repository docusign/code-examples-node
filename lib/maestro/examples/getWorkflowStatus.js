/**
 * @file
 * Example 003: How to get the status of a Maestro workflow instance
 * @author DocuSign
 */

const docusign = require('docusign-maestro');

const getWorkflowInstance = async (args) => {
  //ds-snippet-start:Maestro3Step2
  const dsApiClient = new docusign.ApiClient();
  dsApiClient.setBasePath(args.basePath);
  dsApiClient.addDefaultHeader('Authorization', `Bearer ${args.accessToken}`);
  //ds-snippet-end:Maestro3Step2

  //ds-snippet-start:Maestro3Step3
  const workflowInstanceManagementApi = new docusign.WorkflowInstanceManagementApi(dsApiClient);
  const workflowInstance =
    await workflowInstanceManagementApi.getWorkflowInstance(
      args.accountId,
      args.workflowId,
      args.instanceId
    );

  return workflowInstance;
  //ds-snippet-end:Maestro3Step3
};

module.exports = { getWorkflowInstance };
