const settings = require('../config/appsettings.json');
const chai = require('chai');
const expect = chai.expect;
const should = chai.should();
const helpers = require('./testHelpers');
const { createTemplate } = require('../lib/eSignature/examples/createTemplate');
const { sendEnvelopeFromTemplate } = require('../lib/eSignature/examples/useTemplate');
const { addDocToTemplate } = require('../lib/eSignature/examples/addDocToTemplate')
const { setTabValues } = require('../lib/eSignature/examples/setTabValues')
const path = require('path');
const { authenticate } = require('./testHelpers');
const { TEST_TEMPLATE_PDF_FILE, TEST_TEMPLATE_DOCX_FILE, TEMPLATE_NAME, BASE_PATH, signerClientId, returnUrl, pingUrl } = require('./constants')

let ACCOUNT_ID;
let ACCESS_TOKEN;
let TEMPLATE_ID;

describe ('templateTests', function() {
  before(async function() {
    this.timeout(0);

    const { accountId, accessToken } = await authenticate();
      
    ACCOUNT_ID = accountId;
    ACCESS_TOKEN = accessToken;
  });

  it('createTemplate', async function() {
    this.timeout(0);

    const args = {
      accessToken: ACCESS_TOKEN,
      basePath: BASE_PATH,
      accountId: ACCOUNT_ID,
      templateName: TEMPLATE_NAME,
      docFile: TEST_TEMPLATE_PDF_FILE
    };

    const { templateId, templateName, createdNewTemplate } = await createTemplate(args);

    TEMPLATE_ID = templateId;

    should.exist(templateId);
    should.exist(templateName);
    should.equal(createdNewTemplate, true);
  });

  it('useTemplate', async function() {
    this.timeout(0);

    const envelopeArgs  = {
      templateId: TEMPLATE_ID,
      signerEmail: settings.signerEmail,
      signerName: settings.signerName,
      ccEmail: 'test@mail.com',
      ccName: 'Test Name'
    };
    const args = {
      accessToken: ACCESS_TOKEN,
      basePath: BASE_PATH,
      accountId: ACCOUNT_ID,
      envelopeArgs: envelopeArgs
    };

    const results = await sendEnvelopeFromTemplate(args);

    should.exist(results);
  });

  it('addDocToTemplate', async function() {
    this.timeout(0);

    const envelopeArgs  = {
      templateId: TEMPLATE_ID,
      signerEmail: settings.signerEmail,
      signerName: settings.signerName,
      signerClientId: signerClientId,
      ccEmail: 'test@mail.com',
      ccName: 'Test Name',
      item: 'Item',
      quantity: '5',
      dsReturnUrl: returnUrl,
      dsPingUrl: pingUrl
    };
    const args = {
      accessToken: ACCESS_TOKEN,
      basePath: BASE_PATH,
      accountId: ACCOUNT_ID,
      envelopeArgs: envelopeArgs
    };

    const { envelopeId, redirectUrl } = await addDocToTemplate(args);

    should.exist(envelopeId);
    should.exist(redirectUrl);
  });

  it('setTabValues', async function() {
    this.timeout(0);

    const envelopeArgs  = {
      signerEmail: settings.signerEmail,
      signerName: settings.signerName,
      signerClientId: signerClientId,
      dsReturnUrl: returnUrl,
      docFile: TEST_TEMPLATE_DOCX_FILE
    };
    const args = {
      accessToken: ACCESS_TOKEN,
      basePath: BASE_PATH,
      accountId: ACCOUNT_ID,
      envelopeArgs: envelopeArgs
    };

    const { envelopeId, redirectUrl } = await setTabValues(args);

    should.exist(envelopeId);
    should.exist(redirectUrl);
  });
});
