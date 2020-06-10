/**
 * @file
 * Example 010: Send envelope with multipart mime
 * @author DocuSign
 */

const path = require('path')
    , fs = require('fs-extra')
    , dsConfig = require('../../config/index.js').config
    , rp = require('request-promise-native')
    , validator = require('validator')
    ;

const eg010SendBinaryDocs = exports
    , eg = 'eg010' // This example reference.
    , mustAuthenticate = '/ds/mustAuthenticate'
    , minimumBufferMin = 3
    , demoDocsPath = path.resolve(__dirname, '../../demo_documents')
    , doc2File = 'World_Wide_Corp_Battle_Plan_Trafalgar.docx'
    , doc3File = 'World_Wide_Corp_lorem.pdf'
    ;


/**
 * Create envelope using multipart and sending documents in binary
 * @param {object} req Request obj
 * @param {object} res Response obj
 */
eg010SendBinaryDocs.createController = async (req, res) => {
    // Step 1. Check the token
    // At this point we should have a good token. But we
    // double-check here to enable a better UX to the user.
    let tokenOK = req.dsAuth.checkToken(minimumBufferMin);
    if (! tokenOK) {
        req.flash('info', 'Sorry, you need to re-authenticate.');
        // We could store the parameters of the requested operation
        // so it could be restarted automatically.
        // But since it should be rare to have a token issue here,
        // we'll make the user re-enter the form data after
        // authentication.
        req.dsAuth.setEg(req, eg);
        res.redirect(mustAuthenticate);
    }

    // Step 2. Call the worker method
    let body = req.body
        // Additional data validation might also be appropriate
      , signerEmail = validator.escape(body.signerEmail)
      , signerName = validator.escape(body.signerName)
      , ccEmail = validator.escape(body.ccEmail)
      , ccName = validator.escape(body.ccName)
      , envelopeArgs = {
            signerEmail: signerEmail,
            signerName: signerName,
            ccEmail: ccEmail,
            ccName: ccName }
      , args = {
            accessToken: req.user.accessToken,
            basePath: req.session.basePath,
            accountId: req.session.accountId,
            envelopeArgs: envelopeArgs,
            demoDocsPath: demoDocsPath,
            doc2File: doc2File,
            doc3File: doc3File
        }
      , results = null
      ;

    try {
        results = await eg010SendBinaryDocs.worker (args)
    }
    catch (error) {
        let errorBody = error && error.response && error.response.body
        // Since we're using the request library at a low level, the body
        // is not automatically JSON parsed.
        try {
            if (errorBody) {errorBody = JSON.parse(errorBody)}
        }
        catch (e) {;}
        // we can pull the DocuSign error code and message from the response body
        let errorCode = errorBody && errorBody.errorCode
            , errorMessage = errorBody && errorBody.message
            ;
        // In production, may want to provide customized error messages and
        // remediation advice to the user.
        res.render('pages/error', {err: error, errorCode: errorCode, errorMessage: errorMessage});
    }
    if (results) {
        req.session.envelopeId = results.envelopeId; // Save for use by other examples
            // which need an envelopeId
        res.render('pages/example_done', {
            title: "Envelope sent",
            h1: "Envelope sent",
            message: `The envelope has been created and sent!<br/>Envelope ID ${results.envelopeId}.`
        });
    }
}

/**
 * This function does the work of creating the envelope by using
 * the API directly with multipart mime
 * @param {object} args object
 */
// ***DS.snippet.0.start
eg010SendBinaryDocs.worker = async (args) => {
    // Data for this method
    // args.basePath
    // args.accessToken
    // args.accountId
    // demoDocsPath: relative path for the demo docs
    // doc2File: file name for doc 2
    // doc3File: file name for doc 3


    // Step 1. Make the envelope JSON request body
    let envelopeJSON = makeEnvelopeJSON( args.envelopeArgs )
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
         bytes: fs.readFileSync(path.resolve(args.demoDocsPath, args.doc2File))},
        {mime: "application/pdf", filename: envelopeJSON.documents[2].name,
         documentId: envelopeJSON.documents[2].documentId,
         bytes: fs.readFileSync(path.resolve(args.demoDocsPath, args.doc3File))}
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
            method: 'POST',
            uri: `${args.basePath}/v2/accounts/${args.accountId}/envelopes`,
            auth: {bearer: args.accessToken},
            headers: {
                Accept: 'application/json',
                'Content-Type':
                    `multipart/form-data; boundary=${boundary}`
              },
            body: reqBody
        };

    // Step 2. call Envelopes::create API method
    // Exceptions will be caught by the calling function
    results = await rp(options);

    // Since we're using the request library at a low level, the results
    // are not automatically JSON parsed.
    results = JSON.parse(results);
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
// ***DS.snippet.0.end


/**
 * Form page for this application
 */
eg010SendBinaryDocs.getController = (req, res) => {
    // Check that the authentication token is ok with a long buffer time.
    // If needed, now is the best time to ask the user to authenticate
    // since they have not yet entered any information into the form.
    let tokenOK = req.dsAuth.checkToken();
    if (tokenOK) {
        res.render('pages/examples/eg010SendBinaryDocs', {
            eg: eg, csrfToken: req.csrfToken(),
            title: "Send envelope with multipart mime",
            sourceFile: path.basename(__filename),
            sourceUrl: dsConfig.githubExampleUrl + path.basename(__filename),
            documentation: dsConfig.documentation + eg,
            showDoc: dsConfig.documentation
        });
    } else {
        // Save the current operation so it will be resumed after authentication
        req.dsAuth.setEg(req, eg);
        res.redirect(mustAuthenticate);
    }
}
