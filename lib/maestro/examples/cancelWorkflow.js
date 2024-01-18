/**
 * @file
 * Example 002: How to cancel a Maestro workflow instance
 * @author DocuSign
 */

const docusign = require('docusign-maestro');

const cancelWorkflowInstance = async (args) => {
  const dsApiClient = new docusign.ApiClient();
  dsApiClient.setBasePath(args.basePath);
  dsApiClient.addDefaultHeader('Authorization', `Bearer ${args.accessToken}`);

  const workflowInstanceManagementApi = new docusign.WorkflowInstanceManagementApi(dsApiClient);
  const cancelResponse =
    await workflowInstanceManagementApi.cancelWorkflowInstance(
      args.accountId,
      args.instanceId
    );

  return cancelResponse;
};

module.exports = { cancelWorkflowInstance };
