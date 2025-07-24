const iam = require('@docusign/iam-sdk');

const getMaestroWorkflows = async (args) => {
  //ds-snippet-start:Maestro1Step2
  const client = new iam.IamClient({ accessToken: args.accessToken });
  //ds-snippet-end:Maestro1Step2
  //ds-snippet-start:Maestro1Step3
  return await client.maestro.workflows.getWorkflowsList({ accountId: args.accountId, status: 'active' });
  //ds-snippet-end:Maestro1Step3
};

const triggerWorkflow = async (args, workflowId) => {
  const client = new iam.IamClient({ accessToken: args.accessToken });

  const instanceName = args.instanceName;
  //ds-snippet-start:Maestro1Step4
  const triggerInputs = {
    signerName: args.signerName,
    signerEmail: args.signerEmail,
    ccName: args.ccName,
    ccEmail: args.ccEmail,
  };
  //ds-snippet-end:Maestro1Step4

  //ds-snippet-start:Maestro1Step5
  const triggerWorkflow = { instanceName, triggerInputs };

  const result = await client.maestro.workflows.triggerWorkflow({
    accountId: args.accountId,
    workflowId: workflowId,
    triggerWorkflow,
  });

  return result;
  //ds-snippet-end:Maestro1Step5
};

module.exports = { triggerWorkflow, getMaestroWorkflows };
