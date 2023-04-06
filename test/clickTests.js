const fs = require('fs');
const path = require('path');
const chai = require('chai');
const chaiExclude = require('chai-exclude');
const expect = chai.expect;
const should = chai.should();

const { createClickwrap } = require('../lib/click/examples/createClickwrap');
const {
  getInactiveClickwraps,
  activateClickwrap
} = require('../lib/click/examples/activateClickwrap');
const { TEST_TIMEOUT_MS, authenticate } = require('./testHelpers');

const {
  CLICK_BASE_PATH,
  CLICKWRAP_NAME,
  CLICKWRAP_VERSION_NUMBER,
  TEST_TERM_OF_SERVICE_FILE,
} = require('./constants')

chai.use(chaiExclude);

const apiTypes = ['click'];

let ACCOUNT_ID;
let ACCESS_TOKEN;
let CLICKWRAP_ID;

describe ('ClickApi tests:', function() {
  before(async function() {
    this.timeout(TEST_TIMEOUT_MS);

    const { accountId, accessToken } = await authenticate(apiTypes);
      
    should.exist(accountId);
    should.exist(accessToken);

    ACCOUNT_ID = accountId;
    ACCESS_TOKEN = accessToken;
  });

  it('createClickwrap method should create a clickwrap if correct data is provided', async function() {
    this.timeout(TEST_TIMEOUT_MS);

    const args = {
      accessToken: ACCESS_TOKEN,
      basePath: CLICK_BASE_PATH,
      accountId: ACCOUNT_ID,
      clickwrapName: `${CLICKWRAP_NAME}_${Date.now()}`,
      docFile: path.resolve(TEST_TERM_OF_SERVICE_FILE)
    };
      
    const clickwrap = await createClickwrap(args);

    should.exist(clickwrap);
    should.exist(clickwrap.clickwrapId);

    CLICKWRAP_ID = clickwrap.clickwrapId;
  });

  it('getInactiveClickwraps method of activateClickwrap example should return the list of inactive clickwraps if correct data is provided', async function() {
    this.timeout(TEST_TIMEOUT_MS);

    const args = {
      accessToken: ACCESS_TOKEN,
      basePath: CLICK_BASE_PATH,
      accountId: ACCOUNT_ID,
      statuses: ['inactive', 'draft'],
    };

    const clickwraps = await getInactiveClickwraps(args);

    should.exist(clickwraps);
  });

  it('activateClickwrap method should create an active clickwrap if correct data is provided', async function() {
    this.timeout(TEST_TIMEOUT_MS);

    const args  = {
      accessToken: ACCESS_TOKEN,
      basePath: CLICK_BASE_PATH,
      accountId: ACCOUNT_ID,
      clickwrapId: CLICKWRAP_ID,
      clickwrapVersionNumber: CLICKWRAP_VERSION_NUMBER,
    };

    const clickwrap = await activateClickwrap(args);

    should.exist(clickwrap);
  });
})
