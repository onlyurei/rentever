/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes map URLs to views and controllers.
 *
 * If Sails receives a URL that doesn't match any of the routes below,
 * it will check for matching files (images, scripts, stylesheets, etc.)
 * in your assets directory.  e.g. `http://localhost:1337/images/foo.jpg`
 * might match an image file: `/assets/images/foo.jpg`
 *
 * Finally, if those don't match either, the default 404 handler is triggered.
 * See `config/404.js` to adjust your app's 404 logic.
 *
 * Note: Sails doesn't ACTUALLY serve stuff from `assets`-- the default Gruntfile in Sails copies
 * flat files from `assets` to `.tmp/public`.  This allows you to do things like compile LESS or
 * CoffeeScript for the front-end.
 *
 * For more information on routes, check out:
 * http://links.sailsjs.org/docs/config/routes
 */

module.exports.routes = {

    //Auth
    'POST /api/auth/login': 'AuthController.login',
    'POST /api/auth/logout': 'AuthController.logout',
    'GET /api/auth/facebookLogin': 'AuthController.facebookLogin',
    'GET /api/auth/facebookCallback': 'AuthController.facebookCallback',

    //Config
    'GET /api/config': 'ConfigController.get',

    //Db
    'GET /api/db/populate': 'DbController.populate',

    //Geo
    'GET /api/geo/normalizeAddress': 'GeoController.normalizeAddress',

    //Listing
    'GET /api/listing/search': 'ListingController.search',
    'GET /api/listing/getCategories': 'ListingController.getCategories',
    'POST /api/listing/uploadImage/:id': 'ListingController.uploadImage',

    //ListingImage
    'PUT /api/listingImage/saveSequence': 'ListingImageController.saveSequence',

    //Favorite
    'GET /api/favorite': 'FavoriteController.list',
    'POST /api/favorite/:id': 'FavoriteController.create',
    'DELETE /api/favorite/:id': 'FavoriteController.remove',

    //Log
    'POST /api/log/log': 'LogController.log',

    //Reservation
    'GET /api/reservation/getAvailabilityForDatetimeRange': 'ReservationController.getAvailabilityForDatetimeRange',
    'GET /api/reservation/getReservedDatesForPublicCalendar': 'ReservationController.getReservedDatesForPublicCalendar',
    'POST /api/reservation/reserveForDatetimeRange': 'ReservationController.reserveForDatetimeRange',
    'PUT /api/reservation/markAsCancelled': 'ReservationController.markAsCancelled',
    'PUT /api/reservation/markAsDeclined': 'ReservationController.markAsDeclined',
    'PUT /api/reservation/markAsAccepted': 'ReservationController.markAsAccepted',
    'PUT /api/reservation/markAsPickedUp': 'ReservationController.markAsPickedUp',
    'PUT /api/reservation/markAsReturned': 'ReservationController.markAsReturned',
    'GET /api/reservation/getPickupCode': 'ReservationController.getPickupCode',
    'GET /api/reservation/getReturnCode': 'ReservationController.getReturnCode',
    'GET /api/reservation/getEstimatedPrice': 'ReservationController.getEstimatedPrice',
    'GET /api/reservation/getConflictingReservations': 'ReservationController.getConflictingReservations',
    'GET /api/reservation/generateContract': 'ReservationController.generateContract',
    'GET /api/reservation/downloadContractPdf': 'ReservationController.downloadContractPdf',

    //Review
    'GET /api/review/getAverageForListing': 'ReviewController.getAverageForListing',
    'GET /api/review/getAverageForUser': 'ReviewController.getAverageForUser',

    //User
    'GET /api/user/findOneDetailed/:id': 'UserController.findOneDetailed',
    'GET /api/user/findOnePublicProfile/:id': 'UserController.findOnePublicProfile',
    'PUT /api/user/sendVerificationEmail': 'UserController.sendVerificationEmail',
    'POST /api/user/uploadProfilePicture/:id': 'UserController.uploadProfilePicture',
    'DELETE /api/user/deleteProfilePicture/:id': 'UserController.deleteProfilePicture',
    'GET /api/user/verifyEmail/:token': 'UserController.verifyEmail',
    'PUT /api/user/sendResetPasswordEmail': 'UserController.sendResetPasswordEmail',
    'GET /api/user/verifyPasswordResetToken/:token': 'UserController.verifyPasswordResetToken',
    'PUT /api/user/resetPassword': 'UserController.resetPassword',

    //Dashboard
    'GET /dashboard': 'DashboardController.index'

    // If a request to a URL doesn't match any of the custom routes above,
    // it is matched against Sails route blueprints.  See `config/blueprints.js`
    // for configuration options and examples.

};
