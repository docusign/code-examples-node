/**
 * @file
 * Example 007: Get a document from an envelope
 * @author DocuSign
 */

const path = require('path')
    , docusign = require('docusign-esign')
    , dsConfig = require('../../ds_configuration.js').config
    , validator = require('validator')
    , stream = require('stream')
    ;

const eg007 = exports
    , eg = 'eg007' // This example reference.
    , mustAuthenticate = '/ds/mustAuthenticate'
    , minimumBufferMin = 3
    ;

/**
 * Form page for this application
 */
eg007.getController = (req, res) => {
    // Check that the authentication token is ok with a long buffer time.
    // If needed, now is the best time to ask the user to authenticate
    // since they have not yet entered any information into the form.
    let tokenOK = req.dsAuthCodeGrant.checkToken();
    if (tokenOK) {
        let envelopeDocuments = req.session.envelopeDocuments,
            documentOptions;
        if (envelopeDocuments) {
            // Prepare the select items
            documentOptions = envelopeDocuments.documents.map ( item => 
                ({text: item.name, documentId: item.documentId}));
        }
        res.render('pages/examples/eg007', {
            csrfToken: req.csrfToken(), 
            title: "Download a document",
            envelopeOk: req.session.envelopeId,
            documentsOk: envelopeDocuments,
            documentOptions: documentOptions,
            source: dsConfig.githubExampleUrl + path.basename(__filename),
            documentation: dsConfig.documentation + eg
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
eg007.createController = async (req, res) => {
    let accountId = req.dsAuthCodeGrant.getAccountId()
      // Additional data validation might also be appropriate
      , documentId = validator.escape(req.body.docSelect)
      , envelopesApi = new docusign.EnvelopesApi(req.dsAuthCodeGrant.getDSApi())
      , getEnvelopeDocumentP = req.dsAuthCodeGrant.makePromise(envelopesApi, 'getDocument')
      , envelopeDocuments = req.session.envelopeDocuments
      ;

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
    if (! req.session.envelopeId || ! envelopeDocuments ) {
        res.render('pages/examples/eg007', {
            csrfToken: req.csrfToken(), 
            title: "Download a document",
            envelopeOk: req.session.envelopeId,
            documentsOk: envelopeDocuments,
            source: dsConfig.githubExampleUrl + path.basename(__filename)
        });
    }

    // Step 2. EnvelopeDocuments::get
    let results = null;
    try {
        results = await getEnvelopeDocumentP(accountId, envelopeDocuments.envelopeId, documentId, null);
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
    if (!results) {return}

    let docItem = envelopeDocuments.documents.find(item => item.documentId === documentId)
      , docName = docItem.name
      , hasPDFsuffix = docName.substr(docName.length - 4).toUpperCase() === '.PDF'
      , pdfFile = hasPDFsuffix
      ;
    // Add .pdf if it's a content or summary doc and doesn't already end in .pdf
    if ((docItem.type === "content" || docItem.type === "summary") && !hasPDFsuffix){
        docName += ".pdf";
        pdfFile = true;
    }
    // Add .zip as appropriate
    if (docItem.type === "zip") {
        docName += ".zip"
    }

    // Return the file
    // See https://stackoverflow.com/a/30625085/64904
    let mimetype;
    if (pdfFile) { 
        mimetype = 'application/pdf'
    } else if (docItem.type === 'zip') {
        mimetype = 'application/zip'
    } else {
        mimetype = 'application/octet-stream'
    }

    res.writeHead(200, {
        'Content-Type': mimetype,
        'Content-disposition': 'inline;filename=' + docName,
        'Content-Length': results.length
    });
    res.end(results, 'binary');
}

