define([
    'framework/page', 'util/regex-patterns', 'widget/form/form-input-location', 'widget/form/form-input',
    'widget/form/form', 'util/google-analytics', 'locale/strings', 'util/dom', 'app/shared/api/api', 'knockout'
], function (
    Page, RegexPatterns, FormInputLocation, FormInput, Form, GA, Strings, Dom, Api, ko) {

    var redirectUrl = '';

    var Register = {
        init: function () {
            Dom.ensureHttps();
            redirectUrl = Object.fromQueryString(window.location.search).url;
        },
        dispose: function () {
            Register.form.clear();
        },
        setRedirectUrl: function () {
            Page.setRedirectUrl(redirectUrl);
            Page.setNewlyLoggedInFlag();
        },
        form: new Form([
            new FormInput('firstName', '', true),
            new FormInput('lastName', '', true),
            new FormInput('email', '', true),
            new FormInput('username', '', true),
            new FormInput('password', '', true),
            new FormInput('_password', '', true, [
                {
                    rule: function (value) {
                        return value == Register.form.inputs.password.value();
                    },
                    message: 'error.password.not.match'
                }
            ]),
            new FormInputLocation('displayedAddress', '', true, null, false, false, false, '/api/geo/normalizeAddress')
        ], function () {
            var serialization = Register.form.serialize(true);
            delete serialization._password;
            Api.call('user', 'create', null, serialization, Register.error)
                .done(function () {
                    Api.call('auth', 'login', null, serialization, Register.error, Register.loading)
                        .done(function () {
                            Page.afterLogin(((redirectUrl != '/') && (redirectUrl != '/logout') && redirectUrl) || '/my/account');
                        });
                })
                .fail(function () {
                    Register.error(Strings('error.register'));
                });
            GA.trackEvent({
                category: 'user',
                action: 'register',
                label: Register.form.inputs.username.value()
            });
        }),
        error: ko.observable(''),
        loading: ko.observable(false)
    };

    return Register;

});
