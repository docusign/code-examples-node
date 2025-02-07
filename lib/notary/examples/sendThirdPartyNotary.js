/**
 * @file
 * Example 004: Send third party notary
 * @author DocuSign
 */

const fs = require('fs-extra');
const docusign = require('docusign-esign');

/**
 * This function does the work of creating the envelope
 */

const sendEnvelope = async (args) => {
  // Data for this method
  // args.basePath
  // args.accessToken
  // args.accountId

  //ds-snippet-start:Notary4Step2
  let dsApiClient = new docusign.ApiClient();
  dsApiClient.setBasePath(args.basePath);
  dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + args.accessToken);
  let envelopesApi = new docusign.EnvelopesApi(dsApiClient);
  //ds-snippet-end:Notary4Step2
    let results = null;

  // Make the envelope request body
  //ds-snippet-start:Notary4Step3
  let envelope = makeEnvelope(args.envelopeArgs);
  //ds-snippet-end:Notary4Step3

  // Call the Envelopes::create API method
  // Exceptions will be caught by the calling function
  //ds-snippet-start:Notary4Step4
  results = await envelopesApi.createEnvelope(args.accountId, {
    envelopeDefinition: envelope,
  });
  let envelopeId = results.envelopeId;
  //ds-snippet-end:Notary4Step4

  console.log(`Envelope was created. EnvelopeId ${envelopeId}`);
  return { envelopeId: envelopeId };
};

/**
 * Creates envelope
 * @function
 * @param {Object} args parameters for the envelope
 * @returns {Envelope} An envelope definition
 * @private
 */

//ds-snippet-start:Notary4Step3
function makeEnvelope(args) {
  // Data for this method
  // args.signerEmail
  // args.signerName
  // args.status

  // document 1 (html) has tag **signature_1**
  //
  // The envelope has two recipients.
  // recipient 1 - signer
  // The envelope will be sent first to the signer.
  // After it is signed, a copy is sent to the cc person.

  // create the envelope definition
  let env = new docusign.EnvelopeDefinition();
  env.emailSubject = 'Please sign this document set';

  // add the documents
  let doc1 = new docusign.Document();
    let doc1b64 = Buffer.from(document1(args)).toString('base64');
  doc1.documentBase64 = doc1b64;
  doc1.name = 'Order acknowledgement'; // can be different from actual file name
  doc1.fileExtension = 'html'; // Source data format. Signed docs are always pdf.
  doc1.documentId = '1'; // a label used to reference the doc

  // The order in the docs array determines the order in the envelope
  env.documents = [doc1];

  // create a signer recipient to sign the document, identified by name and email
  // We're setting the parameters via the object constructor
  let signer1 = docusign.Signer.constructFromObject({
    email: args.signerEmail,
    name: args.signerName,
    recipientId: '2',
    routingOrder: '1',
    notaryId: '1',
    clientUserId: '1000',
  });
  // routingOrder (lower means earlier) determines the order of deliveries
  // to the recipients. Parallel routing order is supported by using the
  // same integer as the order for two or more recipients.

  // Create signHere fields (also known as tabs) on the documents,
  // We're using anchor (autoPlace) positioning
  //
  // The DocuSign platform searches throughout your envelope's
  // documents for matching anchor strings. So the
  // use the same anchor string for their "signer 1" tabs.
  let signHere1 = docusign.SignHere.constructFromObject({
      xPosition: '200',
      yPosition: '235',
      pageNumber: '1',
      documentId: '1'
    });
    let signHere2 = docusign.SignHere.constructFromObject({
      stampType: 'stamp',
      documentId: '1',
      xPosition: '200',
      yPosition: '150',
      pageNumber: '1',
      
    });
  // Tabs are set per recipient / signer
  let signer1Tabs = docusign.Tabs.constructFromObject({
    signHereTabs: [signHere1, signHere2],
  });
  signer1.tabs = signer1Tabs;

  const notarySealTab = {
    xPosition: '300',
    yPosition: '235',
    documentId: '1',
    pageNumber: '1',
};

const notarySignHereTab = {
    xPosition: '300',
    yPosition: '150',
    documentId: '1',
    pageNumber: '1',
};

const notaryTabs = {
    signHereTabs: [notarySignHereTab],
    notarySealTabs: [notarySealTab],
};

const notaryRecipient = [
    {
        name: 'Notary',
        recipientId: '1',
        routingOrder: '1',
        tabs: notaryTabs,
        notaryType: 'remote',
        notarySourceType: 'thirdparty',
        notaryThirdPartyPartner: 'onenotary',
        recipientSignatureProviders: [
          {
            sealDocumentsWithTabsOnly: 'false',
            signatureProviderName: 'ds_authority_idv',
            signatureProviderOptions: {}
          }
        ],
    },
];

  // Add the recipients to the envelope object
  let recipients = docusign.Recipients.constructFromObject({
    signers: [signer1],
    notaries: [...notaryRecipient],
  });
  env.recipients = recipients;

  // Request that the envelope be sent by setting |status| to "sent".
  // To request that the envelope be created as a draft, set to "created"
  env.status = args.status;

  return env;
}
//ds-snippet-end:Notary4Step3

/**
 * Creates document 1
 * @function
 * @private
 * @param {Object} args parameters for the envelope
 * @returns {string} A document in HTML format
 */

function document1(args) {
  // Data for this method
  // args.signerEmail
  // args.signerName
  // args.ccEmail
  // args.ccName

  return `
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
        <h4>Ordered by ${args.signerName}</h4>
        <p style="margin-top:0em; margin-bottom:0em;">Email: ${args.signerEmail}</p>
        <p style="margin-top:0em; margin-bottom:0em;">Copy to: ${args.ccName}, ${args.ccEmail}</p>
        <p style="margin-top:3em;">
  Candy bonbon pastry jujubes lollipop wafer biscuit biscuit. Topping brownie sesame snaps sweet roll pie. Croissant danish biscuit soufflé caramels jujubes jelly. Dragée danish caramels lemon drops dragée. Gummi bears cupcake biscuit tiramisu sugar plum pastry. Dragée gummies applicake pudding liquorice. Donut jujubes oat cake jelly-o. Dessert bear claw chocolate cake gummies lollipop sugar plum ice cream gummies cheesecake.
        </p>
        <!-- Note the anchor tag for the signature field is in white. -->
        <h3 style="margin-top:3em;">Agreed: <span style="color:white;">**signature_1**/</span></h3>
        </body>
    </html>
  `;
}

module.exports = { sendEnvelope, makeEnvelope, document1 };
