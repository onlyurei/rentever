define([
    'util/regex-patterns', 'widget/form/form-input-location', 'widget/form/form-input', 'widget/form/form',
    'app/shared/api/api', 'app/shared/config', 'locale/strings', 'knockout', 'lib/sugar'
], function (
    RegexPatterns, FormInputLocation, FormInput, Form, Api, Config, Strings, ko) {

    var success = ko.observable('');

    var MyAccount = {
        init: function () {
            var redirect = Config.redirectIfNotLoggedIn();
            if (!redirect) {
                MyAccount.refreshUser();
            }
            return !redirect;
        },
        dispose: function () {
            MyAccount.form.clear();
        },
        user: ko.observable({}),
        form: new Form([
            new FormInput('id', '', true),
            new FormInput('firstName', ''),
            new FormInput('lastName', ''),
            new FormInput('email', '', false, [
                {
                    rule: RegexPatterns.email,
                    message: 'error.type.email'
                }
            ]),
            new FormInput('password', ''),
            new FormInput('_password', '', false, [
                {
                    rule: function (value) {
                        return value == MyAccount.form.inputs.password.value();
                    },
                    message: 'error.password.not.match'
                }
            ]),
            new FormInputLocation('displayedAddress', '', true, null, false, false, false, '/api/geo/normalizeAddress')
        ], function () {
            var serialization = MyAccount.form.serialize(true);
            delete serialization._password;
            Api.call('user', 'update', { id: Config().user.id }, serialization, MyAccount.error, MyAccount.loading)
                .done(function () {
                    MyAccount.success(Strings('success.update'));
                    MyAccount.refreshUser();
                    Config.refresh();
                });
        }),
        refreshUser: function () {
            Api.call('user', 'findOneDetailed', { id: Config().user.id }, null, MyAccount.error, MyAccount.loading)
                .done(function (user) {
                    MyAccount.user(user);
                    MyAccount.form.deserialize(user);
                    Config.refresh();
                });
        },
        resendVerificationEmail: function () {
            Api.call('user', 'sendVerificationEmail', null, { id: MyAccount.user().id }, MyAccount.error, MyAccount.loading)
                .done(function () {
                    MyAccount.success(Strings('my.account.email.resend.success'));
                });
        },
        deleteProfilePicture: function () {
            Api.call('user', 'deleteProfilePicture', { id: MyAccount.user().id }, null, MyAccount.error, MyAccount.loading)
                .done(MyAccount.refreshUser);
        },
        error: ko.observable(''),
        success: ko.computed({
            read: function () {
                return success();
            },
            write: function (value) {
                success(value);
                if (value) {
                    MyAccount.error('');
                    (function () {
                        success('');
                    }).delay(3000);
                }
            }
        }),
        loading: ko.observable(false)
    };

    return MyAccount;

});
