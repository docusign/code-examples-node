const path = require('path');
const chai = require('chai');
const chaiExclude = require('chai-exclude');
const should = chai.should();

const { bulkSendEnvelopes } = require('../lib/eSignature/examples/bulkSendEnvelope');
const { TEST_TIMEOUT_MS, authenticate, config } = require('./testHelpers');

const {
  TEST_PDF_FILE,
  BASE_PATH,
  CC_EMAIL,
  CC_NAME,
  SIGNER2_NAME,
  SIGNER2_EMAIL,
  CC2_NAME,
  CC2_EMAIL,
} = require('./constants')

chai.use(chaiExclude);

let ACCOUNT_ID;
let ACCESS_TOKEN;

describe ('BulkEnvelopesApi tests:', function() {
  before(async function() {
    this.timeout(TEST_TIMEOUT_MS);

    const { accountId, accessToken } = await authenticate();
      
    should.exist(accountId);
    should.exist(accessToken);

    ACCOUNT_ID = accountId;
    ACCESS_TOKEN = accessToken;
  });

  it('bulkSendEnvelopes method should create a bulk send request if correct data is provided', async function() {
    this.timeout(TEST_TIMEOUT_MS);

    const list1 = {
      signer: {
        name: config.signerName,
        email: config.signerEmail,
      },
      cc: {
        name: CC_NAME,
        email: CC_EMAIL,
      }
    };
    const list2 = {
      signer: {
        name: SIGNER2_NAME,
        email: SIGNER2_EMAIL,
      },
      cc: {
        name: CC2_NAME,
        email: CC2_EMAIL,
      }
    };

    const args = {
      accessToken: ACCESS_TOKEN,
      basePath: BASE_PATH,
      accountId: ACCOUNT_ID,
      list1: list1,
      list2: list2,
      docFile: path.resolve(TEST_PDF_FILE)
    };

    const bulkSendStatus = await bulkSendEnvelopes(args);

    should.exist(bulkSendStatus);
  });
})
