var expect = require('chai').expect;
var Promise = require('bluebird');
var request = require('supertest-as-promised');
var testHelper = require('./TestHelper.js');

describe('ReviewController', function () {

    var agentLoggedInAsTest1;
    var agentLoggedInAsTest2;

    before(function (done) {
        agentLoggedInAsTest1 = request.agent(sails.hooks.http.app);
        agentLoggedInAsTest2 = request.agent(sails.hooks.http.app);

        async.parallel([
            function (callback) {
                testHelper.loginAgent(agentLoggedInAsTest1, 'test1', 'test1', callback);
            },
            function (callback) {
                testHelper.loginAgent(agentLoggedInAsTest2, 'test2', 'test2', callback);
            }
        ], function () {
            done();
        });
    });

    describe('#getAverageForListing', function () {

        it('should take into account only reviews from the renter', function (done) {
            Promise.resolve()
                .then(function () {
                    return request(sails.hooks.http.app)
                        .get('/api/review/getAverageForListing?listingId=2')
                        .expect(200);
                })
                .then(function (response) {
                    return new Promise(function (resolve) {
                        expect(response.body.averageScore).to.equal(3.5);
                        expect(response.body.count).to.equal(2);
                        return resolve();
                    });
                })
                .done(function (prevResult, err) {
                    if (err) {
                        return done(err);
                    }
                    return done();
                });
        });

        it('should work when there are no reviews', function (done) {
            Promise.resolve()
                .then(function () {
                    return request(sails.hooks.http.app)
                        .get('/api/review/getAverageForListing?listingId=1')
                        .expect(200);
                })
                .then(function (response) {
                    return new Promise(function (resolve) {
                        expect(response.body.averageScore).to.equal(0);
                        expect(response.body.count).to.equal(0);
                        return resolve();
                    });
                })
                .done(function (prevResult, err) {
                    if (err) {
                        return done(err);
                    }
                    return done();
                });
        });
    });

    describe('#getAverageForUser', function () {

        it('should return average', function (done) {
            Promise.resolve()
                .then(function () {
                    return request(sails.hooks.http.app)
                        .get('/api/review/getAverageForUser?userId=1')
                        .expect(200);
                })
                .then(function (response) {
                    return new Promise(function (resolve) {
                        expect(response.body.averageScore).to.equal(3.5);
                        expect(response.body.count).to.equal(2);
                        return resolve();
                    });
                })
                .done(function (prevResult, err) {
                    if (err) {
                        return done(err);
                    }
                    return done();
                });
        });

        it('should work when there are no reviews', function (done) {
            Promise.resolve()
                .then(function () {
                    return request(sails.hooks.http.app)
                        .get('/api/review/getAverageForUser?userId=3')
                        .expect(200);
                })
                .then(function (response) {
                    return new Promise(function (resolve) {
                        expect(response.body.averageScore).to.equal(0);
                        expect(response.body.count).to.equal(0);
                        return resolve();
                    });
                })
                .done(function (prevResult, err) {
                    if (err) {
                        return done(err);
                    }
                    return done();
                });
        });

    });

    describe('#limitToOneReview', function () {

        it('should not be allowed to leave more than one review per reservation', function (done) {
            Promise.resolve()
                .then(function () {
                    return agentLoggedInAsTest2
                        .post('/api/review')
                        .send({
                            reviewer: 2,
                            reviewed: 1,
                            reservation: 600,
                            rating: 5,
                            comment: 'yay'
                        })
                        .expect(201);
                })
                .then(function () {
                    return agentLoggedInAsTest2
                        .post('/api/review')
                        .send({
                            reviewer: 2,
                            reviewed: 1,
                            reservation: 600,
                            rating: 4,
                            comment: 'yay2'
                        })
                        .expect(403);
                })
                .then(function () {
                    return agentLoggedInAsTest1
                        .post('/api/review')
                        .send({
                            reviewer: 1,
                            reviewed: 2,
                            reservation: 600,
                            rating: 4,
                            comment: 'yay3'
                        })
                        .expect(201);
                })
                .done(function (prevResult, err) {
                    if (err) {
                        return done(err);
                    }
                    return done();
                });
        });
    });
});