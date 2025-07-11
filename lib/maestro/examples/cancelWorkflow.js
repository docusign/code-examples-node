const iam = require('@docusign/iam-sdk');

const cancelWorkflow = async (args) => {
  const client = new iam.IamClient({ accessToken: args.accessToken });

  return await client.maestro.workflowInstanceManagement.cancelWorkflowInstance({
    accountId: args.accountId,
    workflowId: args.workflowId,
    instanceId: args.instanceId
  });
};

module.exports = { cancelWorkflow };
