/**
 * @file
 * This file provides common controllers.
 * @author DocuSign
 */

const fs = require('fs')
    , dsConfig = require('../ds_configuration.js').config
    , documentationTopic = 'auth-code-grant-node'
    ;

const commonControllers = exports;

/**
 * Home page for this application
 */
commonControllers.indexController = (req, res) => {
    res.render('pages/index', {
        title: "Home",
        documentation: dsConfig.documentation + documentationTopic
    });
}

commonControllers.mustAuthenticateController = (req, res) => {
    res.render('pages/ds_must_authenticate', {title: "Authenticate with DocuSign"});
}

/**
 * Display parameters after DS redirect to the application 
 * after an embedded signing ceremony, etc
 * @param {object} req Request object 
 * @param {object} res Result object
 */
commonControllers.returnController = (req, res) => {
    let event = req.query && req.query.event,
        state = req.query && req.query.state;
    res.render('pages/ds_return', {
        title: "Return from DocuSign",
        event: event,
        state: state
    });
}

