/**
 * ReviewController
 *
 * @description :: Server-side logic for managing threads
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
var Promise = require('bluebird');

module.exports = {

    getAverageForListing: function (req, res) {
        var validationResult = ValidationService.validate(req, [
            { field: 'listingId', checks: ['required'] }
        ]);
        if (validationResult.success === false) {
            return res.badRequest(validationResult.messages);
        }

        Promise.join(
            Listing.findOne(req.param('listingId')),
            Reservation.find({ listing: req.param('listingId') }).populate('reviews'),
            function (listing, reservations) {
                var averageScore = 0;
                var count = 0;
                reservations.forEach(function (reservation) {
                    reservation.reviews.forEach(function (review) {
                        if (review.reviewer != listing.owner) {
                            count += 1;
                            averageScore += review.rating;
                        }
                    });
                });
                averageScore = (count !== 0) ? (averageScore / count) : 0;

                return res.send({
                    averageScore: averageScore,
                    count: count
                });
            }
        );
    },
    getAverageForUser: function (req, res) {
        var validationResult = ValidationService.validate(req, [
            { field: 'userId', checks: ['required'] }
        ]);
        if (validationResult.success === false) {
            return res.badRequest(validationResult.messages);
        }

        Review.find({ reviewed: req.param('userId') })
            .then(function (reviews) {
                var averageScore = 0;
                var count = 0;
                reviews.forEach(function (review) {
                    count += 1;
                    averageScore += review.rating;
                });
                averageScore = (count !== 0) ? (averageScore / count) : 0;

                return res.send({
                    averageScore: averageScore,
                    count: count
                });
            });
    }
};

