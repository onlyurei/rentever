var request = require('supertest-as-promised');
var testHelper = require('./TestHelper.js');

describe('ListingMessageController', function () {

    var agentLoggedInAsTest1;
    var agentLoggedInAsTest2;
    var agentLoggedInAsTest3;

    before(function (done) {
        agentLoggedInAsTest1 = request.agent(sails.hooks.http.app);
        agentLoggedInAsTest2 = request.agent(sails.hooks.http.app);
        agentLoggedInAsTest3 = request.agent(sails.hooks.http.app);

        async.parallel([
            function (callback) {
                testHelper.loginAgent(agentLoggedInAsTest1, 'test1', 'test1', callback);
            },
            function (callback) {
                testHelper.loginAgent(agentLoggedInAsTest2, 'test2', 'test2', callback);
            },
            function (callback) {
                testHelper.loginAgent(agentLoggedInAsTest3, 'test3', 'test3', callback);
            }
        ], function () {
            done();
        });
    });

    describe('#create', function () {

        it('should not allow from non logged-in user', function (done) {
            var agent = request.agent(sails.hooks.http.app);
            agent
                .post('/api/listingMessage')
                .send({
                    listing: 1,
                    sender: 1,
                    message: 'test'
                })
                .expect(403, done);
        });

        it('should allow from logged-in (yet non-owner) user', function (done) {
            agentLoggedInAsTest3
                .post('/api/listingMessage')
                .send({
                    listing: 1,
                    sender: 3,
                    message: 'test'
                })
                .expect(201, done);
        });

        it('should not allow from users pretending to be someone else', function (done) {
            agentLoggedInAsTest1
                .post('/api/listingMessage')
                .send({
                    listing: 1,
                    sender: 2,
                    message: 'test'
                })
                .expect(403, done);
        });
    });

});
