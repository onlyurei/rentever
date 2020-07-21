module.exports = {

    get: function (req, res) {
        var result = {
            url: sails.config.appconfs.url,
            credentials: require('../../config/credentials/credentials').public,
            isLoggedIn: false,
            locale: res.locale,
            useMetric: false,
            user: {},
            defaultLocation: 'Chicago, IL, United States'//TODO: use Geo IP to get the user's city
        };
        result.isLoggedIn = req.isAuthenticated();
        if (result.isLoggedIn) {
            result.user = _.pick(req.user, ['id', 'username', 'firstName', 'lastName', 'displayedAddress', 'profilePictureUrl']);
        }
        res.send(result);
    },

    _config: {}

};
