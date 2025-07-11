const iam = require('@docusign/iam-sdk');

const resumePausedWorkflow = async (args) => {
  const client = new iam.IamClient({ accessToken: args.accessToken });

  return await client.maestro.workflows.resumePausedWorkflow({
    accountId: args.accountId,
    workflowId: args.workflowId,
  });
};

module.exports = { resumePausedWorkflow };
