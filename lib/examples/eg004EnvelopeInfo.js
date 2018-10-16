/**
 * @file
 * Example 004: Get an envelope's basic information and status
 * @author DocuSign
 */

const path = require('path')
    , docusign = require('docusign-esign')
    , {promisify} = require('util') // http://2ality.com/2017/05/util-promisify.html
    , dsConfig = require('../../ds_configuration.js').config
    ;

const eg004EnvelopeInfo = exports
    , eg = 'eg004' // This example reference.
    , mustAuthenticate = '/ds/mustAuthenticate'
    , minimumBufferMin = 3
    ;

/**
 * Form page for this application
 */
eg004EnvelopeInfo.getController = (req, res) => {
    // Check that the authentication token is ok with a long buffer time.
    // If needed, now is the best time to ask the user to authenticate
    // since they have not yet entered any information into the form.
    let tokenOK = req.dsAuthCodeGrant.checkToken();
    if (tokenOK) {
        res.render('pages/examples/eg004EnvelopeInfo', {
            csrfToken: req.csrfToken(), 
            title: "Get envelope information",
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
 * Get the envelope
 * @param {object} req Request obj 
 * @param {object} res Response obj
 */
eg004EnvelopeInfo.createController = async (req, res) => {
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
    if (! req.session.envelopeId) {
        res.render('pages/examples/eg004EnvelopeInfo', {
            csrfToken: req.csrfToken(), 
            title: "Get envelope information",
            envelopeOk: req.session.envelopeId,
            sourceFile: path.basename(__filename),
            sourceUrl: dsConfig.githubExampleUrl + path.basename(__filename),
            documentation: dsConfig.documentation + eg,
            showDoc: dsConfig.documentation
        });
    }

    // Step 2. Call the worker method
    let accountId = req.dsAuthCodeGrant.getAccountId()
      , dsAPIclient = req.dsAuthCodeGrant.getDSApi()
      , args = {
          dsAPIclient: dsAPIclient,
          accountId: accountId,
          envelopeId: req.session.envelopeId
        }
      , results = null
      ;

    try {
        results = await eg004EnvelopeInfo.worker (args)
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
        res.render('pages/example_done', {
            title: "Get envelope status results",
            h1: "Get envelope status results",
            message: `Results from the Envelopes::get method:`,
            json: JSON.stringify(results)
        });
    }
}

/**
 * This function does the work of getting the envelope information
 * @param {object} args An object with the following elements: <br/>
 *   <tt>dsAPIclient</tt>: The DocuSign API Client object, already set with an access token and base url <br/>
 *   <tt>accountId</tt>: Current account Id <br/>
 *   <tt>envelopeId</tt>: envelope Id <br/>
 */
// ***DS.worker.start ***DS.snippet.1.start
eg004EnvelopeInfo.worker = async (args) => {
    let envelopesApi = new docusign.EnvelopesApi(args.dsAPIclient)
      , getEnvelopeP = promisify(envelopesApi.getEnvelope).bind(envelopesApi)
      , results = null
      ;

    // Step 1. Call Envelopes::get
    // Exceptions will be caught by the calling function
    results = await getEnvelopeP(args.accountId, args.envelopeId, null);
    return results;
}
// ***DS.worker.end ***DS.snippet.1.end