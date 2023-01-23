const fs = require('fs');
const path = require('path');

function getConfiguration() {
  let config;

  if(fs.existsSync(path.resolve(__dirname, '../config/appsettings.json'))) {
    config = require('../config/appsettings.json');
  } else {
    config = {
      signerEmail: process.env.SIGNER_EMAIL,
      signerName: process.env.SIGNER_NAME,
      appUrl: process.env.APP_URL,
      dsJWTClientId: process.env.CLIENT_ID,
      impersonatedUserGuid: process.env.USER_ID,
      privateKey: process.env.PRIVATE_KEY,
    };
  }

  return config;
}

module.exports = { getConfiguration };
