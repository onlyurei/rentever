module.exports = function (req, res, next) {
    if(req.param('sender') !== req.user.id) {
        return res.forbidden('Not authorized.');
    }
    next();
};
