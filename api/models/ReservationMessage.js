module.exports = {
    attributes: {
        reservation: {
            model: 'Reservation',
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

    afterCreate: function (reservationMessage, callback) {
        EmailHelper.sendReservationMessageEmailToReceiver(reservationMessage);
        return callback();
    }
};
