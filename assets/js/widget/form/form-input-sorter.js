define(['widget/form/form-input', 'lib/jsface', 'lib/sugar'], function (FormInput, Class) {

    var FormInputSorter = Class(FormInput, {
        constructor: function (orderByKey, orderDirKey, options, initFromQueryString, orderByAndDirConnector) {
            FormInputSorter.$super.call(this, 'sorter', '', false, null, true, initFromQueryString);

            this.orderByKey = orderByKey;
            this.orderDirKey = orderDirKey;
            this.options = options.map(function (option) {
                if (option.isDefault) {
                    this.value(option);
                }
                return Object.isArray(option.dir) ? option.dir.map(function (dir) {
                    return {
                        key: option.key,
                        dir: dir
                    };
                }) : option;
            }.bind(this)).flatten();
            this.orderByAndDirConnector = orderByAndDirConnector;

            return this;
        },
        serialize: function (toHash) {
            var value = this.value();

            if ((value === undefined) || (value === null) || ((typeof value == 'string') && (value.compact() === '')) || value.isDefault) {
                if (toHash) {
                    return {};
                }
                return '';
            }

            if (toHash) {
                var hash = {};
                if (this.orderByAndDirConnector) {
                    hash[this.orderByKey] = value.key + this.orderByAndDirConnector + value.dir;
                } else {
                    hash[this.orderByKey] = value.key;
                    hash[this.orderDirKey] = value.dir;
                }
                return hash;
            }
            return value.isDefault ? '' : (this.orderByKey + '=' + value.key + (this.orderByAndDirConnector ? (this.orderByAndDirConnector + value.dir) : ('&' + this.orderDirKey + '=' + value.dir)));
        },
        deserialize: function (json) {
            var _option = this.options.find(function (option) {
                return this.orderByAndDirConnector ? (json[this.orderByKey] == (option.key + this.orderByAndDirConnector + option.dir)) :
                       (json[this.orderByKey] == option.key) && (json[this.orderDirKey] == option.dir);
            }.bind(this));
            if (_option) {
                this.value(_option);
            }
        },
        fromQueryString: function (queryString) {
            var json = Object.fromQueryString(queryString || window.location.search);
            this.deserialize(json);
        }
    });

    return FormInputSorter;

});
