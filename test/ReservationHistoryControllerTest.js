var request = require('supertest-as-promised');
var testHelper = require('./TestHelper.js');
var expect = require('chai').expect;

describe('ReservationHistoryController', function () {

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

    describe('#find', function () {

        it('should not allow from non logged-in user', function (done) {
            var agent = request.agent(sails.hooks.http.app);
            agent
                .get('/api/reservationHistory?reservation=1')
                .expect(403, done);
        });

        it('should not allow without param: reservation', function (done) {
            agentLoggedInAsTest1
                .get('/api/reservationHistory?user=1')
                .expect(400, done);
        });

        it('should not allow from non-related party', function (done) {
            agentLoggedInAsTest3
                .get('/api/reservationHistory?reservation=1')
                .expect(403, done);
        });

        it('should allow from requester', function (done) {
            agentLoggedInAsTest2
                .get('/api/reservationHistory?reservation=1')
                .expect(200, done);
        });

        it('should allow from owner', function (done) {
            agentLoggedInAsTest1
                .get('/api/reservationHistory?reservation=1')
                .expect(200, done);
        });
    });

    describe('#create triggers', function () {

        it('should log "created" history on reservation creation', function (done) {
            agentLoggedInAsTest2
                .post('/api/reservation')
                .send({
                    id: 101, // in-memory DB doesn't enforce ID uniqueness and doesn't autoincrement
                    requester: 2,
                    listing: 1,
                    datetimeFrom: '2017-01-01 00:00:00',
                    datetimeTo: '2017-01-03 00:00:00',
                    status: 'requested'
                })
                .expect(201, function (err) {
                    if (err) { return done(err); }

                    ReservationHistory.find( {
                        reservation: 101,
                        status: 'requested'
                    } )
                        .then(function (histories) {
                            expect(histories.length).to.equal(1);
                            return done();
                        })
                        .catch(function (err) {
                            return done(err);
                        });
                });
        });

        it('should log history on reservation status change', function (done) {
            agentLoggedInAsTest1
                .put('/api/reservation/markAsAccepted')
                .send({
                    id: 101
                })
                .expect(200, function (err) {
                    if (err) { return done(err); }

                    ReservationHistory.find( {
                        reservation: 101,
                        status: 'accepted'
                    } )
                        .then(function (histories) {
                            expect(histories.length).to.equal(1);
                            return done();
                        })
                        .catch(function (err) {
                            return done(err);
                        });
                });
        });
    });

});
