var moment = require('moment');
var expect = require('chai').expect;
var Promise = require('bluebird');
var request = require('supertest-as-promised');
var reservationController = require('../api/controllers/ReservationController.js');
var testHelper = require('./TestHelper.js');

describe('ReservationController', function () {

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

    describe('#_getDatesInRange', function () {

        it('should get dates within month', function () {
            var result = reservationController._getDatesInRange('2014-09-01', '2014-09-02');
            expect(result.length).to.equal(2);
            expect(result[0]).to.equal('2014-09-01');
            expect(result[1]).to.equal('2014-09-02');
        });

        it('should get one date range', function () {
            var result = reservationController._getDatesInRange('2014-09-01', '2014-09-01');
            expect(result.length).to.equal(1);
            expect(result[0]).to.equal('2014-09-01');
        });

        it('should get dates between months', function () {
            var result = reservationController._getDatesInRange('2014-09-25', '2014-10-05');
            expect(result.length).to.equal(11);
            expect(result[0]).to.equal('2014-09-25');
            expect(result[10]).to.equal('2014-10-05');
        });

        it('should get dates between years', function () {
            var result = reservationController._getDatesInRange('2014-12-30', '2015-01-02');
            expect(result.length).to.equal(4);
            expect(result[0]).to.equal('2014-12-30');
            expect(result[3]).to.equal('2015-01-02');
        });
    });

    describe('#_alphaSortByProperty', function () {
        it('should sort dates (YYYY-MM-DD)', function () {
            var result = reservationController._alphaSortByProperty([
                { date: '2014-01-01', order: 2 },
                { date: '2014-12-31', order: 4 },
                { date: '2014-10-01', order: 3 },
                { date: '2015-07-07', order: 5 },
                { date: '2013-07-07', order: 1 }
            ], 'date');
            expect(result[0].order).to.equal(1);
            expect(result[0].date).to.equal('2013-07-07');

            expect(result[1].order).to.equal(2);
            expect(result[2].order).to.equal(3);
            expect(result[3].order).to.equal(4);

            expect(result[4].order).to.equal(5);
            expect(result[4].date).to.equal('2015-07-07');
        });
    });

    describe('#getReservedDatesForPublicCalendar', function () {

        it('anonymous user should not see others\' non-accepted requests', function (done) {
            request(sails.hooks.http.app)
                .get('/api/reservation/getReservedDatesForPublicCalendar?listingId=1&dateFrom=2014-10-19&dateTo=2014-10-21')
                .expect(200)
                .end(function (err, result) {
                    if (err) { return done(err); }
                    expect(result.body.length).to.equal(0);
                    return done();
                });
        });

        it('should return 6 ordered "reserved" days (2 of them half-reserved) for January 2015 for listing 1', function (done) {
            request(sails.hooks.http.app)
                .get('/api/reservation/getReservedDatesForPublicCalendar?listingId=1&dateFrom=2015-01-01&dateTo=2015-01-31')
                .expect(200)
                .end(function (err, result) {
                    if (err) { return done(err); }
                    expect(result.body.length).to.equal(6);
                    expect(result.body[0].date).to.equal('2015-01-05');
                    expect(result.body[0].status).to.equal('HALF_RESERVED');
                    expect(result.body[1].date).to.equal('2015-01-06');
                    expect(result.body[1].status).to.equal('RESERVED');
                    expect(result.body[5].date).to.equal('2015-01-10');
                    expect(result.body[5].status).to.equal('HALF_RESERVED');
                    done();
                });
        });

        it('should return 0 "reserved" days if start date is 2016-02-01 and end date is not specified for listing 1', function (done) {
            request(sails.hooks.http.app)
                .get('/api/reservation/getReservedDatesForPublicCalendar?listingId=1&dateFrom=2016-02-01')
                .expect(200)
                .end(function (err, res) {
                    if (err) { return done(err); }
                    expect(res.body.length).to.equal(0);
                    done();
                });
        });

        it('should return 2 "reserved" days if start date is 2015-02-01 and end date is not specified for listing 1', function (done) {
            request(sails.hooks.http.app)
                .get('/api/reservation/getReservedDatesForPublicCalendar?listingId=1&dateFrom=2015-02-01')
                .expect(200)
                .end(function (err, result) {
                    if (err) { return done(err); }
                    expect(result.body.length).to.equal(2);
                    expect(result.body[0].date).to.equal('2015-02-05');
                    expect(result.body[0].status).to.equal('RESERVED');
                    expect(result.body[1].date).to.equal('2015-03-05');
                    expect(result.body[1].status).to.equal('RESERVED');
                    done();
                });
        });

        it('should return 0 days for non-logged-in user for 2014-10-19 - 2014-10-21', function (done) {
            request(sails.hooks.http.app)
                .get('/api/reservation/getReservedDatesForPublicCalendar?listingId=1&dateFrom=2014-10-19&dateTo=2014-10-21')
                .expect(200)
                .end(function (err, result) {
                    if (err) { return done(err); }
                    expect(result.body.length).to.equal(0);
                    done();
                });
        });

        it('should return 0 days for user "test1" for 2014-10-19 - 2014-10-21', function (done) {
            agentLoggedInAsTest1
                .get('/api/reservation/getReservedDatesForPublicCalendar?listingId=1&dateFrom=2014-10-19&dateTo=2014-10-21')
                .expect(200)
                .end(function (err, result) {
                    if (err) { return done(err); }
                    expect(result.body.length).to.equal(0);
                    done();
                });
        });

        it('should return 3 "pending" days for user "test2" for 2014-10-19 - 2014-10-21', function (done) {
            agentLoggedInAsTest2
                .get('/api/reservation/getReservedDatesForPublicCalendar?listingId=1&dateFrom=2014-10-19&dateTo=2014-10-21')
                .expect(200)
                .end(function (err, result) {
                    if (err) { return done(err); }
                    expect(result.body.length).to.equal(3);
                    expect(result.body[0].date).to.equal('2014-10-19');
                    expect(result.body[0].status).to.equal('PENDING_APPROVAL');
                    expect(result.body[0].note).to.equal('Your request is pending approval.');

                    expect(result.body[1].date).to.equal('2014-10-20');
                    expect(result.body[1].status).to.equal('PENDING_APPROVAL');
                    expect(result.body[1].note).to.equal('Your request is pending approval.');

                    expect(result.body[2].date).to.equal('2014-10-21');
                    expect(result.body[2].status).to.equal('PENDING_APPROVAL');
                    expect(result.body[2].note).to.equal('Your request is pending approval.');
                    done();
                });
        });

        it('should return 2 "pending" days for user "test2" from 2015-12-01 to [not-specified] ', function (done) {
            agentLoggedInAsTest2
                .get('/api/reservation/getReservedDatesForPublicCalendar?listingId=1&dateFrom=2015-12-01')
                .expect(200)
                .end(function (err, result) {
                    if (err) { return done(err); }
                    expect(result.body.length).to.equal(2);
                    expect(result.body[0].date).to.equal('2015-12-10');
                    expect(result.body[0].status).to.equal('PENDING_APPROVAL');
                    expect(result.body[1].date).to.equal('2015-12-11');
                    expect(result.body[1].status).to.equal('PENDING_APPROVAL');
                    done();
                });
        });
    });

    describe('#getAvailabilityForDatetimeRange', function () {

        it('should return true when there are no reservations', function (done) {
            agentLoggedInAsTest2
                .get('/api/reservation/getAvailabilityForDatetimeRange?listingId=1&datetimeFrom=2013-01-01 12:00:00&datetimeTo=2013-01-31 12:00:00')
                .expect(200)
                .end(function (err, result) {
                    if (err) { return done(err); }
                    expect(result.res.body).to.equal(true);
                    done();
                });
        });

        it('should return false when there are reservations (for Feb 2015)', function (done) {
            agentLoggedInAsTest2
                .get('/api/reservation/getAvailabilityForDatetimeRange?listingId=1&datetimeFrom=2015-02-01 00:00:00&datetimeTo=2015-03-01 23:59:59')
                .expect(200)
                .end(function (err, result) {
                    if (err) { return done(err); }
                    expect(result.res.body).to.equal(false);
                    done();
                });
        });

        it('should return true when trying to reserve till morning of 2015-01-05 (half-reserved starting from 13:00)', function (done) {
            agentLoggedInAsTest2
                .get('/api/reservation/getAvailabilityForDatetimeRange?listingId=1&datetimeFrom=2015-01-01 00:00:00&datetimeTo=2015-01-05 09:00:00')
                .expect(200)
                .end(function (err, result) {
                    if (err) { return done(err); }
                    expect(result.res.body).to.equal(true);
                    done();
                });
        });

        it('should return false when trying to reserve till evening of 2015-01-05 (half-reserved starting from 13:00)', function (done) {
            agentLoggedInAsTest2
                .get('/api/reservation/getAvailabilityForDatetimeRange?listingId=1&datetimeFrom=2015-01-01 00:00:00&datetimeTo=2015-01-05 18:00:00')
                .expect(200)
                .end(function (err, result) {
                    if (err) { return done(err); }
                    expect(result.res.body).to.equal(false);
                    done();
                });
        });

        it('should return true when test1 trying to reserve 2014-10-20 (already requested by user test2)', function (done) {
            agentLoggedInAsTest1
                .get('/api/reservation/getAvailabilityForDatetimeRange?listingId=1&datetimeFrom=2014-10-20 00:00:00&datetimeTo=2014-10-20 18:00:00')
                .expect(200)
                .end(function (err, result) {
                    if (err) { return done(err); }
                    expect(result.res.body).to.equal(true);
                    done();
                });
        });

        it('should return false when test2 trying to reserve 2014-10-20 (already requested by user test2)', function (done) {
            agentLoggedInAsTest2
                .get('/api/reservation/getAvailabilityForDatetimeRange?listingId=1&datetimeFrom=2014-10-20 00:00:00&datetimeTo=2014-10-20 18:00:00')
                .expect(200)
                .end(function (err, result) {
                    if (err) { return done(err); }
                    expect(result.res.body).to.equal(false);
                    done();
                });
        });
    });

    describe('#reserveForDatetimeRange', function () {

        it('should fail when not enough params are passed)', function (done) {
            agentLoggedInAsTest2
                .post('/api/reservation/reserveForDatetimeRange')
                .send({
                    listingId: 1
                })
                .expect(400, done);
        });

        it('should fail when datetime format is not valid)', function (done) {
            agentLoggedInAsTest2
                .post('/api/reservation/reserveForDatetimeRange')
                .send({
                    listingId: 1,
                    datetimeFrom: '2017-01-01 00:00:00',
                    datetimeTo: '2017-01-02 00:00:00'
                })
                .expect(400, done);
        });

        it('should fail when start date is after end date)', function (done) {
            agentLoggedInAsTest2
                .post('/api/reservation/reserveForDatetimeRange')
                .send({
                    listingId: 1,
                    datetimeFrom: '2015-02-02T00:00:00.000Z',
                    datetimeTo: '2015-02-01T00:00:00.000Z'
                })
                .expect(400, done);
        });

        it('should fail when interval between start date and end date is less than 1 hour)', function (done) {
            agentLoggedInAsTest2
                .post('/api/reservation/reserveForDatetimeRange')
                .send({
                    listingId: 1,
                    datetimeFrom: '2015-02-01T00:00:00.000Z',
                    datetimeTo: '2015-02-01T00:59:59.000Z'
                })
                .expect(400, done);
        });

        it('should return true when interval between start date and end date is equal to 1 hour)', function (done) {
            agentLoggedInAsTest2
                .post('/api/reservation/reserveForDatetimeRange')
                .send({
                    listingId: 1,
                    datetimeFrom: '2016-02-01T00:00:00.000Z',
                    datetimeTo: '2016-02-01T01:00:00.000Z'
                })
                .expect(200)
                .end(function (err, result) {
                    if (err) { return done(err); }
                    expect(result.res.text).to.equal('1');
                    done();
                });
        });

        it('should return true when interval between start date and end date is greater than 1 hour)', function (done) {
            agentLoggedInAsTest2
                .post('/api/reservation/reserveForDatetimeRange')
                .send({
                    listingId: 1,
                    datetimeFrom: '2016-02-01T02:00:00.000Z',
                    datetimeTo: '2016-02-01T03:30:00.000Z'
                })
                .expect(200)
                .end(function (err, result) {
                    if (err) { return done(err); }
                    expect(result.res.text).to.equal('2');
                    done();
                });
        });

        it('should return true when test2 trying to reserve 2016-10-20', function (done) {
            agentLoggedInAsTest2
                .post('/api/reservation/reserveForDatetimeRange')
                .send({
                    listingId: 1,
                    datetimeFrom: '2016-10-20T00:00:00.000Z',
                    datetimeTo: '2016-10-20T18:00:00.000Z'
                })
                .expect(200)
                .end(function (err, result) {
                    if (err) { return done(err); }
                    expect(result.res.text).to.equal('3');
                    done();
                });
        });

        it('should return false when there are reservations (for Feb 2015)', function (done) {
            agentLoggedInAsTest2
                .post('/api/reservation/reserveForDatetimeRange')
                .send({
                    listingId: 1,
                    datetimeFrom: '2015-02-01T00:00:00.000Z',
                    datetimeTo: '2015-03-01T23:59:59.000Z'
                })
                .expect(200)
                .end(function (err, result) {
                    if (err) { return done(err); }
                    expect(result.res.body).to.equal(false);
                    done();
                });
        });

        it('should return false when test2 trying to reserve 2014-10-20 (already requested by user test2)', function (done) {
            agentLoggedInAsTest2
                .post('/api/reservation/reserveForDatetimeRange')
                .send({
                    listingId: 1,
                    datetimeFrom: '2014-10-20T00:00:00.000Z',
                    datetimeTo: '2014-10-20T18:00:00.000Z'
                })
                .expect(200)
                .end(function (err, result) {
                    if (err) { return done(err); }
                    expect(result.res.body).to.equal(false);
                    done();
                });
        });
    });

    describe('#markAsCancelled', function () {

        it('should only allow (from requester + status requested/accepted) or (from owner + status accepted)', function (done) {
            Promise.resolve()
                .then(function () {
                    // unrelated user
                    return agentLoggedInAsTest2
                        .put('/api/reservation/markAsCancelled')
                        .send({ id: 20 })
                        .expect(403);
                })
                .then(function () {
                    // requester & status: requested
                    return agentLoggedInAsTest3
                        .put('/api/reservation/markAsCancelled')
                        .send({ id: 20 })
                        .expect(200);
                })
                .then(function () {
                    return Reservation.update({ id: 20 }, { status: 'accepted' });
                })
                .then(function () {
                    // owner & status: requested - should NOT BE ALLOWED
                    return agentLoggedInAsTest3
                        .put('/api/reservation/markAsCancelled')
                        .send({ id: 20 })
                        .expect(200);
                })
                .then(function () {
                    return Reservation.update({ id: 20 }, { status: 'requested' });
                })
                .then(function () {
                    // owner & status: requested - should NOT BE ALLOWED
                    return agentLoggedInAsTest1
                        .put('/api/reservation/markAsCancelled')
                        .send({ id: 20 })
                        .expect(403);
                })
                .then(function () {
                    return Reservation.update({ id: 20 }, { status: 'accepted' });
                })
                .then(function () {
                    // owner & status: accepted
                    return agentLoggedInAsTest1
                        .put('/api/reservation/markAsCancelled')
                        .send({ id: 20 })
                        .expect(200);
                })
                .then(function () {
                    // status: cancelled
                    return agentLoggedInAsTest1
                        .put('/api/reservation/markAsCancelled')
                        .send({ id: 20 })
                        .expect(403);
                })
                .done(function (prevResult, err) {
                    if(err) { return done(err); }
                    return done();
                });
        });
    });

    describe('#markAsDeclined', function () {

        it('should only allow from owner and status requested', function (done) {

            Promise.resolve()
                .then(function () {
                    // unrelated user
                    return agentLoggedInAsTest2
                        .put('/api/reservation/markAsDeclined')
                        .send({ id: 21 })
                        .expect(403);
                })
                .then(function() {
                    // requester
                    return agentLoggedInAsTest3
                        .put('/api/reservation/markAsDeclined')
                        .send({ id: 21 })
                        .expect(403);
                })
                .then(function() {
                    return Reservation.update({ id: 21 }, { status: 'requested' });
                })
                .then(function() {
                    // owner
                    return agentLoggedInAsTest1
                        .put('/api/reservation/markAsDeclined')
                        .send({ id: 21 })
                        .expect(200);
                })
                .then(function() {
                    // status: accepted
                    return agentLoggedInAsTest1
                        .put('/api/reservation/markAsDeclined')
                        .send({ id: 21 })
                        .expect(403);
                })
                .done(function (prevResult, err) {
                    if(err) { return done(err); }
                    return done();
                });
        });
    });

    describe('#markAsAccepted', function () {

        it('should only allow from owner and status requested', function (done) {

            Promise.resolve()
                .then(function () {
                    // unrelated user
                    return agentLoggedInAsTest2
                        .put('/api/reservation/markAsAccepted')
                        .send({ id: 22 })
                        .expect(403);
                })
                .then(function () {
                    // requester
                    return agentLoggedInAsTest3
                        .put('/api/reservation/markAsAccepted')
                        .send({ id: 22 })
                        .expect(403);
                })
                .then(function () {
                    return Reservation.update({ id: 22 }, { status: 'requested' });
                })
                .then(function () {
                    // owner
                    return agentLoggedInAsTest1
                        .put('/api/reservation/markAsAccepted')
                        .send({ id: 22 })
                        .expect(200);
                })
                .then(function () {
                    // status: accepted
                    return agentLoggedInAsTest1
                        .put('/api/reservation/markAsAccepted')
                        .send({ id: 22 })
                        .expect(403);
                })
                .done(function (prevResult, err) {
                    if(err) { return done(err); }
                    return done();
                });
        });

        it('should generate pickupCode and returnCode', function (done) {
            var pickupCode, returnCode;
            async.waterfall([
                function (callback) {
                    // owner
                    agentLoggedInAsTest1
                        .put('/api/reservation/markAsAccepted')
                        .send({
                            id: 25
                        })
                        .expect(200, function (err) {
                            if (err) { return callback(err); }
                            return callback();
                        });
                },
                function (callback) {
                    Reservation.findOne(25)
                        .then(function (reservation) {
                            pickupCode = reservation.pickupCode;
                            returnCode = reservation.returnCode;
                            return callback();
                        })
                        .catch(function (err) {
                            return callback(err);
                        });
                }
            ], function (err) {
                if (err) {
                    return done(err);
                }
                expect(pickupCode).to.be.not.an('undefined');
                expect(returnCode).to.be.not.an('undefined');
                expect(pickupCode.length).to.equal(4);
                expect(returnCode.length).to.equal(4);
                return done();
            });
        });

        it('should decline conflicting pending reservations', function (done) {
            Promise.resolve()
                .then(function () {
                    return agentLoggedInAsTest1
                        .put('/api/reservation/markAsAccepted')
                        .send({
                            id: 500
                        })
                        .expect(200);
                })
                .then(function () {
                    return Reservation.find({
                        or : [
                            { id: 501 },
                            { id: 502 }
                        ]
                    });
                })
                .then(function (reservations) {
                    return new Promise(function (resolve) {
                        expect(reservations.length).to.equal(2);
                        expect(reservations[0].status).to.equal('declined');
                        expect(reservations[1].status).to.equal('declined');
                        return resolve();
                    });
                })
                .done(function (prevResult, err) {
                    if(err) { return done(err); }
                    return done();
                });
        });
    });

    describe('#markAsPickedUp', function () {

        it('should not allow from unrelated user', function (done) {
            agentLoggedInAsTest2
                .put('/api/reservation/markAsPickedUp')
                .send({ id: 23, code: 'K1' })
                .expect(403, done);
        });

        it('should not allow from requester', function (done) {
            agentLoggedInAsTest3
                .put('/api/reservation/markAsPickedUp')
                .send({ id: 23, code: 'K1' })
                .expect(403, done);
        });

        it('should not allow with a wrong code', function (done) {
            agentLoggedInAsTest1
                .put('/api/reservation/markAsPickedUp')
                .send({ id: 23, code: 'KK' })
                .expect(403, done);
        });

        it('should only allow from owner and status accepted', function (done) {
            agentLoggedInAsTest1
                .put('/api/reservation/markAsPickedUp')
                .send({ id: 23, code: 'K1' })
                .expect(200, done);
        });

        it('should not allow when status !accepted', function (done) {
            agentLoggedInAsTest1
                .put('/api/reservation/markAsPickedUp')
                .send({ id: 23, code: 'K1' })
                .expect(403, done);
        });
    });

    describe('#markAsReturned', function () {

        it('should not allow from unrelated user', function (done) {
            agentLoggedInAsTest2
                .put('/api/reservation/markAsReturned')
                .send({ id: 24, code: 'K2' })
                .expect(403, done);
        });

        it('should not allow from requester', function (done) {
            agentLoggedInAsTest3
                .put('/api/reservation/markAsReturned')
                .send({ id: 24, code: 'K2' })
                .expect(403, done);
        });

        it('should not allow with a wrong code', function (done) {
            agentLoggedInAsTest1
                .put('/api/reservation/markAsReturned')
                .send({ id: 24, code: 'KK' })
                .expect(403, done);
        });

        it('should only allow from owner and status picked_up', function (done) {
            agentLoggedInAsTest1
                .put('/api/reservation/markAsReturned')
                .send({ id: 24, code: 'K2' })
                .expect(200, done);
        });

        it('should not allow when status !picked_up', function (done) {
            agentLoggedInAsTest1
                .put('/api/reservation/markAsReturned')
                .send({ id: 24, code: 'K2' })
                .expect(403, done);
        });
    });

    describe('#getPickupCode', function () {

        it('should not allow from unrelated & owner', function (done) {
            async.parallel([
                function (callback) {
                    // unrelated user
                    agentLoggedInAsTest2
                        .get('/api/reservation/getPickupCode?id=26')
                        .expect(403, function (err) {
                            if (err) { return callback(err); }
                            return callback();
                        });
                },
                function (callback) {
                    // owner
                    agentLoggedInAsTest1
                        .get('/api/reservation/getPickupCode?id=26')
                        .expect(403, function (err) {
                            if (err) { return callback(err); }
                            return callback();
                        });
                }
            ], function (err) {
                if (err) {
                    return done(err);
                }
                return done();
            });
        });

        it('should allow from requester', function (done) {
            agentLoggedInAsTest3
                .get('/api/reservation/getPickupCode?id=26')
                .expect(200)
                .end(function (err, result) {
                    if (err) { return done(err); }
                    expect(result.text).to.equal('A1');
                    done();
                });
        });
    });

    describe('#getReturnCode', function () {

        it('should not allow from unrelated & owner', function (done) {
            async.parallel([
                function (callback) {
                    // unrelated user
                    agentLoggedInAsTest2
                        .get('/api/reservation/getReturnCode?id=26')
                        .expect(403, function (err) {
                            if (err) { return callback(err); }
                            return callback();
                        });
                },
                function (callback) {
                    // owner
                    agentLoggedInAsTest1
                        .get('/api/reservation/getReturnCode?id=26')
                        .expect(403, function (err) {
                            if (err) { return callback(err); }
                            return callback();
                        });
                }
            ], function (err) {
                if (err) {
                    return done(err);
                }
                return done();
            });
        });

        it('should allow from requester', function (done) {
            agentLoggedInAsTest3
                .get('/api/reservation/getReturnCode?id=26')
                .expect(200)
                .end(function (err, result) {
                    if (err) { return done(err); }
                    expect(result.text).to.equal('B2');
                    done();
                });
        });
    });

    describe('#listingClone', function () {

        it('should be created when reservation is created', function (done) {
            Promise.resolve()
                .then(function () {
                    return agentLoggedInAsTest2
                        .post('/api/reservation/reserveForDatetimeRange')
                        .send({
                            listingId: 2,
                            datetimeFrom: '2013-01-01T00:00:00.000Z',
                            datetimeTo: '2013-01-01T01:00:00.000Z'
                        })
                        .expect(200);
                })
                .then(function () {
                    return new Promise(function (resolve, reject) {
                        agentLoggedInAsTest2
                            .get('/api/reservation?requester=2&listing=2')
                            .expect(200)
                            .end(function (err, result) {
                                if (err) { return reject(err); }
                                expect(result.res.body.results[0].listingClone.id).to.equal(2);
                                expect(result.res.body.results[0].listingClone.images.length).to.equal(2);
                                expect(result.res.body.results[0].listingClone.images[0].caption).to.equal('first image');
                                expect(result.res.body.results[0].listingClone.images[1].caption).to.equal('second image');
                                expect(result.res.body.results[0].listingClone.owner.id).to.equal(1);
                                resolve();
                            });
                    });
                })
                .done(function (prevResult, err) {
                    if(err) { return done(err); }
                    return done();
                });
        });

    });

    describe('#estimatedPriceCalculation', function () {

        it('should charge for x+1 days when duration x.z days (z is greater than 0)', function (done) {
            Promise.resolve()
                .then(function () {
                    return agentLoggedInAsTest2
                        .post('/api/reservation/reserveForDatetimeRange')
                        .send({
                            listingId: 1,
                            datetimeFrom: '2016-09-01T00:00:00.000Z',
                            datetimeTo: '2016-09-02T14:00:00.000Z'
                        })
                        .expect(200);
                })
                .then(function () {
                    return Reservation.find({
                        listing: 1,
                        datetimeFrom: {
                            '>=': moment('2016-09-01T00:00:00.000Z').toDate()
                        },
                        datetimeTo: {
                            '<=': moment('2016-09-02T14:00:00.000Z').toDate()
                        }
                    });
                })
                .then(function (reservations) {
                    return new Promise(function (resolve) {
                        expect(reservations[0].estimatedPrice).to.equal(20);
                        return resolve();
                    });
                })
                .done(function (prevResult, err) {
                    if(err) { return done(err); }
                    return done();
                });

        });

        it('should charge for x days when duration x.0 days', function (done) {
            Promise.resolve()
                .then(function () {
                    return agentLoggedInAsTest2
                        .post('/api/reservation/reserveForDatetimeRange')
                        .send({
                            listingId: 1,
                            datetimeFrom: '2016-09-03T00:00:00.000Z',
                            datetimeTo: '2016-09-03T24:00:00.000Z'
                        })
                        .expect(200);
                })
                .then(function () {
                    return Reservation.find({
                        listing: 1,
                        datetimeFrom: {
                            '>=': moment('2016-09-03T00:00:00.000Z').toDate()
                        },
                        datetimeTo: {
                            '<=': moment('2016-09-03T24:00:00.000Z').toDate()
                        }
                    });
                })
                .then(function (reservations) {
                    return new Promise(function (resolve) {
                        expect(reservations[0].estimatedPrice).to.equal(10);
                        return resolve();
                    });
                })
                .done(function (prevResult, err) {
                    if(err) { return done(err); }
                    return done();
                });

        });
    });

    describe('#actualPriceCalculation', function () {

        it('should never be less than estimated charge', function (done) {

            Promise.resolve()
                .then(function () {
                    return ReservationHistory.findOne(200);
                })
                .then(function (history) {
                    return ReservationHistory.update(history.id, {
                        createdAt: moment().subtract(2, 'days').toDate()
                    });
                })
                .then(function () {
                    return agentLoggedInAsTest1
                        .put('/api/reservation/markAsReturned')
                        .send({ id: 200, code: '200' })
                        .expect(200);
                })
                .then(function () {
                    return Reservation.findOne(200);
                })
                .then(function (reservation) {
                    return new Promise(function (resolve) {
                        expect(reservation.actualPrice).to.equal(30);
                        return resolve();
                    });
                })
                .done(function (prevResult, err) {
                    if(err) { return done(err); }
                    return done();
                });
        });

        it('can be bigger than estimated charge', function (done) {

            Promise.resolve()
                .then(function () {
                    return ReservationHistory.findOne(201);
                })
                .then(function (history) {
                    return ReservationHistory.update(history.id, {
                        createdAt: moment().subtract(4, 'days').toDate()
                    });
                })
                .then(function () {
                    return agentLoggedInAsTest1
                        .put('/api/reservation/markAsReturned')
                        .send({ id: 201, code: '201' })
                        .expect(200);
                })
                .then(function () {
                    return Reservation.findOne(201);
                })
                .then(function (reservation) {
                    return new Promise(function (resolve) {
                        expect(reservation.actualPrice).to.equal(40);
                        return resolve();
                    });
                })
                .done(function (prevResult, err) {
                    if(err) { return done(err); }
                    return done();
                });
        });
    });

    describe('#getEstimatedPrice', function () {

        it('should work for any user', function (done) {

            Promise.resolve()
                .then(function () {
                    return request(sails.hooks.http.app)
                        .get('/api/reservation/getEstimatedPrice?listingId=1&datetimeFrom=2014-01-01T00:00:00.000Z&datetimeTo=2014-01-02T19:00:00.000Z')
                        .expect(200);
                })
                .then(function (response) {
                    return new Promise(function (resolve) {
                        expect(response.text).to.equal('20');
                        return resolve();
                    });
                })
                .done(function (prevResult, err) {
                    if(err) { return done(err); }
                    return done();
                });
        });
    });

    describe('#getConflictingReservations', function () {

        it('should not allow non-logged in users', function (done) {
            request(sails.hooks.http.app)
                .get('/api/reservation/getConflictingReservations?reservationId=400')
                .expect(403, done);
        });

        it('should not allow non-owner users', function (done) {
            agentLoggedInAsTest2
                .get('/api/reservation/getConflictingReservations?reservationId=400')
                .expect(403, done);
        });

        it('should return 0 if there are no conflicting reservations', function (done) {
            Promise.resolve()
                .then(function () {
                    return agentLoggedInAsTest1
                        .get('/api/reservation/getConflictingReservations?reservationId=400')
                        .expect(200);
                })
                .then(function (response) {
                    return new Promise(function (resolve) {
                        expect(response.text).to.equal('0');
                        return resolve();
                    });
                })
                .done(function (prevResult, err) {
                    if(err) { return done(err); }
                    return done();
                });
        });

        it('should return # of conflicting reservations', function (done) {
            Promise.resolve()
                .then(function () {
                    return agentLoggedInAsTest1
                        .get('/api/reservation/getConflictingReservations?reservationId=402')
                        .expect(200);
                })
                .then(function (response) {
                    return new Promise(function (resolve) {
                        expect(response.text).to.equal('3');
                        return resolve();
                    });
                })
                .done(function (prevResult, err) {
                    if(err) { return done(err); }
                    return done();
                });
        });
    });

    describe('#expireReservations', function () {
        it('should expire requested reservations past pickup time', function (done) {
            Promise.resolve()
                .then(function () {
                    Promise.join(
                        Reservation.update(700, {
                            datetimeFrom: moment().subtract(5, 'minutes').toDate(),
                            status: 'requested'
                        }),
                        Reservation.update(701, {
                            datetimeFrom: moment().add(5, 'minutes').toDate(),
                            status: 'requested'
                        }),
                        function () {
                            return Promise.resolve();
                        }
                    );
                })
                .then(function () {
                    return reservationController.expireReservations();
                })
                .then(function () {
                    Promise.join(
                        Reservation.findOne(700),
                        Reservation.findOne(701),
                        function (expired, nonExpired) {
                            expect(expired.status).to.equal('declined');
                            expect(nonExpired.status).to.equal('requested');
                            return Promise.resolve();
                        }
                    ).catch(done);
                })
                .done(function (prevResult, err) {
                    if (err) {
                        return done(err);
                    }
                    return done();
                });
        });
        it('should expire accepted reservations past return time', function (done) {
            Promise.resolve()
                .then(function () {
                    Promise.join(
                        Reservation.update(700, {
                            datetimeTo: moment().subtract(5, 'minutes').toDate(),
                            status: 'accepted'
                        }),
                        Reservation.update(701, {
                            datetimeTo: moment().add(5, 'minutes').toDate(),
                            status: 'accepted'
                        }),
                        function () {
                            return Promise.resolve();
                        }
                    );
                })
                .then(function () {
                    return reservationController.expireReservations();
                })
                .then(function () {
                    Promise.join(
                        Reservation.findOne(700),
                        Reservation.findOne(701),
                        function (expired, nonExpired) {
                            expect(expired.status).to.equal('cancelled');
                            expect(nonExpired.status).to.equal('accepted');
                            return Promise.resolve();
                        }
                    ).catch(done);
                })
                .done(function (prevResult, err) {
                    if (err) {
                        return done(err);
                    }
                    return done();
                });
        });
    });

    describe('#generateContract', function () {

        it('should generate proper contract', function (done) {
            request(sails.hooks.http.app)
                .get('/api/reservation/generateContract?reservationId=800')
                .expect(200)
                .end(function (err, result) {
                    if (err) { return done(err); }
                    expect(result.res.text.indexOf('test1')).to.be.at.least(0);
                    expect(result.res.text.indexOf('test3')).to.be.at.least(0);
                    expect(result.res.text.indexOf('800')).to.be.at.least(0);
                    expect(result.res.text.indexOf('listing-for-contract-generation')).to.be.at.least(0);
                    expect(result.res.text.indexOf('short description')).to.be.at.least(0);
                    expect(result.res.text.indexOf('long description')).to.be.at.least(0);
                    //expect(result.res.text.indexOf('src="thumb-url-1"')).to.be.at.least(0);
                    return done();
                });

        });
    });

});
