var util = require('util');

module.exports = function (req, res, next) {

    var userId = req.param('id');
    if (userId === undefined) {
        return res.badRequest('Missing GET identifier parameter.');
    }
    if (userId != req.user.id) {
        return res.forbidden('Not authorized.');
    }
    if (req.body && req.body.username && (req.body.username != req.user.username)) {
        return res.forbidden('Not authorized.');
    }

    User.findOne(userId)
        .then(function (user) {
            if (user === undefined) {
                res.badRequest('User not found.');
                return;
            }
            if (user.id === req.user.id) {
                next();
            } else {
                return res.forbidden('Not authorized.');
            }
        })
        .catch(function (err) {
            util.error(err, err.stack);
            return res.serverError(err);
        });
};
