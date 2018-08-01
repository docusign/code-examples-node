/**
 * @file
 * Example 003: List envelopes in the user's account
 * @author DocuSign
 */

const docusign = require('docusign-esign')
    , dsConfig = require('../../ds_configuration.js').config
    , moment = require('moment')
    , path = require('path')
    ;

const eg003 = exports
    , eg = 'eg003' // This example reference.
    , mustAuthenticate = '/ds/mustAuthenticate'
    , minimumBufferMin = 3
    ;

/**
 * Form page for this application
 */
eg003.getController = (req, res) => {
    // Check that the authentication token is ok with a long buffer time.
    // If needed, now is the best time to ask the user to authenticate
    // since they have not yet entered any information into the form.
    let tokenOK = req.dsAuthCodeGrant.checkToken();
    if (tokenOK) {
        res.render('pages/examples/eg003', {
            csrfToken: req.csrfToken(), 
            title: "List envelopes",
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
 * List envelopes in the user's account
 * @param {object} req Request obj 
 * @param {object} res Response obj
 */
eg003.createController = async (req, res) => {
    let accountId = req.dsAuthCodeGrant.getAccountId()
      , envelopesApi = new docusign.EnvelopesApi(req.dsAuthCodeGrant.getDSApi())
      , listStatusChangesP = req.dsAuthCodeGrant.makePromise(envelopesApi, 'listStatusChanges')
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

    // Step 2. List the envelopes
    // The Envelopes::listStatusChanges method has many options
    // See https://developers.docusign.com/esign-rest-api/reference/Envelopes/Envelopes/listStatusChanges

    // The list status changes call requires at least a from_date OR
    // a set of envelopeIds. Here we filter using a from_date.
    // Here we set the from_date to filter envelopes for the last month
    // Use ISO 8601 date format
    let options = {fromDate: moment().subtract(30, 'days').format()};

    let results = null;
    try {
        results = await listStatusChangesP(accountId, options);
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

    res.render('pages/example_done', {
        title: "List envelopes results",
        h1: "List envelopes results",
        message: `Results from the Envelopes::listStatusChanges method:`,
        json: JSON.stringify(results)
    });
}

