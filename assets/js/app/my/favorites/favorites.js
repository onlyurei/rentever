define([
    'app/shared/listing/listing-sorter', 'app/shared/api/api', 'app/shared/config', 'knockout', 'lib/sugar'
], function (ListingSorter, Api, Config, ko) {

    var MyFavorites = {
        init: function () {
            var redirect = Config.redirectIfNotLoggedIn();
            if (!redirect) {
                MyFavorites.sorter = ListingSorter('/my/favorites');
            }
            return !redirect;
        },
        dispose: function () {},
        controllers: {
            '/': function () {
                Api.call('favorite', 'list', { params: window.location.search },
                    null, MyFavorites.error, MyFavorites.loading)
                    .done(function (listings) {
                        MyFavorites.listings(listings);
                    });
            }
        },
        listings: ko.observableArray([]),
        sorter: null,
        deleteListing: function (id) {
            MyFavorites.listings().remove(function (listing) { return listing.id == id; });
            MyFavorites.listings.notifySubscribers();
            Api.call('favorite', 'destroy', { id: id }, null, MyFavorites.error);
        },
        error: ko.observable(''),
        loading: ko.observable(false)
    };

    return MyFavorites;

});
