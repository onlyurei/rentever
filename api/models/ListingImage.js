module.exports = {
    attributes: {
        listing: {
            model: 'Listing',
            required: true
        },
        thumbUrl: {
            type: 'string',
            required: true
        },
        fullUrl: {
            type: 'string',
            required: true
        },
        sequence: {
            type: 'integer',
            defaultsTo: 0
        },
        caption: {
            type: 'string'
        }
    },

    beforeDestroy: function (clause, callback) {
        ListingImage.find(clause)
            .then(function (images) {
                if (images === undefined || images.length === 0) {
                    callback();
                    return;
                }

                var imageUrls = [];
                images.forEach(function (image) {
                    imageUrls.push(image.thumbUrl.replace(sails.config.appconfs.s3Prefix, ''));
                    imageUrls.push(image.fullUrl.replace(sails.config.appconfs.s3Prefix, ''));
                });

                ImageService.deleteImages(imageUrls)
                    .then(function () {
                        callback();
                    })
                    .catch(callback);
            })
            .catch(callback);
    }
};
