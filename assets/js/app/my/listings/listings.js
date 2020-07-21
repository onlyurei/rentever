define([
    'app/shared/listing/listing-sorter', 'lib/director', 'app/shared/api/api', 'app/shared/config', 'knockout',
    'lib/sugar'
], function (ListingSorter, Router, Api, Config, ko) {

    var MyListings = {
        init: function () {
            var redirect = Config.redirectIfNotLoggedIn();
            if (!redirect) {
                MyListings.sorter = ListingSorter('/my/listings');
            }
            return !redirect;
        },
        dispose: function () {},
        controllers: {
            '/': function () {
                Api.call('listing', 'find', { params: '?owner=' + Config().user.id + '&' + window.location.search.remove('?') },
                    null, MyListings.error, MyListings.loading)
                    .done(function (listings) {
                        MyListings.page(listings.page);
                        MyListings.pageSize(listings.pageSize);
                        MyListings.total(listings.total);
                        MyListings.listings(listings.results);
                    });
            }
        },
        listings: ko.observableArray([]),
        sorter: null,
        deleteListing: function (id) {
            MyListings.listings().remove(function (listing) { return listing.id == id; });
            MyListings.listings.notifySubscribers();
            Api.call('listing', 'destroy', { id: id }, null, MyListings.error);
        },
        error: ko.observable(''),
        loading: ko.observable(false),
        page: ko.observable(0),
        pageSize: ko.observable(0),
        total: ko.observable(0)
    };

    return MyListings;

});
