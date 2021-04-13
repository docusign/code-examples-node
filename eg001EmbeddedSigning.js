/**
 * @file
 * Example 001: Use embedded signing
 * @author DocuSign
 */

const path = require('path')
    , fs = require('fs-extra')
    , docusign = require('docusign-esign')
    , validator = require('validator')
    , dsConfig = require('./config/index.js').config
    ;

const eg001EmbeddedSigning = exports
    , eg = 'eg001' // This example reference.
    , mustAuthenticate = '/ds/mustAuthenticate'
    , minimumBufferMin = 3
    , signerClientId = 1000 // The id of the signer within this application.
    , demoDocsPath = path.resolve(__dirname, 'demo_documents')
    , pdf1File = 'World_Wide_Corp_lorem.pdf'
    , dsReturnUrl = dsConfig.appUrl + '/ds-return'
    , dsPingUrl = dsConfig.appUrl + '/' // Url that will be pinged by the DocuSign signing via Ajax
    ;


/**
 * Create the envelope, the embedded signing, and then redirect to the DocuSign signing
 * @param {object} req Request obj
 * @param {object} res Response obj
 */
eg001EmbeddedSigning.createController = async (req, res) => {
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
      , envelopeArgs = {
            signerEmail: signerEmail,
            signerName: signerName,
            signerClientId: signerClientId,
            dsReturnUrl: dsReturnUrl,
            dsPingUrl: dsPingUrl
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
        results = await eg001EmbeddedSigning.worker (args)
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
        // Redirect the user to the embedded signing
        // Don't use an iFrame!
        // State can be stored/recovered using the framework's session or a
        // query parameter on the returnUrl (see the makeRecipientViewRequest method)
        res.redirect(results.redirectUrl);
    }
}


/**
 * This function does the work of creating the envelope and the
 * embedded signing
 * @param {object} args
 */
// ***DS.snippet.0.start
eg001EmbeddedSigning.worker = async (args) => {
    // Data for this method
    // args.basePath
    // args.accessToken
    // args.accountId

    let dsApiClient = new docusign.ApiClient();
    dsApiClient.setBasePath(args.basePath);
    dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + args.accessToken);
    let envelopesApi = new docusign.EnvelopesApi(dsApiClient)
      , results = null;

    // Step 1. Make the envelope request body
    let envelope = makeEnvelope(args.envelopeArgs)

    // Step 2. call Envelopes::create API method
    // Exceptions will be caught by the calling function
    results = await envelopesApi.createEnvelope(args.accountId, {envelopeDefinition: envelope});

    let envelopeId = results.envelopeId;
    console.log(`Envelope was created. EnvelopeId ${envelopeId}`);

    // Step 3. create the recipient view, the embedded signing
    let viewRequest = makeRecipientViewRequest(args.envelopeArgs);
    // Call the CreateRecipientView API
    // Exceptions will be caught by the calling function
    results = await envelopesApi.createRecipientView(args.accountId, envelopeId,
        {recipientViewRequest: viewRequest});

    return ({envelopeId: envelopeId, redirectUrl: results.url})
}

/**
 * Creates envelope
 * @function
 * @param {Object} args parameters for the envelope:
 * @returns {Envelope} An envelope definition
 * @private
 */
function makeEnvelope(args){
    // Data for this method
    // args.signerEmail
    // args.signerName
    // args.signerClientId
    // demoDocsPath (module constant)
    // pdf1File (module constant)

    // document 1 (pdf) has tag /sn1/
    //
    // The envelope has one recipients.
    // recipient 1 - signer

    let docPdfBytes;
    // read file from a local directory
    // The read could raise an exception if the file is not available!
    docPdfBytes = fs.readFileSync(path.resolve(demoDocsPath, pdf1File));

    // create the envelope definition
    let env = new docusign.EnvelopeDefinition();
    env.emailSubject = 'Please sign this document';

    // add the documents
    let doc1 = new docusign.Document()
      , doc1b64 = Buffer.from(docPdfBytes).toString('base64')
      ;

    doc1.documentBase64 = doc1b64;
    doc1.name = 'Lorem Ipsum'; // can be different from actual file name
    doc1.fileExtension = 'pdf';
    doc1.documentId = '3';

    // The order in the docs array determines the order in the envelope
    env.documents = [doc1];

    // Create a signer recipient to sign the document, identified by name and email
    // We set the clientUserId to enable embedded signing for the recipient
    // We're setting the parameters via the object creation
    let signer1 = docusign.Signer.constructFromObject({
        email: args.signerEmail,
        name: args.signerName,
        clientUserId: args.signerClientId,
        recipientId: 1
    });

    // Create signHere fields (also known as tabs) on the documents,
    // We're using anchor (autoPlace) positioning
    //
    // The DocuSign platform seaches throughout your envelope's
    // documents for matching anchor strings.
    let signHere1 = docusign.SignHere.constructFromObject({
          anchorString: '/sn1/',
          anchorYOffset: '10', anchorUnits: 'pixels',
          anchorXOffset: '20'})
      ;

    // Tabs are set per recipient / signer
    let signer1Tabs = docusign.Tabs.constructFromObject({
      signHereTabs: [signHere1]});
    signer1.tabs = signer1Tabs;

    // Add the recipient to the envelope object
    let recipients = docusign.Recipients.constructFromObject({
      signers: [signer1]});
    env.recipients = recipients;

    // Request that the envelope be sent by setting |status| to "sent".
    // To request that the envelope be created as a draft, set to "created"
    env.status = 'sent';

    return env;
}

function makeRecipientViewRequest(args) {
    // Data for this method
    // args.dsReturnUrl
    // args.signerEmail
    // args.signerName
    // args.signerClientId
    // args.dsPingUrl

    let viewRequest = new docusign.RecipientViewRequest();

    // Set the url where you want the recipient to go once they are done signing
    // should typically be a callback route somewhere in your app.
    // The query parameter is included as an example of how
    // to save/recover state information during the redirect to
    // the DocuSign signing. It's usually better to use
    // the session mechanism of your web framework. Query parameters
    // can be changed/spoofed very easily.
    viewRequest.returnUrl = args.dsReturnUrl + "?state=123";

    // How has your app authenticated the user? In addition to your app's
    // authentication, you can include authenticate steps from DocuSign.
    // Eg, SMS authentication
    viewRequest.authenticationMethod = 'none';

    // Recipient information must match embedded recipient info
    // we used to create the envelope.
    viewRequest.email = args.signerEmail;
    viewRequest.userName = args.signerName;
    viewRequest.clientUserId = args.signerClientId;

    // DocuSign recommends that you redirect to DocuSign for the
    // embedded signing. There are multiple ways to save state.
    // To maintain your application's session, use the pingUrl
    // parameter. It causes the DocuSign signing web page
    // (not the DocuSign server) to send pings via AJAX to your
    // app,
    viewRequest.pingFrequency = 600; // seconds
    // NOTE: The pings will only be sent if the pingUrl is an https address
    viewRequest.pingUrl = args.dsPingUrl; // optional setting

    return viewRequest
}
// ***DS.snippet.0.end


/**
 * Form page for this application
 */
eg001EmbeddedSigning.getController = (req, res) => {
    console.log(req.dsAuth);
    // Check that the authentication token is ok with a long buffer time.
    // If needed, now is the best time to ask the user to authenticate
    // since they have not yet entered any information into the form.
    let tokenOK = req.dsAuth.checkToken();
    if (tokenOK) {
        res.render('pages/examples/eg001EmbeddedSigning', {
            eg: eg, csrfToken: req.csrfToken(),
            title: "Use embedded signing",
            sourceFile: path.basename(__filename),
            sourceUrl: 'https://github.com/docusign/code-examples-node/blob/master/eg001EmbeddedSigning.js',
            documentation: dsConfig.documentation + eg,
            showDoc: dsConfig.documentation
        });
    } else {
        // Save the current operation so it will be resumed after authentication
        req.dsAuth.setEg(req, eg);
        res.redirect(mustAuthenticate);
    }
}
