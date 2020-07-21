define({
    _name: 'user',
    create: {
        type: 'POST',
        https: true
    },
    findOne: {
        url: '/{id}',
        https: true
    },
    findOneDetailed: {
        url: '/findOneDetailed/{id}',
        https: true
    },
    findOnePublicProfile: {
        url: '/findOnePublicProfile/{id}'
    },
    sendResetPasswordEmail: {
        url: '/sendResetPasswordEmail',
        type: 'PUT'
    },
    sendVerificationEmail: {
        url: '/sendVerificationEmail',
        type: 'PUT'
    },
    uploadProfilePicture: {
        url: '/uploadProfilePicture/{id}',
        type: 'POST'
    },
    deleteProfilePicture: {
        url: '/deleteProfilePicture/{id}',
        type: 'DELETE'
    },
    update: {
        url: '/{id}',
        type: 'PUT',
        https: true
    },
    resetPassword: {
        url: '/resetPassword',
        type: 'PUT',
        https: true
    },
    verifyEmail: {
        url: '/verifyEmail/{token}'
    },
    verifyPasswordResetToken: {
        url: '/verifyPasswordResetToken/{token}'
    }
});
