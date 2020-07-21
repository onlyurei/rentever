define([
    'app/listing/shared/listing-form-inputs', 'util/json', 'widget/form/form', 'app/shared/api/api',
    'app/shared/config', 'locale/strings', 'lib/director', 'knockout', 'lib/sugar'
], function (
    ListingFormInputs, Json, Form, Api, Config, Strings, Router, ko) {

    var orderedImageIds = ko.observableArray([]);
    var success = ko.observable(false);

    var ListingEdit = {
        init: function () {
            return !Config.redirectIfNotLoggedIn();
        },
        dispose: function () {
            ListingEdit.form.clear();
        },
        controllers: {
            '/:vanity/:id': function (vanity, id) {
                ListingEdit.section('');
                if (!ListingEdit.listing() || (ListingEdit.listing().id != id)) {
                    ListingEdit.refresh(id);
                }
            },
            '/:vanity/:id/:section': function (vanity, id, section) {
                ListingEdit.section(section);
                if (!ListingEdit.listing() || (ListingEdit.listing().id != id)) {
                    ListingEdit.refresh(id);
                }
            }
        },
        form: new Form(ListingFormInputs(), function () {
            Api.call('listing', 'update', { id: ListingEdit.listing().id }, ListingEdit.form.serialize(true), ListingEdit.error, ListingEdit.loading)
                .done(function (listing) {
                    ListingEdit.success(Strings('success.update'));
                    ListingEdit.listing(listing);
                    ListingEdit.form.deserialize(Json.flatten(listing));
                })
                .fail(function (data) {
                    if (data.status == 400) {
                        ListingEdit.error(Strings('error.deposit'));
                    }
                });
        }),
        listing: ko.observable(null),
        orderedImageIds: ko.computed({
            read: function () {
                return orderedImageIds();
            },
            write: function (value) {
                orderedImageIds(value);
                Api.call('listingImage', 'saveSequence', null, { imageIds: value }, ListingEdit.error);
            }
        }),
        section: ko.observable(''),
        refresh: function (id) {
            Api.call('listing', 'detail', { id: id }, null, ListingEdit.error, ListingEdit.loading)
                .done(function (listing) {
                    if (Config().user.id && (Config().user.id != listing.owner.id)) {
                        Router().setRoute('/error/403');
                    }
                    ListingEdit.listing(listing);
                    ListingEdit.form.deserialize(Json.flatten(listing));
                });
        },
        deleteListing: function (id) {
            Api.call('listing', 'destroy', { id: id }, null, ListingEdit.error)
                .done(function () {
                    Router().setRoute('/my/listings');
                });
        },
        deleteImage: function (image) {
            ListingEdit.listing().images.remove(image);
            ListingEdit.listing.notifySubscribers();
            Api.call('listingImage', 'destroy', { id: image.id }, null, ListingEdit.error)
                .fail(function () {
                    ListingEdit.listing().images.push(image);
                    ListingEdit.listing.notifySubscribers();
                });
        },
        updateImage: function (image) {
            Api.call('listingImage', 'update', { id: image.id }, image, ListingEdit.error);
        },
        error: ko.observable(''),
        success: ko.computed({
            read: function () {
                return success();
            },
            write: function (value) {
                success(value);
                if (value) {
                    ListingEdit.error('');
                    (function () {
                        success('');
                    }).delay(3000);
                }
            }
        }),
        loading: ko.observable(false)
    };

    return ListingEdit;

});
