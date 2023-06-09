const docusignAdmin = require('docusign-admin');
const dsConfig = require('../../../config/index.js').config;
const moment = require('moment')

/**
* audit recently modified users in your account
* @param {object} args
*/
const auditUsers = async (args) => {
  //ds-snippet-start:Admin5Step2
  let dsApiClient = new docusignAdmin.ApiClient();
  dsApiClient.setBasePath(dsConfig.adminAPIUrl);
  dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + args.accessToken);
  //ds-snippet-end:Admin5Step2

  //ds-snippet-start:Admin5Step3
  let options = {
    accountId: args.accountId,
    lastModifiedSince: moment().subtract(10, 'days').format()
  };

  const usersApi = new docusignAdmin.UsersApi(dsApiClient);
  const modifiedUsers = (await usersApi.getUsers(args.organizationId, options)).users;
  //ds-snippet-end:Admin5Step3

  //ds-snippet-start:Admin5Step5
  let results = [];
  let opts = {};

  for (const user of modifiedUsers) {
    opts.email = user.email;
    const result = await usersApi.getUserProfiles(args.organizationId, opts);
    results.push(result.users);
  }
  //ds-snippet-end:Admin5Step5
  return results;
}

module.exports = { auditUsers };