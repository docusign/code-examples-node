const iam = require('@docusign/iam-sdk');

const pauseWorkflow = async (args) => {
  const client = new iam.IamClient({ accessToken: args.accessToken });

  return await client.maestro.workflows.pauseNewWorkflowInstances({
    accountId: args.accountId,
    workflowId: args.workflowId
  });
};

module.exports = { pauseWorkflow };
