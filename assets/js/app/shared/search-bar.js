define([
    'widget/form/form-input-location', 'widget/form/form-input-sorter', 'widget/form/form-input', 'widget/form/form',
    'app/shared/config', 'lib/director', 'util/persisted-observable', 'lib/sugar'
], function (
    FormInputLocation, FormInputSorter, FormInput, Form, Config, Router, PersistedObservable) {

    var lastSerialization = {};

    var SearchBar = new Form([
        new FormInput('q', ''),
        new FormInputLocation('location', PersistedObservable(Config.storageKeys.searchLocation, function () {
            return (Config().isLoggedIn && Config().user.displayedAddress) || Config().defaultLocation;
        }), true, null, PersistedObservable(Config.storageKeys.useCurrentPosition, false), false, false, '/api/geo/normalizeAddress'),
        new FormInputSorter('orderBy', 'orderDir', [
            { key: 'distance', dir: 'asc', isDefault: true },
            { key: 'price', dir: ['asc', 'desc'] },
            { key: 'updatedAt', dir: 'desc' }
        ])
    ], function () {
        var newSerialization = SearchBar.serialize(true);
        if (!Object.equal(newSerialization, lastSerialization)) {
            lastSerialization = newSerialization;
            if (!Object.equal(Object.fromQueryString(window.location.search), newSerialization)) {
                Router().setRoute('/listing/search?' + SearchBar.serialize());
            }
        }
    }, true);

    SearchBar.addFilters = function (filters) {
        if (Object.isArray(filters) && filters.length) {
            Object.each(SearchBar.inputs, function (key, value) {
                if (value.filter && filters.none(function (filter) {
                        return filter.name == key;
                    })) {
                    delete SearchBar.inputs[key];
                }
            });
            filters.each(function (filter) {
                var input = Object.merge(Object.merge(new FormInput(filter.name, filter.defaultValue, false, null, true, true), filter), { filter: true });
                SearchBar.addInput(input);
            });
            SearchBar.fromQueryString(window.location.search);
        }
    };

    SearchBar.clearLastSerialization = function () {
        lastSerialization = {};
    };

    return SearchBar;

});
