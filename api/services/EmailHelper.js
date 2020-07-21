var Promise = require('bluebird');
var urlUtil = require('../../assets/js/util/url-util.js');
var moment = require('moment');

var sharedContext = {
    siteRoot: sails.config.appconfs.url
};
var reservationStatusChangeMap = {
    REQUESTED_OWNER: {
        template: 'new-reservation-owner',
        title: '${requesterName} would like to rent your ${listingTitle}',
        to: 'owner'
    },
    REQUESTED_REQUESTER: {
        template: 'new-reservation-requester',
        title: 'You requested to rent ${listingTitle} from ${ownerName}',
        to: 'requester'
    },
    CANCELLED_OWNER: {
        template: 'cancelled-reservation-owner',
        title: '${requesterName} cancelled request to rent your ${listingTitle}',
        to: 'owner'
    },
    CANCELLED_REQUESTER: {
        template: 'cancelled-reservation-requester',
        title: 'You cancelled request to rent ${listingTitle} from ${ownerName}',
        to: 'requester'
    },
    DECLINED_OWNER: {
        template: 'declined-reservation-owner',
        title: 'You declined request from ${requesterName} to rent your ${listingTitle}',
        to: 'owner'
    },
    DECLINED_REQUESTER: {
        template: 'declined-reservation-requester',
        title: '${ownerName} declined your request to rent ${listingTitle}',
        to: 'requester'
    },
    ACCEPTED_OWNER: {
        template: 'accepted-reservation-owner',
        title: 'You accepted request from ${requesterName} to rent your ${listingTitle}',
        to: 'owner'
    },
    ACCEPTED_REQUESTER: {
        template: 'accepted-reservation-requester',
        title: '${ownerName} accepted your request to rent ${listingTitle}',
        to: 'requester'
    },
    PICKED_UP_OWNER: {
        template: 'picked-up-reservation-owner',
        title: '${requesterName} picked up your ${listingTitle}',
        to: 'owner'
    },
    PICKED_UP_REQUESTER: {
        template: 'picked-up-reservation-requester',
        title: 'You picked up ${ownerName}\'s ${listingTitle}',
        to: 'requester'
    },
    RETURNED_OWNER: {
        template: 'returned-reservation-owner',
        title: '${requesterName} returned your ${listingTitle}',
        to: 'owner'
    },
    RETURNED_REQUESTER: {
        template: 'returned-reservation-requester',
        title: 'You returned ${ownerName}\'s ${listingTitle}',
        to: 'requester'
    }
};
var emailDatetimeFormat = 'LLLL'; // Thursday, September 4 1986 8:30 PM http://momentjs.com/docs/#/displaying/format/

module.exports = {

    emailVerification: function (token, username) {
        return {
            template: 'email-verification',
            context: _.merge(sharedContext, {
                title: 'Verify your RentEver account email',
                link: sails.config.appconfs.url + '/verify-email/' + token + '?username=' + username,
                username: username
            })
        };
    },

    sendResetPasswordEmail: function (token, username) {
        return {
            template: 'reset-password',
            context: _.merge(sharedContext, {
                title: 'Reset your RentEver account passsword',
                link: sails.config.appconfs.url + '/reset-password/' + token,
                username: username
            })
        };
    },

    getSharedContext: function () {
        return sharedContext;
    },

    sendReservationStatusChangeEmail: function (type, reservationId) {
        var map = reservationStatusChangeMap[type];
        var compiledTitle = _.template(map.title);

        Reservation.findOne(reservationId)
            .populate('requester')
            .then(function (reservation) {
                return new Promise(function (resolve) {
                    Listing.findOne(reservation.listing)
                        .populate('owner')
                        .then(function (listing) {
                            return resolve([reservation, listing]);
                        });
                });
            })
            .spread(function (reservation, listing) {

                var title = compiledTitle({
                    'listingTitle': listing.title,
                    'requesterName': reservation.requester.firstName,
                    'ownerName': listing.owner.firstName
                });
                var context = {
                    title: title, // required: used in the header
                    siteRoot: sails.config.appconfs.url,
                    listingTitle: listing.title,
                    datetimeFrom: moment(reservation.datetimeFrom).format(emailDatetimeFormat),
                    datetimeTo: moment(reservation.datetimeTo).format(emailDatetimeFormat),
                    ownerName: listing.owner.firstName,
                    requesterName: reservation.requester.firstName,
                    link: sails.config.appconfs.url + '/listing/reservation/detail/' + reservation.id
                };
                var recepient = {
                    owner: listing.owner.email,
                    requester: reservation.requester.email
                };

                EmailService.sendEmailAsync(recepient[map.to], title, map.template, context);
            });
    },

    sendListingMessageEmailToOwner: function (listingMessage) {
        Promise.join(
            Listing.findOne(listingMessage.listing).populate('owner'),
            ListingMessage.findOne(listingMessage.id).populate('sender'),
            function (listing, listingMessage) {
                var title = 'New message about your listing ' + listing.title + ' on RentEver';
                EmailService.sendEmailAsync(listing.owner.email, title, 'listing-message-owner',
                    _.merge(EmailHelper.getSharedContext(), {
                        title: title,
                        link: sails.config.appconfs.url + '/listing/questions/' + urlUtil.toUrl(listing.title) + '/' + listing.id,
                        posterName: listingMessage.sender.firstName,
                        message: listingMessage.message,
                        listingTitle: listing.title
                    })
                );
            }
        );
    },

    sendListingMessageEmailsToWatchers: function (listingMessage) {
        ListingMessage.findOne(listingMessage.id)
            .populate('sender')
            .populate('listing')
            .then(function (listingMessage) {
                ListingMessage.find({ listing: listingMessage.listing.id })
                    .populate('sender')
                    .then(function (messages) {
                        var watchers = [];
                        var watcherIds = [];
                        messages.forEach(function (message) {
                            if (watcherIds.indexOf(message.sender.id) == -1 && message.sender.id !== listingMessage.listing.owner) {
                                watcherIds.push(message.sender.id);
                                watchers.push(message.sender);
                            }
                        });
                        watchers.forEach(function (watcher) {
                            var title = 'New message about listing ' + listingMessage.listing.title + ' on RentEver';
                            EmailService.sendEmailAsync(watcher.email, title, 'listing-message-watcher',
                                _.merge(EmailHelper.getSharedContext(), {
                                    title: title,
                                    link: sails.config.appconfs.url + '/listing/questions/' + urlUtil.toUrl(listingMessage.listing.title) + '/' + listingMessage.listing.id,
                                    posterName: listingMessage.sender.firstName,
                                    message: listingMessage.message,
                                    listingTitle: listingMessage.listing.title
                                })
                            );
                        });
                    });
            });
    },

    sendListingMessageEmailToPoster: function (listingMessage) {
        Promise.join(
            Listing.findOne(listingMessage.listing).populate('owner'),
            ListingMessage.findOne(listingMessage.id).populate('sender'),
            function (listing, listingMessage) {
                if (listing.owner.id !== listingMessage.sender.id) {
                    var title = 'You left a message about listing ' + listing.title + ' on RentEver';
                    EmailService.sendEmailAsync(listingMessage.sender.email, title, 'listing-message-poster',
                        _.merge(EmailHelper.getSharedContext(), {
                            title: title,
                            link: sails.config.appconfs.url + '/listing/questions/' + urlUtil.toUrl(listing.title) + '/' + listing.id,
                            ownerName: listing.owner.firstName,
                            message: listingMessage.message,
                            listingTitle: listing.title
                        })
                    );
                }
            }
        );
    },

    sendReservationMessageEmailToReceiver: function (reservationMessage) {
        Promise.join(
            Reservation.findOne(reservationMessage.reservation)
                .populate('listing')
                .then(function (reservation) {
                    return User.findOne(reservation.listing.owner);
                }),
            User.findOne(reservationMessage.sender),
            Reservation.findOne(reservationMessage.reservation).populate('listing').populate('requester'),
            function (owner, sender, reservation) {
                var to = owner.email;
                if (owner.id === sender.id) {
                    to = reservation.requester.email;
                }

                var title = 'New message about reservation of ' + reservation.listing.title + ' on RentEver';
                EmailService.sendEmailAsync(to, title, 'reservation-message-receiver',
                    _.merge(EmailHelper.getSharedContext(), {
                        title: title,
                        link: sails.config.appconfs.url + '/listing/reservation/' + urlUtil.toUrl(reservation.listing.title) + '/' + reservation.id,
                        posterName: sender.firstName,
                        message: reservationMessage.message,
                        listingTitle: reservation.listing.title
                    })
                );
            }
        );
    },

    sendToReviewed: function (reviewId) {
        Review.findOne(reviewId).populate('reviewer').populate('reviewed').populate('reservation')
            .then(function (review) {
                return Promise.join(
                    Listing.findOne(review.reservation.listing),
                    function (listing) {
                        var title = 'You got a review on RentEver';
                        EmailService.sendEmailAsync(review.reviewed.email, title, 'new-review-reviewed',
                            _.merge(EmailHelper.getSharedContext(), {
                                title: title,
                                link: sails.config.appconfs.url + '/listing/reservation/' + urlUtil.toUrl(listing.title) + '/' + review.reservation.id,
                                reviewerName: review.reviewer.firstName,
                                listingTitle: listing.title
                            })
                        );
                    }
                );
            });
    }
};
