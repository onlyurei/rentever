require(['common'], function () {

    require(['app/shared/config', 'util/error-reporter', 'util/google-analytics', 'lib/sugar'], function (
        Config, ErrorReporter, GA) {
        require.config({
            config: {
                i18n: {
                    locale: Config().locale.toLowerCase()
                }
            }
        });

        GA.init(Config().credentials.google.analytics, [['require', 'linkid', 'linkid.js']], true);
        ErrorReporter.init('/api/log/log');

        try {
            Date.setLocale(Config().locale);
        } catch (e) {
            window.console && window.console.error(e.message);
        }
    });

    require(['framework/router']);

});
