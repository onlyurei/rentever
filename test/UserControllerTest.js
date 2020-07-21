var expect = require('chai').expect;
var request = require('supertest-as-promised');
var Promise = require('bluebird');
var testHelper = require('./TestHelper.js');
//var loginAgent = Promise.promisify(require('./TestHelper.js').loginAgent);

describe('UserController', function () {

    describe('#sendResetPasswordEmail', function () {

        it('should return false for non-existing email', function it(done) {
            request(sails.hooks.http.app)
                .put('/api/user/sendResetPasswordEmail')
                .send({
                    email: 'sdfsdf@sdfsdf.com'
                })
                .expect(400)
                .end(function (error) {
                    if (error) { return done(error); }
                    return done();
                }
            );
        });

        it('should create passwordResetToken and return true for existing email', function it(done) {

            request(sails.hooks.http.app)
                .put('/api/user/sendResetPasswordEmail')
                .send({
                    email: 'test1@rentever.com'
                })
                .expect(200)
                .end(function (error) {
                    if (error) {
                        return done(error);
                    }
                    User.find({ email: 'test1@rentever.com' })
                        .then(function (users) {
                            expect(users[0].passwordResetToken).to.be.not.an('undefined');
                            expect(users[0].passwordResetToken.length).to.equal(36);
                            done();
                        });
                }
            );
        });
    });

    describe('#verifyPasswordResetToken', function () {

        it('should return 200 if token exists', function it(done) {
            request(sails.hooks.http.app)
                .get('/api/user/verifyPasswordResetToken/PASSWORD-RESET-TOKEN-4')
                .expect(200)
                .end(function (error) {
                    if (error) { return done(error); }
                    return done();
                }
            );
        });

        it('should return 400 if token doesn\'t exists', function it(done) {
            request(sails.hooks.http.app)
                .get('/api/user/verifyPasswordResetToken/PASSWORD-RESET-TOKEN-NON-EXISTENT')
                .expect(400)
                .end(function (error) {
                    if (error) { return done(error); }
                    return done();
                }
            );
        });
    });

    describe('#resetPassword', function () {

        it('should return 400 if token doesn\'t exist', function it(done) {
            request(sails.hooks.http.app)
                .put('/api/user/resetPassword')
                .send({
                    token: 'PASSWORD-RESET-TOKEN-NON_EXISTENT',
                    password: 'new-password'
                })
                .expect(400)
                .end(function (error) {
                    if (error) { return done(error); }
                    return done();
                }
            );
        });

        it('should return 200, reset password and remove token if token exists', function (done) {

            Promise.resolve()
                .then(function () {
                    return request(sails.hooks.http.app)
                        .put('/api/user/resetPassword')
                        .send({
                            token: 'PASSWORD-RESET-TOKEN-5',
                            password: 'new-password'
                        })
                        .expect(200);
                })
                .then(function () {
                    return User.findOne(5);
                })
                .then(function (user) {
                    return new Promise(function (resolve) {
                        expect(user.passwordResetToken).to.equal(null);
                        return resolve();
                    });
                })
                .then(function () {
                    return testHelper.isUsernamePasswordValid('userForPasswordResetTest', 'userForPasswordResetTest')
                        .then(function (isLoggedIn) {
                            expect(isLoggedIn).to.equal(false);
                            return Promise.resolve();
                        });

                })
                .then(function () {
                    return testHelper.isUsernamePasswordValid('userForPasswordResetTest', 'new-password')
                        .then(function (isLoggedIn) {
                            expect(isLoggedIn).to.equal(true);
                            return Promise.resolve();
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
});
