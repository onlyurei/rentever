var request = require('supertest-as-promised');
var testHelper = require('./TestHelper.js');

describe('Policies Test', function () {

    describe('#allowedToReview', function () {

        var agentLoggedInAsTest1;
        var agentLoggedInAsTest2;
        var agentLoggedInAsTest3;

        before(function (done) {
            agentLoggedInAsTest1 = request.agent(sails.hooks.http.app);
            agentLoggedInAsTest2 = request.agent(sails.hooks.http.app);
            agentLoggedInAsTest3 = request.agent(sails.hooks.http.app);

            async.parallel([
                function(callback){
                    testHelper.loginAgent(agentLoggedInAsTest1, 'test1', 'test1', callback);
                },
                function(callback){
                    testHelper.loginAgent(agentLoggedInAsTest2, 'test2', 'test2', callback);
                },
                function(callback){
                    testHelper.loginAgent(agentLoggedInAsTest3, 'test3', 'test3', callback);
                }
            ], function(){
                done();
            });
        });

        it('should not allow review from a user who is not logged in', function it(done) {
            var agent = request.agent(sails.hooks.http.app);
            agent
                .post('/api/review')
                .send({
                    reviewer: 1,
                    reviewed: 1,
                    reservation: 1,
                    rating: 5,
                    comment: 'whatever'
                })
                .expect(403, done);
        });

        it('should not allow review from a user who did not participate in transaction', function (done) {
            agentLoggedInAsTest3
                .post('/api/review')
                .send({
                    reviewer: 3,
                    reviewed: 1,
                    reservation: 1,
                    rating: 5,
                    comment: 'whatever'
                })
                .expect(403, done);
        });

        it('should not allow review from imposers', function (done) {
            agentLoggedInAsTest1
                .post('/api/review')
                .send({
                    reviewer: 2,
                    reviewed: 1,
                    reservation: 1,
                    rating: 5,
                    comment: 'whatever'
                })
                .expect(403, done);
        });

        it('should not allow review for himself', function (done) {
            agentLoggedInAsTest1
                .post('/api/review')
                .send({
                    reviewer: 1,
                    reviewed: 1,
                    reservation: 1,
                    rating: 5,
                    comment: 'whatever'
                })
                .expect(403, done);
        });

        it('should not allow review with rating < 0', function (done) {
            agentLoggedInAsTest1
                .post('/api/review')
                .send({
                    reviewer: 1,
                    reviewed: 2,
                    reservation: 27,
                    rating: -1,
                    comment: 'whatever'
                })
                .expect(400, done);
        });

        it('should not allow review with rating > 5', function (done) {
            agentLoggedInAsTest1
                .post('/api/review')
                .send({
                    reviewer: 1,
                    reviewed: 2,
                    reservation: 27,
                    rating: 6,
                    comment: 'whatever'
                })
                .expect(400, done);
        });

        it('should not allow review unless status is "returned"', function (done) {
            agentLoggedInAsTest1
                .post('/api/review')
                .send({
                    reviewer: 1,
                    reviewed: 2,
                    reservation: 1,
                    rating: 5,
                    comment: 'whatever'
                })
                .expect(403, done);
        });

        it('should allow review when everything is OK', function (done) {
            agentLoggedInAsTest1
                .post('/api/review')
                .send({
                    reviewer: 1,
                    reviewed: 2,
                    reservation: 27,
                    rating: 5,
                    comment: 'whatever'
                })
                .expect(201, done);
        });
    });
});
