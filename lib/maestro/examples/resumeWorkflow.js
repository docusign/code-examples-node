const iam = require('@docusign/iam-sdk');

const resumePausedWorkflow = async (args) => {
  //ds-snippet-start:Maestro3Step2
  const client = new iam.IamClient({ accessToken: args.accessToken });
  //ds-snippet-end:Maestro3Step2

  //ds-snippet-start:Maestro3Step3
  return await client.maestro.workflows.resumePausedWorkflow({
    accountId: args.accountId,
    workflowId: args.workflowId,
  });
  //ds-snippet-end:Maestro3Step3
};

module.exports = { resumePausedWorkflow };
