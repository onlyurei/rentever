var util = require('util');

module.exports = {
    log: function (req, res) {
        util.log(util.inspect(req.body));
        return res.ok();
    }
};
