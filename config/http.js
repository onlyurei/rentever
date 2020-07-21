/**
 * HTTP Server Settings
 * (sails.config.http)
 *
 * Configuration for the underlying HTTP server in Sails.
 * Only applies to HTTP requests (not WebSockets)
 *
 * For more information on configuration, check out:
 * http://links.sailsjs.org/docs/config/http
 */

module.exports.http = {

    middleware: {

        // The order in which middleware should be run for HTTP request.
        // (the Sails router is invoked by the "router" middleware below.)
        order: [
            'startRequestTimer',
            'cookieParser',
            'session',
            'bodyParser',
            'handleBodyParserError',
            'compress',
            'methodOverride',
            'poweredBy',
            '$custom',
            'router',
            'www',
            'favicon',
            '404',
            '500'
        ],

        poweredBy: function poweredBy(req, res, next) {
            res.header('X-Powered-By', 'RentEver');
            next();
        }

        // The body parser that will handle incoming multipart HTTP requests.
        // By default as of v0.10, Sails uses [skipper](http://github.com/balderdashy/skipper).
        // See http://www.senchalabs.org/connect/multipart.html for other options.
        // bodyParser: require('skipper')

    },

    customMiddleware: function (app) {
        // passport
        app.use(require('passport').initialize());
        app.use(require('passport').session());

        // prerender
        app.use(require('prerender-node').set('prerenderToken', require('./credentials/credentials.js').private.prerender.token));
    },

    cache: 0 //Cache-Control Max-Age override for the Static middleware (in milliseconds)

};
