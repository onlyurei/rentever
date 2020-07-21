define(['app/shared/root-bindings', 'locale/strings', 'app/shared/api/api', 'knockout'], function (
    RootBindings, Strings, Api, ko) {

    function ChangeReservationStatus(reservation, status, code, error, loading, refresh) {
        return Api.call('reservation', 'markAs' + status.camelize(), null, {
                id: reservation.id,
                code: code && code.toUpperCase()
            }, error, loading, {})
            .done(function (updatedValues) {
                reservation.status(updatedValues.status);
                if (updatedValues.actualPrice && (typeof reservation.actualPrice == 'function')) {
                    reservation.actualPrice(updatedValues.actualPrice);
                }
                reservation.code && reservation.code('');
                RootBindings.refreshOwnsActiveReservation();
                refresh && refresh();
            })
            .fail(function () {
                error(Strings('reservation.invalid.code'));
            });
    }

    ChangeReservationStatus.conflictingReservations = ko.observable('');

    ChangeReservationStatus.checkConflictingReservations = function (reservationId) {
        ChangeReservationStatus.conflictingReservations('');
        return Api.call('reservation', 'getConflictingReservations', { reservationId: reservationId })
            .done(ChangeReservationStatus.conflictingReservations);
    };

    return ChangeReservationStatus;
});
