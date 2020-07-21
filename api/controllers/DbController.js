module.exports = {

    populate: function (req, res) {
        DbService.overwriteDBWithSampleData(function(){
            res.send({result: true});
        });

    },

    _config: {}
};
