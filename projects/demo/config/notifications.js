/*
 Mia.js supports notifications like email and push. To use notifications manager you have to define notifications settings and templates for notifications
 */

function thisModule() {
    var self = this;
    self.disabled = false; // Enable /disable controller
    self.identity = 'notification-templates'; // Unique controller id used in routes, policies and followups
    self.version = '1.0'; // Version number of service
    self.created = '2015-07-17T11:00:00'; // Creation date of controller
    self.modified = '2015-07-17T11:00:00'; // Last modified date of controller
    self.group = 'demo'; // Group this service to a origin

    self.notifications = {
        connectors: {
            smtp: {
                production: {
                    user: "my@domain.com",
                    password: "your password",
                    host: "mail.domain.com"
                }
            },
            apns: {
                production: {
                    production: true,
                    cert: new Buffer("your cert string"),
                    key: new Buffer("your key string"),
                    passphrase: "your password"
                },
                sandbox: {
                    production: false,
                    cert: new Buffer("your cert string"),
                    key: new Buffer("your key string"),
                    passphrase: "your password"
                }
            }
        },
        templates: {
            resetPassword: { // Template name
                push: { // Template type
                    apns: {
                        alert: {
                            title: "Reset password",
                            body: "Hi [NAME], you requested a password reset"
                        },
                        badge: 1,
                        sound: "default",
                        "content-available": 1
                    },
                    android: {
                        //Not implemented so far but will be soon
                    }
                },
                mail: { // Template type
                    smtp: { // SMTP settings to take has to match with connectors.smtp
                        sender: "My Project <noreply@myproject.com>",
                        subject: "Reset password",
                        html: "<html><body><h1>Hi [NAME][LASTNAME], you requested a password reset</h1></body>",
                        text: "Hi [NAME], you requested a password reset"
                    }
                }
            },
            welcome: { // Template name
                mail: { // Template type
                    smtp: { // SMTP settings to take has to match with connectors.smtp
                        sender: "My Project <noreply@myproject.com>",
                        subject: "Welcome to my project",
                        html: "<html><body><b>Hi [Name][LASTNAME]</b>, we are so happy that you joined our project</body></html>",
                        text: "Hi [Name] we are so happy that you joined our project"
                    }
                }
            }
        }
    };
    return self;
}

module.exports = new thisModule();