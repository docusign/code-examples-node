/**
 * @file
 * Example 002: How to cancel a Maestro workflow instance
 * @author DocuSign
 */

const docusign = require('docusign-maestro');

const cancelWorkflowInstance = async (args) => {
  //ds-snippet-start:Maestro2Step2
  const dsApiClient = new docusign.ApiClient();
  dsApiClient.setBasePath(args.basePath);
  dsApiClient.addDefaultHeader('Authorization', `Bearer ${args.accessToken}`);
  //ds-snippet-end:Maestro2Step2

  //ds-snippet-start:Maestro2Step3
  const workflowInstanceManagementApi = new docusign.WorkflowInstanceManagementApi(dsApiClient);
  const cancelResponse =
    await workflowInstanceManagementApi.cancelWorkflowInstance(
      args.accountId,
      args.instanceId
    );
  //ds-snippet-end:Maestro2Step3

  return cancelResponse;
};

module.exports = { cancelWorkflowInstance };
