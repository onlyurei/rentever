var request = require('supertest-as-promised');
var testHelper = require('./TestHelper.js');
var expect = require('chai').expect;

describe('ListingController', function () {

    var agentLoggedInAsTest1;

    before(function (done) {
        agentLoggedInAsTest1 = request.agent(sails.hooks.http.app);

        async.parallel([
            function (callback) {
                testHelper.loginAgent(agentLoggedInAsTest1, 'test1', 'test1', callback);
            }
        ], function () {
            done();
        });
    });

    describe('#update', function () {

        it('should allow right categories', function (done) {
            agentLoggedInAsTest1
                .put('/api/listing/900')
                .send({
                    'title': 'listing-for-create-update-test-new',
                    'description': {'short': 'xxx', 'long': 'xxx'},
                    'price': {'daily': 100},
                    'deposit': {'required': true, 'amount': '15'},
                    'displayedAddress': 'x',
                    'unavailable': false,
                    'categories': ['sport', 'tools']
                })
                .expect(200, done);
        });

        it('should allow no categories', function (done) {
            agentLoggedInAsTest1
                .put('/api/listing/900')
                .send({
                    'title': 'listing-for-create-update-test-new',
                    'description': {'short': 'xxx', 'long': 'xxx'},
                    'price': {'daily': 100},
                    'deposit': {'required': true, 'amount': '15'},
                    'displayedAddress': 'x',
                    'unavailable': false
                })
                .expect(200, done);
        });

        it('should not allow wrong categories', function (done) {
            agentLoggedInAsTest1
                .put('/api/listing/900')
                .send({
                    'title': 'listing-for-create-update-test-new',
                    'description': {'short': 'xxx', 'long': 'xxx'},
                    'price': {'daily': 100},
                    'deposit': {'required': true, 'amount': '15'},
                    'displayedAddress': 'x',
                    'unavailable': false,
                    'categories': ['sport', 'stuff']
                })
                .expect(500, done);
        });

    });

    describe('#getCategories', function() {
        it('should get 5 categories', function (done) {
            request(sails.hooks.http.app)
                .get('/api/listing/getCategories')
                .expect(200)
                .end(function (err, result) {
                    if (err) { return done(err); }
                    expect(result.body.length).to.equal(5);
                    return done();
                });
        });
    });
});
