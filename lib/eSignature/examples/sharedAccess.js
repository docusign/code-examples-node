/**
 * @file
 * Example 043: Share access to a DocuSign envelope inbox
 * @author DocuSign
 */

const docusign = require("docusign-esign");
const moment = require("moment");

/**
 * Creates the agent user
 * @param {object} args parameters for the agent user
 * @returns {docusign.NewUsersSummary} Summary of creating the agent user
 */
const createAgent = async (args) => {
  //ds-snippet-start:eSign43Step2
  const dsApiClient = new docusign.ApiClient();
  dsApiClient.setBasePath(args.basePath);
  dsApiClient.addDefaultHeader("Authorization", "Bearer " + args.accessToken);
  //ds-snippet-end:eSign43Step2
  const usersApi = new docusign.UsersApi(dsApiClient);

  // check if agent already exists
  try {
    const users = await usersApi.list(args.accountId, { email: args.email, status: 'Active' });
    
    if(users.resultSetSize > 0) {
      return users.users[0];
    }
  } catch (error) {
    const errorCode = error && error.response && error.response.body.errorCode;
    const userNotFoundErrorCodes = ['USER_NOT_FOUND', 'USER_LACKS_MEMBERSHIP'];
    if(!userNotFoundErrorCodes.includes(errorCode)) {
      throw error;
    }
  }

  // create new agent
  const newUsersData = createNewUserDefinition(args);
  const newUsers = await usersApi.create(args.accountId, { newUsersDefinition: newUsersData });
  return newUsers.newUsers[0];
}

/**
 * Creates the authorization for agent user
 * @param {object} args parameters for the authorization
 * @returns {docusign.UserAuthorization} User authorization
 */
//ds-snippet-start:eSign43Step4
const createAuthorization = async (args) => {
  const dsApiClient = new docusign.ApiClient();
  dsApiClient.setBasePath(args.basePath);
  dsApiClient.addDefaultHeader("Authorization", "Bearer " + args.accessToken);
  const accountsApi = new docusign.AccountsApi(dsApiClient);

  // check if authorization with manage permission already exists
  const authorizations = await accountsApi.getAgentUserAuthorizations(args.accountId, args.agentUserId, { permissions: 'manage' });
  if(authorizations.resultSetSize > 0) {
    return;
  }
  
  // create authorization
  const agentData = createAuthorizationRequest(args.agentUserId, args);
  await accountsApi.createUserAuthorization(args.accountId, args.userId, { userAuthorizationCreateRequest: agentData });
}
//ds-snippet-end:eSign43Step4

/**
 * Retrieves the list of envelopes
 * @param {object} args parameters for listing the envelopes
 * @returns {docusign.EnvelopesInformation} The envelopes information
 */
//ds-snippet-start:eSign43Step5
const getEnvelopes = async (args) => {
  const dsApiClient = new docusign.ApiClient();
  dsApiClient.setBasePath(args.basePath);
  dsApiClient.addDefaultHeader("Authorization", "Bearer " + args.accessToken);
  dsApiClient.addDefaultHeader("X-DocuSign-Act-On-Behalf", args.userId);
  const envelopesApi = new docusign.EnvelopesApi(dsApiClient);

  const options = { fromDate: moment().subtract(10, "days").format() };
  return await envelopesApi.listStatusChanges(args.accountId, options);
}
//ds-snippet-end:eSign43Step5

/**
 * Creates the agent user definition
 * @param {object} args parameters for the agent user
 * @returns {docusign.NewUsersDefinition} New users definition
 */
//ds-snippet-start:eSign43Step3
const createNewUserDefinition = (args) => {
  const newUsersDefinition = docusign.NewUsersDefinition.constructFromObject({
    newUsers: [
      docusign.UserInformation.constructFromObject({
        activationAccessCode: args.activation,
        userName: args.userName,
        email: args.email,
      }),
    ],
  });

  return newUsersDefinition;
};
//ds-snippet-end:eSign43Step3


/**
 * Creates user authorization request
 * @param {string} agentUserId Agent user's GUID
 * @param {object} args Parameters for authorization
 * @returns {docusign.UserAuthorizationCreateRequest} User authorization request
 */
const createAuthorizationRequest = (agentUserId, args) => {
  const agent = docusign.UserAuthorizationCreateRequest.constructFromObject({
    agentUser: {
      userId: agentUserId,
      accountId: args.accountId
    },
    permission: 'manage',
  });

  return agent;
};

module.exports = { createAgent, createAuthorization, getEnvelopes };
