/**
 * UserController
 * @module      :: Controller
 */

var util = require('util');
var uuid = require('node-uuid');

function SerializerResult(result) {
    this.result = result;
}

SerializerResult.prototype.toJSON = function () {
    return this.result;
};

var UserSerializer = {};

UserSerializer.serialize = function (userModel) {
    var result = userModel.toJSONFull();
    return new SerializerResult(result);
};

UserSerializer.serializePublicProfile = function (userModel) {
    var result = userModel.toJSONPublicProfile();
    return new SerializerResult(result);
};

module.exports = {

    findOneDetailed: function (req, res) {
        User.findOne(req.param('id'))
            .then(function (user) {
                res.send(UserSerializer.serialize(user));
            })
            .catch(function (err) {
                util.error(err, err.stack);
                res.serverError(err);
            });
    },

    findOnePublicProfile: function (req, res) {
        User.findOne(req.param('id'))
            .then(function (user) {
                res.send(UserSerializer.serializePublicProfile(user));
            })
            .catch(function (err) {
                util.error(err, err.stack);
                res.serverError(err);
            });
    },

    sendVerificationEmail: function (req, res) {
        User.findOne(req.param('id'))
            .then(function (user) {
                var emailSettings = EmailHelper.emailVerification(user.emailToken, user.username);
                EmailService.sendEmail(user.email, emailSettings.context.title, emailSettings.template, emailSettings.context)
                    .then(function () {
                        return res.send();
                    })
                    .catch(function (err) {
                        util.error(err, err.stack);
                        return res.serverError(err);
                    });
            })
            .catch(function (err) {
                util.error(err, err.stack);
                res.serverError(err);
            });
    },

    verifyEmail: function (req, res) {
        User.findOne({ id: req.user.id, emailToken: req.param('token') })
            .then(function (user) {
                if (!user) {
                    res.badRequest('Invalid token.');
                    return;
                }
                User.update({ emailToken: req.param('token') }, { emailToken: '' })
                    .exec(function (err) {
                        if (err) {
                            util.error(err, err.stack);
                            res.serverError(err);
                            return;
                        }
                        res.send();
                    });
            });
    },

    sendResetPasswordEmail: function (req, res) {
        var validationResult = ValidationService.validate(req, [
            { field: 'email', checks: ['required'] }
        ]);
        if (validationResult.success === false) {
            return res.badRequest(validationResult.messages);
        }

        User.find({ email: req.param('email') })
            .then(function (users) {
                if (!users.length) {
                    return res.badRequest();
                }
                User.update(users[0].id, { passwordResetToken: uuid.v4() })
                    .then(function (users) {
                        var emailSettings = EmailHelper.sendResetPasswordEmail(users[0].passwordResetToken, users[0].username);
                        EmailService.sendEmail(users[0].email, emailSettings.context.title, emailSettings.template, emailSettings.context)
                            .then(function () {
                                return res.send();
                            })
                            .catch(function (err) {
                                util.error(err, err.stack);
                                return res.serverError(err);
                            });
                    });
            });
    },

    verifyPasswordResetToken: function (req, res) {
        User.find({ passwordResetToken: req.param('token') })
            .then(function (users) {
                if (!users.length) {
                    return res.badRequest();
                }
                return res.send(users[0].email);
            });
    },

    resetPassword: function (req, res) {
        var validationResult = ValidationService.validate(req, [
            { field: 'token', checks: ['required'] },
            { field: 'password', checks: ['required'] }
        ]);
        if (validationResult.success === false) {
            return res.badRequest(validationResult.messages);
        }

        User.find({ passwordResetToken: req.param('token') })
            .then(function (users) {
                if (!users.length) {
                    return res.badRequest();
                }
                UserHelper.encryptPassword(req.param('password'))
                    .then(function (hashedPassword) {
                        return User.update(users[0].id, {
                            passwordResetToken: null,
                            password: hashedPassword
                        });
                    })
                    .then(function () {
                        return res.send();
                    });
            });
    },

    uploadProfilePicture: function (req, res) {
        async.waterfall([
            function (callback) {
                // remove existing photo, if any
                User.findOne(req.user.id)
                    .then(function (user) {
                        if (user.profilePictureUrl) {
                            ImageService.deleteImages([user.profilePictureUrl])
                                .then(function () {
                                    callback();
                                });
                        } else {
                            callback();
                        }
                    })
                    .catch(function (err) {
                        callback(err, null);
                    });
            },
            function (callback) {
                ImageService.validateResizeAndUpload(req, 'png', [{ size: 400 }] )
                    .then(function (s3FileNames) {
                        callback(null, s3FileNames[0]);
                    })
                    .catch(function (err) {
                        if (err) {
                            callback(err, null);
                        }
                    });
            },
            function (filename, callback) {
                User.update(
                    { id: req.user.id },
                    { profilePictureUrl: sails.config.appconfs.s3Prefix + filename })
                    .exec(function (err) {
                        if (err) {
                            callback(err, null);
                        }
                        callback(null, true);
                    });
            }
        ], function (err, result) {
            if (err) {
                util.error(err, err.stack);
                return res.serverError(err);
            }
            return res.send(result);
        });
    },

    deleteProfilePicture: function (req, res) {
        User.findOne(req.user.id)
            .then(function (user) {
                if (user.profilePictureUrl) {
                    User.update(
                        { id: req.user.id },
                        { profilePictureUrl: '' })
                        .exec(function (err) {
                            if (err) {
                                res.error(err, null);
                            }
                            ImageService.deleteImages([user.profilePictureUrl])
                                .then(function () {
                                    return res.send();
                                });
                        });
                } else {
                    return res.send();
                }
            })
            .catch(function (err) {
                util.error(err, err.stack);
                return res.serverError(err);
            });
    },

    _config: {}

};
