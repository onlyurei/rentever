module.exports = {

    normalizeAddress: function (req, res) {
        var address = req.query.term;
        if (address === undefined) {
            res.badRequest('Missing param: term.');
            return;
        }

        GeoService.resolveAddress(address)
            .then(function (response) {
                res.send(response.map(function (address) {
                    return GeoService.generateDisplayedAddress(address);
                }));
            })
            .catch(function () {
                res.send([]);
            });
    },

    _config: {}
};
