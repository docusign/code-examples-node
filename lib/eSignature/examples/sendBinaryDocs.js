/**
 * @file
 * Example 010: Send envelope with multipart mime
 * @author DocuSign
 */

const fs = require("fs-extra");
const nf = require("node-fetch");

/**
 * This function does the work of creating the envelope by using
 * the API directly with multipart mime
 * @param {object} args object
 */
// ***DS.snippet.0.start
const sendBinaryDocs = async (args) => {
  // Data for this method
  // args.basePath
  // args.accessToken
  // args.accountId
  // doc2File: file name for doc 2
  // doc3File: file name for doc 3
  // Step 1. Make the envelope JSON request body
  let envelopeJSON = makeEnvelopeJSON(args.envelopeArgs)
    , results = null
    ;
  // Step 2. Gather documents and their headers
  // Read files from a local directory
  // The reads could raise an exception if the file is not available!
  let documents = [
      {mime: "text/html", filename: envelopeJSON.documents[0].name,
       documentId: envelopeJSON.documents[0].documentId,
       bytes: document1(args.envelopeArgs)},
      {mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
       filename: envelopeJSON.documents[1].name,
       documentId: envelopeJSON.documents[1].documentId,
       bytes: fs.readFileSync(args.doc2File)},
      {mime: "application/pdf", filename: envelopeJSON.documents[2].name,
       documentId: envelopeJSON.documents[2].documentId,
       bytes: fs.readFileSync(args.doc3File)}
  ];
  // Step 3. Create the multipart body
  let CRLF = "\r\n"
    , boundary = "multipartboundary_multipartboundary"
    , hyphens = "--"
    , reqBody
    ;
  reqBody = Buffer.from([
      hyphens, boundary,
      CRLF, "Content-Type: application/json",
      CRLF, "Content-Disposition: form-data",
      CRLF,
      CRLF, JSON.stringify(envelopeJSON, null, "    ")].join('')
  );
  // Loop to add the documents.
  // See section Multipart Form Requests on page https://developers.docusign.com/esign-rest-api/guides/requests-and-responses
  documents.forEach(d => {
      reqBody = Buffer.concat([reqBody, Buffer.from([
          CRLF, hyphens, boundary,
          CRLF, `Content-Type: ${d.mime}`,
          CRLF, `Content-Disposition: file; filename="${d.filename}";documentid=${d.documentId}`,
          CRLF,
          CRLF].join('')), Buffer.from(d.bytes)]
      )
  })
  // Add closing boundary
  reqBody = Buffer.concat([reqBody,
      Buffer.from([CRLF, hyphens, boundary, hyphens, CRLF].join(''))]);
  let options = {
          uri: `${args.basePath}/v2.1/accounts/${args.accountId}/envelopes`,
          method: 'POST',
          headers: {
              'Accept': 'application/json',
              'Content-Type': `multipart/form-data; boundary=${boundary}`,
              'Authorization': `Bearer ${args.accessToken}`
            },
          body: reqBody
      };
  // Step 2. call Envelopes::create API method
  // Exceptions will be caught by the calling function
  const response = await nf(options.uri, options);
  results = await response.json()
  return results;
}

/**
 * Create envelope JSON
 * <br>Document 1: An HTML document.
 * <br>Document 2: A Word .docx document.
 * <br>Document 3: A PDF document.
 * <br>DocuSign will convert all of the documents to the PDF format.
 * <br>The recipients' field tags are placed using <b>anchor</b> strings.
 * @function
 * @param {Object} args object
 * @returns {Envelope} An envelope definition
 * @private
 */
function makeEnvelopeJSON(args){
  // Data for this method
  // args.signerEmail
  // args.signerName
  // args.ccEmail
  // args.ccName
  // document 1 (html) has tag **signature_1**
  // document 2 (docx) has tag /sn1/
  // document 3 (pdf) has tag /sn1/
  //
  // The envelope has two recipients.
  // recipient 1 - signer
  // recipient 2 - cc
  // The envelope will be sent first to the signer.
  // After it is signed, a copy is sent to the cc person.
  // create the envelope definition
  let envJSON = {};
  envJSON.emailSubject = 'Please sign this document set';
  // add the documents
  let doc1 = {}
    , doc2 = {}
    , doc3 = {}
    ;
  doc1.name = 'Order acknowledgement'; // can be different from actual file name
  doc1.fileExtension = 'html'; // Source data format. Signed docs are always pdf.
  doc1.documentId = '1'; // a label used to reference the doc
  doc2.name = 'Battle Plan'; // can be different from actual file name
  doc2.fileExtension = 'docx';
  doc2.documentId = '2';
  doc3.name = 'Lorem Ipsum'; // can be different from actual file name
  doc3.fileExtension = 'pdf';
  doc3.documentId = '3';
  // The order in the docs array determines the order in the envelope
  envJSON.documents = [doc1, doc2, doc3];
  // create a signer recipient to sign the document, identified by name and email
  // We're setting the parameters via the object creation
  let signer1 = {
      email: args.signerEmail,
      name: args.signerName,
      recipientId: '1',
      routingOrder: '1'};
  // routingOrder (lower means earlier) determines the order of deliveries
  // to the recipients. Parallel routing order is supported by using the
  // same integer as the order for two or more recipients.
  // create a cc recipient to receive a copy of the documents, identified by name and email
  // We're setting the parameters via setters
  let cc1 = {};
  cc1.email = args.ccEmail;
  cc1.name = args.ccName;
  cc1.routingOrder = '2';
  cc1.recipientId = '2';
  // Create signHere fields (also known as tabs) on the documents,
  // We're using anchor (autoPlace) positioning
  //
  // The DocuSign platform searches throughout your envelope's
  // documents for matching anchor strings. So the
  // signHere2 tab will be used in both document 2 and 3 since they
  // use the same anchor string for their "signer 1" tabs.
  let signHere1 = {
      anchorString: '**signature_1**',
      anchorYOffset: '10', anchorUnits: 'pixels',
      anchorXOffset: '20'}
  , signHere2 = {
      anchorString: '/sn1/',
      anchorYOffset: '10', anchorUnits: 'pixels',
      anchorXOffset: '20'}
  ;
  // Tabs are set per recipient / signer
  let signer1Tabs = {signHereTabs: [signHere1, signHere2]};
  signer1.tabs = signer1Tabs;
  // Add the recipients to the envelope object
  let recipients = {signers: [signer1], carbonCopies: [cc1]};
  envJSON.recipients = recipients;
  // Request that the envelope be sent by setting |status| to "sent".
  // To request that the envelope be created as a draft, set to "created"
  envJSON.status = 'sent';
  return envJSON;
}

/**
 * Creates document 1
 * @function
 * @private
 * @param {Object} args object
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
  `
  }

module.exports = { sendBinaryDocs };
