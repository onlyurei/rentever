define([
    'app/shared/timepicker-options', 'app/shared/listing/listing-availability-calendar', 'util/url-util',
    'locale/strings', 'app/shared/api/api', 'lib/director', 'app/shared/config', 'knockout', 'lib/sugar', 'jquery'
], function (
    TimepickerOptions, ListingAvailabilityCalendar, UrlUtil, Strings, Api, Router, Config, ko) {

    var pickUpCalendar = null;
    var returnCalendar = null;

    function makeParams() {
        return {
            listingId: ListingReserve.listing() && ListingReserve.listing().id,
            datetimeFrom: Date.create(Date.create(ListingReserve.pickUpDate()).format(Date.ISO8601_DATE) + ' ' + ListingReserve.pickUpTime()).format(Date.ISO8601_DATETIME),
            datetimeTo: Date.create(Date.create(ListingReserve.returnDate()).format(Date.ISO8601_DATE) + ' ' + ListingReserve.returnTime()).format(Date.ISO8601_DATETIME)
        };
    }

    var ListingReserve = {
        init: function () {
            return !Config.redirectIfNotLoggedIn();
        },
        dispose: function () {
            pickUpCalendar = null;
            returnCalendar = null;
        },
        controllers: {
            '/:vanity/:listingId': function (vanity, listingId) {
                if (!pickUpCalendar) {
                    pickUpCalendar = new ListingAvailabilityCalendar(listingId, ko.observable(null), ko.observable(null), {
                        onSelect: function (date) {
                            returnCalendar && returnCalendar.minDate(date);
                            ListingReserve.pickUpDate(Date.create(date));
                            ListingReserve.returnDate(Date.create(date));
                            ListingReserve.getEstimatedPrice();
                        },
                        defaultDate: Date.create('tomorrow')
                    });
                    ListingReserve.pickUpDatepicker = pickUpCalendar.datepickerOptions;
                } else {
                    pickUpCalendar.changeListingId(listingId);
                }
                if (!returnCalendar) {
                    returnCalendar = new ListingAvailabilityCalendar(listingId, ko.observable(null), ko.observable(null), {
                        onSelect: function (date) {
                            ListingReserve.returnDate(Date.create(date));
                            ListingReserve.getEstimatedPrice();
                        },
                        defaultDate: Date.create('the day after tomorrow')
                    });
                    ListingReserve.returnDatepicker = returnCalendar.datepickerOptions;
                } else {
                    returnCalendar.changeListingId(listingId);
                }
                Api.call('listing', 'findOne', { id: listingId }, null, ListingReserve.error, ListingReserve.loading)
                    .done(function (listing) {
                        if (listing) {
                            ListingReserve.listing(listing);
                            if ((listing.owner && (listing.owner.id == Config().user.id)) || listing.unavailable) {
                                Router().setRoute('/listing/detail/' + UrlUtil.toUrl(listing.title) + '/' + listing.id);
                            }
                            ListingReserve.getEstimatedPrice();
                        }
                    });
            }
        },
        reserve: function () {
            var params = makeParams();
            Api.call('reservation', 'getAvailabilityForDatetimeRange', params, null, ListingReserve.error, ListingReserve.loading)
                .done(function (ok) {
                    var tokens = {
                        ownerName: ListingReserve.listing().owner.firstName,
                        renterName: Config().user.firstName,
                        title: ListingReserve.listing().title
                    };
                    if (ok) {
                        Api.call('reservation', 'reserveForDatetimeRange', null, params, ListingReserve.error, ListingReserve.loading)
                            .done(function (reservationId) {
                                if (reservationId) {
                                    ListingReserve.success(Strings('listing.reserve.success', tokens));
                                    pickUpCalendar.getReservedDates();
                                    returnCalendar.getReservedDates();
                                    ListingReserve.reservationId(reservationId);
                                } else {
                                    ListingReserve.error(Strings('listing.reserve.unavailable', tokens));
                                }
                            });
                    } else {
                        ListingReserve.error(Strings('listing.reserve.unavailable', tokens));
                    }
                });
        },
        getEstimatedPrice: function () {
            var params = makeParams();
            if (params.listingId && params.datetimeFrom && params.datetimeTo) {
                ListingReserve.error('');
                Api.call('reservation', 'getEstimatedPrice', {
                        listingId: params.listingId,
                        datetimeFrom: params.datetimeFrom,
                        datetimeTo: params.datetimeTo
                    })
                    .done(ListingReserve.estimatedPrice);
            }
        },
        estimatedPrice: ko.observable(null),
        pickUpDatepicker: null,
        returnDatepicker: null,
        pickUpDate: ko.observable(''),
        pickUpTime: ko.observable('10:00 AM'),
        returnDate: ko.observable(''),
        returnTime: ko.observable('10:00 AM'),
        timepickerOptions: TimepickerOptions,
        listing: ko.observable(null),
        reservationId: ko.observable(''),
        loading: ko.observable(false),
        error: ko.observable(''),
        success: ko.observable('')
    };

    return ListingReserve;

});
