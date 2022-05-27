/**
 * @file
 * Example 006: Get user profile data by email
 * @author DocuSign
 */

 const path = require('path');
 const { getUserProfileByEmail } = require('../examples/getUserProfileByEmail');
 const dsConfig = require('../../../config/index.js').config;
 const validator = require('validator');
 const { getOrganizationId } = require("../getOrganizationId.js");
 
 const eg006GetUserProfileByEmail = exports;
 const eg = 'eg006' // This example reference.;
 const mustAuthenticate = '/ds/mustAuthenticate';
 const minimumBufferMin = 3;
 
 /**
  * Getting user profile by email
  * @param {object} req Request obj
  * @param {object} res Response obj
  */
  eg006GetUserProfileByEmail.createController = async(req, res) => {
   // Step 1. Check the token
   // At this point we should have a good token. But we
   // double-check here to enable a better UX to the user.
   const isTokenOK = req.dsAuth.checkToken(minimumBufferMin);
   if (!isTokenOK) {
     req.flash('info', 'Sorry, you need to re-authenticate.');
     // Save the current operation so it will be resumed after authentication
     req.dsAuth.setEg(req, eg);
     res.redirect(mustAuthenticate);
   }
 
   const { body } = req;
   const args = {
       accessToken: req.user.accessToken,
       email: validator.escape(body.email),
       accountId: req.session.accountId,
       organizationId: req.session.organizationId,
       basePath: dsConfig.adminAPIUrl
     };
 
   let results = null;
 
   try {
     results = await getUserProfileByEmail(args)
   } catch (error) {
     // we can pull the DocuSign error code and message from the response body
     const errorBody = error && error.response && error.response.body;
     const errorCode = errorBody && errorBody.errorCode;
     const errorMessage = errorBody && errorBody.message;
 
     // In production, may want to provide customized error messages and
     // remediation advice to the user.
     res.render('pages/error', { err: error, errorCode, errorMessage });
   }
   if (results) {
     res.render('pages/example_done', {
       title: "Retrieve the user's DocuSign profile using an email address",
       h1: "Retrieve the user's DocuSign profile using an email address",
       message: "Results from MultiProductUserManagement:getUserDSProfilesByEmail method:",
       json: JSON.stringify(results)
     });
   }
 }
 
 /**
  * Form page for this application
  */
  eg006GetUserProfileByEmail.getController = async (req, res) => {
   // Check that the authentication token is ok with a long buffer time.
   // If needed, now is the best time to ask the user to authenticate
   // since they have not yet entered any information into the form.
 
   let isTokenOK = req.dsAuth.checkToken();
   if (isTokenOK) {
     try {
       await getOrganizationId(req);
 
       const args = {
         accessToken: req.user.accessToken,
         accountId: req.session.accountId,
         basePath: req.session.basePath,
         organizationId: req.session.organizationId
       };
  
       sourceFile = (path.basename(__filename))[5].toLowerCase() + (path.basename(__filename)).substr(6);
       res.render('pages/admin-examples/eg006GetUserProfileByEmail', {
         eg: eg,
         csrfToken: req.csrfToken(),
         title: "Get user profile by email",
         sourceFile: sourceFile,
         sourceUrl: dsConfig.githubExampleUrl + "admin/examples/" + sourceFile,
         documentation: dsConfig.documentation + eg,
         showDoc: dsConfig.documentation
       });
     }
     catch (error) {
       const errorBody = error && error.response && error.response.body;
       const errorCode = errorBody && errorBody.errorCode;
       const errorMessage = errorBody && errorBody.message;
 
       // In production, may want to provide customized error messages and
       // remediation advice to the user.
       res.render('pages/error', { err: error, errorCode, errorMessage });
     }
 
   } else {
     // Save the current operation so it will be resumed after authentication
     req.dsAuth.setEg(req, eg);
     res.redirect(mustAuthenticate);
   }
 }
 