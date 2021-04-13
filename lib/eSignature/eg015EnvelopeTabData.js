/**
 * @file
 * Example 015: Get an envelope's tab (field) data
 * @author DocuSign
 */

const path = require('path')
    , docusign = require('docusign-esign')
    , dsConfig = require('../../config/index.js').config
    ;

const eg015EnvelopeTabData = exports
    , eg = 'eg015' // This example reference.
    , mustAuthenticate = '/ds/mustAuthenticate'
    , minimumBufferMin = 3
    ;


/**
 * Get the envelope
 * @param {object} req Request obj
 * @param {object} res Response obj
 */
eg015EnvelopeTabData.createController = async (req, res) => {
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
    if (! req.session.envelopeId) {
        res.render('pages/examples/eg015EnvelopeTabData', {
            eg: eg, csrfToken: req.csrfToken(),
            title: "Get envelope tab data",
            envelopeOk: req.session.envelopeId,
            sourceFile: path.basename(__filename),
            sourceUrl: dsConfig.githubExampleUrl + 'eSignature/' + path.basename(__filename),
            documentation: dsConfig.documentation + eg,
            showDoc: dsConfig.documentation
        });
    }

    // Step 2. Call the worker method
    let args = {
            accessToken: req.user.accessToken,
            basePath: req.session.basePath,
            accountId: req.session.accountId,
            envelopeId: req.session.envelopeId
        }
      , results = null
      ;

    try {
        results = await eg015EnvelopeTabData.worker (args)
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
            title: "Get envelope tab data",
            h1: "Get envelope tab data",
            message: `Results from the EnvelopeFormData::get method:`,
            json: JSON.stringify(results)
        });
    }
}

/**
 * This function does the work of getting the envelope information
 * @param {object} args
 */
// ***DS.snippet.0.start
eg015EnvelopeTabData.worker = async (args) => {
    // Data for this method
    // args.basePath
    // args.accessToken
    // args.accountId
    // args.envelopeId

    let dsApiClient = new docusign.ApiClient();
    dsApiClient.setBasePath(args.basePath);
    dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + args.accessToken);
    let envelopesApi = new docusign.EnvelopesApi(dsApiClient)
      , results = null;

    // Step 1. Call EnvelopeFormData::get
    // Exceptions will be caught by the calling function
    results = await envelopesApi.getFormData(args.accountId, args.envelopeId);
    return results;
}
// ***DS.snippet.0.end


/**
 * Form page for this application
 */
eg015EnvelopeTabData.getController = (req, res) => {
    // Check that the authentication token is ok with a long buffer time.
    // If needed, now is the best time to ask the user to authenticate
    // since they have not yet entered any information into the form.
    let tokenOK = req.dsAuth.checkToken();
    if (tokenOK) {
        res.render('pages/examples/eg015EnvelopeTabData', {
            eg: eg, csrfToken: req.csrfToken(),
            title: "Get envelope tab data information",
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
