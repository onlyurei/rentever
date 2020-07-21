module.exports = function (req, res, next) {
    if (req.body) {
        UserHelper.encryptUserPasswordIfNotEmpty(req.body, next, res.serverError);
    }
};
