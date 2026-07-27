/**
 * @file
 * Example 046: Request a signature bt multiple delivery channels
 * @author DocuSign
 */

const fs = require('fs-extra');
const docusign = require('docusign-esign');

/**
 * This function does the work of creating the envelope and sending it by multiple channels
 */
const sendByMultipleChannels = async (args) => {
  // Data for this method
  // args.basePath
  // args.accessToken
  // args.accountId

  const dsApiClient = new docusign.ApiClient();
  dsApiClient.setBasePath(args.basePath);
  dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + args.accessToken);
  const envelopesApi = new docusign.EnvelopesApi(dsApiClient);
  let results = null;

  // Make the envelope request body
  const envelope = makeEnvelope(args.envelopeArgs);

  // call Envelopes::create API method
  // Exceptions will be caught by the calling function
  //ds-snippet-start:eSign46Step3
  results = await envelopesApi.createEnvelope(args.accountId, {
    envelopeDefinition: envelope,
  });
  //ds-snippet-end:eSign46Step3
  const envelopeId = results.envelopeId;

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
//ds-snippet-start:eSign46Step2
function makeEnvelope(args) {
  // Data for this method
  // args.signerName
  // args.phoneNumber
  // args.countryCode
  // args.ccName
  // args.ccPhoneNumber
  // args.ccCountryCode
  // args.status
  // doc2File
  // doc3File

  // document 1 (html) has tag **signature_1**
  // document 2 (docx) has tag /sn1/
  // document 3 (pdf) has tag /sn1/
  //
  // The envelope has two recipients.
  // recipient 1 - signer
  // recipient 2 - cc
  // The envelope will be sent first to the signer.
  // After it is signed, a copy is sent to the cc person.

  let doc2DocxBytes, doc3PdfBytes;
  // read files from a local directory
  // The reads could raise an exception if the file is not available!
  doc2DocxBytes = fs.readFileSync(args.doc2File);
  doc3PdfBytes = fs.readFileSync(args.doc3File);

  // create the envelope definition
  const env = new docusign.EnvelopeDefinition();
  env.emailSubject = 'Please sign this document set';

  // add the documents
  const doc1 = new docusign.Document();
  const doc1b64 = Buffer.from(document1(args)).toString('base64');
  const doc2b64 = Buffer.from(doc2DocxBytes).toString('base64');
  const doc3b64 = Buffer.from(doc3PdfBytes).toString('base64');
  doc1.documentBase64 = doc1b64;
  doc1.name = 'Order acknowledgement'; // can be different from actual file name
  doc1.fileExtension = 'html'; // Source data format. Signed docs are always pdf.
  doc1.documentId = '1'; // a label used to reference the doc

  // Alternate pattern: using constructors for docs 2 and 3...
  const doc2 = new docusign.Document.constructFromObject({
    documentBase64: doc2b64,
    name: 'Battle Plan', // can be different from actual file name
    fileExtension: 'docx',
    documentId: '2',
  });

  const doc3 = new docusign.Document.constructFromObject({
    documentBase64: doc3b64,
    name: 'Lorem Ipsum', // can be different from actual file name
    fileExtension: 'pdf',
    documentId: '3',
  });

  // The order in the docs array determines the order in the envelope
  env.documents = [doc1, doc2, doc3];

  // Create a RecipientPhoneNumber object for the signer's phone number
  const signerPhoneNumber = docusign.RecipientPhoneNumber.constructFromObject({
    countryCode: args.countryCode,
    number: args.phoneNumber,
  });

  const signerAdditionalNotification = docusign.RecipientAdditionalNotification.constructFromObject({
    secondaryDeliveryMethod: args.deliveryMethod,
    phoneNumber: signerPhoneNumber
  });

  // Create a signer recipient to sign the document, identified by name and phone number
  // We're setting the parameters via the object constructor
  const signer = docusign.Signer.constructFromObject({
    name: args.signerName,
    email: args.signerEmail,
    deliveryMethod: 'Email',
    additionalNotifications: [signerAdditionalNotification],
    recipientId: '1',
    routingOrder: '1',
  });

  // routingOrder (lower means earlier) determines the order of deliveries
  // to the recipients. Parallel routing order is supported by using the
  // same integer as the order for two or more recipients.

  // Create a RecipientPhoneNumber object for the signer's phone number
  const ccPhoneNumber = docusign.RecipientPhoneNumber.constructFromObject({
    countryCode: args.ccCountryCode,
    number: args.ccPhoneNumber,
  });

  const ccAdditionalNotification = docusign.RecipientAdditionalNotification.constructFromObject({
    secondaryDeliveryMethod: args.deliveryMethod,
    phoneNumber: ccPhoneNumber
  });

  // Create a cc recipient to receive a copy of the documents, identified by name and phone number
  // We're setting the parameters via setters
  const cc = new docusign.CarbonCopy.constructFromObject({
    name: args.ccName,
    email: args.ccEmail,
    routingOrder: '2',
    recipientId: '2',
    deliveryMethod: 'Email',
    additionalNotifications: [ccAdditionalNotification],
  });

  // Create signHere fields (also known as tabs) on the documents,
  // We're using anchor (autoPlace) positioning
  //
  // The DocuSign platform searches throughout your envelope's
  // documents for matching anchor strings. So the
  // signHere2 tab will be used in both document 2 and 3 since they
  // use the same anchor string for their "signer 1" tabs.
  const signHere1 = docusign.SignHere.constructFromObject({
    anchorString: '**signature_1**',
    anchorYOffset: '10',
    anchorUnits: 'pixels',
    anchorXOffset: '20',
  });
  const signHere2 = docusign.SignHere.constructFromObject({
    anchorString: '/sn1/',
    anchorYOffset: '10',
    anchorUnits: 'pixels',
    anchorXOffset: '20',
  });
  // Tabs are set per recipient / signer
  const signerTabs = docusign.Tabs.constructFromObject({
    signHereTabs: [signHere1, signHere2],
  });
  signer.tabs = signerTabs;

  // Add the recipients to the envelope object
  const recipients = docusign.Recipients.constructFromObject({
    signers: [signer],
    carbonCopies: [cc],
  });
  env.recipients = recipients;

  // Request that the envelope be sent by setting |status| to "sent".
  // To request that the envelope be created as a draft, set to "created"
  env.status = args.status;

  return env;
}

/**
 * Creates document 1
 * @function
 * @private
 * @param {Object} args parameters for the envelope
 * @returns {string} A document in HTML format
 */

function document1(args) {
  // Data for this method
  // args.signerName
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
        <p style="margin-top:0em; margin-bottom:0em;">Phone number: ${args.phoneNumber}</p>
        <p style="margin-top:0em; margin-bottom:0em;">Copy to: ${args.ccName}, ${args.ccPhoneNumber}</p>
        <p style="margin-top:3em;">
  Candy bonbon pastry jujubes lollipop wafer biscuit biscuit. Topping brownie sesame snaps sweet roll pie. Croissant danish biscuit soufflé caramels jujubes jelly. Dragée danish caramels lemon drops dragée. Gummi bears cupcake biscuit tiramisu sugar plum pastry. Dragée gummies applicake pudding liquorice. Donut jujubes oat cake jelly-o. Dessert bear claw chocolate cake gummies lollipop sugar plum ice cream gummies cheesecake.
        </p>
        <!-- Note the anchor tag for the signature field is in white. -->
        <h3 style="margin-top:3em;">Agreed: <span style="color:white;">**signature_1**/</span></h3>
        </body>
    </html>
  `;
}
//ds-snippet-end:eSign46Step2
module.exports = { sendByMultipleChannels };
