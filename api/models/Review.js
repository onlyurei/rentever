module.exports = {
    attributes: {
        reviewer: {
            model: 'User',
            required: true
        },
        reviewed: {
            model: 'User',
            required: true
        },
        reservation: {
            model: 'Reservation',
            required: true
        },
        rating: {
            type: 'integer',
            required: true,
            min: 1,
            max: 5
        },
        comment: {
            type: 'string',
            required: true,
            maxLength: 1000
        }
    },

    afterCreate: function (review, callback) {
        EmailHelper.sendToReviewed(review.id);
        return callback();
    }
};
