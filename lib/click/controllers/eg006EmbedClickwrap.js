/**
 * @file
 * Example 6: Embed a clickwrap
 * @author DocuSign
 */

 const path = require("path");
 const { embedClickwrap, getActiveClickwraps, getInactiveClickwraps } = require("../examples/embedClickwrap");
 const validator = require("validator");
 const { getExampleByNumber } = require("../../manifestService");
 const dsConfig = require("../../../config/index.js").config;
 const { API_TYPES } = require('../../utils.js');

 const eg006EmbedClickwrap = exports;
 const exampleNumber = 6;
 const eg = `ceg00${exampleNumber}`; // This example reference.
 const api = API_TYPES.CLICK;
 const mustAuthenticate = "/ds/mustAuthenticate";
 const minimumBufferMin = 3;

 /**
  * Create clickwrap
  * @param {Object} req Request obj
  * @param {Object} res Response obj
  */
 eg006EmbedClickwrap.createController = async (req, res) => {
     // Step 1. Check the token
     // At this point we should have a good token. But we
     // double-check here to enable a better UX to the user
     const isTokenOK = req.dsAuth.checkToken(minimumBufferMin);
     if (!isTokenOK) {
         req.flash("info", "Sorry, you need to re-authenticate.");
         // Save the current operation so it will be resumed after authentication
         req.dsAuth.setEg(req, eg);
         return res.redirect(mustAuthenticate);
     }

     // Get required arguments
     const { body } = req;
     let results = null;

     const documentArgs = {
        fullName: validator.escape(body.fullName),
        email: validator.escape(body.email),
        company: validator.escape(body.company),
        jobTitle: validator.escape(body.title),
        date: validator.escape(body.date),
     };

     const args = {
         accessToken: req.user.accessToken,
         basePath: dsConfig.clickAPIUrl,
         accountId: req.session.accountId,
         clickwrapName: req.body.clickwrapName,
         clickwrapId: req.body.clickwrapId,
         documentArgs: documentArgs
     };

     // Call the worker method
     try {
         results = await embedClickwrap(args);
         console.log(JSON.parse(JSON.stringify(results)));
     } catch (error) {
        if (embedClickwrap.agreementUrl == null) {
            const errorCode = "Error:";
            const errorMessage = "The email address was already used to agree to this elastic template. Provide a different email address if you want to view the agreement and agree to it.";
            res.render("pages/error", {err: error, errorCode, errorMessage});
        } else {
            const errorBody = error && error.response && error.response.body;
            // We can pull the DocuSign error code and message from the response body
            const errorCode = errorBody && errorBody.errorCode;
            const errorMessage = errorBody && errorBody.message;

            // In production, may want to provide customized error messages and
            // remediation advice to the user.
            res.render('pages/error', {err: error, errorCode, errorMessage});
        }
    }
     if (results) {
      // Save for use by other examples that need an clickwrapId
      const example = getExampleByNumber(res.locals.manifest, exampleNumber, api);
      res.render("pages/example_click6_done", {
          title: example.ExampleName,
          message: example.ResultsPageText,
          agreementUrl: JSON.parse(JSON.stringify(results)).agreementUrl
      });
  }
 }


 /**
  * Render page with our form for the example
  * @param {Object} req Request obj
  * @param {Object} res Response obj
  */
 eg006EmbedClickwrap.getController = async (req, res) => {
     // Check that the authentication token is okay with a long buffer time.
     // If needed, now is the best time to ask the user to authenticate,
     // since they have not yet entered any information into the form
     const isTokenOK = req.dsAuth.checkToken();
     if (!isTokenOK) {
         // Save the current operation so it will be resumed after authentication
         req.dsAuth.setEg(req, eg);
         return res.redirect(mustAuthenticate);
     }

     const args = {
        accessToken: req.user.accessToken,
        basePath: dsConfig.clickAPIUrl,
        accountId: req.session.accountId,
    };

     const example = getExampleByNumber(res.locals.manifest, exampleNumber, api);
     const sourceFile = (path.basename(__filename))[5].toLowerCase() + (path.basename(__filename)).substr(6);
     res.render("pages/click-examples/eg006EmbedClickwrap", {
         eg: eg, csrfToken: req.csrfToken(),
         example: example,
         sourceFile: sourceFile,
         clickwrapsData: await getActiveClickwraps(args),
         clickwrapsExist: await getInactiveClickwraps(args),
         sourceUrl: dsConfig.githubExampleUrl + 'click/examples/' + sourceFile,
         documentation: dsConfig.documentation + eg,
         showDoc: dsConfig.documentation
     });
 }