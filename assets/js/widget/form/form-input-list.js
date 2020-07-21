define(['widget/form/form-input', 'util/json', 'lib/jsface', 'knockout', 'jquery'], function (
    FormInput, Json, Class, ko) {

    var FormInputList = Class(FormInput, {
        constructor: function (name, value, valuesApi, multiple, required, submitOnChange, initFromQueryString) {
            FormInputList.$super.call(this, name, value, required, null, submitOnChange, initFromQueryString);
            this.values = ko.observableArray([]);
            this.multiple = multiple;
            $.getJSON(valuesApi, function (data) {
                var value = this.value();
                this.values(data);
                this.value(value); // so that when the available options come later, the selected options are still
                                   // selected
            }.bind(this));
        },
        deserialize: function (json) {
            FormInputList.$superp.deserialize.call(this, this.multiple ? Json.unflatten(json) : json);
        },
        clear: function () {
            this.multiple ? this.value([]) : this.value('');
        }
    });

    return FormInputList;

});
