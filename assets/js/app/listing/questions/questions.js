define(['app/shared/messages', 'app/shared/api/api', 'knockout', 'lib/sugar'], function (Messages, Api, ko) {

    var ListingQuestions = {
        init: function () {},
        dispose: function () {},
        controllers: {
            '/:vanity/:listingId': function (vanity, listingId) {
                if (!ListingQuestions.listing()) {
                    Api.call('listing', 'findOne', { id: listingId }, null, ListingQuestions.error, ListingQuestions.loading)
                        .done(function (listing) {
                            if (listing) {
                                ListingQuestions.listing(listing);
                                Messages.init('listing', listingId, listing.owner.id, ListingQuestions.error, ListingQuestions.loading);
                                Messages.controllers['/:vanity/:modelId'](vanity, listingId);
                            }
                        });
                } else {
                    Messages.controllers['/:vanity/:modelId'](vanity, listingId);
                }
            }
        },
        listing: ko.observable(null),
        loading: ko.observable(false),
        error: ko.observable('')
    };

    Object.merge(ListingQuestions, Messages, false, false);

    return ListingQuestions;
});
