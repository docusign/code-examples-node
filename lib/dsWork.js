/**
 * @file
 * This file provides generic example methods.
 * @author DocuSign
 */

const fs = require('fs')
    , ds_config = require('../ds_configuration.js').config
    ;

const dsWork = exports;

const debug = ds_config.debug  // should debug statements be printed?
    , debug_prefix = 'dsWork'
    ;

dsWork.index_controller = (req, res) => {
    res.render('pages/index', {title: "Home"});
}

dsWork.go_controller = (req, res) => {
    res.render('pages/go', {title: "Home"});
}

dsWork.must_authenticate_controller = (req, res) => {
    res.render('pages/ds_must_authenticate', {title: "Authenticate with DocuSign"});
}

