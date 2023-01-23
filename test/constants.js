const config = require('./testConfig').getConfiguration();

const signerClientId = '1000';
const returnUrl = config.appUrl + "/ds-return";
const pingUrl = config.appUrl + "/";
const PRIVATE_KEY_FILENAME = "../config/private.key";
const BASE_PATH = 'https://demo.docusign.net/restapi';
const CLICK_BASE_PATH = 'https://demo.docusign.net/clickapi';
const ROOMS_BASE_PATH = 'https://demo.rooms.docusign.com';
const MONITOR_BASE_PATH = 'https://lens-d.docusign.net';
const ADMIN_BASE_PATH = 'https://api-d.docusign.net/management';
const OAUTH_BASE_PATH = 'account-d.docusign.com';
const REDIRECT_URI = 'https://www.docusign.com/api';
const SCOPES = ["signature", "impersonation"];
const ROOM_SCOPES = [
  "dtr.rooms.read", "dtr.rooms.write", "dtr.documents.read",
  "dtr.documents.write", "dtr.profile.read", "dtr.profile.write",
  "dtr.company.read", "dtr.company.write", "room_forms"
];
const CLICK_SCOPES = [
  "click.manage", "click.send"
];
const ADMIN_SCOPES = [
  "organization_read", "group_read", "permission_read	",
  "user_read", "user_write", "account_read",
  "domain_read", "identity_provider_read"
];
const EXPIRES_IN = 3600;
const TEST_PDF_FILE = './test/docs/World_Wide_Corp_lorem.pdf';
const TEST_DOCX_FILE = './test/docs/World_Wide_Corp_Battle_Plan_Trafalgar.docx';
const TEST_TEMPLATE_PDF_FILE = './test/docs/World_Wide_Corp_fields.pdf';
const TEST_TEMPLATE_DOCX_FILE = './test/docs/World_Wide_Corp_salary.docx';
const TEST_TERM_OF_SERVICE_FILE = './test/docs/Term_Of_Service.pdf';
const TEMPLATE_NAME = 'Test Template';
const CC_NAME = 'Test Name';
const CC_EMAIL = 'test@mail.com';
const SIGNER2_NAME = 'Test signer2';
const SIGNER2_EMAIL = 'test.signer2@mail.com';
const CC2_NAME = 'Test cc2';
const CC2_EMAIL = 'test.cc2@mail.com';
const BRAND_NAME = 'Test_Brand';
const DEFAULT_BRAND_LANGUAGE = 'en';
const PERMISSION_PROFILE_NAME = 'Test_Profile';
const CLICKWRAP_NAME = 'Test_Clickwrap';
const CLICKWRAP_VERSION_NUMBER = '1';

module.exports = {
  signerClientId,
  returnUrl,
  pingUrl,
  PRIVATE_KEY_FILENAME,
  BASE_PATH,
  CLICK_BASE_PATH,
  ROOMS_BASE_PATH,
  MONITOR_BASE_PATH,
  ADMIN_BASE_PATH,
  OAUTH_BASE_PATH,
  REDIRECT_URI,
  SCOPES,
  CLICK_SCOPES,
  ROOM_SCOPES,
  ADMIN_SCOPES,
  EXPIRES_IN,
  TEST_PDF_FILE,
  TEST_DOCX_FILE,
  TEST_TEMPLATE_PDF_FILE,
  TEMPLATE_NAME,
  TEST_TEMPLATE_DOCX_FILE,
  TEST_TERM_OF_SERVICE_FILE,
  CC_NAME,
  CC_EMAIL,
  BRAND_NAME,
  DEFAULT_BRAND_LANGUAGE,
  PERMISSION_PROFILE_NAME,
  CLICKWRAP_NAME,
  CLICKWRAP_VERSION_NUMBER,
  SIGNER2_NAME,
  SIGNER2_EMAIL,
  CC2_NAME,
  CC2_EMAIL,
};
