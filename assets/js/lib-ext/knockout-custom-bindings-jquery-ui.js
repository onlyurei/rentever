define(['lib/knockout', 'jquery.ui', 'lib/sugar'], function (ko) {

    ko.bindingHandlers.autocomplete = {
        init: function (element, valueAccessor, allBindingsAccessor) {
            var allBindings = allBindingsAccessor();
            $(element).autocomplete(Object.merge({
                select: function (event, ui) {
                    valueAccessor()(ui.item);
                }
            }, allBindings.autocompleteOptions));
        }
    };

    ko.bindingHandlers.dragDrop = {
        init: function (element, valueAccessor) {
            var values = ko.utils.unwrapObservable(valueAccessor());
            if (values.enabled) {
                var dropOptions = values.dropOptions || {};
                var dragOptions = values.dragOptions || {};
                dragOptions.helper = dragOptions.helper || 'clone';
                dragOptions.revert = dragOptions.revert || 'invalid';
                dragOptions.cursor = dragOptions.cursor || 'move';
                $(dropOptions.accept).draggable(dragOptions);
                $(element).droppable(dropOptions);
            }
        }
    };
    ko.bindingHandlers.dragDrop.update = ko.bindingHandlers.dragDrop.init;

    ko.bindingHandlers.slider = {
        init: function (element, valueAccessor, allBindingsAccessor) {
            var value = ko.utils.unwrapObservable(valueAccessor()), allBindings = allBindingsAccessor();
            var options = {
                min: allBindings.sliderOptions.min,
                max: allBindings.sliderOptions.max,
                range: allBindings.sliderOptions.range
            };

            function handler(event, ui) {
                valueAccessor()((options.range === true) ? ui.values : ui.value);
            }

            if (allBindings.sliderOptions.continuous) {
                options.slide = handler;
            } else {
                options.change = handler;
            }
            if (options.range === true) {
                options.values = (Object.isArray(value) ? value
                        : ((Object.isString(value) && (value.split(',').length == 2)) ? value.split(',').map(function (i) { return parseInt(i, 10); })
                        : null)) || [options.min, options.max];
            } else {
                options.value = value;
            }
            if (allBindings.sliderOptions.step) {
                options.step = allBindings.sliderOptions.step;
            }
            $(element).slider(options);
        },
        update: function (element, valueAccessor, allBindingsAccessor) {
            var value = ko.utils.unwrapObservable(valueAccessor()), allBindings = allBindingsAccessor();
            if (allBindings.sliderOptions.range === true) {
                $(element).slider('values', value);
            } else {
                $(element).slider('value', value);
            }
        }
    };

    ko.bindingHandlers.sortable = {
        init: function (element, valueAccessor, allBindingsAccessor) {
            if (ko.isObservable(valueAccessor())) {
                var allBindings = allBindingsAccessor();

                var change = function () {
                    valueAccessor()($(element).sortable('toArray'));
                }.debounce(1000);

                var options = Object.merge({
                    change: function () {
                        change();
                    }
                }, allBindings.sortableOptions);

                $(element).sortable(options);
            }
        }
    };

    ko.bindingHandlers.datepicker = {
        init: function (element, valueAccessor) {
            $(element).datepicker(ko.utils.unwrapObservable(valueAccessor()));
        },
        update: function (element, valueAccessor) {
            var date = $(element).datepicker('getDate');
            var defaultDate = ko.utils.unwrapObservable(valueAccessor());
            defaultDate = defaultDate && defaultDate.defaultDate;
            $(element).datepicker('destroy');
            ko.bindingHandlers.datepicker.init(element, valueAccessor);
            $(element).datepicker('setDate', defaultDate || date);
        }
    };

    return ko;

});
