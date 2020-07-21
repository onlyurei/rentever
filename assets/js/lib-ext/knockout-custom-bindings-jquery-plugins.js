define(['lib/knockout', 'jquery', 'lib/sugar'], function (ko) {

    ko.bindingHandlers.fileupload = {
        init: function (element, valueAccessor, allBindingsAccessor) {
            var value = valueAccessor(), allBindings = allBindingsAccessor();
            var options = Object.merge({
                done: function (event, data) {
                    if (Object.isFunction(value)) {
                        value(data);
                    }
                }
            }, allBindings.fileuploadOptions);
            require(['jquery.fileupload'], function () {
                $(element).fileupload(options);
            });
        }
    };

    ko.bindingHandlers.keynav = {
        init: function (element, valueAccessor, allBindingsAccessor) {
            var value = ko.utils.unwrapObservable(valueAccessor()), allBindings = allBindingsAccessor();
            if (value) {
                require(['lib/jquery-keynav'], function () {
                    $(allBindings.keynavOptions).keynav();
                });
            }
        }
    };
    ko.bindingHandlers.keynav.update = ko.bindingHandlers.keynav.init;

    ko.bindingHandlers.qrcode = {
        init: function (element, valueAccessor, allBindingsAccessor) {
            var value = ko.utils.unwrapObservable(valueAccessor()), allBindings = allBindingsAccessor();
            var options = Object.merge({
                text: value,
                render: 'image'
            }, allBindings.qrcodeOptions);
            require(['lib/jquery-qrcode'], function () {
                $(element).qrcode(options);
            });
        }
    };

    return ko;

});
