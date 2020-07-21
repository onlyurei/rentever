var AWS = require('aws-sdk');
var Promise = require('bluebird');
var path = require('path');
var util = require('util');
var emailTemplates = require('email-templates');

AWS.config.loadFromPath('config/credentials/aws/credentials.json');
var ses = new AWS.SES();

var mailAdmin = 'info@rentever.com';
var fromEmail = 'RentEver <info@rentever.com>';
var replyToEmail = 'RentEver <contact@rentever.com>';
var emailTemplatesDir = path.resolve(__dirname, '../../', 'views/emails');

function prepareParams(from, to, subject, html, text) {
    var params = {
        Destination: { /* required */
            BccAddresses: [],
            CcAddresses: [],
            ToAddresses: [to]
        },
        Message: { /* required */
            Body: { /* required */
                Html: {
                    Data: html, /* required */
                    Charset: 'utf-8'
                }
            },
            Subject: { /* required */
                Data: subject, /* required */
                Charset: 'utf-8'
            }
        },
        Source: from, /* required */
        ReplyToAddresses: [replyToEmail],
        ReturnPath: mailAdmin
    };
    if (text) {
        params.Message.Body.Text = {
            Data: text, /* required */
            Charset: 'utf-8'
        };
    }
    return params;
}

module.exports = {

    sendEmailAsync: function (to, title, template, context) {
        module.exports.sendEmail(to, title, template, context)
            .catch(function (err) {
                util.error(err, err.stack);
            });
    },

    sendEmail: function (to, title, template, context) {
        return new Promise(function (resolve, reject) {
            if(sails.config.appconfs.isTest) {
                // util.log('pretending to be sending an email...');
                return resolve();
            } else {
                emailTemplates(emailTemplatesDir, function (err, _template) {
                    if (err) {
                        return reject(err);
                    }
                    _template(template, context, function (err, html, text) {
                        if (err) {
                            return reject(err);
                        }
                        var params = prepareParams(fromEmail, to, title, html, text);
                        ses.sendEmail(params, function (err) {
                            if (err) {
                                return reject(err);
                            } else {
                                return resolve();
                            }
                        });
                    });
                });
            }
        });
    },

    sendSimpleEmail: function (to, title, body) {
        return new Promise(function (resolve, reject) {
            if(sails.config.appconfs.isTest) {
                // util.log('pretending to be sending an email...');
                return resolve();
            } else {
                var params = prepareParams(fromEmail, to, title, body);
                ses.sendEmail(params, function (err) {
                    if (err) {
                        return reject(err);
                    } else {
                        return resolve();
                    }
                });
            }
        });
    }
};
