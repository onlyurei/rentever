define(['app/shared/config'], function (Config) {

    window.fbAsyncInit = function () {
        window.FB.init({
            appId: Config().credentials.facebook.id,
            xfbml: true,
            version: 'v2.2'
        });
    };

    (function (d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) {return;}
        js = d.createElement(s);
        js.id = id;
        js.src = '//connect.facebook.net/' + Config().locale + '/sdk.js';
        fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));

});
