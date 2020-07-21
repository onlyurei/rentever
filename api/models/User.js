var bcrypt = require('bcrypt');
var Promise = require('bluebird');
var util = require('util');
var uuid = require('node-uuid');

function sendEmailVerification(user) {
    var emailSettings = EmailHelper.emailVerification(user.emailToken, user.username);
    EmailService.sendEmail(user.email, emailSettings.context.title, emailSettings.template, emailSettings.context)
        .catch(function (err) {
            util.error(err, err.stack);
        });
}

module.exports = {
    attributes: {
        facebookId: {
            type: 'string'
        },
        firstName: {
            type: 'string',
            maxLength: 50,
            required: true
        },
        lastName: {
            type: 'string',
            maxLength: 50,
            required: true
        },
        email: {
            type: 'email',
            required: true,
            unique: true,
            maxLength: 200
        },
        username: {
            type: 'string',
            required: true,
            unique: true,
            maxLength: 50,
            minLength: 3
        },
        password: {
            type: 'string',
            required: true,
            maxLength: 100,
            minLength: 3
        },
        listings: {
            collection: 'Listing',
            via: 'owner'
        },
        favorites: {
            collection: 'Listing',
            via: 'favorers'
        },
        address: {
            type: 'json'
        },
        location: {
            type: 'json'
        },
        displayedAddress: {
            type: 'string',
            maxLength: 300
        },
        emailToken: {
            type: 'string'
        },
        profilePictureUrl: {
            type: 'string'
        },
        passwordResetToken: {
            type: 'string'
        },

        getDisplayName: function () {
            return this.firstName + ' ' + this.lastName;
        },

        getShortDisplayName: function () {
            return this.firstName + ' ' + this.lastName[0] + '.';
        },

        toJSON: function () {
            var safeAttributes = ['id', 'email', 'firstName', 'lastName', 'username', 'profilePictureUrl'];
            return _.pick(this.toObject(), safeAttributes);
        },

        toJSONFull: function () {
            var unsafeAttributes = ['password', 'emailToken'];
            var object = this.toObject();
            object.emailVerified = !object.emailToken;
            unsafeAttributes.forEach(function (attribute) {
                delete object[attribute];
            });
            return object;
        },

        toJSONPublicProfile: function () {
            var safeAttributes = ['firstName', 'lastName', 'profilePictureUrl', 'address'];
            var object = _.pick(this.toObject(), safeAttributes);
            object.address = _.pick(object.address, ['city', 'state', 'country']);
            return object;
        },

        isPasswordValid: function (password) {
            var modelContext = this;
            return new Promise(function (resolve, reject) {
                bcrypt.compare(password, modelContext.password, function (err, res) {
                    if (err) {
                        return reject(err);
                    }
                    return resolve(res);
                });
            });

        }
    },

    beforeCreate: function (user, callback) {
        user.emailToken = uuid.v4();
        UserHelper.encryptUserPasswordIfNotEmpty(user, callback, callback);
    },

    afterCreate: function (user, callback) {
        sendEmailVerification(user);
        // TODO: remove it at some point
        EmailService.sendSimpleEmail('rentever.com@gmail.com', 'Hoorah! New User', JSON.stringify(user));
        callback();
    },

    beforeUpdate: function (user, callback) {
        if (user.email) {
            if (!user.id) {
                //because Waterline doesn't include model id in the beforeUpdate callback, sucks
                callback('Must include User id in the update request.');
            } else {
                User.findOne(user.id)
                    .then(function (_user) {
                        if (user.email != _user.email) {
                            user.emailToken = uuid.v4();
                            sendEmailVerification(_user);
                        }
                        callback();
                    })
                    .catch(callback);
            }
        } else {
            callback();
        }
    },

    beforeValidate: function (user, callback) {
        if (user.displayedAddress) {
            GeoService.guessAddress(user.displayedAddress)
                .then(function (response) {
                    user.address = response;
                    user.location = {
                        type: 'Point',
                        coordinates: [user.address.longitude, user.address.latitude]
                    };
                    callback();
                })
                .catch(callback);
        } else {
            callback();
        }
    }

};
