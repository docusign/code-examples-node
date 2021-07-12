const settings = require('./appsettings.json');

const dsOauthServer = settings.production
  ? 'https://account.docusign.com'
  : 'https://account-d.docusign.com';

settings.dsClientSecret = process.env.DS_CLIENT_SECRET || settings.dsClientSecret;
settings.signerEmail = process.env.DS_SIGNER_EMAIL || settings.signerEmail;
settings.signerName = process.env.DS_SIGNER_NAME || settings.signerName;
settings.dsClientId = process.env.DS_CLIENT_ID || settings.dsClientId;
settings.appUrl = process.env.DS_APP_URL || settings.appUrl;
settings.privateKeyLocation = process.env.DS_PRIVATE_KEY_PATH  || settings.privateKeyLocation;
settings.impersonatedUserGuid =  process.env.DS_IMPERSONATED_USER_GUID || settings.impersonatedUserGuid;

exports.config = {
  dsOauthServer,
  ...settings
};
