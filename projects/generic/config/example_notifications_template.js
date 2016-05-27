/**
 * Products
 * @module      :: Controller
 * @description :: List of available preset products
 */

var MiaJs = require('mia-js-core')
    , Logger = MiaJs.Logger
    , Shared = MiaJs.Shared
    , fs = require("fs")
    , _ = require('lodash');

function thisModule() {

    var self = this;
    self.disabled = false; // Enable /disable controller
    self.identity = 'generic-example-notification-templates'; // Unique controller id used in routes, policies and followups
    self.version = '1.0'; // Version number of service
    self.created = '2015-01-17T11:00:00'; // Creation date of controller
    self.modified = '2015-01-17T11:00:00'; // Last modified date of controller
    self.group = 'example'; // Group this service to a origin

    self.notifications = {
        defaultLanguage: "en",
        connectors: {
            smtp: {
                local: {
                    user: "",
                    password: "",
                    host: ""
                }
            },
            apns: {
                local: {
                    production: false,
                    cert: new Buffer("certString", "utf-8"), // Cert file as buffer
                    key: new Buffer("keyFile", "utf-8"),// Key file as buffer
                    passphrase: ""
                }
            }
        },
        templates: {
            en: { // Language prefix for templates
                resetPassword: {
                    push: {
                        apns: {
                            alert: {
                                title: "Passwort zurücksetzen",
                                body: "Hallo [NAME], so kannst du dein Passwort zurücksetzen"
                            },
                            badge: 1,
                            sound: "default",
                            "content-available": 1
                        },
                        android: {
                            tbd: "tbd"
                        }
                    },
                    mail: {
                        smtp: {
                            sender: "noreply@example.com",
                            subject: "Passwort zurücksetzen",
                            html: "HTML Mail with [NAME] replacements",
                            text: "Dies ist eine HTML Email. Bitte aktivieren Sie HTML um den Inhalt anzuzeigen!"
                        }
                    }
                }
            }
        }
    };

    return self;
};

module.exports = new thisModule();
