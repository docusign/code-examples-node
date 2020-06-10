/**
 * @file
 * This file provides common controllers.
 * @author DocuSign
 */

const fs = require('fs')
    , dsConfig = require('../config/appsettings.json')
    , documentationTopic = 'auth-code-grant-node'
    ;

const commonControllers = exports;

/**
 * Home page for this application
 */
commonControllers.indexController = (req, res) => {
    res.render('pages/index', {
        title: "Home",
        documentation: dsConfig.documentation + documentationTopic,
        showDoc: dsConfig.documentation
    });
}

commonControllers.mustAuthenticateController = (req, res) => {
    res.render('pages/ds_must_authenticate', {title: "Authenticate with DocuSign"});
}

commonControllers.login = (req, res, next) => {
    const { auth } = req.query;
    if (auth === 'grand-auth') {
        req.dsAuth = req.dsAuthCodeGrant;
    } else if (auth === 'jwt-auth') {
        req.dsAuth = req.dsAuthJwt;
    }
    req.dsAuth.login(req, res, next)
}

commonControllers.logout = (req, res) => {
    req.dsAuth.logout(req, res)
}

commonControllers.logoutCallback = (req, res) => {
    req.dsAuth.logoutCallback(req, res)
}

/**
 * Display parameters after DS redirect to the application
 * after an embedded signing ceremony, etc
 * @param {object} req Request object
 * @param {object} res Result object
 */
commonControllers.returnController = (req, res) => {
    let event = req.query && req.query.event,
        state = req.query && req.query.state,
        envelopeId = req.query && req.query.envelopeId;
    res.render('pages/ds_return', {
        title: "Return from DocuSign",
        event: event,
        envelopeId: envelopeId,
        state: state
    });
}

