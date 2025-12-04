/**
 * @file
 * Example 002: Add a document to a Workspaces
 * @author DocuSign
 */

const iam = require('@docusign/iam-sdk');
const fs = require('fs').promises;

const addDocumentToWorkspace = async (args) => {
  //ds-snippet-start:Workspaces2Step2
  const client = new iam.IamClient({ accessToken: args.accessToken });
  //ds-snippet-end:Workspaces2Step2

  //ds-snippet-start:Workspaces2Step3
  const buffer = await fs.readFile(args.documentPath);
  const uint8array = new Uint8Array(
    buffer.buffer,
    buffer.byteOffset,
    buffer.byteLength
  );
  const addWorkspaceDocumentRequest = {
    file: {
      fileName: args.documentName,
      content: uint8array,
    },
  };
  //ds-snippet-end:Workspaces2Step3

  //ds-snippet-start:Workspaces2Step4
  return await client.workspaces1.workspaceDocuments.addWorkspaceDocument({
    accountId: args.accountId,
    workspaceId: args.workspaceId,
    addWorkspaceDocumentRequest,
  });
  //ds-snippet-end:Workspaces2Step4
};

module.exports = { addDocumentToWorkspace };
