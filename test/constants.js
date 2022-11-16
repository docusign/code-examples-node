const settings = require('../config/appsettings.json')

const signerClientId = 1000;
const returnUrl = settings.appUrl + "/ds-return";
const pingUrl = settings.appUrl + "/";
const PRIVATE_KEY_FILENAME = "../config/private.key";
const BASE_PATH = 'https://demo.docusign.net/restapi';
const OAUTH_BASE_PATH = 'account-d.docusign.com';
const REDIRECT_URI = 'https://www.docusign.com/api';
const SCOPES = ["signature, impersonation"];
const EXPIRES_IN = 3600;
const TEST_PDF_FILE = './test/docs/World_Wide_Corp_lorem.pdf';
const TEST_DOCX_FILE = './test/docs/World_Wide_Corp_Battle_Plan_Trafalgar.docx';
const TEST_TEMPLATE_PDF_FILE = './test/docs/World_Wide_Corp_fields.pdf';
const TEST_TEMPLATE_DOCX_FILE = './test/docs/World_Wide_Corp_salary.docx';
const TEMPLATE_NAME = 'Test Template';

module.exports = {
  signerClientId,
  returnUrl,
  pingUrl,
  PRIVATE_KEY_FILENAME,
  BASE_PATH,
  OAUTH_BASE_PATH,
  REDIRECT_URI,
  SCOPES,
  EXPIRES_IN,
  TEST_PDF_FILE,
  TEST_DOCX_FILE,
  TEST_TEMPLATE_PDF_FILE,
  TEMPLATE_NAME,
  TEST_TEMPLATE_DOCX_FILE,
};
