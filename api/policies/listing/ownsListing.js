var util = require('util');

module.exports = function (req, res, next) {

    var listingId = req.param('id');
    if (listingId === undefined) {
        return res.badRequest('Missing GET identifier parameter.');
    }

    Listing.findOne(listingId)
        .then(function (listing) {
            if (listing === undefined) {
                res.badRequest('Listing not found.');
                return;
            }

            if (listing.owner === req.user.id) {
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
