module.exports = {
    attributes: {
        reservation: {
            model: 'Reservation',
            required: true
        },
        user: {
            model: 'User',
            required: true
        },
        status: {
            type: 'string',
            enum: ['requested', 'cancelled', 'declined', 'accepted', 'picked_up', 'returned'],
            required: true
        }
    }
};
