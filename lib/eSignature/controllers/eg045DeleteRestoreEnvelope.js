/**
 * @file
 * Example 045: Delete and Undelete an Envelope
 * @author DocuSign
 */

const path = require('path');
const { deleteEnvelope, moveEnvelopeToFolder, getFolders } = require('../examples/deleteRestoreEnvelope');
const { getExampleByNumber } = require('../../manifestService');
const dsConfig = require('../../../config/index.js').config;
const { API_TYPES, formatString } = require('../../utils.js');
const { getFolderIdByName } = require('../getData.js');

const eg045DeleteRestoreEnvelope = exports;
const exampleNumber = 45;
const eg = `eg0${exampleNumber}`; // This example reference.
const api = API_TYPES.ESIGNATURE;
const mustAuthenticate = '/ds/mustAuthenticate';
const minimumBufferMin = 3;
const restoreEndpoint = `${eg}restore`;
const deleteFolderId = 'recyclebin';

/**
 * Delete the envelope
 * @param {object} req Request obj
 * @param {object} res Response obj
 */
eg045DeleteRestoreEnvelope.deleteController = async (req, res) => {
    // Step 1. Check the token
    // At this point we should have a good token. But we
    // double-check here to enable a better UX to the user.
    const isTokenOK = req.dsAuth.checkToken(minimumBufferMin);
    if (!isTokenOK) {
        req.flash('info', 'Sorry, you need to re-authenticate.');
        // Save the current operation so it will be resumed after authentication
        req.dsAuth.setEg(req, eg);
        return res.redirect(mustAuthenticate);
    }

    // Step 2. Call the worker method
    const args = {
        accessToken: req.user.accessToken,
        basePath: req.session.basePath,
        accountId: req.session.accountId,
        envelopeId: req.body.envelopeId,
        deleteFolderId: deleteFolderId,
    };
    let results = null;

    try {
        results = await deleteEnvelope(args);
    } catch (error) {
        const errorBody = error?.body || error?.response?.body;
        // we can pull the DocuSign error code and message from the response body
        const errorCode = errorBody?.errorCode;
        const errorMessage = errorBody?.message;
        // In production, may want to provide customized error messages and
        // remediation advice to the user.
        res.render('pages/error', {err: error, errorCode, errorMessage});
    }
    if (results) {
        req.session.envelopeId = req.body.envelopeId;

        const example = getExampleByNumber(res.locals.manifest, exampleNumber, api);
        const additionalPageData = example.AdditionalPage.find(p => p.Name === 'envelope_is_deleted');
        res.render('pages/example_done', {
            title: example.ExampleName,
            message: formatString(additionalPageData.ResultsPageText, req.body.envelopeId),
            redirectUrl: restoreEndpoint,
        });
    }
};

/**
 * Undelete the envelope
 * @param {object} req Request obj
 * @param {object} res Response obj
 */
eg045DeleteRestoreEnvelope.restoreController = async (req, res) => {
    // Step 1. Check the token
    // At this point we should have a good token. But we
    // double-check here to enable a better UX to the user.
    const isTokenOK = req.dsAuth.checkToken(minimumBufferMin);
    if (!isTokenOK) {
        req.flash('info', 'Sorry, you need to re-authenticate.');
        // Save the current operation so it will be resumed after authentication
        req.dsAuth.setEg(req, eg);
        return res.redirect(mustAuthenticate);
    }

    const args = {
        accessToken: req.user.accessToken,
        basePath: req.session.basePath,
        accountId: req.session.accountId,
        envelopeId: req.session.envelopeId,
        fromFolderId: deleteFolderId,
    };
    const folderName = req.body.folderName;
    let folderId = '';

    const example = getExampleByNumber(res.locals.manifest, exampleNumber, api);

    // Step 2. Call the worker method
    let results = null;
    try {
        const folders = await getFolders(args);
        folderId = getFolderIdByName(folders.folders, folderName);

        if (!folderId) {
            const additionalPageData = example.AdditionalPage.find(page => page.Name === 'folder_does_not_exist');
            return res.render('pages/example_done', {
                title: example.ExampleName,
                message: formatString(additionalPageData.ResultsPageText, folderName),
                redirectUrl: restoreEndpoint,
            });

        }

        results = await moveEnvelopeToFolder({ ...args, folderId });
    } catch (error) {
        const errorBody = error?.body || error?.response?.body;
        // we can pull the DocuSign error code and message from the response body
        const errorCode = errorBody?.errorCode;
        const errorMessage = errorBody?.message;
        // In production, may want to provide customized error messages and
        // remediation advice to the user.
        res.render('pages/error', {err: error, errorCode, errorMessage});
    }
    if (results) {
        res.render('pages/example_done', {
            title: example.ExampleName,
            message: formatString(example.ResultsPageText, req.session.envelopeId, folderId, folderName),
        });
    }
};

/**
 * Form page for this application
 */
eg045DeleteRestoreEnvelope.getDeleteController = (req, res) => {
    // Check that the authentication token is ok with a long buffer time.
    // If needed, now is the best time to ask the user to authenticate
    // since they have not yet entered any information into the form.
    const isTokenOK = req.dsAuth.checkToken();
    if (!isTokenOK) {
        // Save the current operation so it will be resumed after authentication
        req.dsAuth.setEg(req, eg);
        return res.redirect(mustAuthenticate);
    }

    const example = getExampleByNumber(res.locals.manifest, exampleNumber, api);
    const sourceFile = (path.basename(__filename))[5].toLowerCase() + (path.basename(__filename)).substr(6);
    res.render('pages/examples/eg045DeleteEnvelope', {
        eg: eg, csrfToken: req.csrfToken(),
        example: example,
        envelopeId: req.session.envelopeId,
        submitButtonText: res.locals.manifest.SupportingTexts.HelpingTexts.SubmitButtonDeleteText,
        sourceFile: sourceFile,
        sourceUrl: dsConfig.githubExampleUrl + 'eSignature/examples/' + sourceFile,
        documentation: dsConfig.documentation + eg,
        showDoc: dsConfig.documentation
    });
};


/**
 * Form page for this application
 */
eg045DeleteRestoreEnvelope.getRestoreController = (req, res) => {
    // Check that the authentication token is ok with a long buffer time.
    // If needed, now is the best time to ask the user to authenticate
    // since they have not yet entered any information into the form.
    const isTokenOK = req.dsAuth.checkToken();
    if (!isTokenOK) {
        // Save the current operation so it will be resumed after authentication
        req.dsAuth.setEg(req, eg);
        return res.redirect(mustAuthenticate);
    }

    if (!req.session.envelopeId) {
        return res.redirect(eg);
    }

    const example = getExampleByNumber(res.locals.manifest, exampleNumber, api);
    const sourceFile = (path.basename(__filename))[5].toLowerCase() + (path.basename(__filename)).substr(6);
    res.render('pages/examples/eg045RestoreEnvelope', {
        eg: eg, csrfToken: req.csrfToken(),
        example: example,
        envelopeId: req.session.envelopeId,
        submitButtonText: res.locals.manifest.SupportingTexts.HelpingTexts.SubmitButtonRestoreText,
        sourceFile: sourceFile,
        sourceUrl: dsConfig.githubExampleUrl + 'eSignature/examples/' + sourceFile,
        documentation: dsConfig.documentation + eg,
        showDoc: dsConfig.documentation
    });
};
