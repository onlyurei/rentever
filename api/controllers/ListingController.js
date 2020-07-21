/**
 * ListingController
 *
 * @description :: Server-side logic for managing Listings
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
var Promise = require('bluebird');
var util = require('util');
var listingCategories = require('../constants/categories.js');

var searchCategories = listingCategories.slice(0);
searchCategories.unshift(
    { id: '', name: 'Any' }
);

var filterDefinitions = [
    {
        name: 'distance',
        type: 'enum',
        values: [
            { id: '1609', name: '1609' },
            { id: '8047', name: '8047' },
            { id: '16093', name: '16093' },
            { id: '40234', name: '40234' },
        ],
        defaultValue: '16093',
        unit: 'm',
        displayUnit: {
            metric: 'km',
            imperial: 'mi'
        }
    },
    {
        name: 'priceRange',
        type: 'range',
        range: true,
        unit: null,
        min: 0,
        max: 100
    },
    {
        name: 'category',
        type: 'enum',
        values: searchCategories
    }
];

var maxImagesPerListing = 10;
var maxSearchRadius = _.last(_.find(filterDefinitions, 'name', 'distance').values).id;
var maxPageSize = 360;

function bake(item, input) {
    var result = _.pick(item, ['id', 'title', 'price']);
    result.location = {
        long: item.location.coordinates[0],
        lat: item.location.coordinates[1]
    };
    result.address = item.address.city || '';
    result.distance = GeoService.getDistanceFromLatLon(input.longLat[1], input.longLat[0],
        item.location.coordinates[1], item.location.coordinates[0], true);
    result.shortDescription = item.description.short;
    result.thumbUrl = (item.images && item.images.length) ? (_.find(item.images, { sequence: 0 }) || item.images[0]).thumbUrl : '';

    return result;
}

function queryDB(input, res) {
    var result = {
        success: true,
        filters: filterDefinitions,
        results: [],
        page: input.page,
        pageSize: input.pageSize
    };
    var filterClauseAnd = [
        {
            $or: [
                {
                    title: new RegExp(input.q, 'i')
                },
                {
                    'description.short': new RegExp(input.q, 'i')
                },
                {
                    'description.long': new RegExp(input.q, 'i')
                }
            ]
        },
        {
            location: {
                // $near always returns the documents sorted by distance.
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: input.longLat
                    },
                    $maxDistance: input.distance
                }
            }
        },
        {
            $or: [
                { unavailable: { $exists: false } },
                { unavailable: false }
            ]
        }
    ];
    if (input.priceType) {
        var key = 'price.' + input.priceType;
        var clause = {};

        clause[key] = { $exists: true };
        filterClauseAnd.push(clause);

        if (input.priceRange) {
            var priceRange = input.priceRange.split(',');
            var priceFrom = priceRange[0] && parseInt(priceRange[0], 10);
            var priceTo = priceRange[1] && parseInt(priceRange[1], 10);

            if (priceFrom) {
                clause = {};
                clause[key] = { $gte: priceFrom };
                filterClauseAnd.push(clause);
            }
            if (priceTo) {
                clause = {};
                clause[key] = { $lte: priceTo };
                filterClauseAnd.push(clause);
            }
        }
    }

    if (input.category) {
        filterClauseAnd.push({
            categories: {
                $all: [input.category]
            }
        });
    }

    var orderByClause = {};
    if (input.orderBy && (input.orderBy !== 'distance') && input.orderDir) {
        var direction = (input.orderDir.toLowerCase() === 'asc') ? 1 : -1;
        if (input.orderBy == 'price') {
            input.orderBy += ('.' + (input.priceType || 'daily'));
        }
        orderByClause[input.orderBy] = direction;
    }

    async.parallel([
        function (callback) {
            Listing.native(function (err, collection) {
                collection
                    .find({
                        $and: filterClauseAnd
                    })
                    .count(function (err, num) {
                        result.total = num;
                        callback();
                    });
            });
        },
        function (callback) {
            Listing.native(function (err, collection) {
                collection
                    .find({
                        $and: filterClauseAnd
                    })
                    .sort(orderByClause)
                    .skip(input.pageSize * (input.page - 1))
                    .limit(input.pageSize)
                    .toArray(function (err, results) {
                        if (err) {
                            callback(err);
                        }

                        var listingIds = [];
                        if (results && results.length) {
                            results.forEach(function (item) { // i like forEach
                                listingIds.push(item._id);
                            });
                        }

                        Listing.find()
                            .where({ id: listingIds })
                            .populate('images')
                            .exec(function (err, listings) {
                                if (err) {
                                    callback(err);
                                }
                                // preserving the order
                                var idsToListings = {};
                                listings.forEach(function (item) {
                                    idsToListings[item.id] = item;
                                });

                                listingIds.forEach(function (listingId) {
                                    result.results.push(bake(idsToListings[listingId], input));
                                });

                                callback();
                            });
                    });
            });
        }
    ], function (err) {
        if (err) {
            util.error(err, err.stack);
            res.serverError(err);
        }
        res.send(result);
    });
}

function validateInput(req, res, callback) {
    var VALIDATION_FAILED = { success: false, message: 'Params are missing and/or invalid!' };

    var requiredParams = [];
    requiredParams.forEach(function (item) {
        if (req.query[item] === undefined) {
            return res.send(VALIDATION_FAILED);
        }
    });

    if (req.query.location === undefined && req.query.lat === undefined && req.query.long === undefined) {
        return res.send(VALIDATION_FAILED);
    }

    if (req.query.orderBy !== undefined) {
        if (_.indexOf(['distance', 'updatedAt', 'price'], req.query.orderBy) === -1) {
            return res.send(VALIDATION_FAILED);
        }
    }

    if (req.query.orderDir !== undefined) {
        if (req.query.orderDir.toLowerCase() !== 'asc' && req.query.orderDir.toLowerCase() !== 'desc') {
            return res.send(VALIDATION_FAILED);
        }
    }

    if (req.query.distance && (parseInt(req.query.distance, 10) > maxSearchRadius)) {
        return res.send(VALIDATION_FAILED);
    }

    if (req.query.pageSize && (parseInt(req.query.pageSize, 10) > maxPageSize)) {
        return res.send(VALIDATION_FAILED);
    }

    if (callback) {
        callback();
    }
}

function normalizeAddress(listing) {
    var address = listing.displayedAddress;
    if (listing.lat && listing.long) {
        address = [listing.lat, listing.long].join(',');
        delete listing.lat;
        delete listing.long;
        return GeoService.guessAddress(address);
    }
    return GeoService.guessAddress(address);
}

function createOrUpdate(req, res, action) {
    var listing = req.body;
    if (action == 'create') {
        listing.owner = req.user;
    }
    normalizeAddress(listing)
        .then(function (response) {
            listing.displayedAddress = response.displayedAddress;
            delete response.displayedAddress;
            listing.address = response;
            listing.location = {
                type: 'Point',
                coordinates: [listing.address.longitude, listing.address.latitude]
            };
            if (action == 'create') {
                Listing.create(listing).exec(function (err, created) {
                    if (err) {
                        util.error(err, err.stack);
                        return res.serverError(err);
                    }
                    res.send(created);
                });

            } else if (action == 'update') {
                Listing.update(req.param('id'), listing).exec(function (err) {
                    if (err) {
                        util.error(err, err.stack);
                        return res.serverError(err);
                    }
                    Listing.findOne(req.param('id')).populate('images').exec(function (err, updated) {
                        if (err) {
                            util.error(err, err.stack);
                            return res.serverError(err);
                        }
                        res.send(updated);
                    });
                });
            }
        })
        .catch(function (err) {
            util.error(err, err.stack);
            res.serverError(err);
        });
}

module.exports = {

    getCategories: function (req, res) {
        return res.send(listingCategories);
    },

    create: function (req, res) {
        createOrUpdate(req, res, 'create');
    },

    update: function (req, res) {
        createOrUpdate(req, res, 'update');
    },

    search: function (req, res) {
        validateInput(req, res, function () {

            var input = {
                q: req.query.q,
                distance: parseInt(req.query.distance || maxSearchRadius, 10),
                page: parseInt(req.query.page || 1, 10),
                pageSize: parseInt(req.query.pageSize || 60, 10),
                priceType: req.query.priceType || 'daily',
                priceRange: req.query.priceRange,
                orderBy: req.query.orderBy,
                orderDir: req.query.orderDir,
                category: req.query.category
            };

            if (req.query.long && req.query.lat) {
                input.longLat = [parseFloat(req.query.long, 10), parseFloat(req.query.lat, 10)];
                queryDB(input, res);
            } else {
                GeoService.guessLongLat(req.query.location)
                    .then(function (longLat) {
                        input.longLat = longLat;
                        queryDB(input, res);
                    })
                    .catch(function (err) {
                        util.error(err, err.stack);
                        res.serverError(err);
                    });
            }

        });
    },

    uploadImage: function (req, res) {
        var listingId = req.param('id');

        var thumbFilename;
        var fullFilename;

        Promise.resolve()
            .then(function () {
                return ListingImage.count({ listing: listingId });
            })
            .then(function (count) {
                if (count >= maxImagesPerListing) {
                    return res.badRequest('Max images per listing limit reached.');
                }
                return ImageService.validateResizeAndUpload(req, 'jpg', [
                    { size: 600, quality: 40 },
                    { size: 1024, quality: 80 }
                ]);
            })
            .then(function (s3FileNames) {
                thumbFilename = s3FileNames[0];
                fullFilename = s3FileNames[1];

                return Listing.findOne().where({ id: listingId });
            })
            .then(function (listing) {
                return ListingImage.create({
                    thumbUrl: sails.config.appconfs.s3Prefix + thumbFilename,
                    fullUrl: sails.config.appconfs.s3Prefix + fullFilename,
                    caption: '',
                    listing: listing
                });
            })
            .then(function () {
                return res.send();
            })
            .catch(function (err) {
                util.error(err, err.stack);
                return res.serverError(err);
            });
    },

    _config: {}

};
