/**
 * @file
 * Example 009: Send envelope using a template
 * @author DocuSign
 */

const path = require('path')
    , docusign = require('docusign-esign')
    , validator = require('validator')
    , dsConfig = require('../../ds_configuration.js').config
    ;

const eg009 = exports
    , eg = 'eg009' // This example reference.
    , mustAuthenticate = '/ds/mustAuthenticate'
    , minimumBufferMin = 3
    ;

/**
 * Form page for this application
 */
eg009.getController = (req, res) => {
    // Check that the authentication token is ok with a long buffer time.
    // If needed, now is the best time to ask the user to authenticate
    // since they have not yet entered any information into the form.
    let tokenOK = req.dsAuthCodeGrant.checkToken();
    if (tokenOK) {
        res.render('pages/examples/eg009', {
            csrfToken: req.csrfToken(), 
            title: "Send envelope using a template",
            templateOk: req.session.templateId,
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
 * Send envelope with a template
 * @param {object} req Request obj 
 * @param {object} res Response obj
 */
eg009.createController = async (req, res) => {
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
    let body = req.body
        // Additional data validation might also be appropriate
      , signerEmail = validator.escape(body.signerEmail)
      , signerName = validator.escape(body.signerName)
      , ccEmail = validator.escape(body.ccEmail)
      , ccName = validator.escape(body.ccName)
      , envelopeArgs = {
            templateId: req.session.templateId,
            signerEmail: signerEmail, 
            signerName: signerName, 
            ccEmail: ccEmail, 
            ccName: ccName }
      , accountId = req.dsAuthCodeGrant.getAccountId()
      , dsAPIclient = req.dsAuthCodeGrant.getDSApi()
      , args = {
            dsAPIclient: dsAPIclient,
            makePromise: req.dsAuthCodeGrant.makePromise, // this is a function
            accountId: accountId,
            envelopeArgs: envelopeArgs
        }
      , results = null
      ;

    try {
        results = await eg009.worker (args)
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
        req.session.envelopeId = results.envelopeId; // Save for use by other examples 
            // which need an envelopeId
        res.render('pages/example_done', {
            title: "Envelope sent",
            h1: "Envelope sent",
            message: `The envelope has been created and sent!<br/>Envelope ID ${results.envelopeId}.`
        });
    }
}

/**
 * This function does the work of creating the envelope 
 * @param {object} args An object with the following elements: <br/>
 *   <tt>dsAPIclient</tt>: The DocuSign API Client object, already set with an access token and base url <br/>
 *   <tt>makePromise</tt>: Function for promisfying an SDK method <br/>
 *   <tt>accountId</tt>: Current account Id <br/>
 *   <tt>envelopeArgs</tt>: envelopeArgs, an object with elements 
 *      <tt>templateId</tt>, <tt>signerEmail</tt>, <tt>signerName</tt>, 
 *      <tt>ccEmail</tt>, <tt>ccName</tt>
 */
// ***DS.worker.start ***DS.snippet.1.start
eg009.worker = async (args) => { 
    let envelopesApi = new docusign.EnvelopesApi(args.dsAPIclient)
      , createEnvelopeP = args.makePromise(envelopesApi, 'createEnvelope')
      , results = null
      ;
    
    // Step 1. Make the envelope request body
    let envelope = makeEnvelope(args.envelopeArgs)

    // Step 2. call Envelopes::create API method
    // Exceptions will be caught by the calling function
    results = await createEnvelopeP(args.accountId, {envelopeDefinition: envelope});

    return results;
}
// ***DS.worker.end ***DS.snippet.1.end

// ***DS.snippet.2.start
/**
 * Creates envelope from the template
 * @function
 * @param {Object} args parameters for the envelope:
 *   <tt>signerEmail</tt>, <tt>signerName</tt>, <tt>ccEmail</tt>, <tt>ccName</tt>,
 *   <tt>templateId</tt>
 * @returns {Envelope} An envelope definition
 * @private
 */
function makeEnvelope(args){
    // The envelope has two recipients.
    // recipient 1 - signer
    // recipient 2 - cc

    // create the envelope definition
    let env = new docusign.EnvelopeDefinition();
    env.templateId = args.templateId;

    // Create template role elements to connect the signer and cc recipients
    // to the template
    // We're setting the parameters via the object creation
    let signer1 = docusign.TemplateRole.constructFromObject({
        email: args.signerEmail,
        name: args.signerName,
        roleName: 'signer'});

    // Create a cc template role.
    // We're setting the parameters via setters
    let cc1 = new docusign.TemplateRole();
    cc1.email = args.ccEmail;
    cc1.name = args.ccName;
    cc1.roleName = 'cc';

    // Add the TemplateRole objects to the envelope object
    env.templateRoles = [signer1, cc1];
    env.status = "sent"; // We want the envelope to be sent

    return env;
}
// ***DS.snippet.2.end
