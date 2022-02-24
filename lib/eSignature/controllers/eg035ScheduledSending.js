/**
 * @file
 * Example 035: Creates an envelope that would include two documents and add a signer and cc recipients to be notified via email
 * @author DocuSign
 */

 const path = require('path');
 const validator = require('validator');
 const dsConfig = require('../../../config/index.js').config;
 const { scheduleEnvelope } = require('../examples/scheduledSending');

 const eg035ScheduledSending = exports;
 const eg = 'eg035'; // This example reference.
 const mustAuthenticate = '/ds/mustAuthenticate';
 const minimumBufferMin = 3;
 const demoDocsPath = path.resolve(__dirname, '../../../demo_documents');
 const docPdf = 'World_Wide_Corp_lorem.pdf';

 /**
  * Create the envelope
  * @param {object} req Request obj
  * @param {object} res Response obj
  */
 eg035ScheduledSending.createController = async (req, res) => {
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
         signerEmail: validator.escape(body.signerEmail),
         signerName: validator.escape(body.signerName),
         resumeDate: validator.escape(body.resumeDate),
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
         results = await scheduleEnvelope(args);
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
             title: "Envelope scheduled",
             h1: "Envelope scheduled",
             message: `The envelope has been created and scheduled!<br/>Envelope ID ${results.envelopeId}.`
         });
     }
 }

 /**
  * Form page for this application
  */
 eg035ScheduledSending.getController = (req, res) => {
     // Check that the authentication token is ok with a long buffer time.
     // If needed, now is the best time to ask the user to authenticate
     // since they have not yet entered any information into the form.
     const tokenOK = req.dsAuth.checkToken();
     if (tokenOK) {
         sourceFile = (path.basename(__filename))[5].toLowerCase() + (path.basename(__filename)).substr(6);
         res.render('pages/examples/eg035ScheduledSending', {
             eg: eg, csrfToken: req.csrfToken(),
             title: "Scheduled Sending",
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
