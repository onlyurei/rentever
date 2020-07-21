define(['lib/jsface', 'locale/strings', 'app/shared/api/api', 'knockout', 'lib/sugar'], function (
    Class, Strings, Api, ko) {

    var dateFormat = '{yyyy}-{MM}-{dd}'; //'mm' is for minutes, 'MM' is for months, easily mistakenly to use 'mm' and
                                         // thought it's the month
    var availableStatus = 'AVAILABLE';
    var reservedStatus = 'RESERVED';

    var ListingAvailabilityCalendar = Class({
        constructor: function (listingId, minDate, maxDate, datepickerOptions) {
            this.listingId = listingId;
            this.minDate = minDate;
            this.maxDate = maxDate;

            var _datepickerOptions = {
                minDate: (ko.isObservable(this.minDate) ? this.minDate() : this.minDate) || new Date(),
                maxDate: (ko.isObservable(this.maxDate) ? this.maxDate() : this.maxDate) || null
            };

            if (Object.isObject(datepickerOptions)) {
                _datepickerOptions = Object.merge(_datepickerOptions, datepickerOptions);
            }
            if (_datepickerOptions.onSelect && _datepickerOptions.defaultDate) {
                _datepickerOptions.onSelect(_datepickerOptions.defaultDate);
            }

            this.datepickerOptions = ko.observable(_datepickerOptions);

            if (ko.isObservable(this.minDate)) {
                this.minDate.subscribe(function (newValue) {
                    _datepickerOptions.minDate = newValue;
                    this.datepickerOptions(_datepickerOptions);
                    this.getReservedDates();
                }.bind(this));
            }

            if (ko.isObservable(this.maxDate)) {
                this.maxDate.subscribe(function (newValue) {
                    _datepickerOptions.maxDate = newValue;
                    this.datepickerOptions(_datepickerOptions);
                    this.getReservedDates();
                }.bind(this));
            }

            this.getReservedDates();
        },
        getReservedDates: function () {
            var params = {
                listingId: this.listingId,
                dateFrom: this.datepickerOptions().minDate && Date.create(this.datepickerOptions().minDate).format(Date.ISO8601_DATETIME),
                dateTo: (this.datepickerOptions().maxDate && Date.create(this.datepickerOptions().maxDate).format(Date.ISO8601_DATETIME)) || ''
            };
            return Api.call('reservation', 'getReservedDatesForPublicCalendar', params)
                .done(function (reservedDates) {
                    this.datepickerOptions(Object.merge(this.datepickerOptions(), {
                        beforeShowDay: function (date) {
                            var reservedDate = reservedDates.find(function (_date) {
                                return Date.create(date).format(dateFormat) == Date.create(_date.date).format(dateFormat); //TODO: find a way to use more accurate marking using Date.utc.create
                            });
                            return [
                                !reservedDate || (reservedDate.status != reservedStatus), //whether the day is
                                                                                          // selectable
                                (reservedDate && (reservedDate.status != availableStatus)) ? 'partial' : '', //additional
                                                                                                             // CSS
                                                                                                             // class
                                                                                                             // for the
                                                                                                             // day
                                (date.isAfter(Date.create()) || (date.isToday())) ? (reservedDate ? reservedDate.note : Strings('listing.available.day')) //tooltip for the day
                                    : Strings('listing.unavailable.day')
                            ];
                        }
                    }));
                }.bind(this));
        },
        changeListingId: function (listingId) {
            this.listingId = listingId;
            this.getReservedDates();
        }
    });

    return ListingAvailabilityCalendar;

});
