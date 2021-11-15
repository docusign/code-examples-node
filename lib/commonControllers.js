/**
 * @file
 * This file provides common controllers.
 * @author DocuSign
 */

const fs = require('fs')
    , dsConfig = require('../config/appsettings.json')
    , examplesApi = require('../config/examplesApi.json')
    , documentationTopic = 'auth-code-grant-node'
    ;

const commonControllers = exports;

/**
 * Home page for this application
 */
commonControllers.indexController = (req, res) => {
    if (dsConfig.quickstart == 'true' && req.user == undefined) {
        console.debug ('quickstart mode on');
        return res.redirect('/eg001');
    }
    else if (examplesApi.examplesApi['isMonitorApi']){
        res.render('pages/index_monitor_examples', {
            title: "Home",
            documentation: dsConfig.documentation + documentationTopic,
            showDoc: dsConfig.documentation    
        });
    }
    else {
        res.render('pages/index', {
            title: "Home",
            documentation: dsConfig.documentation + documentationTopic,
            showDoc: dsConfig.documentation    
        });
    }
}

commonControllers.mustAuthenticateController = (req, res) => {
    if (dsConfig.quickstart == 'true')
      res.redirect('login');
    else if (examplesApi.examplesApi.isMonitorApi) {
          // Monitor API supports JWT only
          req.dsAuth = req.dsAuthJwt;
          req.dsAuth.login(req, res, '');
      }
    else
      res.render('pages/ds_must_authenticate', {title: "Authenticate with DocuSign"});
}

commonControllers.chooseApi = (req, res) => {
    res.render('pages/choose_api', {title: "Choose API"});
}

commonControllers.switchApi = (req, res) => {
    const { chosenApi } = req.query;
    const fs = require('fs');

    let apiChoice = {
            examplesApi: {
                isESignatureApi: false,
                isRoomsApi: false,
                isClickApi: false,
                isMonitorApi: false,
                isAdminApi: false
            }
    }

    if (chosenApi == "eSignature") {
        apiChoice.examplesApi.isESignatureApi = true;
        let data = JSON.stringify(apiChoice);
        fs.writeFile ("config/examplesApi.json", data, function(err) {
            if (err) throw err;
            console.log('complete');
            }
        );
      }
    else if (chosenApi == "rooms") {
        apiChoice.examplesApi.isRoomsApi = true;
        let data = JSON.stringify(apiChoice);
        fs.writeFile ("config/examplesApi.json", data, function(err) {
            if (err) throw err;
            console.log('complete');
            }
        ); 
      }
    else if (chosenApi == "click") {
        apiChoice.examplesApi.isClickApi = true;
        let data = JSON.stringify(apiChoice);
        fs.writeFile ("config/examplesApi.json", data, function(err) {
            if (err) throw err;
            console.log('complete');
            }
        );
      }
    else if (chosenApi == "monitor") {
        apiChoice.examplesApi.isMonitorApi = true;
        let data = JSON.stringify(apiChoice);
        fs.writeFile ("config/examplesApi.json", data, function(err) {
            if (err) throw err;
            console.log('complete');
            }
        );
      }
    else if (chosenApi == "admin") {
        apiChoice.examplesApi.isAdminApi = true;
        let data = JSON.stringify(apiChoice);
        fs.writeFile ("config/examplesApi.json", data, function(err) {
            if (err) throw err;
            console.log('complete');
            }
        );
      }

    res.render('pages/restart', {title: "Restart the app"});
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
    dsConfig.quickstart = 'false';
    req.dsAuth.logout(req, res)
}

commonControllers.logoutCallback = (req, res) => {
    req.dsAuth.logoutCallback(req, res)
}

/**
 * Display parameters after DS redirect to the application
 * after an embedded signing, etc
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

