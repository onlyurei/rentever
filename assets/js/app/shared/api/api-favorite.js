define({
    _name: 'favorite',
    create: {
        url: '/{id}',
        type: 'POST'
    },
    list: {
        url: '{params}'
    }
});
