const iam = require('@docusign/iam-sdk');

const cancelWorkflow = async (args) => {
  //ds-snippet-start:Maestro4Step2
  const client = new iam.IamClient({ accessToken: args.accessToken });
  //ds-snippet-end:Maestro4Step2

  //ds-snippet-start:Maestro4Step3
  return await client.maestro.workflowInstanceManagement.cancelWorkflowInstance({
    accountId: args.accountId,
    workflowId: args.workflowId,
    instanceId: args.instanceId
  });
  //ds-snippet-end:Maestro4Step3
};

module.exports = { cancelWorkflow };
