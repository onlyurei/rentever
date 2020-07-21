var util = require('util');

module.exports = function (req, res, next) {
    var reservationId = req.param('reservation');
    if (reservationId === undefined) {
        return res.badRequest('Missing GET identifier parameter.');
    }

    Review.find({
        reviewer: req.user.id,
        reservation: reservationId
    })
        .then(function (reviews) {
            if(reviews.length > 0) {
                return res.forbidden('Not authorized.');
            }
            return next();
        })
        .catch(function (err) {
            util.error(err, err.stack);
            return res.serverError(err);
        });
};
