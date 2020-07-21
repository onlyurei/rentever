var Promise = require('bluebird');
var join = Promise.join;

module.exports = {
    attributes: {
        requester: {
            model: 'User',
            required: true
        },
        listing: {
            model: 'Listing',
            required: true
        },
        reviews: {
            collection: 'Review',
            via: 'reservation'
        },
        listingClone: {
            type: 'json'
        },
        datetimeFrom: {
            type: 'datetime',
            required: true
        },
        datetimeTo: {
            type: 'datetime',
            required: true
        },
        status: {
            type: 'string',
            enum: ['requested', 'cancelled', 'declined', 'accepted', 'picked_up', 'returned'],
            required: true
        },
        pickupCode: {
            type: 'string'
        },
        returnCode: {
            type: 'string'
        },
        estimatedPrice: {
            type: 'float'
        },
        actualPrice: {
            type: 'float'
        },

        toJSON: function () {
            var unsafeAttributes = ['pickupCode', 'returnCode'];
            var object = this.toObject();
            unsafeAttributes.forEach(function (attribute) {
                delete object[attribute];
            });
            return object;
        }
    },

    beforeCreate: function (reservation, callback) {
        var listingClone = {};
        Listing.findOne(reservation.listing)
            .then(function (listing) {
                _.assign(listingClone, listing);
                join(
                    User.findOne(listing.owner),
                    ListingImage.find({ listing: listing.id }),
                    function (owner, images) {
                        _.assign(listingClone, { owner: owner.toJSON(), images: images });
                        reservation.listingClone = listingClone;
                        callback();
                    })
                    .catch(callback);
            })
            .catch(callback);
    },

    afterCreate: function (reservation, callback) {
        ReservationHistory.create({
            reservation: reservation.id,
            user: reservation.requester,
            status: 'requested'
        })
            .then(function () {
                callback();
            })
            .catch(callback);
    }
};
