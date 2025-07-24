const iam = require('@docusign/iam-sdk');

const pauseWorkflow = async (args) => {
  //ds-snippet-start:Maestro2Step2
  const client = new iam.IamClient({ accessToken: args.accessToken });
  //ds-snippet-end:Maestro2Step2

  //ds-snippet-start:Maestro2Step3
  return await client.maestro.workflows.pauseNewWorkflowInstances({
    accountId: args.accountId,
    workflowId: args.workflowId
  });
  //ds-snippet-end:Maestro2Step3
};

module.exports = { pauseWorkflow };
