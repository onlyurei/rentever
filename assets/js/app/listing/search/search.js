define([
    'widget/form/form-input', 'app/shared/search-bar', 'app/shared/api/api', 'knockout', 'lib/sugar'
], function (FormInput, SearchBar, Api, ko) {

    var currentPositionSubscription = null;

    var filtersToReset = ['category', 'priceRange'];

    var ListingSearch = {
        init: function () {
            currentPositionSubscription = SearchBar.inputs.location.currentPosition.subscribe(function () {
                SearchBar.submit.delay(100);
            });
        },
        dispose: function () {
            currentPositionSubscription.dispose();
            filtersToReset.each(function (filter) {
                SearchBar.inputs[filter] && delete SearchBar.inputs[filter];
            });
            SearchBar.clearLastSerialization();
        },
        controllers: {
            '/': function () {
                ListingSearch.error('');
                ListingSearch.results([]);
                ListingSearch.query(Object.fromQueryString(window.location.search).q);
                Api.call('listing', 'search', { params: window.location.search }, null, ListingSearch.error, ListingSearch.loading)
                    .done(function (result) {
                        if (result.success) {
                            SearchBar.addFilters(result.filters);
                            ListingSearch.results(result.results);
                            ListingSearch.total(result.total);
                            ListingSearch.page(result.page);
                            ListingSearch.pageSize(result.pageSize);
                        } else {
                            ListingSearch.error(result.message);
                        }
                    });
            }
        },
        title: function () {
            return SearchBar.inputs.q.value();
        },
        loading: ko.observable(false),
        error: ko.observable(''),
        hideHeaderSearchBar: true,
        searchBar: SearchBar,
        results: ko.observableArray([]),
        total: ko.observable(0),
        page: ko.observable(0),
        pageSize: ko.observable(0),
        query: ko.observable('')
    };

    return ListingSearch;
});
