require.config({
    paths: {
        //lib
        'jquery': 'lib/jquery',
        'i18n': 'lib/require-i18n',
        'text': 'lib/require-text',

        //lib-ext
        'jquery.fileupload': 'lib-ext/jquery-fileupload-extended',
        'jquery.ui': 'lib-ext/jquery-ui-extended',
        'knockout': 'lib-ext/knockout-extended'
    },
    shim: {
        'lib/bootstrap': {
            deps: ['jquery']
        },
        'lib/jsface': {
            exports: 'Class'
        },
        'lib/jquery-keynav': {
            deps: ['jquery']
        },
        'lib/director': {
            exports: 'Router'
        }
    }
});
