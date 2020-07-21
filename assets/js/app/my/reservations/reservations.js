define([
    'app/shared/change-reservation-status', 'app/shared/root-bindings', 'widget/form/form-input-sorter',
    'widget/form/form', 'lib/sails-io', 'locale/strings', 'lib/director', 'app/shared/config', 'app/shared/api/api',
    'knockout', 'jquery', 'lib/sugar'
], function (
    ChangeReservationStatus, RootBindings, FormInputSorter, Form, io, Strings, Router, Config, Api, ko) {

    function sorterOptions() {
        return [
            new FormInputSorter('sort', '', [
                { key: 'updatedAt', dir: 'desc', isDefault: true },
                { key: 'datetimeFrom', dir: ['asc', 'desc'] },
                { key: 'datetimeTo', dir: ['asc', 'desc'] },
                { key: 'status', dir: ['asc', 'desc'] }
            ], false, ' ')
        ];
    }

    function getCode(reservation) {
        if (reservation.requester.id == Config().user.id) {
            if (reservation.status() == 'accepted') {
                return Api.call('reservation', 'getPickupCode', { id: reservation.id }, null, MyReservations.error, MyReservations.loading)
                    .done(function (code) {
                        reservation.pickupCode(code);
                    });
            } else if (reservation.status() == 'picked_up') {
                return Api.call('reservation', 'getReturnCode', { id: reservation.id }, null, MyReservations.error, MyReservations.loading)
                    .done(function (code) {
                        reservation.returnCode(code);
                    });
            } else {
                return $.Deferred().resolve();
            }
        } else {
            return $.Deferred().resolve();
        }
    }

    var params = {
        receivedReservationsParams: '',
        sentReservationsParams: ''
    };

    function switchTab(tab) {
        MyReservations.tab(tab);
        // force pagination widget to refresh
        MyReservations[tab + 'ReservationsPage'].notifySubscribers();
        MyReservations[tab + 'ReservationsPageSize'].notifySubscribers();
        MyReservations[tab + 'ReservationsTotal'].notifySubscribers();
        MyReservations.controllers['/'](tab);
    }

    function updateReservationInObservableArray(observableArray, id, status, actualPrice) {
        var reservation = observableArray().find(function (reservation) { return reservation.id == id; });
        if (reservation) {
            reservation.status(status);
            reservation.actualPrice(actualPrice);
            getCode(reservation);
            return true;
        }
        return false;
    }

    function updateReservations(msg) {
        if (msg.verb == 'created') {
            msg.data.newlyAdded = true;
            msg.data.status = ko.observable(msg.data.status);
            msg.data.actualPrice = ko.observable(msg.data.actualPrice);
            if (msg.data.listingClone.owner.id == Config().user.id) {
                MyReservations.receivedReservations.unshift(msg.data);
            } else if (msg.data.requester.id == Config().user.id) {
                MyReservations.sentReservations.unshift(msg.data);
            }
        } else if (msg.verb == 'updated') {
            [MyReservations.receivedReservations, MyReservations.sentReservations].each(function (observableArray) {
                return !updateReservationInObservableArray(observableArray, msg.id, msg.data.status, msg.data.actualPrice);
            });
        }
    }

    function fetchReservations(tab, newParams) {
        Api.call('reservation', 'find', { params: newParams }, null, MyReservations.error, MyReservations.loading, {})
            .done(function (reservations) {
                var populatedCount = 0;

                function checkToFillReservations() {
                    populatedCount++;
                    if (populatedCount == reservations.results.length) {
                        if (MyReservations.onlyShowActive()) {
                            reservations.results.remove(function (reservation) {
                                return reservation.reviews.any(function (review) {
                                    return review.reviewer == Config().user.id;
                                });
                            });
                        }
                        MyReservations[tab + 'Reservations'](reservations.results);
                        MyReservations[tab + 'ReservationsPage'](reservations.page);
                        MyReservations[tab + 'ReservationsPageSize'](reservations.pageSize);
                        MyReservations[tab + 'ReservationsTotal'](reservations.total);
                    }
                }

                reservations.results.each(function (reservation) {
                    reservation.status = ko.observable(reservation.status);
                    reservation.actualPrice = ko.observable(reservation.actualPrice);
                    if (tab == 'sent') {
                        reservation.pickupCode = ko.observable('');
                        reservation.returnCode = ko.observable('');
                        getCode(reservation).always(checkToFillReservations);
                    } else {
                        checkToFillReservations();
                    }
                });

                params[tab + 'ReservationsParams'] = newParams;
            });
    }

    function makeCriteria(criteria) {
        if (MyReservations.onlyShowActive()) {
            Object.merge(criteria, {
                status: { '!': ['cancelled', 'declined'] }
            });
        }
        return JSON.stringify(criteria);
    }

    var MyReservations = {
        init: function () {
            var redirect = Config.redirectIfNotLoggedIn();
            if (!redirect) {
                io.socket.on('reservation', updateReservations);
                MyReservations.receivedReservationsSorter = new Form(sorterOptions(), function () {
                    var serialization = MyReservations.receivedReservationsSorter.serialize();
                    Router().setRoute('/my/reservations/received' + (serialization && ('?' + serialization)));
                }, true);
                MyReservations.sentReservationsSorter = new Form(sorterOptions(), function () {
                    var serialization = MyReservations.sentReservationsSorter.serialize();
                    Router().setRoute('/my/reservations/sent' + (serialization && ('?' + serialization)));
                }, true);
                RootBindings.refreshOwnsActiveReservation();
            }
            return !redirect;
        },
        dispose: function () {
            io.socket._raw.removeListener('reservation', updateReservations);
            params.receivedReservationsParams = '';
            params.sentReservationsParams = '';
        },
        controllers: {
            '/': function (tab, force) {
                if (!tab || (tab == 'received')) {
                    var newReceivedReservationsParams = '?where=' + makeCriteria({ 'listingClone.owner.id': Config().user.id }) + '&pageSize=10&' + window.location.search.remove('?');
                    if (force || (newReceivedReservationsParams != params.receivedReservationsParams)) {
                        fetchReservations('received', newReceivedReservationsParams);
                    }
                }

                if (!tab || (tab == 'sent')) {
                    var newSentReservationsParams = '?where=' + makeCriteria({ requester: Config().user.id }) + '&pageSize=10&' + window.location.search.remove('?');
                    if (force || (newSentReservationsParams != params.sentReservationsParams)) {
                        fetchReservations('sent', newSentReservationsParams);
                    }
                }
            },
            '/received': function () {
                switchTab('received');
            },
            '/sent': function () {
                switchTab('sent');
            }
        },
        receivedReservations: ko.observableArray([]),
        receivedReservationsPage: ko.observable(0),
        receivedReservationsPageSize: ko.observable(0),
        receivedReservationsTotal: ko.observable(0),
        receivedReservationsSorter: null,
        sentReservations: ko.observableArray([]),
        sentReservationsPage: ko.observable(0),
        sentReservationsPageSize: ko.observable(0),
        sentReservationsTotal: ko.observable(0),
        sentReservationsSorter: null,
        tab: ko.observable(''),
        changeReservationStatus: function (reservation, status, code, refresh) {
            ChangeReservationStatus(reservation, status, code, MyReservations.error, MyReservations.loading, refresh && function () { MyReservations.controllers['/']('', true); });
        },
        onlyShowActive: ko.observable(true),
        error: ko.observable(''),
        loading: ko.observable(false)
    };

    Object.merge(MyReservations.changeReservationStatus, ChangeReservationStatus);

    return MyReservations;

});
