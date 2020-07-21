define(['app/shared/config', 'app/shared/api/api', 'knockout'], function (Config, Api, ko) {

    var VerifyEmail = {
        init: function () {
            return !Config.redirectIfNotLoggedIn();
        },
        dispose: function () {},
        controllers: {
            '/:token': function (token) {
                Api.call('user', 'verifyEmail', { token: token }, null, VerifyEmail.error, VerifyEmail.loading)
                    .done(function () {
                        VerifyEmail.isVerified(true);
                    });
            }
        },
        isVerified: ko.observable(false),
        error: ko.observable(''),
        loading: ko.observable(false)
    };

    return VerifyEmail;

});
