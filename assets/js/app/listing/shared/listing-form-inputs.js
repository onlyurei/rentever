define([
    'util/regex-patterns', 'widget/form/form-input-list', 'widget/form/form-input-location', 'widget/form/form-input',
    'locale/strings'
], function (RegexPatterns, FormInputList, FormInputLocation, FormInput, Strings) {

    return function () {
        return [
            new FormInput('title', '', true),
            new FormInput('description.short', '', true),
            new FormInput('description.long', '', true),
            new FormInputList('categories', [], '/api/listing/getCategories', true, true),
            new FormInput('price.daily', '', true, [
                { rule: RegexPatterns.positiveNumber, message: Strings('error.type.positiveNumber') }
            ]),
            new FormInput('deposit.required', true),
            new FormInput('deposit.amount', 20),
            new FormInputLocation('displayedAddress', '', true, null, false, false, false, '/api/geo/normalizeAddress'),
            new FormInput('unavailable', false)
        ];
    };

});
