const docusign = require('docusign-esign');

async function getUserInfo(accessToken, basePath){
  const apiClient = new docusign.ApiClient();
  apiClient.setBasePath(basePath);
  apiClient.addDefaultHeader('Authorization', 'Bearer ' + accessToken);

  const userInfo = await apiClient.getUserInfo(accessToken);
  if (!userInfo) {
    throw new Exception("The user does not have access to account");
  }
  return userInfo;
}

exports.getUserInfo = getUserInfo;
