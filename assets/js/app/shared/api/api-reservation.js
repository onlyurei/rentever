define({
    _name: 'reservation',
    getAvailabilityForDatetimeRange: {
        url: '/getAvailabilityForDatetimeRange?listingId={listingId}&datetimeFrom={datetimeFrom}&datetimeTo={datetimeTo}'
    },
    getConflictingReservations: {
        url: '/getConflictingReservations?reservationId={reservationId}'
    },
    getEstimatedPrice: {
        url: '/getEstimatedPrice?listingId={listingId}&datetimeFrom={datetimeFrom}&datetimeTo={datetimeTo}'
    },
    getReservedDatesForPublicCalendar: {
        url: '/getReservedDatesForPublicCalendar?listingId={listingId}&dateFrom={dateFrom}&dateTo={dateTo}'
    },
    getPickupCode: {
        url: '/getPickupCode?id={id}',
        https: true
    },
    getReturnCode: {
        url: '/getReturnCode?id={id}',
        https: true
    },
    reserveForDatetimeRange: {
        url: '/reserveForDatetimeRange',
        type: 'POST',
        https: true
    },
    markAsAccepted: {
        url: '/markAsAccepted',
        type: 'PUT',
        https: true
    },
    markAsCancelled: {
        url: '/markAsCancelled',
        type: 'PUT',
        https: true
    },
    markAsDeclined: {
        url: '/markAsDeclined',
        type: 'PUT',
        https: true
    },
    markAsPickedUp: {
        url: '/markAsPickedUp',
        type: 'PUT',
        https: true
    },
    markAsReturned: {
        url: '/markAsReturned',
        type: 'PUT',
        https: true
    }
});
