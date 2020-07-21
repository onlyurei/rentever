var geocoder = require('node-geocoder').getGeocoder('google', 'https', {
    apiKey: require('../../config/credentials/credentials').private.google.server,
    formatter: null
});
var Promise = require('bluebird');
var LRU = require('lru-cache');
var cache = LRU({
    max: 5000
});
var util = require('util');
var geolocation = require('../../assets/js/util/geolocation.js');

function callGeocode (address) {
    return new Promise(function (resolve, reject) {
        var cachedResult = cache.get(address);
        if (cachedResult) {
            return resolve(cachedResult);
        } else {
            geocoder.geocode(address)
                .then(function (response) {
                    util.log('Google API called.'); // leave this for stats, to improve caching in the future
                    cache.set(address, response);
                    return resolve(response);
                })
                .fail(reject);
        }
    });
}

module.exports = {
    getDistanceFromLatLon: geolocation.getDistanceFromLatLon,

    guessLongLat: function (address) {
        return callGeocode(address)
            .then(function (response) {
                return new Promise(function (resolve) {
                    return resolve([
                        response[0].longitude,
                        response[0].latitude
                    ]);
                });
            });
    },

    guessAddress: function (address) {
        return this.resolveAddress(address)
            .then(function (response) {
                return new Promise(function (resolve) {
                    response[0].displayedAddress = module.exports.generateDisplayedAddress(response[0]);
                    return resolve(response[0]);
                });
            });
    },

    resolveAddress: function (address) {
        return callGeocode(address);
    },

    generateDisplayedAddress: function (addressObject) {
        return (addressObject.streetNumber ? (addressObject.streetNumber + ' ') : '') +
               (addressObject.streetName ? (addressObject.streetName + ', ') : '') +
               (addressObject.city ? (addressObject.city + ', ') : '') +
               (addressObject.stateCode ? (addressObject.stateCode + ', ') : (addressObject.state ? (addressObject.state + ', ') : '')) +
               (addressObject.country ? (addressObject.country + ' ') : '') +
               (addressObject.zipcode || '');
    }
};
