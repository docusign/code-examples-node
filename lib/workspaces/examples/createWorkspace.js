/**
 * @file
 * Example 001: Create a workspaces
 * @author DocuSign
 */

const iam = require('@docusign/iam-sdk');

const createWorkspace = async (args) => {
  //ds-snippet-start:Workspaces1Step2
  const client = new iam.IamClient({ accessToken: args.accessToken });
  //ds-snippet-end:Workspaces1Step2

  //ds-snippet-start:Workspaces1Step3
  const createWorkspaceBody = {
    name: args.workspaceName,
  };
  //ds-snippet-end:Workspaces1Step3

  //ds-snippet-start:Workspaces1Step4
  return await client.workspaces1.workspaces.createWorkspace({ accountId: args.accountId, createWorkspaceBody });
  //ds-snippet-end:Workspaces1Step4
};

module.exports = { createWorkspace };
