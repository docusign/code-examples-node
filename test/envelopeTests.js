const settings = require('../config/appsettings.json');
const chai = require('chai');
const expect = chai.expect;
const should = chai.should();
const helpers = require('./testHelpers');
const { sendEnvelopeForEmbeddedSigning } = require('../embeddedSigning');
const { sendEnvelope } = require('../lib/eSignature/examples/signingViaEmail')
const fs = require('fs');
const path = require('path');
const { authenticate, getEnvelopeArgs } = require('./testHelpers');
const { signerClientId, pingUrl, returnUrl, TEST_PDF_FILE, TEST_DOCX_FILE, BASE_PATH } = require('./constants')

let ACCOUNT_ID;
let ACCESS_TOKEN;

describe ('envelopeTests', function() {
  before(async function() {
    this.timeout(0);

    const { accountId, accessToken } = await authenticate();
      
    ACCOUNT_ID = accountId;
    ACCESS_TOKEN = accessToken;
  });

  it('embeddedSigning', async function() {
    this.timeout(0);

    const envelopeArgs = {
      signerEmail: settings.signerEmail,
      signerName: settings.signerName,
      signerClientId: signerClientId,
      dsReturnUrl: returnUrl,
      dsPingUrl: pingUrl,
      docFile: path.resolve(TEST_PDF_FILE),
    };
    const args = {
      accessToken: ACCESS_TOKEN,
      basePath: BASE_PATH,
      accountId: ACCOUNT_ID,
      envelopeArgs: envelopeArgs,
    };

    const { envelopeId, redirectUrl } = await sendEnvelopeForEmbeddedSigning(args);

    should.exist(envelopeId);
    should.exist(redirectUrl);
  });

  it('signViaEmail', async function() {
    this.timeout(0);

    const envelopeArgs = {
      signerEmail: settings.signerEmail,
      signerName: settings.signerName,
      ccEmail: 'test@mail.com',
      ccName: 'Test Name',
      status: 'sent',
      doc2File: path.resolve(TEST_DOCX_FILE),
      doc3File: path.resolve(TEST_PDF_FILE),
    };
    const args = {
      accessToken: ACCESS_TOKEN,
      basePath: BASE_PATH,
      accountId: ACCOUNT_ID,
      envelopeArgs: envelopeArgs,
    };

    const { envelopeId } = await sendEnvelope(args);

    should.exist(envelopeId);
  });

  
})
