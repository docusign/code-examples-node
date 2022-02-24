/**
 * @file
 * Example 036: Demonstrates how to delay an envelope’s delivery between recipients using the delayed routing feature.
 * @author DocuSign
 */

 const path = require('path');
 const validator = require('validator');
 const dsConfig = require('../../../config/index.js').config;
 const { SendEnvelopeWithDelayedRouting } = require('../examples/delayedRouting');

 const eg036DelayedRouting = exports;
 const eg = 'eg036'; // This example reference.
 const mustAuthenticate = '/ds/mustAuthenticate';
 const minimumBufferMin = 3;
 const demoDocsPath = path.resolve(__dirname, '../../../demo_documents');
 const docPdf = 'World_Wide_Corp_lorem.pdf';

 /**
  * Create the envelope
  * @param {object} req Request obj
  * @param {object} res Response obj
  */
  eg036DelayedRouting.createController = async (req, res) => {
     // Step 1. Check the token
     // At this point we should have a good token. But we
     // double-check here to enable a better UX to the user.
     const tokenOK = req.dsAuth.checkToken(minimumBufferMin);
     if (! tokenOK) {
         req.flash('info', 'Sorry, you need to re-authenticate.');
         // Save the current operation so it will be resumed after authentication
         req.dsAuth.setEg(req, eg);
         res.redirect(mustAuthenticate);
     }

     // Step 2. Call the worker method
     const { body } = req;
     const envelopeArgs = {
         signer1Email: validator.escape(body.signer1Email),
         signer1Name: validator.escape(body.signer1Name),
         signer2Email: validator.escape(body.signer2Email),
         signer2Name: validator.escape(body.signer2Name),
         delay: validator.escape(body.delay),
         docPdf: path.resolve(demoDocsPath, docPdf)
     };
     const args = {
         accessToken: req.user.accessToken,
         basePath: req.session.basePath,
         accountId: req.session.accountId,
         envelopeArgs: envelopeArgs
     };
     let results = null;

     try {
         results = await SendEnvelopeWithDelayedRouting(args);
     }
     catch (error) {
         const errorBody = error && error.response && error.response.body;
         // we can pull the DocuSign error code and message from the response body
         const errorCode = errorBody && errorBody.errorCode;
         const errorMessage = errorBody && errorBody.message;
         // In production, may want to provide customized error messages and
         // remediation advice to the user.
         res.render('pages/error', {err: error, errorCode, errorMessage});
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
  * Form page for this application
  */
  eg036DelayedRouting.getController = (req, res) => {
     // Check that the authentication token is ok with a long buffer time.
     // If needed, now is the best time to ask the user to authenticate
     // since they have not yet entered any information into the form.
     const tokenOK = req.dsAuth.checkToken();
     if (tokenOK) {
         sourceFile = (path.basename(__filename))[5].toLowerCase() + (path.basename(__filename)).substr(6);
         res.render('pages/examples/eg036DelayedRouting', {
             eg: eg, csrfToken: req.csrfToken(),
             title: "Delayed Routing",
             sourceFile: sourceFile,
             sourceUrl: dsConfig.githubExampleUrl + 'eSignature/examples/' + sourceFile,
             documentation: dsConfig.documentation + eg,
             showDoc: dsConfig.documentation
         });
     } else {
         // Save the current operation so it will be resumed after authentication
         req.dsAuth.setEg(req, eg);
         res.redirect(mustAuthenticate);
     }
 }
