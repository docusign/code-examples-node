const iam = require('@docusign/iam-sdk');

const getMaestroWorkflows = async (args) => {
  const client = new iam.IamClient({ accessToken: args.accessToken });
  return await client.maestro.workflows.getWorkflowsList({ accountId: args.accountId, status: 'active' });
};

const triggerWorkflow = async (args, workflowId) => {
  const client = new iam.IamClient({ accessToken: args.accessToken });

  const instanceName = args.instanceName;
  const triggerInputs = {
    signerName: args.signerName,
    signerEmail: args.signerEmail,
    ccName: args.ccName,
    ccEmail: args.ccEmail,
  };

  const triggerWorkflow = { instanceName, triggerInputs };

  const result = await client.maestro.workflows.triggerWorkflow({
    accountId: args.accountId,
    workflowId: workflowId,
    triggerWorkflow,
  });

  return result;
};

module.exports = { triggerWorkflow, getMaestroWorkflows };
