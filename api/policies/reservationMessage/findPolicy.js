var util = require('util');
var actionUtil = require('../../../node_modules/sails/lib/hooks/blueprints/actionUtil');

module.exports = function (req, res, next) {
    var reservationId = req.param('reservation') || actionUtil.parseCriteria(req).reservation;
    if (reservationId === undefined) {
        return res.badRequest('Missing parameter.');
    }
    Reservation.findOne(reservationId)
        .populate('listing')
        .then(function (reservation) {
            if (reservation.requester === req.user.id ||
                reservation.listing.owner === req.user.id) {
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
