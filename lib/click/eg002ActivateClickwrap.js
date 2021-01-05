/**
 * @file
 * Example 2: Activating a clickwrap
 * @author DocuSign
 */

const path = require("path")
    , docusignClick = require("docusign-click")
    , dsConfig = require("../../config/index.js").config
    , createClickApiClient = require("./createClickApiClient")
    ;

const eg002ActivateClickwrap = exports
    , eg = "eg002"
    , mustAuthenticate = "/ds/mustAuthenticate"
    , minimumBufferMin = 3
    ;


/**
 * Work with activating the clickwrap
 * @param {Object} args Arguments for creating a clickwrap
 * @return {Object} The object with value of clickwrapId or error
 */
const worker = async (args) => {
    // Step 2. Construct the request body
    // Create clickwrapRequest model
    const clickwrapRequest = docusignClick.ClickwrapRequest.constructFromObject({
        status: "active"
    });

    // Step 4. Call the Click API
    // Create Click API client
    const accountApi = createClickApiClient(args, dsConfig.clickAPIUrl);

    // Update and activate a clickwrap
    const result = await accountApi.updateClickwrapVersion(
        args.accountId, args.clickwrapId, 1, { clickwrapRequest });
    console.log(`Clickwrap was updated. ClickwrapId ${result.clickwrapId}`);
    return result;
}

/**
 * Activate clickwrap
 * @param {Object} req Request obj
 * @param {Object} res Response obj
 */
eg002ActivateClickwrap.createController = async (req, res) => {
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
        clickwrapName: req.session.clickwrapName,
        clickwrapId: req.session.clickwrapId
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
        req.session.clickIsActive = true;
        res.render("pages/example_done", {
            title: "Activating a new clickwrap",
            h1: "Activating a new clickwrap",
            message: `The clickwrap ${results.clickwrapName} has been activated`
        });
    }
}

/**
 * Render page with our form for the example
 * @param {Object} req Request obj
 * @param {Object} res Response obj
 */
eg002ActivateClickwrap.getController = async (req, res) => {
    // Check that the authentication token is okay with a long buffer time.
    // If needed, now is the best time to ask the user to authenticate,
    // since they have not yet entered any information into the form
    const tokenOk = req.dsAuth.checkToken();
    if (tokenOk){
        res.render("pages/click-examples/eg002ActivateClickwrap", {
            eg: eg, csrfToken: req.csrfToken(),
            title: "Activating a new clickwrap",
            clickwrapOk: req.session.hasOwnProperty("clickwrapId"),
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
