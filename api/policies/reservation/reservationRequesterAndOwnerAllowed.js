var util = require('util');

module.exports = function (req, res, next) {
    var id = req.param('reservationId') || req.param('id');
    if (id === undefined) {
        return res.badRequest('Missing parameter.');
    }
    Reservation.findOne(id)
        .then(function (reservation) {
            if (reservation.requester === req.user.id) {
                return next();
            } else {
                Listing.findOne(reservation.listing)
                    .then(function (listing) {
                        if (listing && (listing.owner == req.user.id)) {
                            return next();
                        } else {
                            return res.forbidden('Not authorized.');
                        }
                    })
                    .catch(function (err) {
                        util.error(err, err.stack);
                        return res.serverError(err);
                    });
            }
        })
        .catch(function (err) {
            util.error(err, err.stack);
            return res.serverError(err);
        });
};
