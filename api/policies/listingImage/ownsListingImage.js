var util = require('util');

module.exports = function (req, res, next) {

    var listingImageId = req.param('id');
    if (listingImageId === undefined) {
        return res.badRequest('Missing GET identifier parameter.');
    }

    ListingImage.findOne(listingImageId)
        .populate('listing')
        .then(function (listingImage) {
            if (listingImage === undefined) {
                res.badRequest('Image not found.');
                return;
            }

            if (listingImage.listing.owner === req.user.id) {
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
