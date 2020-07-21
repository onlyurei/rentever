var expect = require('chai').expect;
var Promise = require('bluebird');
var request = require('supertest-as-promised');

module.exports = {

    loginAgent: function loginAgent(agent, username, password, done){
        agent
            .post('/api/auth/login')
            .set('Accept', 'application/json')
            .send({ username: username, password: password })
            .expect(200)
            .end(function (err) {
                if (err) {
                    return done(err);
                }
                agent
                    .get('/api/config')
                    .expect(200, function (err, res) {
                        if (err) {
                            return done(err);
                        }
                        expect(res.body.isLoggedIn).to.equal(true);
                        return done(null);
                    });
            });
    },

    isLoggedInAsync: function (agent) {
        return new Promise(function (resolve, reject) {
            agent
                .get('/api/config')
                .expect(200)
                .end(function (err, result) {
                    if (err) { return reject(err); }
                    return resolve(result.body.isLoggedIn);
                });
        });
    },

    isUsernamePasswordValid: function (username, password) {
        return new Promise(function (resolve) {
            var agent = request.agent(sails.hooks.http.app);
            module.exports.loginAgent(agent, username, password, function () {
                module.exports.isLoggedInAsync(agent)
                    .then(function (isLoggedIn) {
                        return resolve(isLoggedIn);
                    });
            });
        });
    }
};
