var passport = require('passport'),
    randomstring = require('randomstring'),
    LocalStrategy = require('passport-local').Strategy,
    FacebookStrategy = require('passport-facebook').Strategy;

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    User.findOne(id)
        .then(function (user) {
            done(null, user || null);
        })
        .catch(function (err) {
            done(err, null);
        });
});

passport.use(new LocalStrategy(
    function (usernameOrEmail, password, callback) {
        User.findOne({
            or: [
                { username: usernameOrEmail },
                {
                    email: usernameOrEmail,
                    emailToken: ''
                }
            ]
        }, function (err, user) {
            if (err) {
                console.error(err, err.stack);
                return callback(err);
            }
            if (!user) {
                return callback(null, false, { message: 'Incorrect username.' });
            }

            user.isPasswordValid(password)
                .then(function (result) {
                    if (result === true) {
                        return callback(null, user);
                    } else {
                        return callback(null, false, { message: 'Incorrect password.' });
                    }
                })
                .catch(function (err) {
                    console.error(err, err.stack);
                    return callback(null, false, { message: 'Incorrect password.' });
                });
        });
    }
));

passport.use(new FacebookStrategy(require('./credentials/credentials.js').private.facebook, function (token, tokenSecret, profile, done) {

    var errMessage;
    var loggedInUser;
    async.waterfall([
        function (callback) {
            User.findOne()
                .where({ facebookId: profile.id })
                .then(function (user) {
                    callback(null, user);
                })
                .catch(function (err) {
                    errMessage = 'Error logging user in with Facebook';
                    callback(err);
                });
        },
        function (user, callback) {
            if (user) {
                loggedInUser = user;
                callback(null, false);
            } else {
                var data = {
                    facebookId: profile.id,
                    username: 'facebook-' + profile.id,
                    password: randomstring.generate(10)
                };
                if (profile.emails && profile.emails[0] && profile.emails[0].value) {
                    data.email = profile.emails[0].value;
                }
                if (profile.name && profile.name.givenName) {
                    data.firstName = profile.name.givenName;
                }
                if (profile.name && profile.name.familyName) {
                    data.lastName = profile.name.familyName;
                }
                User.create(data)
                    .then(function (user) {
                        loggedInUser = user;
                        callback(null, true);
                    })
                    .catch(function (err) {
                        errMessage = 'Error creating Facebook profile';
                        callback(err);
                    });
            }
        },
        function (isNewlyRegisteredUser, callback) {
            if (isNewlyRegisteredUser) {
                ImageService.uploadExternalFacebookProfilePicture(loggedInUser.facebookId)
                    .then(function (s3photoFilename) {
                        User
                            .update(loggedInUser.id, { profilePictureUrl: sails.config.appconfs.s3Prefix + s3photoFilename})
                            .exec(function (err) {
                                if (err) {
                                    errMessage = 'Error trying to update newly registered user\'s facebook picture property';
                                    callback(err);
                                }
                                callback();
                            });
                    })
                    .catch(function (err) {
                        errMessage = 'Error trying to upload facebook user\'s picture';
                        callback(err);
                    });
            } else {
                callback();
            }
        }
    ], function (err) {
        if(err) {
            done(err, null, { message: errMessage });
        } else {
            done(null, loggedInUser, { message: 'Logged In Successfully' });
        }
    });
}));
