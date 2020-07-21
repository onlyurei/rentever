var passport = require('passport');

module.exports = {
    login: function (req, res, next) {
        passport.authenticate('local', function (err, user) {
            if (err || !user) {
                if (req.wantsJSON) {
                    return res.forbidden('Invalid username/password combination.');
                } else {
                    return res.redirect('/login');
                }
            }
            req.logIn(user, function (err) {
                if (err) {
                    if (req.wantsJSON) {
                        return res.forbidden('Login error.');
                    } else {
                        return res.redirect('/login');
                    }
                }
                if (req.wantsJSON) {
                    return res.send();
                } else {
                    return res.redirect('/');
                }
            });
        })(req, res, next);
    },

    facebookLogin: function (req, res) {
        // triggers facebook page, handles any possible errors, does NOT actually authenticate
        passport.authenticate('facebook', { scope: ['email', 'public_profile']}, function (err, user) {
            if (err || !user) {
                res.forbidden('Invalid username/password combination.');
            }
            res.redirect('/login');

        })(req, res);
    },

    facebookCallback: function(req, res) {
        passport.authenticate('facebook', { scope: ['email', 'public_profile']}, function (err, user) {
            if (err || !user) {
                return res.forbidden('Invalid username/password combination.');
            }
            req.logIn(user, function (err) {
                if (err) {
                    res.redirect('/login');
                }
                res.redirect('/');
            });

        })(req, res);
    },

    logout: function (req, res) {
        req.logout();
        if (req.wantsJSON) {
            res.send();
        } else {
            res.redirect('/logout');
        }
    },

    _config: {}
};
