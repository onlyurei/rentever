/**
 * Policy Mappings
 * (sails.config.policies)
 *
 * Policies are simple functions which run **before** your controllers.
 * You can apply one or more policies to a given controller, or protect
 * its actions individually.
 *
 * Any policy file (e.g. `api/policies/authenticated.js`) can be accessed
 * below by its filename, minus the extension, (e.g. "authenticated")
 *
 * For more information on configuring policies, check out:
 * http://sailsjs.org/#!documentation/
 */


module.exports.policies = {

    // Default policy for all controllers and actions
    // (`true` allows public access)
    //    '*': true,

    '*': 'authenticated',

    AuthController: {
        '*': true
    },

    ConfigController: {
        get: true
    },

    DbController: {
        populate: false
    },

    FavoriteController: {
        create: ['authenticated'],
        remove: ['authenticated'],
        list: ['authenticated']
    },

    GeoController: {
        normalizeAddress: true
    },

    ListingController: {
        find: true,
        findOne: true,
        create: ['authenticated'],
        destroy: ['authenticated', 'listing/ownsListing'], // TODO: prevent deleting when there are active (requested, accepted, picked_up) reservations of the listing
        search: true,
        update: ['authenticated', 'listing/ownsListing'],
        uploadImage: ['authenticated', 'listing/ownsListing'],
        getCategories: true
    },

    ListingImageController: {
        create: false,
        destroy: ['authenticated', 'listingImage/ownsListingImage'],
        find: false,
        findOne: false,
        saveSequence: 'authenticated',
        update: ['authenticated', 'listingImage/ownsListingImage']
    },

    ListingMessageController: {
        create: ['authenticated', 'listingMessage/createPolicy'],
        find: true,
        update: false,
        destroy: false
    },

    LogController: {
        '*': true
    },

    ReservationController: {
        create: ['authenticated'], // TODO: only for himself, only with status 'requested'
        destroy: false,
        find: true,
        findOne: ['authenticated', 'reservation/reservationRequesterAndOwnerAllowed'],
        update: false,
        reserveForDateRange: ['authenticated'], //TODO: add listingAvailable, doesNotOwnListing
        getAvailabilityForDatetimeRange: ['authenticated'],
        getReservedDatesForPublicCalendar: true,
        markAsCancelled: ['authenticated'],
        markAsDeclined: ['authenticated'],
        markAsAccepted: ['authenticated'],
        markAsPickedUp: ['authenticated'],
        markAsReturned: ['authenticated'],
        getPickupCode: ['authenticated', 'reservation/reservationRequesterAllowed'],
        getReturnCode: ['authenticated', 'reservation/reservationRequesterAllowed'],
        getEstimatedPrice: true,
        getConflictingReservations: ['authenticated', 'reservation/reservationOwnerAllowed'],
        generateContract: true,
        downloadContractPdf: ['reservation/reservationRequesterAndOwnerAllowed']
    },

    ReservationHistoryController: {
        create: false,
        find: ['authenticated', 'reservationHistory/findPolicy'],
        findOne: false,
        update: false,
        destroy: false
    },

    ReservationMessageController: {
        create: ['authenticated', 'reservationMessage/createPolicy'],
        find: ['authenticated', 'reservationMessage/findPolicy'],
        findOne: false,
        update: false,
        destroy: false
    },

    ReviewController: {
        create: ['authenticated', 'review/allowedToReview', 'review/maxOneReviewPerReservation'],
        destroy: false,
        find: true,
        findOne: true,
        update: false,
        getAverageForListing: true,
        getAverageForUser: true
    },

    UserController: {
        create: true,
        destroy: false,
        find: ['authenticated', 'user/ownsUser'],
        findOne: ['authenticated', 'user/ownsUser'],
        findOneDetailed: ['authenticated', 'user/ownsUser'],
        findOnePublicProfile: true,
        update: ['authenticated', 'user/ownsUser', 'encryptUserPasswordIfNotEmpty'],
        uploadProfilePicture: ['authenticated', 'user/ownsUser'],
        deleteProfilePicture: ['authenticated', 'user/ownsUser'],
        verifyEmail: ['authenticated'],
        sendResetPasswordEmail: true,
        verifyPasswordResetToken: true,
        resetPassword: true
    }

};
