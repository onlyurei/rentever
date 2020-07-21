define(['util/google-analytics', 'locale/strings', 'knockout'], function (GA, Strings, ko) {

    var Error = {
        init: function (code) {
            Error.statusCode(code);
        },
        dispose: function () {},
        controllers: {
            '/:code': function (code) {
                Error.statusCode(code);
                GA.trackEvent({
                    category: 'error',
                    action: 'http',
                    label: code
                });
            }
        },
        title: function () {
            return Strings('error.' + Error.statusCode());
        },
        statusCode: ko.observable('')
    };

    return Error;

});
