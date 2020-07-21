define(['widget/form/form-input-sorter', 'widget/form/form', 'lib/director'], function (FormInputSorter, Form, Router) {

    return function (baseUrl) {
        var sorter = new Form([
            new FormInputSorter('sort', '', [
                { key: 'updatedAt', dir: 'desc', isDefault: true },
                { key: 'updatedAt', dir: 'asc' },
                { key: 'price.daily', dir: ['desc', 'asc'] },
                { key: 'deposit.amount', dir: ['desc', 'asc'] },
                { key: 'title', dir: ['asc', 'desc'] },
                { key: 'displayedAddress', dir: ['asc', 'desc'] },
                { key: 'createdAt', dir: ['desc', 'asc'] }
            ], false, ' ')
        ], function () {
            var serialization = sorter.serialize();
            Router().setRoute(baseUrl + (serialization && ('?' + serialization)));
        }, true);

        return sorter;
    };

});
