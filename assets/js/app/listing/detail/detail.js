define([
    'app/shared/listing/listing-detail-view', 'app/shared/listing/set-listing-detail-data',
    'app/shared/listing/listing-availability-calendar', 'app/shared/api/api', 'app/shared/config', 'knockout',
    'lib/sugar', 'jquery'
], function (
    ListingDetailView, SetListingDetailData, ListingAvailabilityCalendar, Api, Config, ko) {

    var listingAvailabilityCalendar = null;

    var ListingDetail = {
        init: function () {
            ListingDetailView.init();
        },
        dispose: function () {
            listingAvailabilityCalendar = null;
            ListingDetailView.dispose();
        },
        controllers: {
            '/:vanity/:id': function (vanity, id) {
                Api.call('listing', 'detail', { id: id }, null, ListingDetail.error, ListingDetail.loading)
                    .done(function (listing) {
                        Api.call('reservation', 'find', {
                                params: '?where=' + JSON.stringify({
                                    listing: id,
                                    status: 'returned'
                                }) + '&limit=60'
                            },
                            null, ListingDetail.error, ListingDetail.loading)
                            .then(function (reservations) {
                                return Api.call('review', 'find', {
                                    params: '?where=' + JSON.stringify({
                                        reservation: reservations.results.map('id'),
                                        reviewer: { '!': listing.owner.id }
                                    })
                                }, null, ListingDetail.error, ListingDetail.loading);
                            })
                            .then(function (reviews) {
                                ListingDetail.reviews(reviews.results.first(30));
                            });

                        Api.call('review', 'getAverageForUser', { userId: listing.owner.id }, null, ListingDetail.error, ListingDetail.loading).done(ListingDetail.userRatings);

                        if (Config().isLoggedIn) {
                            Api.call('reservation', 'find', {
                                    params: '?where=' + JSON.stringify({
                                        requester: Config().user.id,
                                        listing: id
                                    }) + '&sort=createdAt%20desc'
                                },
                                null, ListingDetail.error, ListingDetail.loading)
                                .done(function (reservations) {
                                    ListingDetail.mostRecentRental(reservations.results[0]);
                                });
                        }

                        SetListingDetailData(ListingDetail, listing);

                        var image = listing.images.length && listing.images.find(function (image) { return image.sequence === 0; });
                        ListingDetail.image((image && image.fullUrl.add('http:', 0)) || '');
                        ListingDetail.canonicalUrl('/listing/detail/-/' + id);
                    });

                Api.call('review', 'getAverageForListing', { listingId: id }, null, ListingDetail.error, ListingDetail.loading).done(ListingDetail.ratings);

                listingAvailabilityCalendar = new ListingAvailabilityCalendar(id);
                ListingDetail.datepicker = listingAvailabilityCalendar.datepickerOptions;
            }
        },
        canonicalUrl: ko.observable(''),
        datepicker: null,
        listing: ko.observable(null),
        addToFavorites: function (listing) {
            if (!Config.redirectIfNotLoggedIn()) {
                Api.call('favorite', 'create', { id: listing.id }, null, ListingDetail.error)
                    .done(function () {
                        ListingDetail.isFavorited(true);
                    });
            }
        },
        removeFromFavorites: function (listing) {
            Api.call('favorite', 'destroy', { id: listing.id }, null, ListingDetail.error)
                .done(function () {
                    ListingDetail.isFavorited(false);
                });
        },
        image: ko.observable(''),
        mostRecentRental: ko.observable(null),
        isFavorited: ko.observable(false),
        reviews: ko.observableArray([]),
        ratings: ko.observable(null),
        userRatings: ko.observable(null),
        loading: ko.observable(false),
        error: ko.observable('')
    };

    Object.merge(ListingDetail, ListingDetailView, false, false);

    return ListingDetail;
});
