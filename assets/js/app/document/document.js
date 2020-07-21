define(['knockout', 'lib/sugar'], function (ko) {

    var Document = {
        init: function () {},
        dispose: function () {},
        controllers: {
            '/:doc': function (doc) {
                Document.doc(doc);
            }
        },
        title: function () {
            return Document.doc().titleize();
        },
        doc: ko.observable('')
    };

    return Document;

});
