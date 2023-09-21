const fs = require('fs');
const chai = require('chai');
const expect = chai.expect;
const should = chai.should();

const { createTemplate, makeTemplate } = require('../lib/eSignature/examples/createTemplate');
const {
  sendEnvelopeFromTemplate,
  makeEnvelope: makeEnvelopeForUsingTemplate
} = require('../lib/eSignature/examples/useTemplate');
const {
  addDocToTemplate,
  makeEnvelope: makeEnvelopeForAddingDoc,
  document1: document1ForAddingDoc,
  makeRecipientViewRequest: makeRecipientViewRequestForAddingDoc
} = require('../lib/eSignature/examples/addDocToTemplate')
const { setTabValues, makeEnvelope: makeEnvelopeForSetTabValues } = require('../lib/eSignature/examples/setTabValues')
const { TEST_TIMEOUT_MS, authenticate, areEqual, config } = require('./testHelpers');

const {
  TEST_TEMPLATE_PDF_FILE,
  TEST_TEMPLATE_DOCX_FILE,
  TEMPLATE_NAME,
  BASE_PATH,
  signerClientId,
  returnUrl,
  pingUrl,
  CC_EMAIL,
  CC_NAME
} = require('./constants')

let ACCOUNT_ID;
let ACCESS_TOKEN;
let TEMPLATE_ID;

describe ('TemplatesApi tests:', function() {
  before(async function() {
    this.timeout(TEST_TIMEOUT_MS);

    const { accountId, accessToken } = await authenticate();
    
    should.exist(accountId);
    should.exist(accessToken);

    ACCOUNT_ID = accountId;
    ACCESS_TOKEN = accessToken;
  });

  it('createTemplate method should create the correct template definition if correct data is provided', async function() {
    this.timeout(TEST_TIMEOUT_MS);

    const newTemplateName = `${TEMPLATE_NAME}_${Date.now()}`;
    const args = {
      accessToken: ACCESS_TOKEN,
      basePath: BASE_PATH,
      accountId: ACCOUNT_ID,
      templateName: newTemplateName,
      docFile: TEST_TEMPLATE_PDF_FILE
    };

    const { templateId, templateName, createdNewTemplate } = await createTemplate(args);

    TEMPLATE_ID = templateId;

    should.exist(templateId);
    should.exist(templateName);
    should.equal(templateName, newTemplateName);
    should.equal(createdNewTemplate, true);
  });

  it('makeTemplate method of createTemplate example should create correct template definition if correct data is provided', async function() {
    this.timeout(TEST_TIMEOUT_MS);

    const args = {
      templateName: TEMPLATE_NAME,
      docFile: TEST_TEMPLATE_PDF_FILE
    };

    const expected = {
      emailSubject: "Please sign this document",
      description: "Example template created via the API",
      name: TEMPLATE_NAME,
      shared: "false",
      recipients: {
        signers: [
          {
            roleName: "signer",
            recipientId: "1",
            routingOrder: "1",
            tabs: {
              checkboxTabs: [
                {
                  documentId: "1",
                  pageNumber: "1",
                  xPosition: "75",
                  yPosition: "417",
                  tabLabel: "ckAuthorization",
                },
                {
                  documentId: "1",
                  pageNumber: "1",
                  xPosition: "75",
                  yPosition: "447",
                  tabLabel: "ckAuthentication",
                },
                {
                  documentId: "1",
                  pageNumber: "1",
                  xPosition: "75",
                  yPosition: "478",
                  tabLabel: "ckAgreement",
                },
                {
                  documentId: "1",
                  pageNumber: "1",
                  xPosition: "75",
                  yPosition: "508",
                  tabLabel: "ckAcknowledgement",
                }
              ],
              listTabs: [
                {
                  documentId: "1",
                  pageNumber: "1",
                  xPosition: "142",
                  yPosition: "291",
                  font: "helvetica",
                  fontSize: "size14",
                  tabLabel: "list",
                  required: "false",
                  listItems: [
                    {
                      text: "Red",
                      value: "red"
                    },
                    {
                      text: "Orange",
                      value: "orange",
                    },
                    {
                      text: "Yellow",
                      value: "yellow",
                    },
                    {
                      text: "Green",
                      value: "green",
                    },
                    {
                      text: "Blue",
                      value: "blue"
                    },
                    {
                      text: "Indigo",
                      value: "indigo",
                    },
                    {
                      text: "Violet",
                      value: "violet",
                    },
                  ],
                }
              ],
              radioGroupTabs: [
                {
                  documentId: "1",
                  groupName: "radio1",
                  radios: [
                    {
                      font: "helvetica",
                      fontSize: "size14",
                      pageNumber: "1",
                      value: "white",
                      xPosition: "142",
                      yPosition: "384",
                      required: "false",
                    },
                    {
                      font: "helvetica",
                      fontSize: "size14",
                      pageNumber: "1",
                      value: "red",
                      xPosition: "74",
                      yPosition: "384",
                      required: "false",
                    },
                    {
                      font: "helvetica",
                      fontSize: "size14",
                      pageNumber: "1",
                      value: "blue",
                      xPosition: "220",
                      yPosition: "384",
                      required: "false",
                    },
                  ],
                }
              ],
              signHereTabs: [
                {
                  documentId: "1",
                  pageNumber: "1",
                  xPosition: "191",
                  yPosition: "148",
                }
              ],
              textTabs: [
                {
                  documentId: "1",
                  pageNumber: "1",
                  xPosition: "153",
                  yPosition: "230",
                  font: "helvetica",
                  fontSize: "size14",
                  tabLabel: "text",
                  height: "23",
                  width: "84",
                  required: "false",
                }
              ],
              numericalTabs: [
                {
                  documentId: "1",
                  pageNumber: "1",
                  xPosition: "163",
                  yPosition: "260",
                  font: "helvetica",
                  fontSize: "size14",
                  tabLabel: "numericalCurrency",
                  "validationType": "Currency",
                  height: "23",
                  width: "84",
                  required: "false",
                }
              ]
            }
          }
        ],
        carbonCopies: [
          {
            roleName: "cc",
            routingOrder: "2",
            recipientId: "2",
          }
        ]
      },
      documents: [
        {
          documentBase64: Buffer.from(fs.readFileSync(TEST_TEMPLATE_PDF_FILE)).toString("base64"),
          name: "Lorem Ipsum",
          fileExtension: "pdf",
          documentId: "1",
        }
      ],
      status: "created",
    };   
    
    const template = await makeTemplate(args);

    should.exist(template);
    expect(template).excluding(['']).to.deep.equal(expected);
  });

  it('useTemplate method should create the envelope with template if correct data is provided', async function() {
    this.timeout(TEST_TIMEOUT_MS);

    const envelopeArgs  = {
      templateId: TEMPLATE_ID,
      signerEmail: config.signerEmail,
      signerName: config.signerName,
      ccEmail: CC_EMAIL,
      ccName: CC_NAME
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

  it('makeEnvelope method of useTemplate example should create correct envelope definition if correct data is provided', async function() {
    this.timeout(TEST_TIMEOUT_MS);

    const envelopeArgs  = {
      templateId: TEMPLATE_ID,
      signerEmail: config.signerEmail,
      signerName: config.signerName,
      ccEmail: CC_EMAIL,
      ccName: CC_NAME
    };

    const expected = {
      templateId: TEMPLATE_ID,
      templateRoles: [
        {
          email: config.signerEmail,
          name: config.signerName,
          roleName: "signer",
        },
        {
          email: CC_EMAIL,
          name: CC_NAME,
          roleName: "cc",
        }
      ],
      status: 'sent'
    };

    const envelope = await makeEnvelopeForUsingTemplate(envelopeArgs);

    should.exist(envelope);
    expect(areEqual(envelope, expected)).to.be.true;
  });

  it('addDocToTemplate method should correctly add document to a template if correct data is provided', async function() {
    this.timeout(TEST_TIMEOUT_MS);

    const envelopeArgs  = {
      templateId: TEMPLATE_ID,
      signerEmail: config.signerEmail,
      signerName: config.signerName,
      signerClientId: signerClientId,
      ccEmail: CC_EMAIL,
      ccName: CC_NAME,
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

  it('makeEnvelope method of addDocToTemplate should create the correct envelope definition if correct data is provided', async function() {
    this.timeout(TEST_TIMEOUT_MS);

    const item = 'Item';
    const quantity = '5';

    const envelopeArgs  = {
      templateId: TEMPLATE_ID,
      signerEmail: config.signerEmail,
      signerName: config.signerName,
      signerClientId: signerClientId,
      ccEmail: CC_EMAIL,
      ccName: CC_NAME,
      item: item,
      quantity: quantity,
      dsReturnUrl: returnUrl,
      dsPingUrl: pingUrl
    };

    const documentText = `
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
        <p style="margin-top:0em; margin-bottom:0em;">Copy to: ${CC_NAME}, ${CC_EMAIL}</p>
        <p style="margin-top:3em; margin-bottom:0em;">Item: <b>${item}</b>, quantity: <b>${quantity}</b> at market price.</p>
        <p style="margin-top:3em;">
  Candy bonbon pastry jujubes lollipop wafer biscuit biscuit. Topping brownie sesame snaps sweet roll pie. Croissant danish biscuit soufflé caramels jujubes jelly. Dragée danish caramels lemon drops dragée. Gummi bears cupcake biscuit tiramisu sugar plum pastry. Dragée gummies applicake pudding liquorice. Donut jujubes oat cake jelly-o. Dessert bear claw chocolate cake gummies lollipop sugar plum ice cream gummies cheesecake.
        </p>
        <!-- Note the anchor tag for the signature field is in white. -->
        <h3 style="margin-top:3em;">Agreed: <span style="color:white;">**signature_1**/</span></h3>
        </body>
    </html>
  `;

    const expected = {
      compositeTemplates: [
        {
          compositeTemplateId: "1",
          serverTemplates: [
            {
              sequence: "1",
              templateId: TEMPLATE_ID,
            },
          ],
          inlineTemplates: [
            {
              sequence: "2",
              recipients: {
                carbonCopies: [
                  {
                    email: CC_EMAIL,
                    name: CC_NAME,
                    roleName: "cc",
                    recipientId: "2",
                  }
                ],
                signers: [
                  {
                    email: config.signerEmail,
                    name: config.signerName,
                    roleName: "signer",
                    recipientId: "1",
                    clientUserId: signerClientId,
                  }
                ],
              },
            },
          ],
        },
        {
          compositeTemplateId: "2",
          inlineTemplates: [
            {
              sequence: "1",
              recipients: {
                carbonCopies: [
                  {
                    email: CC_EMAIL,
                    name: CC_NAME,
                    roleName: "cc",
                    recipientId: "2",
                  }
                ],
                signers: [
                  {
                    email: config.signerEmail,
                    name: config.signerName,
                    roleName: "signer",
                    recipientId: "1",
                    tabs: {
                      signHereTabs: [
                        {
                          anchorString: "**signature_1**",
                          anchorYOffset: "10",
                          anchorUnits: "pixels",
                          anchorXOffset: "20",
                        }
                      ]
                    },
                  }
                ],
              },
            },
          ],
          document: {
            documentBase64: Buffer.from(documentText).toString("base64"),
            name: "Appendix 1--Sales order",
            fileExtension: "html",
            documentId: "1",
          }
        }
      ],
      status: 'sent'
    };

    const envelope = await makeEnvelopeForAddingDoc(envelopeArgs);

    should.exist(envelope);
    expect(envelope).excluding(['']).to.deep.equal(expected);
  });

  it('document1 method of addDocToTemplate example should return correct HTML document if correct data is provided', async function() {
    this.timeout(TEST_TIMEOUT_MS);

    const item = 'Item';
    const quantity = '5';
    const envelopeArgs  = {
      templateId: TEMPLATE_ID,
      signerEmail: config.signerEmail,
      signerName: config.signerName,
      ccEmail: CC_EMAIL,
      ccName: CC_NAME,
      item: item,
      quantity: quantity,
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
        <p style="margin-top:0em; margin-bottom:0em;">Copy to: ${CC_NAME}, ${CC_EMAIL}</p>
        <p style="margin-top:3em; margin-bottom:0em;">Item: <b>${item}</b>, quantity: <b>${quantity}</b> at market price.</p>
        <p style="margin-top:3em;">
  Candy bonbon pastry jujubes lollipop wafer biscuit biscuit. Topping brownie sesame snaps sweet roll pie. Croissant danish biscuit soufflé caramels jujubes jelly. Dragée danish caramels lemon drops dragée. Gummi bears cupcake biscuit tiramisu sugar plum pastry. Dragée gummies applicake pudding liquorice. Donut jujubes oat cake jelly-o. Dessert bear claw chocolate cake gummies lollipop sugar plum ice cream gummies cheesecake.
        </p>
        <!-- Note the anchor tag for the signature field is in white. -->
        <h3 style="margin-top:3em;">Agreed: <span style="color:white;">**signature_1**/</span></h3>
        </body>
    </html>
  `

    const document = await document1ForAddingDoc(envelopeArgs);

    should.exist(document);
    expect(document).to.be.equal(expected);
  });

  it('makeRecipientView method of addDocToTemplate example should create the correct recipient view request url if correct data is provided', async function() {
    this.timeout(TEST_TIMEOUT_MS);

    const envelopeArgs  = {
      signerEmail: config.signerEmail,
      signerName: config.signerName,
      signerClientId: signerClientId,
      dsReturnUrl: returnUrl,
      dsPingUrl: pingUrl,
    };

    const expected = {
      returnUrl: returnUrl,
      authenticationMethod: 'none',
      email: config.signerEmail,
      userName: config.signerName,
      clientUserId: signerClientId,
      pingFrequency: 600,
      pingUrl: pingUrl
    };

    const viewRequest = await makeRecipientViewRequestForAddingDoc(envelopeArgs);

    should.exist(viewRequest);
    expect({...viewRequest}).to.deep.equal({...expected});
  });

  it('setTabValues method should correctly set the tab values of template if correct data is provided', async function() {
    this.timeout(TEST_TIMEOUT_MS);

    const envelopeArgs  = {
      signerEmail: config.signerEmail,
      signerName: config.signerName,
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

  it('makeEnvelope method of setTabValues example should create correct envelope definition if correct data is provided', async function() {
    this.timeout(TEST_TIMEOUT_MS);

    const envelopeArgs  = {
      signerEmail: config.signerEmail,
      signerName: config.signerName,
      signerClientId: signerClientId,
      dsReturnUrl: returnUrl,
      docFile: TEST_TEMPLATE_DOCX_FILE
    };

    const expected = {
      emailSubject: "Please sign this salary document",
      recipients: {
        signers: [
          {
            email: config.signerEmail,
            name: config.signerName,
            clientUserId: signerClientId,
            recipientId: '1',
            tabs: {
              signHereTabs: [
                {
                  anchorString: "/sn1/",
                  anchorUnits: "pixels",
                  anchorYOffset: "10",
                  anchorXOffset: "20",
                }
              ],
              textTabs: [
                {
                  anchorString: "/legal/",
                  anchorUnits: "pixels",
                  anchorYOffset: "-9",
                  anchorXOffset: "5",
                  font: "helvetica",
                  fontSize: "size11",
                  bold: "true",
                  value: config.signerName,
                  locked: "false",
                  tabId: "legal_name",
                  tabLabel: "Legal name",
                },
                {
                  anchorString: "/familiar/",
                  anchorUnits: "pixels",
                  anchorYOffset: "-9",
                  anchorXOffset: "5",
                  font: "helvetica",
                  fontSize: "size11",
                  bold: "true",
                  value: config.signerName,
                  locked: "false",
                  tabId: "familiar_name",
                  tabLabel: "Familiar name",
                }
              ],
              "numericalTabs": [
                {
                  bold: "true",
                  documentId: "1",
                  font: "helvetica",
                  fontSize: "size11",
                  height: "20",
                  localePolicy: {
                    cultureName: "en-US",
                    currencyCode: "usd",
                    currencyNegativeFormat: "minus_csym_1_comma_234_comma_567_period_89",
                    currencyPositiveFormat: "csym_1_comma_234_comma_567_period_89",
                    useLongCurrencyFormat: "true",
                  },
                  numericalValue: "123000",
                  pageNumber: "1",
                  tabId: "salary",
                  tabLabel: "Salary",
                  validationType: "Currency",
                  width: "70",
                  xPosition: "210",
                  yPosition: "235",
                }
              ]
            }
          }
        ]
      },
      status: "sent",
      customFields: {
        textCustomFields: [
          {
            name: "salary",
            required: "false",
            show: "true",
            value: '123000',
          }
        ]
      },
      documents: [
        {
          documentBase64: Buffer.from(fs.readFileSync(TEST_TEMPLATE_DOCX_FILE)).toString("base64"),
          name: "Lorem Ipsum",
          fileExtension: "docx",
          documentId: "1",
        }
      ]
    }

    const envelope = await makeEnvelopeForSetTabValues(envelopeArgs);

    should.exist(envelope);
    expect(envelope).excluding(['']).to.deep.equal(expected);
  });
});
