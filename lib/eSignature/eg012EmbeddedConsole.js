/**
 * @file
 * Example 012: Embedded NDSE (console)
 * @author DocuSign
 */

const path = require('path')
    , validator = require('validator')
    , docusign = require('docusign-esign')
    , dsConfig = require('../../config/index.js').config
    ;

const eg012EmbeddedConsole = exports
    , eg = 'eg012' // This example reference.
    , mustAuthenticate = '/ds/mustAuthenticate'
    , minimumBufferMin = 3
    , dsReturnUrl = dsConfig.appUrl + '/ds-return'
    ;

/**
 * The controller
 * @param {object} req Request obj
 * @param {object} res Response obj
 */
eg012EmbeddedConsole.createController = async (req, res) => {
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
      , startingView = validator.escape(body.startingView)
      , args = {
            accessToken: req.user.accessToken,
            basePath: req.session.basePath,
            accountId: req.session.accountId,
            dsReturnUrl: dsReturnUrl,
            startingView: startingView,
            envelopeId: req.session.envelopeId // may be undefined
        }
      , results = null
      ;

    try {
        results = await eg012EmbeddedConsole.worker (args)
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
        // Redirect the user to the NDSE View
        // Don't use an iFrame!
        // State can be stored/recovered using the framework's session or a
        // query parameter on the returnUrl (see the makeSenderViewRequest method)
        res.redirect(results.redirectUrl);
    }
}

/**
 * This function does the work of returning a URL for the NDSE view
 * @param {object} args object
 */
// ***DS.snippet.0.start
eg012EmbeddedConsole.worker = async (args) => {
    // Data for this method
    // args.basePath
    // args.accessToken
    // args.accountId
    // args.dsReturnUrl
    // args.startingView
    // args.envelopeId

    let dsApiClient = new docusign.ApiClient();
    dsApiClient.setBasePath(args.basePath);
    dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + args.accessToken);
    let envelopesApi = new docusign.EnvelopesApi(dsApiClient);

    // Step 1. create the NDSE view
    let viewRequest = makeConsoleViewRequest(args);
    // Call the CreateSenderView API
    // Exceptions will be caught by the calling function
    let results = await envelopesApi.createConsoleView(
        args.accountId, {consoleViewRequest: viewRequest});
    let url = results.url;
    console.log (`NDSE view URL: ${url}`);
    return ({redirectUrl: url})
}

function makeConsoleViewRequest(args) {
    // Data for this method
    // args.dsReturnUrl
    // args.startingView
    // args.envelopeId

    let viewRequest = new docusign.ConsoleViewRequest();
    // Set the url where you want the recipient to go once they are done
    // with the NDSE. It is usually the case that the
    // user will never "finish" with the NDSE.
    // Assume that control will not be passed back to your app.
    viewRequest.returnUrl = args.dsReturnUrl;
    if (args.startingView == "envelope" && args.envelopeId) {
        viewRequest.envelopeId = args.envelopeId
    }
    return viewRequest
}
// ***DS.snippet.0.end


/**
 * Form page for this application
 */
eg012EmbeddedConsole.getController = (req, res) => {
    // Check that the authentication token is ok with a long buffer time.
    // If needed, now is the best time to ask the user to authenticate
    // since they have not yet entered any information into the form.
    let tokenOK = req.dsAuth.checkToken();
    if (tokenOK) {
        res.render('pages/examples/eg012EmbeddedConsole', {
            eg: eg, csrfToken: req.csrfToken(),
            title: "Embedded DocuSign web tool",
            envelopeOk: req.session.envelopeId,
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


