/**
 * @file
 * Example 008: create a template if it doesn't already exist
 * @author DocuSign
 */

const path = require('path')
    , dsConfig = require('../../../config/index.js').config
    , createTemplate = require('../examples/createTemplate')
    ;

const eg008CreateTemplate = exports
    , eg = 'eg008' // This example reference.
    , mustAuthenticate = '/ds/mustAuthenticate'
    , minimumBufferMin = 3
    , demoDocsPath = path.resolve(__dirname, '../../demo_documents')
    , docFile = 'World_Wide_Corp_fields.pdf'
    , templateName = 'Example Signer and CC template'
    ;

/**
 * Create a template
 * @param {object} req Request obj
 * @param {object} res Response obj
 */
eg008CreateTemplate.createController = async (req, res) => {
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

    // Step 2. Call the worker method
    let args = {
            accessToken: req.user.accessToken,
            basePath: req.session.basePath,
            accountId: req.session.accountId,
            templateName: templateName,
            docFile: path.resolve(demoDocsPath, docFile)
        }
      , results = null;

    try {
        results = await createTemplate.createTemplate (args)
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
        // Save the templateId in the session so they can be used in future examples
        req.session.templateId = results.templateId;
        let msg = results.createdNewTemplate ?
                "The template has been created!" :
                "Done. The template already existed in your account.";

        res.render('pages/example_done', {
            title: "Template results",
            h1: "Template results",
            message: `${msg}<br/>Template name: ${results.templateName}, ID ${results.templateId}.`
        });
    }
  }

/**
 * Form page for this application
 */
eg008CreateTemplate.getController = (req, res) => {
    // Check that the authentication token is ok with a long buffer time.
    // If needed, now is the best time to ask the user to authenticate
    // since they have not yet entered any information into the form.
    let tokenOK = req.dsAuth.checkToken();
    if (tokenOK) {
        res.render('pages/examples/eg008CreateTemplate', {
            eg: eg, csrfToken: req.csrfToken(),
            title: "Create a template",
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
