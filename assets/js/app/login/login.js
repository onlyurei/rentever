define([
    'app/shared/search-bar', 'framework/page', 'widget/form/form-input', 'widget/form/form', 'util/google-analytics',
    'locale/strings', 'util/dom', 'util/storage', 'lib/director', 'app/shared/api/api', 'app/shared/config', 'knockout',
    'lib/sugar'
], function (
    SearchBar, Page, FormInput, Form, GA, Strings, Dom, Storage, Router, Api, Config, ko) {

    var redirectUrl = '';
    var username = '';

    var Login = {
        init: function () {
            Dom.ensureHttps();
            var params = Object.fromQueryString(window.location.search);
            redirectUrl = params.url;
            username = params.username || Object.fromQueryString(redirectUrl).username;
            if (username) {
                Login.form.inputs.username.value(username);
            }
        },
        dispose: function () {
            Login.form.clear();
        },
        setRedirectUrl: function () {
            Page.setRedirectUrl(redirectUrl);
            Page.setNewlyLoggedInFlag();
        },
        form: new Form([
            new FormInput('username', '', true),
            new FormInput('password', '', true)
        ], function () {
            Api.call('auth', 'login', null, Login.form.serialize(true), Login.error, Login.loading)
                .done(function () {
                    Page.afterLogin(redirectUrl || '/');
                })
                .fail(function () {
                    Login.error(Strings('error.login'));
                });
            GA.trackEvent({
                category: 'user',
                action: 'login',
                label: Login.form.inputs.username.value()
            });
        }),
        error: ko.observable(''),
        loading: ko.observable(false)
    };

    return Login;

});
