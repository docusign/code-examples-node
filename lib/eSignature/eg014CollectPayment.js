/**
 * @file
 * Example 014: Remote signer, cc, envelope has an order form
 * @author DocuSign
 */

const path = require('path')
    , fs = require('fs-extra')
    , docusign = require('docusign-esign')
    , validator = require('validator')
    , dsConfig = require('../../config/index.js').config
    ;

const eg014CollectPayment = exports
    , eg = 'eg014' // This example reference.
    , mustAuthenticate = '/ds/mustAuthenticate'
    , minimumBufferMin = 3
    , demoDocsPath = path.resolve(__dirname, '../../demo_documents')
    , doc1File = 'order_form.html'
    ;


/**
 * Create the envelope
 * @param {object} req Request obj
 * @param {object} res Response obj
 */
eg014CollectPayment.createController = async (req, res) => {
    // Step 1. Check the token
    // At this point we should have a good token. But we
    // double-check here to enable a better UX to the user.
    let tokenOK = req.dsAuth.checkToken(minimumBufferMin);
    if (! tokenOK) {
        req.flash('info', 'Sorry, you need to re-authenticate.');
        // Save the current operation so it will be resumed after authentication
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
            ccName: ccName,
            status: "sent",
            gatewayAccountId: dsConfig.gatewayAccountId,
            gatewayName: dsConfig.gatewayName,
            gatewayDisplayName: dsConfig.gatewayDisplayName
        }
      , args = {
            accessToken: req.user.accessToken,
            basePath: req.session.basePath,
            accountId: req.session.accountId,
            envelopeArgs: envelopeArgs
        }
      , results = null
      ;

    try {
        results = await eg014CollectPayment.worker (args)
    }
    catch (error) {
        let errorBody = error && error.response && error.response.body
            // we can pull the DocuSign error code and message from the response body
          , errorCode = errorBody && errorBody.errorCode
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
 * This function does the work of creating the envelope
 * @param {object} args object
 */
// ***DS.snippet.0.start
eg014CollectPayment.worker = async (args) => {
    // Data for this method
    // args.basePath
    // args.accessToken
    // args.accountId

    let dsApiClient = new docusign.ApiClient();
    dsApiClient.setBasePath(args.basePath);
    dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + args.accessToken);
    let envelopesApi = new docusign.EnvelopesApi(dsApiClient);

    // Step 1. Make the envelope request body
    let envelope = makeEnvelope(args.envelopeArgs)

    // Step 2. call Envelopes::create API method
    // Exceptions will be caught by the calling function
    let results = await envelopesApi.createEnvelope(
        args.accountId, {envelopeDefinition: envelope});
    let envelopeId = results.envelopeId;
    return ({envelopeId: envelopeId})
}

/**
 * Creates envelope
 * <br>Document 1: An HTML document.
 * <br>DocuSign will convert all of the documents to the PDF format.
 * <br>The recipients' field tags are placed using <b>anchor</b> strings.
 * @function
 * @param {Object} args object
 * @returns {Envelope} An envelope definition
 * @private
 */
function makeEnvelope(args){
    // Data for this method
    // args.signerEmail
    // args.signerName
    // args.ccEmail
    // args.ccName
    // args.status
    // args.gatewayAccountId
    // args.gatewayName
    // args.gatewayDisplayName
    // demoDocsPath  -- module global
    // doc1File  -- module global


    // document 1 (html) has multiple tags:
    // /l1q/ and /l2q/ -- quantities: drop down
    // /l1e/ and /l2e/ -- extended: payment lines
    // /l3t/ -- total -- formula
    //
    // The envelope has two recipients.
    // recipient 1 - signer
    // recipient 2 - cc
    // The envelope will be sent first to the signer.
    // After it is signed, a copy is sent to the cc person.

    ///////////////////////////////////////////////////////////////////
    //                                                               //
    // NOTA BENA: This method programmatically constructs the        //
    //            order form. For many use cases, it would be        //
    //            better to create the order form as a template      //
    //            using the DocuSign web tool as WYSIWYG             //
    //            form designer.                                     //
    //                                                               //
    ///////////////////////////////////////////////////////////////////

    // Order form constants
    let l1Name = "Harmonica"
      , l1Price = 5
      , l1Description = `$${l1Price} each`
      , l2Name = "Xylophone"
      , l2Price = 150
      , l2Description = `$${l2Price} each`
      , currencyMultiplier = 100
      ;

    // read file from a local directory
    // The read could raise an exception if the file is not available!
    let doc1HTML1 = fs.readFileSync(path.resolve(demoDocsPath, doc1File),
                    {encoding: 'utf8'});

    // Substitute values into the HTML
    // Substitute for: {signerName}, {signerEmail}, {ccName}, {ccEmail}
    let doc1HTML2 = doc1HTML1.replace('{signerName}', args.signerName)
    .replace('{signerEmail}', args.signerEmail)
    .replace('{ccName}', args.ccName)
    .replace('{ccEmail}', args.ccEmail);

    // create the envelope definition
    let env = new docusign.EnvelopeDefinition();
    env.emailSubject = 'Please complete your order';

    // add the documents
    let doc1 = new docusign.Document()
      , doc1b64 = Buffer.from(doc1HTML2).toString('base64')
      ;

    doc1.documentBase64 = doc1b64;
    doc1.name = 'Order form'; // can be different from actual file name
    doc1.fileExtension = 'html'; // Source data format. Signed docs are always pdf.
    doc1.documentId = '1'; // a label used to reference the doc
    env.documents = [doc1];

    // create a signer recipient to sign the document, identified by name and email
    // We're setting the parameters via the object creation
    let signer1 = docusign.Signer.constructFromObject({
        email: args.signerEmail,
        name: args.signerName,
        recipientId: '1',
        routingOrder: '1'});
    // routingOrder (lower means earlier) determines the order of deliveries
    // to the recipients. Parallel routing order is supported by using the
    // same integer as the order for two or more recipients.

    // create a cc recipient to receive a copy of the documents, identified by name and email
    // We're setting the parameters via setters
    let cc1 = new docusign.CarbonCopy();
    cc1.email = args.ccEmail;
    cc1.name = args.ccName;
    cc1.routingOrder = '2';
    cc1.recipientId = '2';

    // Create signHere fields (also known as tabs) on the documents,
    // We're using anchor (autoPlace) positioning
    let signHere1 = docusign.SignHere.constructFromObject({
            anchorString: '/sn1/',
            anchorYOffset: '10', anchorUnits: 'pixels',
            anchorXOffset: '20'})

      , listItem0 = docusign.ListItem.constructFromObject({
            text: "none", value: "0"})
      , listItem1 = docusign.ListItem.constructFromObject({
            text: "1", value: "1"})
      , listItem2 = docusign.ListItem.constructFromObject({
            text: "2", value: "2"})
      , listItem3 = docusign.ListItem.constructFromObject({
            text: "3", value: "3"})
      , listItem4 = docusign.ListItem.constructFromObject({
            text: "4", value: "4"})
      , listItem5 = docusign.ListItem.constructFromObject({
            text: "5", value: "5"})
      , listItem6 = docusign.ListItem.constructFromObject({
            text: "6", value: "6"})
      , listItem7 = docusign.ListItem.constructFromObject({
            text: "7", value: "7"})
      , listItem8 = docusign.ListItem.constructFromObject({
            text: "8", value: "8"})
      , listItem9 = docusign.ListItem.constructFromObject({
            text: "9", value: "9"})
      , listItem10 = docusign.ListItem.constructFromObject({
            text: "10", value: "10"})

      , listl1q = docusign.List.constructFromObject({
            font: "helvetica",
            fontSize: "size11",
            anchorString: '/l1q/',
            anchorYOffset: '-10', anchorUnits: 'pixels',
            anchorXOffset: '0',
            listItems: [listItem0, listItem1, listItem2,
                listItem3, listItem4, listItem5, listItem6,
                listItem7, listItem8, listItem9, listItem10],
            required: "true",
            tabLabel: "l1q"
            })
      , listl2q = docusign.List.constructFromObject({
            font: "helvetica",
            fontSize: "size11",
            anchorString: '/l2q/',
            anchorYOffset: '-10', anchorUnits: 'pixels',
            anchorXOffset: '0',
            listItems: [listItem0, listItem1, listItem2,
                listItem3, listItem4, listItem5, listItem6,
                listItem7, listItem8, listItem9, listItem10],
            required: "true",
            tabLabel: "l2q"
            })
        // create two formula tabs for the extended price on the line items
      , formulal1e = docusign.FormulaTab.constructFromObject({
            font: "helvetica",
            fontSize: "size11",
            anchorString: '/l1e/',
            anchorYOffset: '-8', anchorUnits: 'pixels',
            anchorXOffset: '105',
            tabLabel: "l1e",
            formula: `[l1q] * ${l1Price}`,
            roundDecimalPlaces: "0",
            required: "true",
            locked: "true",
            disableAutoSize: "false",
            })
      , formulal2e = docusign.FormulaTab.constructFromObject({
            font: "helvetica",
            fontSize: "size11",
            anchorString: '/l2e/',
            anchorYOffset: '-8', anchorUnits: 'pixels',
            anchorXOffset: '105',
            tabLabel: "l2e",
            formula: `[l2q] * ${l2Price}`,
            roundDecimalPlaces: "0",
            required: "true",
            locked: "true",
            disableAutoSize: "false",
            })
        // Formula for the total
      , formulal3t = docusign.FormulaTab.constructFromObject({
            font: "helvetica",
            bold: "true",
            fontSize: "size12",
            anchorString: '/l3t/',
            anchorYOffset: '-8', anchorUnits: 'pixels',
            anchorXOffset: '50',
            tabLabel: "l3t",
            formula: `[l1e] + [l2e]`,
            roundDecimalPlaces: "0",
            required: "true",
            locked: "true",
            disableAutoSize: "false",
            })
        // Payment line items
      , paymentLineIteml1 = docusign.PaymentLineItem.constructFromObject({
            name: l1Name, description: l1Description, amountReference: "l1e"
            })
      , paymentLineIteml2 = docusign.PaymentLineItem.constructFromObject({
            name: l2Name, description: l2Description, amountReference: "l2e"
            })
      , paymentDetails = docusign.PaymentDetails.constructFromObject({
            gatewayAccountId: args.gatewayAccountId,
            currencyCode: "USD",
            gatewayName: args.gatewayName,
            gatewayDisplayName: args.gatewayDisplayName,
            lineItems: [paymentLineIteml1, paymentLineIteml2]
            })
        // Hidden formula for the payment itself
      , formulaPayment = docusign.FormulaTab.constructFromObject({
            tabLabel: "payment",
            formula: `([l1e] + [l2e]) * ${currencyMultiplier}`,
            roundDecimalPlaces: "0",
            paymentDetails: paymentDetails,
            hidden: "true",
            required: "true",
            locked: "true",
            documentId: "1",
            pageNumber: "1",
            xPosition: "0",
            yPosition: "0"
            })
      ;

    // Tabs are set per recipient / signer
    let signer1Tabs = docusign.Tabs.constructFromObject({
            signHereTabs: [signHere1],
            listTabs: [listl1q, listl2q],
            formulaTabs: [formulal1e, formulal2e, formulal3t, formulaPayment]
        });
    signer1.tabs = signer1Tabs;

    // Add the recipients to the envelope object
    let recipients = docusign.Recipients.constructFromObject({
    signers: [signer1],
    carbonCopies: [cc1]});
    env.recipients = recipients;

    // Request that the envelope be sent by setting |status| to "sent".
    // To request that the envelope be created as a draft, set to "created"
    env.status = args.status;

    return env;
}
// ***DS.snippet.0.end


/**
 * Form page for this application
 */
eg014CollectPayment.getController = (req, res) => {
    // Check that the authentication token is ok with a long buffer time.
    // If needed, now is the best time to ask the user to authenticate
    // since they have not yet entered any information into the form.
    let tokenOK = req.dsAuth.checkToken();
    if (tokenOK) {
        res.render('pages/examples/eg014CollectPayment', {
            eg: eg, csrfToken: req.csrfToken(),
            title: "Order form with payment by email",
            gatewayOk: dsConfig.gatewayAccountId && dsConfig.gatewayAccountId.length > 25,
            sourceFile: path.basename(__filename),
            sourceUrl: dsConfig.githubExampleUrl + 'eSignature/' + path.basename(__filename),
            documentation: dsConfig.documentation + eg,
            showDoc: dsConfig.documentation
        });
    } else {
        // Save the current operation so it will be resumed after authentication
        req.dsAuth.setEg(req, eg);
        res.redirect(mustAuthenticate);
    }
}



