module.exports = {
    attributes: {
        listing: {
            model: 'Listing',
            required: true
        },
        sender: {
            model: 'User',
            required: true
        },
        message: {
            type: 'string',
            maxLength: 1000,
            required: true
        }
    },

    afterCreate: function (listingMessage, callback) {
        ListingMessage.findOne(listingMessage.id)
            .populate('listing')
            .then(function (message) {
                if (message.listing.owner !== message.sender) {
                    EmailHelper.sendListingMessageEmailToOwner(listingMessage);
                    EmailHelper.sendListingMessageEmailToPoster(listingMessage);
                } else {
                    EmailHelper.sendListingMessageEmailsToWatchers(listingMessage);
                    EmailHelper.sendListingMessageEmailToPoster(listingMessage);
                }
            });

        return callback();
    }
};
