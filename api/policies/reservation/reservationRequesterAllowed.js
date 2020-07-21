var util = require('util');

module.exports = function (req, res, next) {
    var id = req.param('id');
    if (id === undefined) {
        return res.badRequest('Missing parameter.');
    }
    Reservation.findOne(id)
        .then(function (reservation) {
            if (reservation.requester === req.user.id) {
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
