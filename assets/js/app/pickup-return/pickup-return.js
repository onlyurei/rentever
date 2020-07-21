define([
    'app/shared/change-reservation-status', 'locale/strings', 'app/shared/api/api', 'lib/director', 'app/shared/config',
    'knockout'
], function (
    ChangeReservationStatus, Strings, Api, Router, Config, ko) {

    function makeCriteria() {
        return JSON.stringify({
            'listingClone.owner.id': Config().user.id,
            or: [{ pickupCode: PickupReturn.code().toUpperCase() }, { returnCode: PickupReturn.code().toUpperCase() }]
        });
    }

    var PickupReturn = {
        init: function () {
            return !Config.redirectIfNotLoggedIn();
        },
        dispose: function () {},
        enter: function () {
            Api.call('reservation', 'find',
                { params: '?where=' + makeCriteria() }, null, PickupReturn.error, PickupReturn.loading)
                .done(function (reservations) {
                    if (reservations.results.length) {
                        PickupReturn.error('');
                    } else {
                        PickupReturn.error(Strings('reservation.invalid.code'));
                        return;
                    }
                    reservations.results.each(function (reservation) {
                        reservation.code = ko.observable(PickupReturn.code().toUpperCase());
                        reservation.actualPrice = ko.observable(reservation.actualPrice);
                        reservation.status = ko.observable(reservation.status);
                    });
                    PickupReturn.reservations(reservations.results);
                });
        },
        changeReservationStatus: function (reservation, status, code) {
            ChangeReservationStatus(reservation, status, code, PickupReturn.error, PickupReturn.loading);
        },
        code: ko.observable(''),
        reservations: ko.observableArray([]),
        error: ko.observable(''),
        loading: ko.observable(false)
    };

    Object.merge(PickupReturn.changeReservationStatus, ChangeReservationStatus);

    return PickupReturn;

});
