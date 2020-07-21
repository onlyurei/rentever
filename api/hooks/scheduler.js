/**
 * scheduler hook
 * CAREFUL: don't run multiple instances of Sails with this hook enabled
 * When number of instances exceeds one, trigger needs to happen from a single location
 */

var ReservationController = require('../controllers/ReservationController');

module.exports = function (sails) {
    /**
     * Module dependencies.
     */
    var schedule = require('node-schedule');

    /**
     * Expose hook definition
     */
    return {
        // Run when sails loads-- be sure and call `next()`.
        initialize: function (next) {
            if (sails.config.appconfs.isTest) {
                console.log('Skipping scheduler hook initialization');
                return next();
            }

            sails.after('hook:orm:loaded', function () {
                schedule.scheduleJob('*/5 * * * *', function () {
                    ReservationController.expireReservations()
                        .then(function (itemsAffected) {
                            if (itemsAffected > 0) {
                                console.log('CRONJOB: DbService.expireReservations(), # of items affected : ' + itemsAffected);
                            }
                        });
                });
            });
            return next();
        }
    };
};
