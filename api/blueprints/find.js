/**
 * Module dependencies
 */
var util = require('util');
var actionUtil = require('../../node_modules/sails/lib/hooks/blueprints/actionUtil');

/**
 * Find Records
 *
 *  get   /:modelIdentity
 *   *    /:modelIdentity/find
 *
 * An API call to find and return model instances from the data adapter
 * using the specified criteria.  If an id was specified, just the instance
 * with that unique id will be returned.
 *
 * Optional:
 * @param {Object} where       - the find criteria (passed directly to the ORM)
 * @param {Integer} limit      - the maximum number of records to send back (useful for pagination)
 * @param {Integer} skip       - the number of records to skip (useful for pagination)
 * @param {Integer} page
 * @param {Integer} pageSize
 * @param {String} sort        - the order of returned records, e.g. `name ASC` or `age DESC`
 * @param {String} callback - default jsonp callback param (i.e. the name of the js function returned)
 */

module.exports = function findRecords(req, res) {

    var page = parseInt(req.param('page') || ((typeof req.options.page !== 'undefined') && req.options.page) || 1, 10);
    var pageSize = parseInt(req.param('pageSize') || ((typeof req.options.pageSize !== 'undefined') && req.options.pageSize) || 30, 10);
    var limit = req.param('limit') || ((typeof req.options.limit !== 'undefined') && req.options.limit);
    var skip = req.param('skip') || ((typeof req.options.skip !== 'undefined') && req.options.skip);

    // Look up the model
    var Model = actionUtil.parseModel(req);
    var criteria = actionUtil.parseCriteria(req);

    var blacklist = ['page', 'pageSize', 'total'];
    blacklist.forEach(function (key) {
        delete criteria[key];
    });

    // If an `id` param was specified, use the findOne blueprint action
    // to grab the particular instance with its primary key === the value
    // of the `id` param.   (mainly here for compatibility for 0.9, where
    // there was no separate `findOne` action)
    if (actionUtil.parsePk(req)) {
        return require('../../node_modules/sails/lib/hooks/blueprints/actions/findOne')(req, res);
    }

    // Lookup for records that match the specified criteria
    var query = Model.find()
        .where(criteria)
        .limit((limit && actionUtil.parseLimit(req)) || pageSize)
        .skip((skip && actionUtil.parseSkip(req)) || (pageSize * (page - 1)))
        .sort(actionUtil.parseSort(req) || 'updatedAt desc');

    async.parallel({
        totalCount: function (callback) {
            Model.count(criteria).exec(function (err, count) {
                callback(null, count);
            });
        },
        matchingRecords: function (callback) {
            // TODO: .populateEach(req.options);
            query = actionUtil.populateEach(query, req);
            query.exec(function found(err, matchingRecords) {
                if (err) {
                    callback(err);
                }
                // Only `.watch()` for new instances of the model if
                // `autoWatch` is enabled.
                if (req._sails.hooks.pubsub && req.isSocket) {
                    Model.subscribe(req, matchingRecords);
                    if (req.options.autoWatch) {
                        Model.watch(req);
                    }
                    // Also subscribe to instances of all associated models
                    _.each(matchingRecords, function (record) {
                        actionUtil.subscribeDeep(req, record);
                    });
                }
                callback(null, matchingRecords);
            });
        }
    }, function (err, results) {
        if (err) {
            util.error(err, err.stack);
            return res.serverError(err);
        }
        var response = {
            page: (skip && limit && (Math.floor(skip / limit) + 1)) || page,
            pageSize: limit || pageSize,
            total: results.totalCount,
            results: results.matchingRecords
        };

        res.ok(response);
    });

};
