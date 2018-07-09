/**
 * @file
 * Example 001: Embedded Signing Ceremony
 * @author DocuSign
 */

const fs = require('fs')
    ;

const eg001 = exports
    , eg = 'eg001' // This example reference.
    , mustAuthenticate = '/ds/mustAuthenticate'
    ;

/**
 * Form page for this application
 */
eg001.getController = (req, res) => {
    let needToken = req.dsAuthCodeGrant.checkToken();
    if (needToken) {
        req.dsAuthCodeGrant.setEg(req, eg);
        res.redirect(mustAuthenticate);
    } else {
        res.render('pages/eg001', {title: "Embedded Signing Ceremony"});
    }
}  

/**
 * Create the envelope
 * @param {object} req Request obj 
 * @param {object} res Response obj
 */
eg001.createController = (req, res) => {

}

