/**
 * ListingImageController
 *
 * @description :: Server-side logic for managing Listingimages
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var util = require('util');

module.exports = {
    saveSequence: function (req, res) {

        var imageIds = req.param('imageIds');
        if (imageIds === undefined) {
            res.badRequest('Missing param: imageIds.');
            return;
        }

        var indexes = _.range(0, imageIds.length);

        async.forEach(indexes, function (index, callback) {
            ListingImage.update({id: imageIds[index]}, {sequence: index}).exec(function (err) {
                if (err) {
                    callback(err);
                }
                callback();
            });
        }, function (err) {
            if (err) {
                util.error(err, err.stack);
                res.serverError(err);
                return;
            }
            res.send();
        });
    }
};

