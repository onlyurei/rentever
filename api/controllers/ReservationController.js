var moment = require('moment');
var util = require('util');
var Promise = require('bluebird');
var uuid = require('node-uuid');
var fs = require('fs');
/* jshint ignore:start */
var async = require('../../node_modules/sails/node_modules/async'); //TODO: find out why mocha is wining about async not defined in ReservationControllerTest
/* jshint ignore:end */
var minAllowedReservationIntervalMin = 60;
var verificationCodeLength = 4;
var statusEnum = {
    AVAILABLE: {
        name: 'AVAILABLE',
        note: 'Available'
    },
    RESERVED: {
        name: 'RESERVED',
        note: 'Unavailable'
    },
    HALF_RESERVED: {
        name: 'HALF_RESERVED',
        note: 'Reserved from ${from} to ${to}.'
    },
    PENDING_APPROVAL: {
        name: 'PENDING_APPROVAL',
        note: 'Your request is pending approval.'
    }
};
var statusSwitchRules = {
    cancelled: [
        { allowedUser: 'requester', allowedInitStatus: 'requested' },
        { allowedUser: 'requester', allowedInitStatus: 'accepted' },
        { allowedUser: 'owner', allowedInitStatus: 'accepted' }
    ],
    declined: [
        { allowedUser: 'owner', allowedInitStatus: 'requested' }
    ],
    accepted: [
        { allowedUser: 'owner', allowedInitStatus: 'requested' }
    ],
    picked_up: [
        { allowedUser: 'owner', allowedInitStatus: 'accepted' }
    ],
    returned: [
        { allowedUser: 'owner', allowedInitStatus: 'picked_up' }
    ]
};
var verificationCodeCharacters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // 0,O,1,I - excluded on purpose

function getRandomInt(min, max) {
    // Returns a random integer between min (inclusive) and max (inclusive)
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateVerificationCode(universe, resultSize) {
    var result = '';
    for (var i = 0; i < resultSize; i++) {
        var randomPos = getRandomInt(0, universe.length - 1);
        result += universe.charAt(randomPos);
    }
    return result;
}

function itemReservedOnDate(listingId, date, requesterId) {
    var endOfDay = moment(date).add(1, 'days').subtract(1, 'seconds');

    var orClause = [
        { status: ['accepted', 'picked_up'] }
    ];
    if (requesterId) {
        orClause.push({
            status: ['requested'],
            requester: requesterId
        });
    }

    return Listing.findOne(listingId)
        .populate('reservations', {
            where: {
                datetimeFrom: {
                    '<=': endOfDay.toDate()
                },
                datetimeTo: {
                    '>=': moment(date).toDate()
                },
                or: orClause
            }
        })
        .then(function (listing) {
            return new Promise(function (resolve) {
                var statusName = statusEnum.AVAILABLE.name;
                var statusNote = statusEnum.AVAILABLE.note;

                if (listing && listing.reservations.length > 0) {
                    statusName = statusEnum.RESERVED.name;
                    statusNote = statusEnum.RESERVED.note;

                    if (requesterId && listing.reservations[0].requester == requesterId) {
                        statusName = statusEnum.PENDING_APPROVAL.name;
                        statusNote = statusEnum.PENDING_APPROVAL.note;
                    } else {
                        if (moment(date).isSame(listing.reservations[0].datetimeFrom, 'day') &&
                            moment(date).isBefore(listing.reservations[0].datetimeFrom, 'second')) {
                            statusName = statusEnum.HALF_RESERVED.name;
                            statusNote = _.template(statusEnum.HALF_RESERVED.note, {
                                'from': moment(listing.reservations[0].datetimeFrom).format('HH:mm'),
                                'to': '24:00'
                            });
                        } else if (moment(date).isSame(listing.reservations[0].datetimeTo, 'day') &&
                            endOfDay.isAfter(listing.reservations[0].datetimeTo, 'second')) {
                            statusName = statusEnum.HALF_RESERVED.name;
                            statusNote = _.template(statusEnum.HALF_RESERVED.note, {
                                'from': '00:00',
                                'to': moment(listing.reservations[0].datetimeTo).format('HH:mm')
                            });
                        }
                    }
                }
                return resolve({
                    date: date,
                    status: statusName,
                    note: statusNote
                });
            });
        });
}

function anyReservationsInRange(requesterId, listingId, datetimeFrom, datetimeTo) {
    return Listing.findOne(listingId)
        .populate('reservations', {
            where: {
                datetimeFrom: {
                    '<=': moment(datetimeTo).toDate()
                },
                datetimeTo: {
                    '>=': moment(datetimeFrom).toDate()
                },
                or: [
                    { status: ['accepted', 'picked_up'] },
                    { status: ['requested'], requester: requesterId }
                ]
            }
        })
        .then(function (listing) {
            return new Promise(function (resolve) {
                var result = false;
                if (listing && listing.reservations.length > 0) {
                    result = true;
                }
                return resolve(result);
            });
        });
}

function isStatusSwitchAllowed(newStatus, reservationId, userId, code) {
    return Reservation.findOne(reservationId)
        .populate('listing')
        .then(function (reservation) {
            return new Promise(function (resolve) {
                var userType;
                if (reservation.requester === userId) {
                    userType = 'requester';
                } else if (reservation.listing.owner === userId) {
                    userType = 'owner';
                }
                var isAllowed = _.some(statusSwitchRules[newStatus], {
                    allowedUser: userType,
                    allowedInitStatus: reservation.status
                });

                if (newStatus === 'picked_up' && reservation.pickupCode !== code) {
                    isAllowed = false;
                } else if (newStatus === 'returned' && reservation.returnCode !== code) {
                    isAllowed = false;
                }

                return resolve(isAllowed);
            });
        });
}

function updateStatus(reservationId, userId, status, code) {
    return isStatusSwitchAllowed(status, reservationId, userId, code)
        .then(function (isAllowed) {
            return new Promise(function (resolve, reject) {
                if (!isAllowed) {
                    return reject({ type: 'unauthorized' });
                }
                var updateCommand = { status: status };
                if (status === 'accepted') {
                    updateCommand.pickupCode = generateVerificationCode(verificationCodeCharacters, verificationCodeLength);
                    updateCommand.returnCode = generateVerificationCode(verificationCodeCharacters, verificationCodeLength);
                }

                async.parallel({
                    updated: function (callback) {
                        Reservation.update(reservationId, updateCommand).exec(function (err, updated) {
                            if (err) {
                                return callback(err);
                            }
                            return callback(null, updated);
                        });
                    },
                    logged: function (callback) {
                        ReservationHistory.create({
                            reservation: reservationId,
                            user: userId,
                            status: status
                        }).exec(function (err, history) {
                            if (err) {
                                return callback(err);
                            }
                            return callback(null, history);
                        });
                    }
                }, function (err, results) {
                    if (err) {
                        return reject(err);
                    }
                    return resolve(results.updated[0]);
                });
            });
        });
}

function updateStatusThen(req, res, reservation) {
    var updatedValues = { status: reservation.status };
    if (reservation.actualPrice) {
        updatedValues.actualPrice = reservation.actualPrice;
    }
    if (req._sails.hooks.pubsub) {
        if (req.isSocket) {
            Reservation.subscribe(req, reservation);
        }
        Reservation.publishUpdate(reservation.id, updatedValues);
    }
    res.send(updatedValues);
}

function updateStatusFail(res, err) {
    if (err.type && err.type === 'unauthorized') {
        return res.forbidden('Unauthorized');
    }
    util.error(err, err.stack);
    return res.serverError(err);
}

function getPriceRoundedUp(dailyPrice, datetimeFrom, datetimeTo) {
    var diffInHours = moment(datetimeTo).diff(moment(datetimeFrom), 'hours');
    return Math.ceil(diffInHours / 24) * dailyPrice;
}

function fetchConflictingReservations(reservationId) {
    return Reservation.findOne(reservationId)
        .populate('listing')
        .then(function (reservation) {
            return Reservation.find({
                id: { '!': reservation.id },
                status: 'requested',
                listing: reservation.listing.id,
                datetimeFrom: {
                    '<=': moment(reservation.datetimeTo).toDate()
                },
                datetimeTo: {
                    '>=': moment(reservation.datetimeFrom).toDate()
                }
            });
        });
}

function declineAllConflictingReservations(req, reservationId) {
    return Reservation.findOne(reservationId)
        .populate('listing')
        .then(function (acceptedReservation) {
            return fetchConflictingReservations(reservationId)
                .then(function (reservations) {
                    return [acceptedReservation, reservations];
                });
        })
        .spread(function (acceptedReservation, reservations) {
            return Promise.map(reservations, function (reservation) {
                return updateStatus(reservation.id, acceptedReservation.listing.owner, 'declined')
                    .then(function () {
                        return new Promise(function (resolve) {
                            if (req._sails.hooks.pubsub) {
                                Reservation.publishUpdate(reservation.id, { status: 'declined' });
                            }
                            EmailHelper.sendReservationStatusChangeEmail('DECLINED_REQUESTER', reservation.id);
                            return resolve();
                        });
                    });
            });
        });
}

var contractPdfGenerationQueue = async.queue(function (task, callback) {

    var exec = require('child_process').exec;
    var tempFile = process.cwd() + '/workspace/temp/temp-contract-' + uuid.v4() + '.pdf';
    var script = process.cwd() + '/scripts/phantomjs-html-to-pdf.js';
    var url = sails.config.appconfs.url + '/api/reservation/generateContract?reservationId=' + task.req.param('reservationId');

    function onError(err) {
        util.error(err, err.stack);
        callback(err);
        return task.res.redirect(task.url);
    }

    exec('phantomjs ' + script + ' ' + url + ' ' + tempFile, function (err) {
        if (err) {
            return onError(err);
        }
        return task.res.download(tempFile, 'contract-' + task.req.param('reservationId') + '.pdf', function (err) {
            fs.unlink(tempFile);
            if (err) {
                return onError(err);
            }
            callback();
        });
    });

}, 1);

module.exports = {

    _getDatesInRange: function (dateFrom, dateTo) {
        var result = [];
        var from = moment(dateFrom);
        var to = moment(dateTo);

        while (from.isBefore(to)) {
            result.push(from.format('YYYY-MM-DD'));
            from.add(1, 'days');
        }
        result.push(from.format('YYYY-MM-DD'));

        return result;
    },

    _alphaSortByProperty: function (inputList, property) {
        var result = inputList.sort(function (left, right) {
            if (left[property] < right[property]) {
                return -1;
            } else if (left[property] > right[property]) {
                return 1;
            } else {
                return 0;
            }
        });
        return result;
    },

    _getFarthestReservedDateForListing: function (listingId, startDate, requesterId) {

        var orClause = [
            { status: ['accepted', 'picked_up'] }
        ];
        if (requesterId) {
            orClause.push({
                status: ['requested'],
                requester: requesterId
            });
        }

        return Reservation.find()
            .where({
                listing: listingId,
                datetimeFrom: {
                    '>=': moment(startDate).toDate()
                },
                or: orClause
            })
            .sort({
                datetimeFrom: 'desc'
            })
            .limit(1)
            .then(function (results) {
                return new Promise(function (resolve) {
                    if (results.length > 0) {
                        return resolve(moment(results[0].datetimeTo).toISOString());
                    } else {
                        return resolve(startDate);
                    }
                });
            });
    },

    reserveForDatetimeRange: function (req, res) {
        var validationResult = ValidationService.validate(req, [
            { field: 'listingId', checks: ['required'] },
            { field: 'datetimeFrom', checks: ['required', 'iso-datetime'] },
            { field: 'datetimeTo', checks: ['required', 'iso-datetime'] }
        ]);
        if (validationResult.success === false) {
            return res.badRequest(validationResult.messages);
        }

        var momentFrom = moment(req.body.datetimeFrom);
        var momentTo = moment(req.body.datetimeTo);

        if (momentFrom.isAfter(momentTo)) {
            return res.badRequest(['datetimeFrom should always precede datetimeTo']);
        }

        if (momentTo.subtract(minAllowedReservationIntervalMin, 'minutes').isBefore(momentFrom)) {
            return res.badRequest(['minimum reservation duration is ' + minAllowedReservationIntervalMin + ' minutes']);
        }

        var datesAlreadyBookedError = 'Dates are already booked';

        async.waterfall([
            function (callback) {
                anyReservationsInRange(req.user.id, req.body.listingId, req.body.datetimeFrom, req.body.datetimeTo)
                    .then(function (isReserved) {
                        if (isReserved) {
                            return callback(new Error(datesAlreadyBookedError));
                        }
                        return callback();
                    })
                    .catch(function (err) {
                        return callback(err, null);
                    });
            },
            function (callback) {
                Listing
                    .findOne(req.body.listingId)
                    .then(function (listing) {
                        return callback(null, listing);
                    });
            },
            function (listing, callback) {
                var momentFrom = moment.utc(req.body.datetimeFrom);
                var momentTo = moment.utc(req.body.datetimeTo);
                Reservation.create({
                    requester: req.user,
                    listing: req.body.listingId,
                    datetimeFrom: momentFrom.toDate(),
                    datetimeTo: momentTo.toDate(),
                    status: 'requested',
                    estimatedPrice: getPriceRoundedUp(listing.price.daily, req.body.datetimeFrom, req.body.datetimeTo)
                }).exec(
                    function (err, newReservation) {
                        if (err) {
                            return callback(err, null);
                        }
                        return callback(null, newReservation);
                    });
            }
        ], function (err, newReservation) {
            if (err) {
                if (err.message == datesAlreadyBookedError) {
                    return res.send(false);
                }
                util.error(err, err.stack);
                return res.serverError(err);
            }

            EmailHelper.sendReservationStatusChangeEmail('REQUESTED_OWNER', newReservation.id);
            EmailHelper.sendReservationStatusChangeEmail('REQUESTED_REQUESTER', newReservation.id);

            if (req._sails.hooks.pubsub) {
                if (req.isSocket) {
                    Reservation.subscribe(req, newReservation);
                    Reservation.introduce(newReservation);
                }
                _.assign(newReservation, { requester: req.user.toJSON() });
                Reservation.publishCreate(newReservation, !req.options.mirror && req);
            }

            return res.send(String(newReservation.id));
        });
    },

    getAvailabilityForDatetimeRange: function (req, res) {
        var validationResult = ValidationService.validate(req, [
            { field: 'listingId', checks: ['required'] },
            { field: 'datetimeFrom', checks: ['required'] },
            { field: 'datetimeTo', checks: ['required'] }
        ]);
        if (validationResult.success === false) {
            return res.badRequest(validationResult.messages);
        }
        anyReservationsInRange(req.user.id, req.query.listingId, req.query.datetimeFrom, req.query.datetimeTo)
            .then(function (result) {
                res.send(!result);
            })
            .catch(function (err) {
                util.error(err, err.stack);
                res.serverError(err);
            });
    },

    getReservedDatesForPublicCalendar: function (req, res) {
        var validationResult = ValidationService.validate(req, [
            { field: 'listingId', checks: ['required'] },
            { field: 'dateFrom', checks: ['required'] },
            { field: 'dateTo', checks: ['date'] }
        ]);
        if (validationResult.success === false) {
            return res.badRequest(validationResult.messages);
        }

        async.waterfall([
            function (callback) {
                if (req.query.dateTo) {
                    callback(null, req.query.dateTo);
                } else {
                    module.exports._getFarthestReservedDateForListing(req.query.listingId, req.query.dateFrom, req.user ? req.user.id : null)
                        .then(function (dateTo) {
                            callback(null, dateTo);
                        })
                        .catch(function (err) {
                            callback(err, null);
                        });
                }
            },
            function (dateTo, callback) {
                var dateRange = module.exports._getDatesInRange(req.query.dateFrom, dateTo);
                var result = [];
                async.forEach(dateRange, function (date, foreachCallback) {
                    itemReservedOnDate(req.query.listingId, date, req.user ? req.user.id : null)
                        .then(function (reservationResult) {
                            if (reservationResult && reservationResult.status !== statusEnum.AVAILABLE.name) {
                                result.push(reservationResult);
                            }
                            foreachCallback();
                        })
                        .catch(function (err) {
                            foreachCallback(err);
                        });
                }, function (err) {
                    if (err) {
                        callback(err, null);
                    }
                    result = module.exports._alphaSortByProperty(result, 'date');
                    callback(null, result);
                });
            }
        ], function (err, result) {
            if (err) {
                util.error(err, err.stack);
                return res.serverError(err);
            }
            return res.send(result);
        });
    },

    markAsCancelled: function (req, res) {
        var validationResult = ValidationService.validate(req, [
            { field: 'id', checks: ['required'] }
        ]);
        if (validationResult.success === false) {
            return res.badRequest(validationResult.messages);
        }
        updateStatus(req.body.id, req.user.id, 'cancelled')
            .then(function (reservation) {
                EmailHelper.sendReservationStatusChangeEmail('CANCELLED_REQUESTER', reservation.id);
                EmailHelper.sendReservationStatusChangeEmail('CANCELLED_OWNER', reservation.id);

                updateStatusThen(req, res, reservation);
            })
            .catch(function (err) {
                updateStatusFail(res, err);
            });
    },

    markAsDeclined: function (req, res) {
        var validationResult = ValidationService.validate(req, [
            { field: 'id', checks: ['required'] }
        ]);
        if (validationResult.success === false) {
            return res.badRequest(validationResult.messages);
        }
        updateStatus(req.body.id, req.user.id, 'declined')
            .then(function (reservation) {
                EmailHelper.sendReservationStatusChangeEmail('DECLINED_REQUESTER', reservation.id);
                EmailHelper.sendReservationStatusChangeEmail('DECLINED_OWNER', reservation.id);

                updateStatusThen(req, res, reservation);
            })
            .catch(function (err) {
                updateStatusFail(res, err);
            });
    },

    markAsAccepted: function (req, res) {
        var validationResult = ValidationService.validate(req, [
            { field: 'id', checks: ['required'] }
        ]);
        if (validationResult.success === false) {
            return res.badRequest(validationResult.messages);
        }
        updateStatus(req.body.id, req.user.id, 'accepted')
            .then(function (reservation) {
                EmailHelper.sendReservationStatusChangeEmail('ACCEPTED_REQUESTER', reservation.id);
                EmailHelper.sendReservationStatusChangeEmail('ACCEPTED_OWNER', reservation.id);
                return declineAllConflictingReservations(req, reservation.id)
                    .then(function () {
                        return new Promise(function (resolve) {
                            return resolve(reservation);
                        });
                    });
            })
            .then(function (reservation) {
                updateStatusThen(req, res, reservation);
            })
            .catch(function (err) {
                updateStatusFail(res, err);
            });
    },

    markAsPickedUp: function (req, res) {
        var validationResult = ValidationService.validate(req, [
            { field: 'id', checks: ['required'] },
            { field: 'code', checks: ['required'] }
        ]);
        if (validationResult.success === false) {
            return res.badRequest(validationResult.messages);
        }
        updateStatus(req.body.id, req.user.id, 'picked_up', req.body.code)
            .then(function (reservation) {
                EmailHelper.sendReservationStatusChangeEmail('PICKED_UP_REQUESTER', reservation.id);
                EmailHelper.sendReservationStatusChangeEmail('PICKED_UP_OWNER', reservation.id);
                updateStatusThen(req, res, reservation);
            })
            .catch(function (err) {
                updateStatusFail(res, err);
            });
    },

    markAsReturned: function (req, res) {
        var validationResult = ValidationService.validate(req, [
            { field: 'id', checks: ['required'] },
            { field: 'code', checks: ['required'] }
        ]);
        if (validationResult.success === false) {
            return res.badRequest(validationResult.messages);
        }
        var reservationId = req.body.id;

        updateStatus(reservationId, req.user.id, 'returned', req.body.code)
            .then(function (reservation) {
                EmailHelper.sendReservationStatusChangeEmail('RETURNED_REQUESTER', reservation.id);
                EmailHelper.sendReservationStatusChangeEmail('RETURNED_OWNER', reservation.id);

                return Promise.join(
                    ReservationHistory.find({
                        reservation: reservationId,
                        status: 'picked_up'
                    }),
                    Listing.findOne(reservation.listing),
                    function (reservationHistory, listing) {
                        return [reservationHistory[0], listing, reservation];
                    }
                );
            })
            .spread(function (history, listing, reservation) {
                var actualPrice = getPriceRoundedUp(listing.price.daily, history.createdAt, moment());
                actualPrice = Math.max(actualPrice, reservation.estimatedPrice);
                return Reservation.update(reservationId, { actualPrice: actualPrice });
            })
            .then(function (updatedReservations) {
                updateStatusThen(req, res, updatedReservations[0]);
            })
            .catch(function (err) {
                updateStatusFail(res, err);
            });
    },

    getPickupCode: function (req, res) {
        var validationResult = ValidationService.validate(req, [
            { field: 'id', checks: ['required'] }
        ]);
        if (validationResult.success === false) {
            return res.badRequest(validationResult.messages);
        }

        Reservation.findOne(req.param('id'))
            .then(function (reservation) {
                return res.ok(reservation.pickupCode);
            })
            .catch(function (err) {
                util.error(err, err.stack);
                return res.serverError(err);
            });
    },

    getReturnCode: function (req, res) {
        var validationResult = ValidationService.validate(req, [
            { field: 'id', checks: ['required'] }
        ]);
        if (validationResult.success === false) {
            return res.badRequest(validationResult.messages);
        }

        Reservation.findOne(req.param('id'))
            .then(function (reservation) {
                return res.ok(reservation.returnCode);
            })
            .catch(function (err) {
                util.error(err, err.stack);
                return res.serverError(err);
            });
    },

    getEstimatedPrice: function (req, res) {
        var validationResult = ValidationService.validate(req, [
            { field: 'listingId', checks: ['required'] },
            { field: 'datetimeFrom', checks: ['required', 'iso-datetime'] },
            { field: 'datetimeTo', checks: ['required', 'iso-datetime'] }
        ]);
        if (validationResult.success === false) {
            return res.badRequest(validationResult.messages);
        }

        Listing.findOne(req.param('listingId'))
            .then(function (listing) {
                var price = getPriceRoundedUp(listing.price.daily, req.param('datetimeFrom'), req.param('datetimeTo'));
                return res.ok((price > 0) ? String(price) : '');
            })
            .catch(function (err) {
                util.error(err, err.stack);
                return res.serverError(err);
            });
    },

    getConflictingReservations: function (req, res) {
        var validationResult = ValidationService.validate(req, [
            { field: 'reservationId', checks: ['required'] }
        ]);
        if (validationResult.success === false) {
            return res.badRequest(validationResult.messages);
        }

        fetchConflictingReservations(req.param('reservationId'))
            .then(function (reservations) {
                return res.send(String(reservations.length));
            })
            .catch(function (err) {
                util.error(err, err.stack);
                return res.serverError(err);
            });
    },

    expireReservations: function () {
        return Promise.resolve()
            .then(function () {
                return Reservation.find()
                    .where({
                        or: [
                            {
                                status: 'requested',
                                datetimeFrom: {
                                    '<': moment().toDate()
                                }
                            },
                            {
                                status: 'accepted',
                                datetimeTo: {
                                    '<': moment().toDate()
                                }
                            }
                        ]
                    });
            })
            .then(function (reservations) {
                return Promise.map(reservations, function (reservation) {
                    return updateStatus(reservation.id, reservation.listingClone.owner.id, (reservation.status == 'requested') ? 'declined' : 'cancelled')
                        .then(function (updatedReservation) {
                            EmailHelper.sendReservationStatusChangeEmail((reservation.status == 'requested') ? 'DECLINED_REQUESTER' : 'CANCELLED_REQUESTER', reservation.id);
                            EmailHelper.sendReservationStatusChangeEmail((reservation.status == 'requested') ? 'DECLINED_OWNER' : 'CANCELLED_OWNER', reservation.id);
                            return Promise.resolve(updatedReservation);
                        });
                });
            })
            .then(function (updatedReservations) {
                return Promise.resolve(updatedReservations.length);
            });
    },

    generateContract: function (req, res) {
        var validationResult = ValidationService.validate(req, [
            { field: 'reservationId', checks: ['required'] }
        ]);
        if (validationResult.success === false) {
            return res.badRequest(validationResult.messages);
        }

        Promise.resolve()
            .then(function () {
                return Reservation.findOne(req.param('reservationId')).populate('requester');
            })
            .then(function (reservation) {
                var price = getPriceRoundedUp(reservation.listingClone.price.daily, reservation.datetimeFrom, reservation.datetimeTo);
                var imageUrl = (reservation.listingClone.images && reservation.listingClone.images.length) ?
                    (_.find(reservation.listingClone.images, { sequence: 0 }) || reservation.listingClone.images[0]).thumbUrl :
                    '';
                res.view('contract', {
                    itemId: reservation.listingClone.id,
                    itemTitle: reservation.listingClone.title,
                    itemShortDescription: reservation.listingClone.description.short,
                    itemLongDescription: reservation.listingClone.description.long,
                    ownerName: (reservation.listingClone.owner.firstName || '') + ' ' + (reservation.listingClone.owner.lastName || ''),
                    renterName: reservation.requester.getDisplayName(),
                    pickupDate: reservation.datetimeFrom,
                    returnDate: reservation.datetimeTo,
                    price: price,
                    depositAmount: reservation.listingClone.deposit.amount,
                    imageUrl: imageUrl
                });
            });
    },

    downloadContractPdf: function (req, res) {
        var validationResult = ValidationService.validate(req, [
            { field: 'reservationId', checks: ['required'] }
        ]);
        if (validationResult.success === false) {
            return res.badRequest(validationResult.messages);
        }

        contractPdfGenerationQueue.push({
            req: req,
            res: res
        });
    }
};
