define([
    'app/listing/shared/listing-form-inputs', 'locale/strings', 'util/url-util', 'widget/form/form',
    'app/shared/config', 'app/shared/api/api', 'lib/director', 'knockout', 'lib/sugar'
], function (ListingFormInputs, Strings, UrlUtil, Form, Config, Api, Router, ko) {

    var ListingCreate = {
        init: function () {
            var redirect = Config.redirectIfNotLoggedIn();
            if (!redirect) {
                try {
                    var address = Object.fromQueryString(window.location.search).address;
                    ListingCreate.form.inputs.displayedAddress.value(
                        address || JSON.parse(Api.call('user', 'findOneDetailed', { id: Config().user.id }, null, ListingCreate.error, ListingCreate.loading, true)).displayedAddress || ''
                    );
                    if (address) {
                        ListingCreate.form.inputs.displayedAddress.useCurrentPosition(false);
                    }
                } catch (e) {}
            }
            return !redirect;
        },
        dispose: function () {},
        form: new Form(ListingFormInputs(), function () {
            Api.call('listing', 'create', null, ListingCreate.form.serialize(true), ListingCreate.error, ListingCreate.loading)
                .done(function (listing) {
                    Router().setRoute('/listing/edit/' + UrlUtil.toUrl(listing.title) + '/' + listing.id + '/images');
                    ListingCreate.form.clear();
                })
                .fail(function () {
                    ListingCreate.error(Strings('error.deposit'));
                });
        }),
        loading: ko.observable(false),
        error: ko.observable('')
    };

    return ListingCreate;

});
