define(['app/shared/api/api', 'app/shared/config', 'knockout', 'lib/sugar'], function (Api, Config, ko) {

    var userId = '';
    var listingsParams = '';
    var reviewsParams = '';

    function getUser(id) {
        var newUserId = id;
        if (newUserId != userId) {
            Api.call('user', 'findOnePublicProfile', { id: newUserId }, null, MyProfile.error, MyProfile.loading)
                .done(function (user) {
                    MyProfile.user(user);
                    userId = newUserId;
                });
        }
    }

    function getListings(id) {
        var newListingsParams = '?owner=' + id + '&sort=updatedAt%20desc&' + window.location.search.remove('?');
        if (newListingsParams != listingsParams) {
            Api.call('listing', 'find', { params: newListingsParams }, null, MyProfile.error, MyProfile.loading)
                .done(function (listings) {
                    MyProfile.listings(listings.results);
                    MyProfile.listingsPage(listings.page);
                    MyProfile.listingsPageSize(listings.pageSize);
                    MyProfile.listingsTotal(listings.total);
                    listingsParams = newListingsParams;
                });
        }
    }

    function getRatings(id) {
        Api.call('review', 'getAverageForUser', { userId: id }, null, MyProfile.error, MyProfile.loading).done(MyProfile.ratings);
    }

    function getReviews(id) {
        var newReviewsParams = '?reviewed=' + id + '&sort=updatedAt%20desc&' + window.location.search.remove('?');
        if (newReviewsParams != reviewsParams) {
            Api.call('review', 'find', { params: newReviewsParams }, null, MyProfile.error, MyProfile.loading)
                .done(function (reviews) {
                    MyProfile.reviews(reviews.results);
                    MyProfile.reviewsPage(reviews.page);
                    MyProfile.reviewsPageSize(reviews.pageSize);
                    MyProfile.reviewsTotal(reviews.total);
                    reviewsParams = newReviewsParams;
                });
        }
    }

    function getData(id) {
        getUser(id);
        getListings(id);
        getRatings(id);
        getReviews(id);
    }

    function setTabUrls(vanity, id) {
        if (vanity || id) {
            MyProfile.listingsUrl('/user/profile/' + vanity + '/' + id + '/listings');
            MyProfile.reviewsUrl('/user/profile/' + vanity + '/' + id + '/reviews');
        } else {
            MyProfile.listingsUrl('/my/profile/listings');
            MyProfile.reviewsUrl('/my/profile/reviews');
        }
    }

    var MyProfile = {
        init: function () {},
        dispose: function () {
            userId = '';
            listingsParams = '';
            reviewsParams = '';
        },
        controllers: {
            '/': function () {
                setTabUrls();
                if (!Config.redirectIfNotLoggedIn()) {
                    getData(Config().user.id);
                }
            },
            '/listings': function () {
                MyProfile.tab('listings');
                setTabUrls();
                getData(Config().user.id);
            },
            '/reviews': function () {
                MyProfile.tab('reviews');
                setTabUrls();
                getData(Config().user.id);
            },
            '/:vanity/:id': function (vanity, id) {
                setTabUrls(vanity, id);
                getData(id);
            },
            '/:vanity/:id/listings': function (vanity, id) {
                MyProfile.tab('listings');
                setTabUrls(vanity, id);
                getData(id);
            },
            '/:vanity/:id/reviews': function (vanity, id) {
                MyProfile.tab('reviews');
                setTabUrls(vanity, id);
                getData(id);
            }
        },
        listings: ko.observableArray([]),
        listingsPage: ko.observable(0),
        listingsPageSize: ko.observable(0),
        listingsTotal: ko.observable(0),
        listingsUrl: ko.observable(''),
        ratings: ko.observable(null),
        reviews: ko.observableArray([]),
        reviewsPage: ko.observable(0),
        reviewsPageSize: ko.observable(0),
        reviewsTotal: ko.observable(0),
        reviewsUrl: ko.observable(''),
        tab: ko.observable(''),
        user: ko.observable(null),
        error: ko.observable(''),
        loading: ko.observable(false)
    };

    return MyProfile;

});
