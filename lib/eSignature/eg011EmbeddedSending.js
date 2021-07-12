/**
 * @file
 * Example 011: Use embedded sending: Remote signer, cc, envelope has three documents
 * @author DocuSign
 */

const path = require('path')
    , docusign = require('docusign-esign')
    , validator = require('validator')
    , dsConfig = require('../../config/index.js').config
    , eg002 = require('./eg002SigningViaEmail') // used to create envelope
    ;

const eg011EmbeddedSending = exports
    , eg = 'eg011' // This example reference.
    , mustAuthenticate = '/ds/mustAuthenticate'
    , minimumBufferMin = 3
    , dsReturnUrl = dsConfig.appUrl + '/ds-return'
    ;

/**
 * Create the envelope
 * @param {object} req Request obj
 * @param {object} res Response obj
 */
eg011EmbeddedSending.createController = async (req, res) => {
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
      , startingView = validator.escape(body.startingView)
      , envelopeArgs = {
            signerEmail: signerEmail,
            signerName: signerName,
            ccEmail: ccEmail,
            ccName: ccName,
            dsReturnUrl: dsReturnUrl,
        }
      , args = {
            accessToken: req.user.accessToken,
            basePath: req.session.basePath,
            accountId: req.session.accountId,
            startingView: startingView,
            envelopeArgs: envelopeArgs
        }
      , results = null
      ;

    try {
        results = await eg011EmbeddedSending.worker (args)
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
        // Redirect the user to the Sender View
        // Don't use an iFrame!
        // State can be stored/recovered using the framework's session or a
        // query parameter on the returnUrl (see the makeSenderViewRequest method)
        res.redirect(results.redirectUrl);
    }
}

/**
 * This function does the work of creating the envelope in
 * draft mode and returning a URL for the sender's view
 * @param {object} args object
 */
// ***DS.snippet.0.start
eg011EmbeddedSending.worker = async (args) => {
    // Data for this method
    // args.basePath
    // args.accessToken
    // args.accountId
    // args.startingView -- 'recipient' or 'tagging'

    let dsApiClient = new docusign.ApiClient();
    dsApiClient.setBasePath(args.basePath);
    dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + args.accessToken);
    let envelopesApi = new docusign.EnvelopesApi(dsApiClient);

    // Step 1. Make the envelope with "created" (draft) status
    args.envelopeArgs.status = "created"; // We want a draft envelope
    let results = await eg002.worker(args)
      , envelopeId = results.envelopeId;

    // Step 2. create the sender view
    let viewRequest = makeSenderViewRequest(args.envelopeArgs);
    // Call the CreateSenderView API
    // Exceptions will be caught by the calling function
    results = await envelopesApi.createSenderView(
        args.accountId, envelopeId,
        {returnUrlRequest: viewRequest});

    // Switch to Recipient and Documents view if requested by the user
    let url = results.url;
    console.log (`startingView: ${args.startingView}`);
    if (args.startingView === "recipient") {
        url = url.replace('send=1', 'send=0');
    }

    return ({envelopeId: envelopeId, redirectUrl: url})
}

function makeSenderViewRequest(args) {
    let viewRequest = new docusign.ReturnUrlRequest();
    // Data for this method
    // args.dsReturnUrl

    // Set the url where you want the recipient to go once they are done signing
    // should typically be a callback route somewhere in your app.
    viewRequest.returnUrl = args.dsReturnUrl;
    return viewRequest
}
// ***DS.snippet.0.end


/**
 * Form page for this application
 */
eg011EmbeddedSending.getController = (req, res) => {
    // Check that the authentication token is ok with a long buffer time.
    // If needed, now is the best time to ask the user to authenticate
    // since they have not yet entered any information into the form.
    let tokenOK = req.dsAuth.checkToken();
    if (tokenOK) {
        res.render('pages/examples/eg011EmbeddedSending', {
            eg: eg, csrfToken: req.csrfToken(),
            title: "Signing request by email",
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
