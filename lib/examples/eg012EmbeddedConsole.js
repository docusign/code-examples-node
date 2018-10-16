/**
 * @file
 * Example 012: Embedded NDSE (console)
 * @author DocuSign
 */

const path = require('path')
    , fs = require('fs-extra')
    , validator = require('validator')
    , docusign = require('docusign-esign')
    , {promisify} = require('util') // http://2ality.com/2017/05/util-promisify.html
    , dsConfig = require('../../ds_configuration.js').config
    ;

const eg012EmbeddedConsole = exports
    , eg = 'eg012' // This example reference.
    , mustAuthenticate = '/ds/mustAuthenticate'
    , minimumBufferMin = 3
    , dsReturnUrl = dsConfig.appUrl + '/ds-return' 
    ;

/**
 * Form page for this application
 */
eg012EmbeddedConsole.getController = (req, res) => {
    // Check that the authentication token is ok with a long buffer time.
    // If needed, now is the best time to ask the user to authenticate
    // since they have not yet entered any information into the form.
    let tokenOK = req.dsAuthCodeGrant.checkToken();
    if (tokenOK) {
        res.render('pages/examples/eg012EmbeddedConsole', {
            csrfToken: req.csrfToken(), 
            title: "Embedded DocuSign web tool",
            envelopeOk: req.session.envelopeId,
            sourceFile: path.basename(__filename),
            sourceUrl: dsConfig.githubExampleUrl + path.basename(__filename),
            documentation: dsConfig.documentation + eg,
            showDoc: dsConfig.documentation
        });
    } else {
        // Save the current operation so it will be resumed after authentication
        req.dsAuthCodeGrant.setEg(req, eg);
        res.redirect(mustAuthenticate);
    }
}  

/**
 * The controller
 * @param {object} req Request obj 
 * @param {object} res Response obj
 */
eg012EmbeddedConsole.createController = async (req, res) => {
    // Step 1. Check the token
    // At this point we should have a good token. But we
    // double-check here to enable a better UX to the user.
    let tokenOK = req.dsAuthCodeGrant.checkToken(minimumBufferMin);
    if (! tokenOK) {
        req.flash('info', 'Sorry, you need to re-authenticate.');
        // We could store the parameters of the requested operation 
        // so it could be restarted automatically.
        // But since it should be rare to have a token issue here,
        // we'll make the user re-enter the form data after 
        // authentication.
        req.dsAuthCodeGrant.setEg(req, eg);
        res.redirect(mustAuthenticate);
    }

    // Step 2. Call the worker method
    let accountId = req.dsAuthCodeGrant.getAccountId()
      , dsAPIclient = req.dsAuthCodeGrant.getDSApi()
      , body = req.body
      // Additional data validation might also be appropriate
      , startingView = validator.escape(body.startingView)
      , args = {
            dsAPIclient: dsAPIclient,
            accountId: accountId,
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
 * @param {object} args An object with the following elements: <br/>
 *   <tt>dsAPIclient</tt>: The DocuSign API Client object, already set 
 *       with an access token and base url <br/>
 *   <tt>accountId</tt>: Current account Id <br/>
 *   <tt>dsReturnUrl</tt>: the return url back to this app
 *   <tt>envelopeId</tt>: optional envelope for the NDSE to focus on
 */
// ***DS.worker.start ***DS.snippet.1.start
eg012EmbeddedConsole.worker = async (args) => {
    let envelopesApi = new docusign.EnvelopesApi(args.dsAPIclient)
      , results = null
      ;

    // Step 1. create the NDSE view
    let viewRequest = makeConsoleViewRequest(args)
      , createConsoleViewP = promisify(envelopesApi.createConsoleView).bind(envelopesApi)
      ;

    // Call the CreateSenderView API
    // Exceptions will be caught by the calling function
    results = await createConsoleViewP(args.accountId,
        {consoleViewRequest: viewRequest});
    let url = results.url;
    console.log (`NDSE view URL: ${url}`);
    return ({redirectUrl: url})
}
// ***DS.worker.end ***DS.snippet.1.end

// ***DS.snippet.2.start
function makeConsoleViewRequest(args) {
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
// ***DS.snippet.2.end

