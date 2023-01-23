const fs = require('fs');
const path = require('path');
const chai = require('chai');
const chaiExclude = require('chai-exclude');
const expect = chai.expect;
const should = chai.should();

const { createBrand } = require('../lib/eSignature/examples/createBrand');
const {
  applyBrandToEnvelope,
  makeEnvelope: makeEnvelopeForApplyingBrand,
  document1: makeHtmlDocForApplyingBrand,
  getBrands
} = require('../lib/eSignature/examples/applyBrandToEnvelope');
const { createPermission } = require('../lib/eSignature/examples/createPermission');
const { TEST_TIMEOUT_MS, authenticate, config } = require('./testHelpers');

const {
  TEST_PDF_FILE,
  TEST_DOCX_FILE,
  BASE_PATH,
  BRAND_NAME,
  DEFAULT_BRAND_LANGUAGE,
  PERMISSION_PROFILE_NAME,
} = require('./constants')

chai.use(chaiExclude);

let ACCOUNT_ID;
let ACCESS_TOKEN;
let BRAND_ID;

describe ('AccountsApi tests:', function() {
  before(async function() {
    this.timeout(TEST_TIMEOUT_MS);

    const { accountId, accessToken } = await authenticate();
      
    should.exist(accountId);
    should.exist(accessToken);

    ACCOUNT_ID = accountId;
    ACCESS_TOKEN = accessToken;
  });

  it('createBrand method should create a brand if correct data is provided', async function() {
    this.timeout(TEST_TIMEOUT_MS);

    const args = {
      accessToken: ACCESS_TOKEN,
      basePath: BASE_PATH,
      accountId: ACCOUNT_ID,
      brandName: `${BRAND_NAME}_${Date.now()}`,
      defaultBrandLanguage: DEFAULT_BRAND_LANGUAGE
    };

    const brand = await createBrand(args);
    
    should.exist(brand);
    should.exist(brand.brands);
    should.exist(brand.brands[0]);
    should.exist(brand.brands[0].brandId);
    
    BRAND_ID = brand.brands[0].brandId;
  });

  it('applyBrandToEnvelope method should create the correct envelope and apply brand to it if correct data is provided', async function() {
    this.timeout(TEST_TIMEOUT_MS);

    const envelopeArgs  = {
      signerEmail: config.signerEmail,
      signerName: config.signerName,
      brandId: BRAND_ID,
      status: "sent",
      doc2File: path.resolve(TEST_DOCX_FILE),
      doc3File: path.resolve(TEST_PDF_FILE),
    };
    const args = {
      accessToken: ACCESS_TOKEN,
      basePath: BASE_PATH,
      accountId: ACCOUNT_ID,
      envelopeArgs: envelopeArgs
    };

    const { envelopeId } = await applyBrandToEnvelope(args);

    should.exist(envelopeId);
  });

  it('makeEnvelope method of applyBrandToEnvelope example should create the correct envelope definition if correct data is provided', async function() {
    this.timeout(TEST_TIMEOUT_MS);

    const envelopeArgs  = {
      signerEmail: config.signerEmail,
      signerName: config.signerName,
      brandId: BRAND_ID,
      status: "sent",
      doc2File: path.resolve(TEST_DOCX_FILE),
      doc3File: path.resolve(TEST_PDF_FILE),
    };

    const document1Text = `
    <!DOCTYPE html>
    <html>
        <head>
          <meta charset="UTF-8">
        </head>
        <body style="font-family:sans-serif;margin-left:2em;">
        <h1 style="font-family: 'Trebuchet MS', Helvetica, sans-serif;
            color: darkblue;margin-bottom: 0;">World Wide Corp</h1>
        <h2 style="font-family: 'Trebuchet MS', Helvetica, sans-serif;
          margin-top: 0px;margin-bottom: 3.5em;font-size: 1em;
          color: darkblue;">Order Processing Division</h2>
        <h4>Ordered by ${config.signerName}</h4>
        <p style="margin-top:0em; margin-bottom:0em;">Email: ${config.signerEmail}</p>
        <p style="margin-top:3em;">
  Candy bonbon pastry jujubes lollipop wafer biscuit biscuit. Topping brownie sesame snaps sweet roll pie. Croissant danish biscuit soufflé caramels jujubes jelly. Dragée danish caramels lemon drops dragée. Gummi bears cupcake biscuit tiramisu sugar plum pastry. Dragée gummies applicake pudding liquorice. Donut jujubes oat cake jelly-o. Dessert bear claw chocolate cake gummies lollipop sugar plum ice cream gummies cheesecake.
        </p>
        <!-- Note the anchor tag for the signature field is in white. -->
        <h3 style="margin-top:3em;">Agreed: <span style="color:white;">**signature_1**/</span></h3>
        </body>
    </html>
  `;

    const expected = {
      emailSubject: "Please sign this document set",
      documents: [
        {
          documentBase64: Buffer.from(document1Text).toString("base64"),
          name: 'Order acknowledgement',
          fileExtension: 'html',
          documentId: '1',
        },
        {
          documentBase64: Buffer.from(fs.readFileSync(path.resolve(TEST_DOCX_FILE))).toString("base64"),
          name: "Battle Plan",
          fileExtension: "docx",
          documentId: "2",
        },
        {
          documentBase64: Buffer.from(fs.readFileSync(path.resolve(TEST_PDF_FILE))).toString("base64"),
          name: "Lorem Ipsum",
          fileExtension: "pdf",
          documentId: "3",
        }
      ],
      recipients: {
        signers: [
          {
            email: config.signerEmail,
            name: config.signerName,
            recipientId: '1',
            routingOrder: '1',
            tabs: {
              signHereTabs: [
                {
                  anchorString: "**signature_1**",
                  anchorYOffset: "10",
                  anchorUnits: "pixels",
                  anchorXOffset: "20",
                },
                {
                  anchorString: "/sn1/",
                  anchorYOffset: "10",
                  anchorUnits: "pixels",
                  anchorXOffset: "20",
                }
              ]
            }
          }
        ],
      },
      status: 'sent',
      brandId: BRAND_ID
    };

    const envelope = await makeEnvelopeForApplyingBrand(envelopeArgs);

    should.exist(envelope);
    expect(envelope).excluding(['']).to.deep.equal(expected);
  });

  it('document1 method of applyBrandToEnvelope example should return correct HTML document if correct data is provided', async function() {
    this.timeout(TEST_TIMEOUT_MS);

    const args  = {
      signerEmail: config.signerEmail,
      signerName: config.signerName,
      brandId: BRAND_ID,
      status: "sent",
      doc2File: path.resolve(TEST_DOCX_FILE),
      doc3File: path.resolve(TEST_PDF_FILE),
    };

    const expected = `
    <!DOCTYPE html>
    <html>
        <head>
          <meta charset="UTF-8">
        </head>
        <body style="font-family:sans-serif;margin-left:2em;">
        <h1 style="font-family: 'Trebuchet MS', Helvetica, sans-serif;
            color: darkblue;margin-bottom: 0;">World Wide Corp</h1>
        <h2 style="font-family: 'Trebuchet MS', Helvetica, sans-serif;
          margin-top: 0px;margin-bottom: 3.5em;font-size: 1em;
          color: darkblue;">Order Processing Division</h2>
        <h4>Ordered by ${config.signerName}</h4>
        <p style="margin-top:0em; margin-bottom:0em;">Email: ${config.signerEmail}</p>
        <p style="margin-top:3em;">
  Candy bonbon pastry jujubes lollipop wafer biscuit biscuit. Topping brownie sesame snaps sweet roll pie. Croissant danish biscuit soufflé caramels jujubes jelly. Dragée danish caramels lemon drops dragée. Gummi bears cupcake biscuit tiramisu sugar plum pastry. Dragée gummies applicake pudding liquorice. Donut jujubes oat cake jelly-o. Dessert bear claw chocolate cake gummies lollipop sugar plum ice cream gummies cheesecake.
        </p>
        <!-- Note the anchor tag for the signature field is in white. -->
        <h3 style="margin-top:3em;">Agreed: <span style="color:white;">**signature_1**/</span></h3>
        </body>
    </html>
  `;
    
    const html_doc = await makeHtmlDocForApplyingBrand(args);

    should.exist(html_doc);
    expect(html_doc).to.be.equal(expected);
  });

  it('getBrands method of applyBrandToEnvelope example should return the list of brands if correct data is provided', async function() {
    this.timeout(TEST_TIMEOUT_MS);

    const args = {
      accessToken: ACCESS_TOKEN,
      basePath: BASE_PATH,
      accountId: ACCOUNT_ID,
    };

    const brands = await getBrands(args);

    should.exist(brands);
  });

  it('createPermission should create correct permission profile if correct data is provided', async function() {
    this.timeout(TEST_TIMEOUT_MS);

    const args = {
      accessToken: ACCESS_TOKEN,
      basePath: BASE_PATH,
      accountId: ACCOUNT_ID,
      profileName: `${PERMISSION_PROFILE_NAME}_${Date.now()}`,
    };

    const profile = await createPermission(args);

    should.exist(profile);
  });
})
