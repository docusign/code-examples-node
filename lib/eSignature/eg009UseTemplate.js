/**
 * @file
 * Example 009: Send envelope using a template
 * @author DocuSign
 */

const path = require('path')
    , docusign = require('docusign-esign')
    , validator = require('validator')
    , dsConfig = require('../../config/index.js').config
    ;

const eg009UseTemplate = exports
    , eg = 'eg009' // This example reference.
    , mustAuthenticate = '/ds/mustAuthenticate'
    , minimumBufferMin = 3
    ;


/**
 * Send envelope with a template
 * @param {object} req Request obj
 * @param {object} res Response obj
 */
eg009UseTemplate.createController = async (req, res) => {
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

    if (!req.session.templateId) {
        res.render('pages/examples/eg009UseTemplate', {
            eg: eg, csrfToken: req.csrfToken(),
            title: "Send envelope using a template",
            templateOk: req.session.templateId,
            sourceFile: path.basename(__filename),
            sourceUrl: dsConfig.githubExampleUrl + 'eSignature/' + path.basename(__filename),
            documentation: dsConfig.documentation + eg,
            showDoc: dsConfig.documentation
        });
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
      , args = {
            accessToken: req.user.accessToken,
            basePath: req.session.basePath,
            accountId: req.session.accountId,
            envelopeArgs: envelopeArgs
        }
      , results = null
      ;

    try {
        results = await eg009UseTemplate.worker (args)
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
 * @param {object} args object
 */
// ***DS.snippet.0.start
eg009UseTemplate.worker = async (args) => {
    // Data for this method
    // args.basePath
    // args.accessToken
    // args.accountId


    let dsApiClient = new docusign.ApiClient();
    dsApiClient.setBasePath(args.basePath);
    dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + args.accessToken);
    let envelopesApi = new docusign.EnvelopesApi(dsApiClient);

    // Step 1. Make the envelope request body
    let envelope = makeEnvelope(args.envelopeArgs)

    // Step 2. call Envelopes::create API method
    // Exceptions will be caught by the calling function
    let results = await envelopesApi.createEnvelope(
        args.accountId, {envelopeDefinition: envelope});

    return results;
}

/**
 * Creates envelope from the template
 * @function
 * @param {Object} args object
 * @returns {Envelope} An envelope definition
 * @private
 */
function makeEnvelope(args){
    // Data for this method
    // args.signerEmail
    // args.signerName
    // args.ccEmail
    // args.ccName
    // args.templateId


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
// ***DS.snippet.0.end

/**
 * Form page for this application
 */
eg009UseTemplate.getController = (req, res) => {
    // Check that the authentication token is ok with a long buffer time.
    // If needed, now is the best time to ask the user to authenticate
    // since they have not yet entered any information into the form.
    let tokenOK = req.dsAuth.checkToken();
    if (tokenOK) {
        res.render('pages/examples/eg009UseTemplate', {
            eg: eg, csrfToken: req.csrfToken(),
            title: "Send envelope using a template",
            templateOk: req.session.templateId,
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
