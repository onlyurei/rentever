var gm = require('gm');
var Writable = require('stream').Writable;
var AWS = require('aws-sdk');
var Promise = require('bluebird');
var fs = require('fs');
var request = require('request');
var uuid = require('node-uuid');
var util = require('util');

AWS.config.loadFromPath('config/credentials/aws/credentials.json');

var maxAllowedFileSizeInMb = 5;
var tempImageDirectory = 'workspace/temp/';
var s3Bucket = 'rentever';
var facebookProfilePictureDimension = 400;
var defaultPictureQuality = 80;

var extensions = ['jpg', 'png'];


var resizerQueue = async.queue(function (task, callback) {

    // do the gm image processings
    var writeStream = fs.createWriteStream(task.newFilePath);
    gm(task.originalFilePath)
        .autoOrient()
        .resize(task.width, task.height)
        .quality(task.quality || defaultPictureQuality)
        .stream(task.extension)
        .pipe(writeStream)
        .on('finish', function () {
            return callback();
        })
        .on('error', function (err) {
            return callback(err);
        });
}, 1);

function sanitizeExtension(extension) {
    var _format = (typeof extension == 'string') && extension.toLowerCase();
    return (_format && (extensions.indexOf(_format) >= 0)) ? _format : 'jpg';
}

function uploadToS3(fileToUpload, filename) {
    return new Promise(function (resolve, reject) {
        var s3 = new AWS.S3();
        var file = fs.createReadStream(fileToUpload);

        s3.putObject({
            Bucket: s3Bucket,
            Key: filename,
            Body: file
        }, function (err) {
            fs.unlink(fileToUpload);

            if (err) {
                return reject(err);
            }
            return resolve();
        });
    });
}

function generateCustomReceiver(tempFilename) {
    // Custom receiver for skipper file uploader
    var receiver = new Writable({ objectMode: true });
    receiver._write = function (fileStream, enc, callback) {
        gm(fileStream)
            .write(tempFilename, function (err) {
                if (err) {
                    return callback(err);
                }

                // check the size
                var stats = fs.statSync(tempFilename);
                var fileSizeInBytes = stats.size;
                if ((maxAllowedFileSizeInMb * 1024 * 1024) < fileSizeInBytes) {
                    return callback(new Error('Image size exceeds allowed limit'));
                }

                return callback();
            });
    };
    return receiver;
}

module.exports = {

    validateResizeAndUpload: function (req, extension, saveTargets) {
        //dimension, extension, quality
        return new Promise(function (resolve, reject) {
            var _extension = sanitizeExtension(extension);
            var originalFilePath = tempImageDirectory + require('node-uuid').v4() + '.' + _extension;

            // Custom receiver
            var receiver = generateCustomReceiver(originalFilePath);

            // Skipper file uploader
            req.file('theFile').upload(receiver, function whenDone(err) {
                if (err) {
                    util.error(err, err.stack);
                    return reject(err);
                }

                Promise.map(saveTargets, function (target) {
                    return new Promise(function (resolve, reject) {
                        var newFilename = uuid.v4() + '.' + _extension;
                        var newFilePath = tempImageDirectory + newFilename;

                        // IMPORTANT: Promise.map also provides concurrency control
                        // however async.queue MUST be used here because we need to limit # of 'gm' processes per server (not per request)
                        resizerQueue.push({
                            originalFilePath: originalFilePath,
                            newFilePath: newFilePath,
                            extension: _extension,
                            width: target.size,
                            height: target.size,
                            quality: target.quality
                        }, function (err) {
                            if (err) {
                                return reject(err);
                            }
                            uploadToS3(newFilePath, newFilename).then(function (err) {
                                if (err) {
                                    return reject(err);
                                }
                                return resolve(newFilename);
                            });
                        });
                    });
                })
                    .then(function (newFilePaths) {
                        return resolve(newFilePaths);
                    })
                    .catch(function (err) {
                        return reject(err);
                    })
                    .finally(function () {
                        fs.unlink(originalFilePath);
                    });
            });
        });
    },

    deleteImages: function (paths) {
        return new Promise(function (resolve, reject) {

            var objectsToDelete = [];
            paths.forEach(function (path) {
                objectsToDelete.push({
                    Key: path.replace(sails.config.appconfs.s3Prefix, '')
                });
            });

            var params = {
                Bucket: s3Bucket,
                Delete: {
                    Objects: objectsToDelete
                }
            };
            var s3 = new AWS.S3();
            s3.deleteObjects(params, function (err) {
                if (err) {
                    util.error(err, err.stack);
                    return reject(err);
                } else {
                    return resolve();
                }
            });
        });
    },

    uploadExternalImage: function (uri, extension) {

        return new Promise(function (resolve, reject) {

            var _extension = sanitizeExtension(extension);
            var filename = uuid.v4() + '.' + _extension;
            var filepath = tempImageDirectory + filename;

            async.waterfall([
                function (callback) {
                    // check if file exists
                    request
                        .get(uri)
                        .on('error', function (err) {
                            util.error(err, err.stack);
                            callback(err);
                        })
                        .on('response', function (response) {
                            if (response.headers['content-type'] == 'image/jpeg') {
                                callback();
                            } else {
                                callback('ERROR: Such facebook profile photo doesn\'t exist');
                            }
                        });
                },
                function (callback) {
                    // download the file
                    request
                        .get(uri)
                        .on('error', function (err) {
                            util.error(err, err.stack);
                            callback(err);
                        })
                        .pipe(fs.createWriteStream(filepath)).on('close', function () {
                            callback();
                        });
                },
                function (callback) {
                    // upload to S3
                    var s3 = new AWS.S3();
                    s3.putObject({
                        Bucket: s3Bucket,
                        Key: filename,
                        Body: fs.createReadStream(filepath)
                    }, function (err) {
                        if (err) {
                            util.error(err, err.stack);
                            callback(err);
                        }
                        fs.unlink(filepath);
                        callback(err);
                    });
                }
            ], function (err) {
                if (err) {
                    util.error(err, err.stack);
                    return reject(err);
                }
                return resolve(filename);
            });
        });
    },

    uploadExternalFacebookProfilePicture: function (facebookId) {
        var uri = 'https://graph.facebook.com/' + facebookId + '/picture?width=' + facebookProfilePictureDimension + '&height=' + facebookProfilePictureDimension;
        return module.exports.uploadExternalImage(uri, 'jpg');
    }
};
