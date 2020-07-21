var util = require('util');

module.exports = function (req, res, next) {
    var reservationId = req.param('reservation');
    if (reservationId === undefined) {
        return res.badRequest('Missing GET identifier parameter.');
    }

    if (req.user.id !== req.param('reviewer')) {
        return res.forbidden('Not authorized.');
    }

    if (req.param('reviewed') === req.param('reviewer')) {
        return res.forbidden('Not authorized.');
    }

    Reservation.findOne(reservationId)
        .populate('listing')
        .then(function (reservation) {
            if ((reservation.status == 'returned') && (((req.user.id === reservation.listing.owner) && (req.param('reviewed') === reservation.requester)) ||
                ((req.user.id === reservation.requester) && (req.param('reviewed') === reservation.listing.owner)))) {
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
