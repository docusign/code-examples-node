/**
 * @file
 * This file provides generic example methods.
 * @author DocuSign
 */

const fs = require('fs')
    , ds_config = require('../ds_configuration.js').config
    ;

const dsWork = exports;

/**
 * Home page for this application
 */
dsWork.indexController = (req, res) => {
    res.render('pages/index', {title: "Home"});
}

dsWork.mustAuthenticateController = (req, res) => {
    res.render('pages/ds_must_authenticate', {title: "Authenticate with DocuSign"});
}

/**
 * Display parameters after DS redirect to the application 
 * after an embedded signing ceremony, etc
 * @param {object} req Request object 
 * @param {object} res Result object
 */
dsWork.returnController = (req, res) => {
    let event = req.query && req.query.event,
        state = req.query && req.query.state;
    res.render('pages/ds_return', {
        title: "Return from DocuSign",
        event: event,
        state: state
    });
}

