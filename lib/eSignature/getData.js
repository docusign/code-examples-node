const docusign = require('docusign-esign');

async function getUserInfo(accessToken, basePath){
  const apiClient = new docusign.ApiClient();
  apiClient.setBasePath(basePath);
  apiClient.addDefaultHeader('Authorization', 'Bearer ' + accessToken);

  const userInfo = await apiClient.getUserInfo(accessToken);
  if (!userInfo) {
    throw new Exception('The user does not have access to account');
  }
  return userInfo;
}

function getFolderIdByName(folders, folderName) {
  for (const folder of folders) {
    if (folder.name.toLowerCase() === folderName.toLowerCase()) {
      return folder.folderId;
    }

    if (folder.folders?.length > 0) {
      const folderId = getFolderIdByName(folder.folders, folderName);
      if (folderId) {
        return folderId;
      }
    }
  }

  return null;
}

module.exports = { getUserInfo, getFolderIdByName };
