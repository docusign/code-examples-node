const docusignAdmin = require('docusign-admin');
const dsConfig = require('../../../config/index.js').config;
const moment = require('moment')

/**
* audit recently modified users in your account
* @param {object} args
*/
const auditUsers = async (args) => {
  // Step 2 start
  let dsApiClient = new docusignAdmin.ApiClient();
  dsApiClient.setBasePath(dsConfig.adminAPIUrl);
  dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + args.accessToken);
  // Step 2 end

  // Step 3 start
  let options = {
    accountId: args.accountId,
    lastModifiedSince: moment().subtract(10, 'days').format()
  };

  const usersApi = new docusignAdmin.UsersApi(dsApiClient);
  const modifiedUsers = (await usersApi.getUsers(args.organizationId, options)).users;
  // Step 3 end

  // Step 5 start
  let results = [];
  let opts = {};

  for (const user of modifiedUsers) {
    opts.email = user.email;
    const result = await usersApi.getUserProfiles(args.organizationId, opts);
    results.push(result.users);
  }
  // Step 5 end
  return results;
}

module.exports = { auditUsers };