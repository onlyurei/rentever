define(['locale/strings', 'app/shared/config', 'app/shared/api/api', 'knockout'], function (Strings, Config, Api, ko) {

    var ResetPassword = {
        init: function () {},
        dispose: function () {},
        controllers: {
            '/:token': function (token) {
                Api.call('user', 'verifyPasswordResetToken', { token: token }, null, ResetPassword.error, ResetPassword.loading)
                    .done(function (email) {
                        ResetPassword.token(token);
                        ResetPassword.email(email);
                        ResetPassword.error('');
                        ResetPassword.step(2);
                    })
                    .fail(function () {
                        ResetPassword.error(Strings('error.bad.password.reset.url'));
                    });
            }
        },
        sendResetPasswordEmail: function () {
            if (ResetPassword.email()) {
                Api.call('user', 'sendResetPasswordEmail', null, { email: ResetPassword.email() }, ResetPassword.error, ResetPassword.loading)
                    .done(function () {
                        ResetPassword.success(Strings('reset.password.email.sent', { email: ResetPassword.email() }));
                    })
                    .fail(function () {
                        ResetPassword.error(Strings('error.email.not.found'));
                    });
            }
        },
        resetPassword: function () {
            if (ResetPassword.password() != ResetPassword.passwordConfirm()) {
                ResetPassword.error(Strings('error.password.not.match'));
                return;
            }
            if (ResetPassword.token()) {
                Api.call('user', 'resetPassword', null, {
                        token: ResetPassword.token(),
                        password: ResetPassword.password()
                    }, ResetPassword.error, ResetPassword.loading)
                    .done(function () {
                        ResetPassword.success(Strings('reset.password.success', { email: ResetPassword.email() }));
                    })
                    .fail(ResetPassword.error);
            } else {
                ResetPassword.error(Strings('error.bad.password.reset.url'));
            }
        },
        step: ko.observable(1),
        token: ko.observable(''),
        email: ko.observable(''),
        password: ko.observable(''),
        passwordConfirm: ko.observable(''),
        error: ko.observable(''),
        success: ko.observable(''),
        loading: ko.observable(false)
    };

    return ResetPassword;

});
