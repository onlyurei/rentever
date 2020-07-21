define(['jquery', 'lib/sugar'], function () {

    var initialized = false;

    function initListenOnBody() {
        // Google Analytics click tracking event delegation for elements that have 'data-ga' attribute,
        // the attribute value should be in the following format:
        // <Category>[|Action[|Label[|Value[|Implicit Count]]]]
        // See detailed guide at:
        // https://developers.google.com/analytics/devguides/collection/gajs/eventTrackerGuide
        $('body').on('click', '*[data-ga], a, button', function (event) {
            if (window.ga) {
                var target = event.currentTarget;
                var gaDataArray = [];
                var gaData = $(target).data('ga');
                if (gaData) {
                    gaDataArray = gaData.split('|').union({ page: window.location.pathname });
                } else {
                    gaDataArray = [
                        'click', ($(target).text() || '').compact(),
                        ($(target).attr('id') || $(target).attr('name') || $(target).attr('class') || '').compact()
                    ];
                }
                if (gaDataArray.length) {
                    window.ga.apply(null, ['send', 'event'].union(gaDataArray));
                }
            }
        });
    }

    var GA = {
        init: function (account, plugins, listenOnBody) {
            if (!initialized) {
                (function (i, s, o, g, r, a, m) {
                    i.GoogleAnalyticsObject = r;
                    i[r] = i[r] || function () {
                            (i[r].q = i[r].q || []).push(arguments);
                        }, i[r].l = 1 * new Date();
                    a = s.createElement(o), m = s.getElementsByTagName(o)[0];
                    a.async = 1;
                    a.src = g;
                    m.parentNode.insertBefore(a, m);
                })(window, document, 'script', '//www.google-analytics.com/analytics.js', 'ga');
                window.ga('create', account, 'auto');
                if (Object.isArray(plugins)) {
                    plugins.each(function (params) {
                        window.ga.apply(window, params);
                    });
                }
                if (listenOnBody) {
                    initListenOnBody();
                }
                initialized = true;
            }
        },
        trackPageView: function (path, callback) {
            if (window.ga) {
                var pageViewParams = {
                    page: path || window.location.pathname
                };
                if (callback && Object.isFunction(callback)) {
                    pageViewParams.hitCallback = callback;
                }
                window.ga('send', 'pageview', pageViewParams);
            }
        },
        trackEvent: function (event, callback) {
            var calledBack = false;

            function _callback() {
                if (!calledBack) {
                    calledBack = true;
                    callback();
                }
            }

            if (Object.isFunction(callback)) {
                _callback.delay(500);
            }
            if (window.ga) {
                var eventParams = Object.findAll({
                    eventCategory: event.category,
                    eventAction: event.action,
                    eventLabel: event.label,
                    eventValue: event.value,
                    page: window.location.pathname
                }, function (key, value) {
                    return !!value;
                });
                if (Object.isFunction(callback)) {
                    eventParams.hitCallback = _callback;
                }
                window.ga('send', 'event', eventParams);
            }
        }
    };

    return GA;

});
