define({
    _name: 'auth',
    login: {
        url: '/login',
        type: 'POST',
        https: true
    },
    logout: {
        url: '/logout',
        type: 'POST'
    }
});
