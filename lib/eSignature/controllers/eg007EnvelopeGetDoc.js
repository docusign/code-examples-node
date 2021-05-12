/**
 * @file
 * Example 007: Get a document from an envelope
 * @author DocuSign
 */

const path = require('path')
    , envelopeGetDoc = require('../examples/envelopeGetDoc')
    , dsConfig = require('../../../config/index.js').config
    , validator = require('validator')
    ;

const eg007EnvelopeGetDoc = exports
    , eg = 'eg007' // This example reference.
    , mustAuthenticate = '/ds/mustAuthenticate'
    , minimumBufferMin = 3
    ;

/**
 * Get the envelope
 * @param {object} req Request obj
 * @param {object} res Response obj
 */
eg007EnvelopeGetDoc.createController = async (req, res) => {
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
    let envelopeDocuments = req.session.envelopeDocuments;
    if (! req.session.envelopeId || ! envelopeDocuments ) {
        res.render('pages/examples/eg007EnvelopeGetDoc', {
            eg: eg, csrfToken: req.csrfToken(),
            title: "Download a document",
            envelopeOk: req.session.envelopeId,
            documentsOk: envelopeDocuments,
            sourceFile: path.basename(__filename),
            sourceUrl: dsConfig.githubExampleUrl + 'eSignature/' + path.basename(__filename),
            documentation: dsConfig.documentation + eg,
            showDoc: dsConfig.documentation
        });
    }

    // Step 2. Call the worker method
    let // Additional data validation might also be appropriate
        documentId = validator.escape(req.body.docSelect)
      , args = {
          accessToken: req.user.accessToken,
          basePath: req.session.basePath,
          accountId: req.session.accountId,
          documentId: documentId,
          envelopeDocuments: envelopeDocuments
        }
      , results = null
      ;

    try {
        results = await envelopeGetDoc.getDocument (args)
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
        // ***DS.snippet.2.start
        res.writeHead(200, {
            'Content-Type': results.mimetype,
            'Content-disposition': 'inline;filename=' + results.docName,
            'Content-Length': results.fileBytes.length
        });
        res.end(results.fileBytes, 'binary');
        // ***DS.snippet.2.end
    }
}

/**
 * Form page for this application
 */
eg007EnvelopeGetDoc.getController = (req, res) => {
    // Check that the authentication token is ok with a long buffer time.
    // If needed, now is the best time to ask the user to authenticate
    // since they have not yet entered any information into the form.
    let tokenOK = req.dsAuth.checkToken();
    if (tokenOK) {
        let envelopeDocuments = req.session.envelopeDocuments,
            documentOptions;
        if (envelopeDocuments) {
            // Prepare the select items
            documentOptions = envelopeDocuments.documents.map ( item =>
                ({text: item.name, documentId: item.documentId}));
        }
        res.render('pages/examples/eg007EnvelopeGetDoc', {
            eg: eg, csrfToken: req.csrfToken(),
            title: "Download a document",
            envelopeOk: req.session.envelopeId,
            documentsOk: envelopeDocuments,
            documentOptions: documentOptions,
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
