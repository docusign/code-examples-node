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
    , {promisify} = require('util') // http://2ality.com/2017/05/util-promisify.html
    ;

const eg007EnvelopeGetDoc = exports
    , eg = 'eg007' // This example reference.
    , mustAuthenticate = '/ds/mustAuthenticate'
    , minimumBufferMin = 3
    ;

/**
 * Form page for this application
 */
eg007EnvelopeGetDoc.getController = (req, res) => {
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
        res.render('pages/examples/eg007EnvelopeGetDoc', {
            csrfToken: req.csrfToken(), 
            title: "Download a document",
            envelopeOk: req.session.envelopeId,
            documentsOk: envelopeDocuments,
            documentOptions: documentOptions,
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
eg007EnvelopeGetDoc.createController = async (req, res) => {
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
    let envelopeDocuments = req.session.envelopeDocuments;
    if (! req.session.envelopeId || ! envelopeDocuments ) {
        res.render('pages/examples/eg007EnvelopeGetDoc', {
            csrfToken: req.csrfToken(), 
            title: "Download a document",
            envelopeOk: req.session.envelopeId,
            documentsOk: envelopeDocuments,
            sourceFile: path.basename(__filename),
            sourceUrl: dsConfig.githubExampleUrl + path.basename(__filename),
            documentation: dsConfig.documentation + eg,
            showDoc: dsConfig.documentation
        });
    }

    // Step 2. Call the worker method
    let accountId = req.dsAuthCodeGrant.getAccountId()
      , dsAPIclient = req.dsAuthCodeGrant.getDSApi()
        // Additional data validation might also be appropriate
      , documentId = validator.escape(req.body.docSelect)
      , args = {
          dsAPIclient: dsAPIclient,
          accountId: accountId,
          documentId: documentId,
          envelopeDocuments: envelopeDocuments
        }
      , results = null
      ;

    try {
        results = await eg007EnvelopeGetDoc.worker (args)
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
 * This function does the work of listing the envelope's recipients
 * @param {object} args An object with the following elements: <br/>
 *   <tt>dsAPIclient</tt>: The DocuSign API Client object, already set with an access token and base url <br/>
 *   <tt>accountId</tt>: Current account Id <br/>
 *   <tt>documentId</tt>: the document to be fetched <br/>
 *   <tt>envelopeDocuments</tt>: object with data about the envelope's documents
 */
// ***DS.worker.start ***DS.snippet.1.start
eg007EnvelopeGetDoc.worker = async (args) => {
    let envelopesApi = new docusign.EnvelopesApi(args.dsAPIclient)
      , getEnvelopeDocumentP = promisify(envelopesApi.getDocument).bind(envelopesApi)
      , results = null
      ;

    // Step 1. EnvelopeDocuments::get.
    // Exceptions will be caught by the calling function
    results = await getEnvelopeDocumentP(
        args.accountId, args.envelopeDocuments.envelopeId, args.documentId, null);

    let docItem = args.envelopeDocuments.documents.find(item => item.documentId === args.documentId)
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

    // Return the file information
    // See https://stackoverflow.com/a/30625085/64904
    let mimetype;
    if (pdfFile) { 
        mimetype = 'application/pdf'
    } else if (docItem.type === 'zip') {
        mimetype = 'application/zip'
    } else {
        mimetype = 'application/octet-stream'
    }

    return ({mimetype: mimetype, docName: docName, fileBytes: results});
}
// ***DS.worker.end ***DS.snippet.1.end

