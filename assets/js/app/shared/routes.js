define({
    '/': 'app/home/home /',

    //contact
    '/contact': 'app/contact/contact',

    //document
    '/document/:doc': 'app/document/document /:doc',

    //error
    '/error/:code': 'app/error/error /:code',

    //listing
    '/listing/create': 'app/listing/create/create',
    '/listing/detail/:vanity/:id': 'app/listing/detail/detail /:vanity/:id',
    '/listing/edit/:vanity/:id': 'app/listing/edit/edit /:vanity/:id',
    '/listing/edit/:vanity/:id/:section': 'app/listing/edit/edit /:vanity/:id/:section',
    '/listing/questions/:vanity/:listingId': 'app/listing/questions/questions /:vanity/:listingId',
    '/listing/reservation/:vanity/:id': 'app/listing/reservation/reservation /:vanity/:id',
    '/listing/reservation/:vanity/:id/:code': 'app/listing/reservation/reservation /:vanity/:id/:code',
    '/listing/reservation/:vanity/:id/listing/detail': 'app/listing/reservation/reservation /:vanity/:id/listing/detail',
    '/listing/reserve/:vanity/:listingId': 'app/listing/reserve/reserve /:vanity/:listingId',
    '/listing/search': 'app/listing/search/search /',

    //login
    '/login': 'app/login/login',

    //logout
    '/logout': 'app/logout/logout',

    //my
    '/my/account': 'app/my/account/account',
    '/my/favorites': 'app/my/favorites/favorites /',
    '/my/listings': 'app/my/listings/listings /',
    '/my/profile': 'app/my/profile/profile /',
    '/my/profile/listings': 'app/my/profile/profile /listings',
    '/my/profile/reviews': 'app/my/profile/profile /reviews',
    '/my/reservations': 'app/my/reservations/reservations /',
    '/my/reservations/received': 'app/my/reservations/reservations /received',
    '/my/reservations/sent': 'app/my/reservations/reservations /sent',

    //pickup-return
    '/pickup-return': 'app/pickup-return/pickup-return',

    //register
    '/register': 'app/register/register',

    //reset-password
    '/reset-password': 'app/reset-password/reset-password',
    '/reset-password/:token': 'app/reset-password/reset-password /:token',

    //user
    '/user/profile/:vanity/:id': 'app/my/profile/profile /:vanity/:id',
    '/user/profile/:vanity/:id/listings': 'app/my/profile/profile /:vanity/:id/listings',
    '/user/profile/:vanity/:id/reviews': 'app/my/profile/profile /:vanity/:id/reviews',

    //verify-email
    '/verify-email/:token': 'app/verify-email/verify-email /:token'
});
