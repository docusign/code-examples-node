/**
 * @file
 * Example 040: Set document visibility for envelope recipients
 * @author DocuSign
 */

const fs = require("fs-extra");
const docusign = require("docusign-esign");

/**
 * This function does the work of creating the envelope and setting document visibility for envelope recipients
 * @function
 * @param {object} args Data for this method
 * @param {string} args.basePath The API base path URL
 * @param {string} args.accessToken The access token
 * @param {string} args.accountId The account ID
 * @param {object} args.envelopeArgs Data for creating an envelope
 * @param {string} args.envelopeArgs.signer1Email The email of first signer
 * @param {string} args.envelopeArgs.signer1Name The name of first signer
 * @param {string} args.envelopeArgs.signer2Email The email of second signer
 * @param {string} args.envelopeArgs.signer2Name The name of second signer
 * @param {string} args.envelopeArgs.ccEmail The email of cc recipient
 * @param {string} args.envelopeArgs.ccName The name of cc recipient
 * @param {string} args.envelopeArgs.status The status of the envelope
 * @param {string} args.envelopeArgs.doc2File Path to the second document
 * @param {string} args.envelopeArgs.doc3File Path to the third document
 */
async function sendEnvelope(args) {
  //ds-snippet-start:eSign40Step2
  const dsApiClient = new docusign.ApiClient();

  dsApiClient.setBasePath(args.basePath);
  dsApiClient.addDefaultHeader("Authorization", "Bearer " + args.accessToken);
  //ds-snippet-end:eSign40Step2

  //ds-snippet-start:eSign40Step4
  const envelopesApi = new docusign.EnvelopesApi(dsApiClient);

  // Make the envelope request body
  const envelope = makeEnvelope(args.envelopeArgs);

  // Call Envelopes::create API method
  // Exceptions will be caught by the calling function
  const results = await envelopesApi.createEnvelope(args.accountId, {
    envelopeDefinition: envelope,
  });
  const envelopeId = results.envelopeId;
  //ds-snippet-end:eSign40Step4

  console.log(`Envelope was created. EnvelopeId ${envelopeId}`);
  return { envelopeId };
};

/**
 * Creates envelope definition
 * @function
 * @param {object} args Data for creating an envelope
 * @param {string} args.signer1Email The email of first signer
 * @param {string} args.signer1Name The name of first signer
 * @param {string} args.signer2Email The email of second signer
 * @param {string} args.signer2Name The name of second signer
 * @param {string} args.ccEmail The email of cc recipient
 * @param {string} args.ccName The name of cc recipient
 * @param {string} args.status The status of the envelope
 * @param {string} args.doc2File Path to the second document
 * @param {string} args.doc3File Path to the third document
 * @returns {docusign.EnvelopeDefinition} An envelope definition
 * @private
 */
//ds-snippet-start:eSign40Step3
function makeEnvelope(args) {
  /**
   * document 1 (html) has tag **signature_1**
   * document 2 (docx) has tag /sn1/
   * document 3 (pdf) has tag /sn1/
   *   
   * The envelope has two recipients.
   * recipient 1 - signer 1
   * recipient 2 - signer 2
   * recipient 3 - cc
   * The envelope will be sent first to the signer 1 and then to signer 2.
   * After it is signed, a copy is sent to the cc person.
   */

  let doc2DocxBytes, doc3PdfBytes;
  // read files from a local directory
  // The reads could raise an exception if the file is not available!
  doc2DocxBytes = fs.readFileSync(args.doc2File);
  doc3PdfBytes = fs.readFileSync(args.doc3File);

  // create the envelope definition
  let env = new docusign.EnvelopeDefinition();
  env.emailSubject = "Please sign this document set";

  // add the documents
  const doc1b64 = Buffer.from(document1(args)).toString("base64"),
    doc2b64 = Buffer.from(doc2DocxBytes).toString("base64"),
    doc3b64 = Buffer.from(doc3PdfBytes).toString("base64");

  const doc1 = new docusign.Document.constructFromObject({
    documentBase64: doc1b64,
    name: "Order acknowledgement", // can be different from actual file name
    fileExtension: "html", // Source data format. Signed docs are always pdf.
    documentId: "1", // a label used to reference the doc
  })

  // Alternate pattern: using constructors for docs 2 and 3...
  const doc2 = new docusign.Document.constructFromObject({
    documentBase64: doc2b64,
    name: "Battle Plan", // can be different from actual file name
    fileExtension: "docx",
    documentId: "2",
  });

  const doc3 = new docusign.Document.constructFromObject({
    documentBase64: doc3b64,
    name: "Lorem Ipsum", // can be different from actual file name
    fileExtension: "pdf",
    documentId: "3",
  });

  // The order in the docs array determines the order in the envelope
  env.documents = [doc1, doc2, doc3];

  /**
   * Create signHere fields (also known as tabs) on the documents,
   * We're using anchor (autoPlace) positioning
   *
   * The DocuSign platform searches throughout your envelope's
   * documents for matching anchor strings. So the
   * signHere2 tab will be used in both document 2 and 3 since they
   * use the same anchor string for their "signer 1" tabs.
   */
  const signHere1 = docusign.SignHere.constructFromObject({
    anchorString: "**signature_1**",
    anchorYOffset: "10",
    anchorUnits: "pixels",
    anchorXOffset: "20",
  }),
  signHere2 = docusign.SignHere.constructFromObject({
    anchorString: "/sn1/",
    anchorYOffset: "10",
    anchorUnits: "pixels",
    anchorXOffset: "20",
  });

  // Tabs are set per recipient / signer
  const signer1Tabs = docusign.Tabs.constructFromObject({
    signHereTabs: [signHere1],
  });

  const signer2Tabs = docusign.Tabs.constructFromObject({
    signHereTabs: [signHere2],
  });

  // create a signer recipient to sign the document, identified by name and email
  // We're setting the parameters via the object constructor
  const signer1 = docusign.Signer.constructFromObject({
    email: args.signer1Email,
    name: args.signer1Name,
    recipientId: "1",
    routingOrder: "1",
    excludedDocuments: [2, 3],
    tabs: signer1Tabs,
  });

  const signer2 = docusign.Signer.constructFromObject({
    email: args.signer2Email,
    name: args.signer2Name,
    recipientId: "2",
    routingOrder: "2",
    excludedDocuments: [1],
    tabs: signer2Tabs,
  });

  /**
   * routingOrder (lower means earlier) determines the order of deliveries
   * to the recipients. Parallel routing order is supported by using the
   * same integer as the order for two or more recipients.
   * create a cc recipient to receive a copy of the documents, identified by name and email
   * We're setting the parameters via setters
   */
  const cc = new docusign.CarbonCopy.constructFromObject({
    email: args.ccEmail,
    name: args.ccName,
    routingOrder: "3",
    recipientId: "3",
  });

  // Add the recipients to the envelope object
  const recipients = docusign.Recipients.constructFromObject({
    signers: [signer1, signer2],
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
 * @param {object} args parameters for the envelope
 * @param {string} args.signer1Email The email of first signer
 * @param {string} args.signer1Name The name of first signer
 * @param {string} args.ccEmail The email of cc recipient
 * @param {string} args.ccName The name of cc recipient
 * @returns {string} A document in HTML format
 */

function document1(args) {
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
        <h4>Ordered by ${args.signer1Name}</h4>
        <p style="margin-top:0em; margin-bottom:0em;">Email: ${args.signer1Email}</p>
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
//ds-snippet-end:eSign40Step3

module.exports = { sendEnvelope };
