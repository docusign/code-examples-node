/**
 * @file
 * Example 006: List an envelope's documents
 * @author DocuSign
 */

const path = require('path')
    , docusign = require('docusign-esign')
    , dsConfig = require('../../config/index.js').config
    ;

const eg006EnvelopeDocs = exports
    , eg = 'eg006' // This example reference.
    , mustAuthenticate = '/ds/mustAuthenticate'
    , minimumBufferMin = 3
    ;


/**
 * Get the envelope
 * @param {object} req Request obj
 * @param {object} res Response obj
 */
eg006EnvelopeDocs.createController = async (req, res) => {
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
        res.render('pages/examples/eg006EnvelopeDocs', {
            eg: eg, csrfToken: req.csrfToken(),
            title: "List envelope documents",
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
      , results = null;

    try {
        results = await eg006EnvelopeDocs.worker (args)
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
        // Save the envelopeId and its list of documents in the session so
        // they can be used in example 7 (download a document)
        //
        let standardDocItems = [
            {name: 'Combined'   , type: 'content', documentId: 'combined'},
            {name: 'Zip archive', type: 'zip'    , documentId: 'archive'}]
            // The certificate of completion is named "summary".
            // We give it a better name below.
          , envelopeDocItems = results.envelopeDocuments.map( doc =>
                   ({documentId: doc.documentId,
                    name: doc.documentId === "certificate" ?
                        "Certificate of completion" : doc.name,
                    type: doc.type}) )
          , envelopeDocuments = {envelopeId: req.session.envelopeId,
                    documents: standardDocItems.concat(envelopeDocItems)}
          ;
        req.session.envelopeDocuments = envelopeDocuments; // Save

        res.render('pages/example_done', {
            title: "List envelope documents result",
            h1: "List envelope documents result",
            message: `Results from the EnvelopeDocuments::list method:`,
            json: JSON.stringify(results)
        });
    }
}

/**
 * This function does the work of listing the envelope's documents
 * @param {object} args object
 */
// ***DS.snippet.0.start
eg006EnvelopeDocs.worker = async (args) => {
    // Data for this method
    // args.basePath
    // args.accessToken
    // args.accountId
    // args.envelopeId


    let dsApiClient = new docusign.ApiClient();
    dsApiClient.setBasePath(args.basePath);
    dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + args.accessToken);
    let envelopesApi = new docusign.EnvelopesApi(dsApiClient);

    // Step 1. EnvelopeDocuments::list.
    // Exceptions will be caught by the calling function
    let results = await envelopesApi.listDocuments(args.accountId, args.envelopeId, null);
    return results;
}
// ***DS.snippet.0.end


/**
 * Form page for this application
 */
eg006EnvelopeDocs.getController = (req, res) => {
    // Check that the authentication token is ok with a long buffer time.
    // If needed, now is the best time to ask the user to authenticate
    // since they have not yet entered any information into the form.
    let tokenOK = req.dsAuth.checkToken();
    if (tokenOK) {
        res.render('pages/examples/eg006EnvelopeDocs', {
            eg: eg, csrfToken: req.csrfToken(),
            title: "List envelope documents",
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
