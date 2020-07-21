var Promise = require('bluebird');

module.exports = {

    index: function (req, res) {

        var userCount;
        var users;
        var listingCount;
        var listings;
        var reservationCount;
        var reservations;

        Promise.resolve()
            .then(function () {
                return new Promise(function(resolve) {
                    User.count(function (err, result) {
                            userCount = result;
                            return resolve();
                        });
                });
            })
            .then(function () {
                return new Promise(function(resolve) {
                    User.find()
                        .sort('createdAt DESC')
                        .limit(20)
                        .then(function (result) {
                            users = result;
                            return resolve();
                        });
                });
            })
            .then(function () {
                return new Promise(function(resolve) {
                    Listing.count(function (err, result) {
                        listingCount = result;
                        return resolve();
                    });
                });
            })
            .then(function () {
                return new Promise(function(resolve) {
                    Listing.find()
                        .populate('owner')
                        .sort('createdAt DESC')
                        .limit(20)
                        .then(function (result) {
                            listings = result;
                            return resolve();
                        });
                });
            })
            .then(function () {
                return new Promise(function(resolve) {
                    Reservation.count(function (err, result) {
                        reservationCount = result;
                        return resolve();
                    });
                });
            })
            .then(function () {
                return new Promise(function(resolve) {
                    Reservation.find()
                        .populate('requester')
                        .sort('createdAt DESC')
                        .limit(20)
                        .then(function (result) {
                            reservations = result;
                            return resolve();
                        });
                });
            })
            .then(function() {
                res.view('dashboard', {
                    userCount: userCount,
                    users: users,
                    listingCount: listingCount,
                    listings: listings,
                    reservationCount: reservationCount,
                    reservations: reservations
                });
            });
    }
};
