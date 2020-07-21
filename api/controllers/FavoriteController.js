var util = require('util');
var actionUtil = require('../../node_modules/sails/lib/hooks/blueprints/actionUtil');

function modifyFavorites(req, res, functionName) {
    var listingId = req.param('id');

    User.findOne()
        .where({ id: req.user.id })
        .then(function (user) {
            user.favorites[functionName](listingId);
            user.save(function (err) {
                if (err) {
                    util.error(err, err.stack);
                    return res.serverError(err);
                }
                return res.send();
            });
        })
        .catch(function (err) {
            util.error(err, err.stack);
            res.serverError(err);
        });
}


module.exports = {

    list: function (req, res) {
        User.findOne()
            .where({ id: req.user.id })
            .populate('favorites')
            .then(function (user) {
                var ids = user.favorites.map(function (item) {
                    return item.id;
                });
                Listing.find()
                    .where({ id: ids })
                    .sort(actionUtil.parseSort(req) || 'updatedAt desc')
                    .populate('images')
                    .then(function (listings) {
                        res.send(listings);
                    })
                    .catch(function (err) {
                        util.error(err, err.stack);
                        res.serverError(err);
                    });

            })
            .catch(function (err) {
                util.error(err, err.stack);
                res.serverError(err);
            });
    },

    create: function (req, res) {
        modifyFavorites(req, res, 'add');
    },

    remove: function (req, res) {
        modifyFavorites(req, res, 'remove');
    }
};
