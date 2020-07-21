var passport = require('passport');

module.exports = function (req, res, next) {
    if (req.isSocket) {
        if (req.session && req.session.passport && req.session.passport.user) {
            passport.initialize()(req, res, function () {
                passport.session()(req, res, function () {
                    next();
                });
            });
        }
        else {
            return res.forbidden('Not Authorized');
        }
    } else if (req.isAuthenticated()) {
        next();
    } else {
        return res.forbidden('Not Authorized');
    }
};
