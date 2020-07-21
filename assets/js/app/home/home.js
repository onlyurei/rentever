define(['app/shared/search-bar', 'locale/strings', 'app/shared/api/api', 'knockout', 'lib/sugar'], function (
    SearchBar, Strings, Api, ko) {

    var nearbySearchPageSize = 4;

    var currentPositionSubscription = null;
    var locationValueSubscription = null;

    function callNearbySearchApi() {
        Api.call('listing', 'getCategories', null, null, Home.error, Home.loading)
            .done(function (categories) {
                categories.push({
                    id: '',
                    name: Strings('category.any.name')
                });
                Home.results([]);
                categories.each(function (category) {
                    if (SearchBar.inputs.location.currentPosition() || SearchBar.inputs.location.value().compact()) {
                        Api.call('listing', 'search', { params: '?' + SearchBar.inputs.location.serialize() + '&category=' + category.id + '&pageSize=' + nearbySearchPageSize },
                            null, Home.error, Home.loading)
                            .done(function (result) {
                                if (result.success) {
                                    Home.results.push({
                                        noPagination: true,
                                        category: category,
                                        error: Home.error,
                                        loading: Home.loading,
                                        searchBar: Home.searchBar,
                                        noZeroResultsPrompt: !!category.id,
                                        results: ko.observableArray(result.results),
                                        searchLink: '/listing/search?' + SearchBar.inputs.location.serialize() + (category.id ? ('&category=' + category.id) : '')
                                    });
                                    Home.results(Home.results().sortBy(function (result) {
                                        return (result.category.id == 'other') ? 'z' : result.category.id;//TODO: better way to put other in the end
                                    }));
                                } else {
                                    Home.error(result.message);
                                }
                            });
                    }
                });
            });
    }

    var Home = {
        init: function () {
            currentPositionSubscription = SearchBar.inputs.location.currentPosition.subscribe(function () {
                callNearbySearchApi.delay(100);
            });
            locationValueSubscription = SearchBar.inputs.location.value.subscribe(function () {
                callNearbySearchApi();
            }.debounce(1000));
        },
        dispose: function () {
            currentPositionSubscription.dispose();
            locationValueSubscription.dispose();
        },
        controllers: {
            '/': callNearbySearchApi
        },
        title: function () {
            return Strings('brand.tagline');
        },
        meter: {
            value: ko.observable(500),
            price: ko.observable(20)
        },
        searchBar: SearchBar,
        hideHeaderSearchBar: true,
        loading: ko.observable(false),
        error: ko.observable(''),
        results: ko.observableArray([])
    };

    Home.meter.time = ko.computed(function () {
        return Date.create((Home.meter.value() / Home.meter.price()).ceil() + ' days ago').relative().remove(' ago');
    });

    return Home;

});
