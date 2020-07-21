define([
    'app/shared/search-bar', 'util/keyboard-event-handler', 'app/shared/api/api', 'knockout', 'jquery'
], function (SearchBar, KeyboardEventHandler, Api, ko) {

    function handleKeydown(event) {
        KeyboardEventHandler(event, 'left', function () {
            ListingDetail.navImage(true);
        });
        KeyboardEventHandler(event, 'right', function () {
            ListingDetail.navImage();
        });
    }

    var ListingDetail = {
        init: function () {
            Api.call('listing', 'getCategories').done(ListingDetail.categories);
            $(document).on('keydown', handleKeydown);
        },
        dispose: function () {
            $(document).off('keydown', handleKeydown);
        },
        activeImage: ko.observable(null),
        images: ko.observableArray([]),
        categories: ko.observableArray([]),
        browseCategoryLink: function (category) {
            var currentParams = Object.fromQueryString(SearchBar.serialize());
            delete currentParams.category;
            return '/listing/search?' + Object.toQueryString(currentParams) + '&category=' + category;
        },
        navImage: function (reverse) {
            var index = ListingDetail.images().findIndex(ListingDetail.activeImage());
            if (reverse) {
                index--;
                if (index < 0) {
                    index = ListingDetail.images().length - 1;
                }
            } else {
                index++;
                if (index >= ListingDetail.images().length) {
                    index = 0;
                }
            }
            ListingDetail.activeImage(ListingDetail.images()[index]);
            ListingDetail.triggerWindowResize();
        },
        triggerWindowResize: function () {
            (function () { $(window).resize(); }).delay(100); //fix modal backdrop not covering window in full
        }
    };

    return ListingDetail;

});
