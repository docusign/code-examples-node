/**
 * @file
 * Example 005: Create a workspace upload request
 * @author DocuSign
 */

const iam = require('@docusign/iam-sdk');
const moment = require('moment');

const createUploadRequest = async (args) => {
  //ds-snippet-start:Workspaces5Step2
  const client = new iam.IamClient({ accessToken: args.accessToken });
  //ds-snippet-end:Workspaces5Step2

  const dueDate = moment().add(7, 'days').toDate();

  //ds-snippet-start:Workspaces5Step3
  // create assignments
  const assigneeAssignment = {
    uploadRequestResponsibilityTypeId: 'assignee',
    firstName: 'Test',
    lastName: 'User',
    email: args.assigneeEmail,
  };
  const watcherAssignments = {
    assigneeUserId: args.workspaceCreatorId,
    uploadRequestResponsibilityTypeId: 'watcher'
  };

  // create upload request
  const createWorkspaceUploadRequestBody = {
    name: `Upload Request example ${dueDate}`,
    description: 'This is an example upload request created via the workspaces API',
    dueDate: dueDate,
    status: 'draft',
    assignments: [assigneeAssignment, watcherAssignments],
  };
  //ds-snippet-end:Workspaces5Step3

  //ds-snippet-start:Workspaces5Step4
  return await client.workspaces1.workspaceUploadRequest.createWorkspaceUploadRequest(
    {
      accountId: args.accountId,
      workspaceId: args.workspaceId,
      createWorkspaceUploadRequestBody,
    }
  );
  //ds-snippet-end:Workspaces5Step4
};

module.exports = { createUploadRequest };
