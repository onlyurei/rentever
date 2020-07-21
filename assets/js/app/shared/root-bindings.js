define([
    'util/function-executor', 'util/google-analytics', 'util/url-util', 'lib/quantities', 'app/shared/search-bar',
    'util/dom', 'lib/director', 'app/shared/config', 'locale/strings', 'util/storage', 'app/shared/api/api', 'knockout',
    'external/facebook', 'util/facebook-login-redirect-hash-fix', 'lib/bootstrap', 'jquery', 'lib/sugar'
], function (
    FunctionExecutor, GA, UrlUtil, Quantities, SearchBar, Dom, Router, Config, Strings, Storage, Api, ko) {

    function sanitizeRedirectUrl(url) {
        return (Object.isString(url) && url.compact() && !url.startsWith(/^\/login|\/logout|\/register/i)) ? url.compact().unescapeURL() : '/';
    }

    function redirect(url) {
        var _url = sanitizeRedirectUrl(url);
        if ((window.location.pathname + window.location.search) != _url) {
            Router().setRoute(_url);
        }
    }

    var RootBindings = {
        config: Config,
        dom: Dom,
        quantities: Quantities,
        strings: Strings,
        urlUtil: UrlUtil,
        searchBar: SearchBar,
        ga: GA,
        exec: FunctionExecutor,
        ownsActiveReservation: ko.observable(false),
        initExtra: function () {
            GA.trackPageView();
        },
        refreshOwnsActiveReservation: function () {
            if (Config().isLoggedIn) {
                Api.call('reservation', 'find', {
                    params: '?where=' + JSON.stringify({
                        'listingClone.owner.id': Config().user.id,
                        status: ['accepted', 'picked_up']
                    })
                }).done(function (reservations) {
                    RootBindings.ownsActiveReservation(!!reservations.results.length);
                });
            }
        },
        title: function () {
            var title = this.page().data.title;
            title = (title ? (Object.isFunction(title) ? title() : title) : this.page().name.titleize());
            var suffix = Strings('brand.name');
            return title.has(suffix) ? title : (title + ' - ' + suffix);
        },
        setRedirectUrl: function (url) {
            Storage.set(Config.storageKeys.redirectUrl, url || (window.location.pathname + window.location.search), false);
        },
        setNewlyLoggedInFlag: function () {
            Storage.set(Config.storageKeys.newlyLoggedIn, true, false);
        },
        afterLogin: function (redirectUrl) {
            if (Storage.get(Config.storageKeys.newlyLoggedIn, false)) {
                Storage.remove(Config.storageKeys.newlyLoggedIn, false);
                Storage.set(Config.storageKeys.configChanged, Math.random());
            }
            Config.refresh();
            RootBindings.refreshOwnsActiveReservation();
            if (Config().user.displayedAddress) {
                SearchBar.inputs.location.value(Config().user.displayedAddress);
            }
            if (redirectUrl) {
                redirect(redirectUrl);
            }
        },
        shareOnFacebook: function (object) {
            window.FB.ui(Object.merge({
                method: 'feed', // https://developers.facebook.com/docs/sharing/reference/feed-dialog/v2.2
                link: Config().url + window.location.pathname + window.location.search
            }, object));
        }
    };

    var _redirectUrl = Storage.get(Config.storageKeys.redirectUrl, false);

    if (_redirectUrl) {
        Storage.remove(Config.storageKeys.redirectUrl, false);
        if (Storage.get(Config.storageKeys.newlyLoggedIn, false)) {
            (function () {
                RootBindings.afterLogin(_redirectUrl);
            }).delay(500);
        } else {
            redirect(_redirectUrl);
        }
    } else {
        if (Storage.get(Config.storageKeys.newlyLoggedIn, false)) {
            (function () {
                RootBindings.afterLogin('/');
            }).delay(500);
        }
    }

    RootBindings.refreshOwnsActiveReservation();

    return RootBindings;

});
