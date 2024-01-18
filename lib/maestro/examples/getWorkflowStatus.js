/**
 * @file
 * Example 003: How to get the status of a Maestro workflow instance
 * @author DocuSign
 */

const docusign = require('docusign-maestro');

const getWorkflowInstance = async (args) => {
  const dsApiClient = new docusign.ApiClient();
  dsApiClient.setBasePath(args.basePath);
  dsApiClient.addDefaultHeader('Authorization', `Bearer ${args.accessToken}`);

  const workflowInstanceManagementApi = new docusign.WorkflowInstanceManagementApi(dsApiClient);
  const workflowInstance =
    await workflowInstanceManagementApi.getWorkflowInstance(
      args.accountId,
      args.workflowId,
      args.instanceId
    );

  return workflowInstance;
};

module.exports = { getWorkflowInstance };
