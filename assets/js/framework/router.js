define(['framework/page', 'app/shared/routes', 'lib/director', 'jquery', 'lib/sugar'], function (
    Page, Routes, Router) {

    function initPage(pageModulePath, controller) {
        require([pageModulePath], function (page) {
            var pathParts = pageModulePath.split('/');
            var pageName = pathParts.slice(1, pathParts.length - 1).join('-');
            Page.init(pageName, page, controller, pageModulePath);
        });
    }

    var routes = {};
    Object.each(Routes, function (key, value) {
        var values = value.split(' ');
        var pageModulePath = values[0];
        var controllerName = values[1];
        routes[key] = function () {
            Page.loading(true);
            var args = Array.prototype.slice.call(arguments, 0);
            var controller = controllerName ? function (page) {
                page.controllers[controllerName].apply(null, args);
            } : null;
            initPage(pageModulePath, controller);
        };
    });

    var router = new Router(routes).configure({
        strict: false,
        html5history: true,
        convert_hash_in_init: false,
        notfound: function () {
            routes['/error/:code'](404);
        }
    });

    var urlNotAtRoot = window.location.pathname && (window.location.pathname != '/');

    if (!router.historySupport && urlNotAtRoot) {
        window.location.href = '/#' + (window.location.pathname.startsWith('/') ? '' : '/') + window.location.pathname;
        return;
    }

    if (urlNotAtRoot) {
        router.init();
    } else {
        router.init('/');
    }

    $('body').on('click', 'a[href]', function (event) {
        var href = $(this).attr('href').compact();
        if (href && !href.startsWith('http') && !href.startsWith('//') && !href.startsWith('#') &&
            ($(this).attr('target') != '_blank') && !$(this).data('go') && !event.ctrlKey && !event.metaKey) {
            event.preventDefault();
            Page.loading(true);
            router.setRoute(href);
        }
    });

    return router;

});
