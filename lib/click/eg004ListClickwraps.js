/**
 * @file
 * Example 4: Get list of clickwraps
 * @author DocuSign
 */

const path = require("path")
    , dsConfig = require("../../config/index.js").config
    , createClickApiClient = require("./createClickApiClient")
    ;

const eg004ListClickwraps = exports
    , eg = "eg004"
    , mustAuthenticate = "/ds/mustAuthenticate"
    , minimumBufferMin = 3
    ;

/**
 * Get list of clickwraps
 * @param {Object} args Arguments for creating clickwrap
 * @return {Object} The object with value of clickwrapId or error
 */
const worker = async (args) => {
    // Step 3. Call the Click API
    // Create Click API client
    const accountApi = createClickApiClient(args, dsConfig.clickAPIUrl);

    // Get a list of all clickwraps
    return await accountApi.getClickwraps(args.accountId);
}

/**
 * Render page with our form for the example
 * @param {Object} req Request obj
 * @param {Object} res Response obj
 */
eg004ListClickwraps.createController = async (req, res) => {
    // Step 1. Check the token
    // At this point we should have a good token. But we
    // double-check here to enable a better UX to the user
    const tokenOk = req.dsAuth.checkToken(minimumBufferMin);
    if (!tokenOk) {
        req.flash("info", "Sorry, you need to re-authenticate.");
        // Save the current operation so it will be resumed after authentication
        req.dsAuth.setEg(req, eg);
        res.redirect(mustAuthenticate);
    }

    // Get required arguments
    let results = null;
    const args = {
        accessToken: req.user.accessToken,
        basePath: req.session.basePath,
        accountId: req.session.accountId,
    };

    // Call the worker method
    try {
        results = await worker(args)
    }
    catch (error) {
        const errorBody = error && error.response && error.response.body
            // We can pull the DocuSign error code and message from the response body
            , errorCode = errorBody && errorBody.errorCode
            , errorMessage = errorBody && errorBody.message
        ;
        // In production, you may want to provide customized error messages and
        // remediation advice to the user
        res.render("pages/error", { err: error, errorCode, errorMessage });
    }

    if (results) {
        // Save for use by other examples that need an clickwrapId
        res.render("pages/example_done", {
            title: "List of the clickwraps",
            h1: "List of the clickwraps",
            message: "Results from the Click::getClickwraps method",
            json: JSON.stringify(results)
        });
    }
}

/**
 * Render page with our form for the example
 * @param {Object} req Request obj
 * @param {Object} res Response obj
 */
eg004ListClickwraps.getController = async (req, res) => {
    // Check that the authentication token is okay with a long buffer time.
    // If needed, now is the best time to ask the user to authenticate,
    // since they have not yet entered any information into the form

    const tokenOk = req.dsAuth.checkToken();
    if (tokenOk){
        res.render("pages/click-examples/eg004ListClickwraps", {
            eg: eg, csrfToken: req.csrfToken(),
            title: "Getting a list of clickwraps",
            sourceFile: path.basename(__filename),
            sourceUrl: dsConfig.githubExampleUrl + path.basename(__filename),
            documentation: dsConfig.documentation + eg,
            showDoc: dsConfig.documentation
        });
    } else {
        // Save the current operation so it will be resumed after authentication
        req.dsAuth.setEg(req, eg);
        res.redirect(mustAuthenticate);
    }
}
