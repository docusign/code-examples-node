/**
 * @file
 * Example 3: Create a new clickwrap version
 * @author DocuSign
 */

const path = require("path")
    , fs = require("fs-extra")
    , docusignClick = require("docusign-click")
    , dsConfig = require("../../config/index.js").config
    , createClickApiClient = require("./createClickApiClient")
    ;

const eg003CreateNewClickwrapVersion = exports
    , eg = "eg003"
    , mustAuthenticate = "/ds/mustAuthenticate"
    , minimumBufferMin = 3
    , demoDocumentsPath = path.resolve(__dirname, "../../demo_documents")
    ;

/**
 * Work with creating the new clickwrap version
 * @param {Object} args Arguments for creating clickwrap
 * @return {Object} The object with value of clickwrapId or error
 */
const worker = async (args) => {
    // Step 3. Construct the request Body
    // Create display settings model
    const displaySettings = docusignClick.DisplaySettings.constructFromObject({
        consentButtonText: "I Agree",
        displayName: `${args.clickwrapName} v2`,
        downloadable: false,
        format: "modal",
        mustRead: true,
        mustView: false,
        requireAccept: false,
        documentDisplay: "document",
        sendToEmail: false
    });

    // Create document model
    // Read and encode file. Put encoded value to Document entity.
    // The reads could raise an exception if the file is not available!
    const documentPdfExample = fs.readFileSync(path.resolve(demoDocumentsPath, dsConfig.docTermsPdf));
    const encodedExampleDocument = Buffer.from(documentPdfExample).toString("base64");
    const document = docusignClick.Document.constructFromObject({
        documentBase64: encodedExampleDocument,
        documentName: "Terms of Service",
        fileExtension: "pdf",
        order: 0
    });

    // Create clickwrapRequest model
    const clickwrapRequest = docusignClick.ClickwrapRequest.constructFromObject({
        displaySettings,
        documents: [document],
        name: args.clickwrapName,
        requireReacceptance: true,
        status: "active"
    });

    // Step 4. Call the Click API
    // Create Click API client
    const accountApi = createClickApiClient(args, dsConfig.clickAPIUrl);

    // Create a new clickwrap version using SDK
    const result = await accountApi.createClickwrapVersion(args.accountId,
        args.clickwrapId, { clickwrapRequest });
    console.log(`New clickwrap version was created. ClickwrapId ${result.clickwrapId}`);
    return result;
}

/**
 * Render page with our form for the example
 * @param {Object} req Request obj
 * @param {Object} res Response obj
 */
eg003CreateNewClickwrapVersion.createController = async (req, res) => {
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
        clickwrapId: req.session.clickwrapId,
        clickwrapName: req.session.clickwrapName
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
            title: "Creating a new clickwrap version",
            h1: "Creating a new clickwrap version",
            message: `The 2nd version of clickwrap ${results.clickwrapName} has been created`
        });
    }
}

/**
 * Render page with our form for the example
 * @param {Object} req Request obj
 * @param {Object} res Response obj
 */
eg003CreateNewClickwrapVersion.getController = async (req, res) => {
    // Check that the authentication token is okay with a long buffer time.
    // If needed, now is the best time to ask the user to authenticate,
    // since they have not yet entered any information into the form

    const tokenOk = req.dsAuth.checkToken();
    if (tokenOk){
        res.render("pages/click-examples/eg003CreateNewClickwrapVersion", {
            eg: eg, csrfToken: req.csrfToken(),
            title: "Creating a new clickwrap version",
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
