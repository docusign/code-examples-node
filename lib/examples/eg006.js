/**
 * @file
 * Example 006: List an envelope's documents
 * @author DocuSign
 */

const path = require('path')
    , docusign = require('docusign-esign')
    , dsConfig = require('../../ds_configuration.js').config
    ;

const eg006 = exports
    , eg = 'eg006' // This example reference.
    , mustAuthenticate = '/ds/mustAuthenticate'
    , minimumBufferMin = 3
    ;

/**
 * Form page for this application
 */
eg006.getController = (req, res) => {
    // Check that the authentication token is ok with a long buffer time.
    // If needed, now is the best time to ask the user to authenticate
    // since they have not yet entered any information into the form.
    let tokenOK = req.dsAuthCodeGrant.checkToken();
    if (tokenOK) {
        res.render('pages/examples/eg006', {
            csrfToken: req.csrfToken(), 
            title: "List envelope documents",
            envelopeOk: req.session.envelopeId,
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
eg006.createController = async (req, res) => {
    let accountId = req.dsAuthCodeGrant.getAccountId()
      , envelopesApi = new docusign.EnvelopesApi(req.dsAuthCodeGrant.getDSApi())
      , listEnvelopeDocumentsP = req.dsAuthCodeGrant.makePromise(envelopesApi, 'listDocuments')
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
    if (! req.session.envelopeId) {
        res.render('pages/examples/eg006', {
            csrfToken: req.csrfToken(), 
            title: "List envelope documents",
            envelopeOk: req.session.envelopeId,
            source: dsConfig.githubExampleUrl + path.basename(__filename)
        });
    }

    // Step 2. EnvelopeDocuments::get
    let results = null;
    try {
        results = await listEnvelopeDocumentsP(accountId, req.session.envelopeId, null);
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

