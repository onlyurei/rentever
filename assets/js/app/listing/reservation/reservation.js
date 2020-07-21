define([
    'app/shared/listing/listing-detail-view', 'app/shared/listing/set-listing-detail-data',
    'app/shared/change-reservation-status', 'app/shared/messages', 'util/url-util', 'lib/sails-io', 'locale/strings',
    'app/shared/config', 'app/shared/api/api', 'knockout', 'jquery', 'lib/sugar'
], function (
    ListingDetailView, SetListingDetailData, ChangeReservationStatus, Messages, UrlUtil, io, Strings, Config, Api, ko) {

    function getCode(reservation, code) {
        if ((reservation.requester.id == Config().user.id) && (reservation.status() == 'accepted')) {
            return Api.call('reservation', 'getPickupCode', { id: reservation.id }, null, ListingReservation.error, ListingReservation.loading)
                .done(function (code) {
                    reservation.pickupCode(code);
                });
        } else if ((reservation.requester.id == Config().user.id) && (reservation.status() == 'picked_up')) {
            return Api.call('reservation', 'getReturnCode', { id: reservation.id }, null, ListingReservation.error, ListingReservation.loading)
                .done(function (code) {
                    reservation.returnCode(code);
                });
        } else {
            reservation.code = ko.observable(code);
            return $.Deferred().resolve();
        }
    }

    function getHistory(reservation) {
        return Api.call('reservationHistory', 'find', { params: '?reservation=' + reservation.id }, null, ListingReservation.error, ListingReservation.loading)
            .done(function (history) {
                ListingReservation.history(history.results);
            });
    }

    function getReviews(reservation) {
        return Api.call('review', 'find', { params: '?reservation=' + reservation.id + '&sort=createdAt%20asc' }, null, ListingReservation.error, ListingReservation.loading)
            .done(function (reviews) {
                if (!reviews.results.any(function (review) {
                        return review.reviewer.id == Config().user.id;
                    })) {
                    reviews.results.push({
                        reviewer: Config().user,
                        rating: ko.observable(0),
                        comment: ko.observable(''),
                        editable: ko.observable(true),
                        submit: submitReview
                    });
                }
                ListingReservation.reviews(reviews.results);
            });
    }

    function submitReview(review) {
        if (Object.isNumber(review.rating()) && Object.isString(review.comment()) && review.comment().compact()) {
            Api.call('review', 'create', null, {
                    reviewer: Config().user.id,
                    reviewed: (ListingReservation.reservation().requester.id == Config().user.id) ? ListingReservation.reservation().listingClone.owner.id : ListingReservation.reservation().requester.id,
                    reservation: ListingReservation.reservation().id,
                    rating: review.rating(),
                    comment: review.comment()
                }, ListingReservation.error, ListingReservation.loading)
                .done(function (data) {
                    Object.merge(review, data, false, false);
                    review.editable(false);
                });
        }
    }

    function updateReservation(msg) {
        if ((msg.verb == 'updated') && (msg.id == ListingReservation.reservation().id)) {
            var reservation = ListingReservation.reservation();
            Object.merge(reservation, msg.data);
            reservation.status = ko.observable(reservation.status);
            getCode(reservation).done(function () {
                ListingReservation.reservation(reservation);
                getHistory(reservation);
            });
        }
    }

    var ListingReservation = {
        init: function () {
            var redirect = Config.redirectIfNotLoggedIn();
            if (!redirect) {
                ListingDetailView.init();
                io.socket.on('reservation', updateReservation);
            }
            return !redirect;
        },
        dispose: function () {
            ListingDetailView.dispose();
            io.socket._raw.removeListener('reservation', updateReservation);
        },
        controllers: {
            '/:vanity/:id': function (vanity, id, code) {
                ListingReservation.view('reservation');
                if (!ListingReservation.reservation()) {
                    Api.call('reservation', 'findOne', { id: id }, null, ListingReservation.error, ListingReservation.loading, {})
                        .done(function (reservation) {
                            reservation.status = ko.observable(reservation.status);
                            reservation.actualPrice = ko.observable(reservation.actualPrice);
                            reservation.pickupCode = ko.observable('');
                            reservation.returnCode = ko.observable('');
                            $.when(
                                getCode(reservation, code),
                                getHistory(reservation),
                                getReviews(reservation)
                            ).always(function () {
                                SetListingDetailData(ListingReservation, reservation.listingClone, {
                                    timestamp: reservation.createdAt,
                                    listingUrl: '/listing/detail/' + UrlUtil.toUrl(reservation.listingClone.title) + '/' + reservation.listingClone.id,
                                    reservationUrl: '/listing/reservation/' + UrlUtil.toUrl(reservation.listingClone.title) + '/' + reservation.id
                                });
                                ListingReservation.reservation(reservation);
                                Messages.init('reservation', id, reservation.listingClone.owner.id, ListingReservation.error, ListingReservation.loading);
                                Messages.controllers['/:vanity/:modelId'](vanity, id);
                            });
                        });
                }
            },
            '/:vanity/:id/:code': function (vanity, id, code) {
                ListingReservation.controllers['/:vanity/:id'](vanity, id, code);
            },
            '/:vanity/:id/listing/detail': function (vanity, id) {
                ListingReservation.controllers['/:vanity/:id'](vanity, id);
                ListingReservation.view('listing');
            }
        },
        view: ko.observable('reservation'),
        reservation: ko.observable(null),
        listing: ko.observable(null),
        reviews: ko.observableArray([]),
        history: ko.observableArray([]),
        changeReservationStatus: function (reservation, status, code) {
            ChangeReservationStatus(reservation, status, code, ListingReservation.error, ListingReservation.loading)
                .done(function () {
                    getHistory(reservation);
                });
        },
        error: ko.observable(''),
        loading: ko.observable(false)
    };

    Object.merge(ListingReservation.changeReservationStatus, ChangeReservationStatus);
    Object.merge(ListingReservation, Messages, false, false);
    Object.merge(ListingReservation, ListingDetailView, false, false);

    return ListingReservation;

});
