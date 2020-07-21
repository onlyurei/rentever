var moment = require('moment');

module.exports = {

    validate: function (req, rules) {
        var result = { success: true, messages: [] };
        _.forEach(rules, function (rule) {
            _.forEach(rule.checks, function (check) {
                var field = req.query[rule.field] || null;
                if (req.body && req.body[rule.field]) {
                    field = req.body[rule.field];
                }

                if (check == 'required') {
                    if (!field) {
                        result.success = false;
                        result.messages.push(rule.field + ' is required');
                    }
                }
                if (check == 'iso-datetime') {
                    var reIsoDatetime = new RegExp('(\\d{4}-[01]\\d-[0-3]\\dT[0-2]\\d:[0-5]\\d:[0-5]\\d\\.\\d+([+-][0-2]\\d:[0-5]\\d|Z))|' +
                                                   '(\\d{4}-[01]\\d-[0-3]\\dT[0-2]\\d:[0-5]\\d:[0-5]\\d([+-][0-2]\\d:[0-5]\\d|Z))|' +
                                                   '(\\d{4}-[01]\\d-[0-3]\\dT[0-2]\\d:[0-5]\\d([+-][0-2]\\d:[0-5]\\d|Z))');

                    if (reIsoDatetime.test(field) === false) {
                        result.success = false;
                        result.messages.push(rule.field + ' not formatted as iso-datetime');
                    } else {
                        if (!moment(field).isValid()) {
                            result.success = false;
                            result.messages.push(rule.field + ' not a valid calendar date');
                        }
                    }
                }
                if (check == 'ymd-date') {
                    var reYmd = /\d\d\d\d-\d\d-\d\d/;

                    if (reYmd.test(field) === false) {
                        result.success = false;
                        result.messages.push(rule.field + ' not formatted as yyyy-mm-dd');
                    } else {
                        if (!moment(field).isValid()) {
                            result.success = false;
                            result.messages.push(rule.field + ' not a valid calendar date');
                        }
                    }
                }
                if (check == 'ymd-datetime') {
                    var reYmdHms = /\d\d\d\d-\d\d-\d\d \d\d:\d\d:\d\d/;
                    if (reYmdHms.test(field) === false) {
                        result.success = false;
                        result.messages.push(rule.field + ' not formatted as yyyy-mm-dd hh:mm:ss');
                    } else {
                        if (!moment(field).isValid()) {
                            result.success = false;
                            result.messages.push(rule.field + ' not a valid calendar datetime');
                        }
                    }
                }
            });
        });
        return result;
    }
};
