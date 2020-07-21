define([
    'framework/page', 'widget/form/form-input', 'widget/form/form', 'util/google-analytics', 'util/dom',
    'app/shared/api/api', 'app/shared/config', 'locale/strings', 'knockout', 'lib/sugar'
], function (Page, FormInput, Form, GA, Dom, Api, Config, Strings, ko) {

    var logoutTries;
    var logoutMaxTries;

    function retryLogout() {
        if (logoutTries < logoutMaxTries) {
            logout.delay(200);
        } else {
            Logout.success('');
            Logout.error(Strings('error.generic'));
            throw new Error('Logout max tries reached (' + logoutMaxTries + ') and still not able to logout.');
        }
    }

    function logout() {
        Api.call('auth', 'logout', null, null, Logout.error, Logout.loading)
            .done(function () {
                Config.refresh();
                if (Config().isLoggedIn) {
                    retryLogout();
                } else {
                    Logout.success(Strings('login.logout.message'));
                    Logout.error('');
                    Page.searchBar.inputs.q.value('');
                    Page.searchBar.inputs.location.value(Config().defaultLocation);
                }
            })
            .fail(retryLogout);
        logoutTries++;
    }

    var Logout = {
        init: function () {
            Dom.ensureHttps();
            logoutTries = 0;
            logoutMaxTries = 10;
            logout();
        },
        dispose: function () {
            Logout.form.clear();
        },
        setRedirectUrl: function () {
            Page.setNewlyLoggedInFlag();
        },
        form: new Form([
            new FormInput('username', '', true),
            new FormInput('password', '', true)
        ], function () {
            Api.call('auth', 'login', null, Logout.form.serialize(true), Logout.error, Logout.loading)
                .done(function () {
                    Page.afterLogin('/');
                })
                .fail(function () {
                    Logout.error(Strings('error.login'));
                });
            GA.trackEvent({
                category: 'user',
                action: 'login',
                label: Logout.form.inputs.username.value()
            });
        }),
        success: ko.observable(''),
        error: ko.observable(''),
        loading: ko.observable(false)
    };

    return Logout;

});
