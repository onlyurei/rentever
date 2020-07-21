var bcrypt = require('bcrypt');
var util = require('util');
var Promise = require('bluebird');

module.exports = {
    encryptUserPasswordIfNotEmpty: function (user, next, error) {
        if (!user.password) {
            return next();
        }

        module.exports.encryptPassword(user.password)
            .then(function (hashedPassword) {
                user.password = hashedPassword;
                return next();
            })
            .catch(function (err) {
                util.error(err, err.stack);
                return error(err);
            });
    },

    encryptPassword: function (password) {
        return new Promise(function (resolve, reject) {
            bcrypt.genSalt(10, function (err, salt) {
                bcrypt.hash(password, salt, function (err, hash) {
                    if (err) {
                        util.error(err, err.stack);
                        return reject(err);
                    }
                    return resolve(hash);
                });
            });
        });
    }
};
