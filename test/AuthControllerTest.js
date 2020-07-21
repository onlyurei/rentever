var expect = require('chai').expect;
var request = require('supertest-as-promised');

describe('AuthController', function () {

    describe('#_login', function () {

        it('should return expected HTTP status and true as response body', function it(done) {
            request(sails.hooks.http.app)
                .post('/api/auth/login')
                .send({
                    username: 'test1',
                    password: 'test1'
                })
                .expect(200)
                .end(function (error, result) {
                    if (error) {
                        return done(error);
                    }
                    expect(result.res.body).to.equal(undefined);
                    done();
                }
            );
        });
    });
});
