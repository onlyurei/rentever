var listingCategories = require('../constants/categories.js');

function beforeValidate(listing, callback) {
    _.forOwn(listing.price, function (value, key) {
        listing.price[key] = parseFloat(value);
    });

    listing.deposit = listing.deposit || {};
    listing.deposit.required = ((listing.deposit.required === 'true') || (listing.deposit.required === true));
    listing.deposit.amount = parseFloat(listing.deposit.amount);
    if (isNaN(listing.deposit.amount)) {
        listing.deposit.amount = 0;
    }

    callback();
}

var allowedCategories = _.map(listingCategories, 'id');

var model = {
    attributes: {
        title: {
            type: 'string',
            required: true,
            maxLength: 50
        },
        owner: {
            model: 'User',
            required: true
        },
        favorers: {
            collection: 'User',
            via: 'favorites'
        },
        reservations: {
            collection: 'Reservation',
            via: 'listing'
        },
        messages: {
            collection: 'ListingMessage',
            via: 'listing'
        },
        images: {
            collection: 'ListingImage',
            via: 'listing'
        },
        category: {
            type: 'json'
        },
        displayedAddress: {
            type: 'string',
            maxLength: 300
        },
        address: {
            type: 'json'
        },
        location: {
            type: 'json'
        },
        price: {
            type: 'json',
            required: true,
            priceValidation: true
        },
        description: {
            type: 'json',
            required: true,
            descriptionValidation: true
        },
        deposit: {
            type: 'json',
            required: true,
            depositValidation: true
        },
        unavailable: {
            type: 'boolean',
            defaultsTo: false
        },
        categories: {
            type: 'array', // sport, tools, party, av, other
            categoriesAllowed: true,
            defaultsTo: []
        }
    },

    getCategories: function() {
        return listingCategories;
    },

    types: {
        priceValidation: function (price) {
            var valid = true;
            _.forOwn(price, function (value) {
                if (typeof value != 'number') {
                    valid = false;
                } else if (value <= 0) {
                    valid = false;
                }
                return valid;
            });
            return valid && price.daily;
        },
        descriptionValidation: function (description) {
            return description.short.length && description.long.length && (description.short.length <= 90) && (description.long.length <= 5000);
        },
        depositValidation: function (deposit) {
            return (typeof deposit.required == 'boolean') && (typeof deposit.amount == 'number') && ((deposit.required && (deposit.amount > 0)) || (!deposit.required && (deposit.amount === 0)));
        },
        categoriesAllowed: function (categories) {
            return _.every(categories, function (category) {
                return (allowedCategories.indexOf(category) > -1);
            });
        }
    },

    beforeValidate: beforeValidate,
    beforeDestroy: function (clause, callback) {
        if (clause.where === null) {
            callback();
            return;
        }

        ListingImage.destroy({ listing: clause.where.id })
            .then(function () {
                callback();
            })
            .catch(callback);
    }
};

module.exports = model;
