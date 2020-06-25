exports.docOptions = require('./documentOptions.json');
exports.docNames = require('./documentNames.json');
const settings = require('./appsettings.json');
const jwt = require('./jwtsettings.json');
exports.github = require('./github.json');

const dsOauthServer = settings.production
  ? 'https://account.docusign.com'
  : 'https://account-d.docusign.com';

settings.gatewayAccountId = process.env.DS_PAYMENT_GATEWAY_ID || settings.gatewayAccountId;
settings.dsClientSecret = process.env.DS_CLIENT_SECRET || settings.dsClientSecret;
settings.signerEmail = process.env.DS_SIGNER_EMAIL || settings.signerEmail;
settings.signerName = process.env.DS_SIGNER_NAME || settings.signerName;
settings.dsClientId = process.env.DS_CLIENT_ID || settings.dsClientId;
settings.appUrl = process.env.DS_APP_URL || settings.appUrl;
settings.dsJWTClientId = process.env.DS_JWT_CLIENT_ID || jwt.dsJWTClientId;
settings.privateKeyLocation = process.env.DS_PRIVATE_KEY_PATH  || jwt.privateKeyLocation;
settings.impersonatedUserGuid =  process.env.DS_IMPERSONATED_USER_GUID || jwt.impersonatedUserGuid;

exports.config = {
  dsOauthServer,
  ...settings
};
