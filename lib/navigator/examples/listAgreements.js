/**
 * @file
 * Example 001: List agreements
 * @author DocuSign
 */

const iam = require('@docusign/iam-sdk');

const listAgreements = async (args) => {
//ds-snippet-start:Navigator1Step2
  const client = new iam.IamClient({ accessToken: args.accessToken, serverURL: args.basePath });
//ds-snippet-end:Navigator1Step2
//ds-snippet-start:Navigator1Step3
  return await client.navigator.agreements.getAgreementsList({ accountId: args.accountId });
};

module.exports = { listAgreements };
//ds-snippet-end:Navigator1Step3