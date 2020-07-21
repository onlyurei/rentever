var util = require('util');

module.exports = function (req, res, next) {
    var reservationId = req.param('reservationId');
    if (reservationId === undefined) {
        return res.badRequest('Missing parameter.');
    }
    Reservation.findOne(reservationId)
        .populate('listing')
        .then(function (reservation) {
            if (reservation.listing.owner === req.user.id) {
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
