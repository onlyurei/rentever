define(['app/shared/api/api', 'app/shared/config', 'knockout', 'lib/sugar'], function (Api, Config, ko) {

    function addNewMessage(message) {
        Api.call(Messages.model + 'Message', 'populate', { id: message.id, field: 'sender' }).done(function (sender) {
            message.sender = sender;
            Messages.messages.unshift(Object.merge(message, { newlyAdded: true }));
        });
    }

    var Messages = {
        init: function (model, modelId, ownerId, error, loading) {
            Messages.model = model;
            Messages.modelId = modelId;
            Messages.ownerId(ownerId);
            Messages.error = error;
            Messages.loading = loading;
        },
        controllers: {
            '/:vanity/:modelId': function (vanity, modelId) {
                var criteria = {};
                criteria[Messages.model] = modelId;
                return Api.call(Messages.model + 'Message', 'find', { params: '?where=' + JSON.stringify(criteria) + '&' + window.location.search.remove('?') },
                    null, Messages.error, Messages.loading)
                    .done(function (messages) {
                        Messages.messages(messages.results);
                        Messages.page(messages.page);
                        Messages.pageSize(messages.pageSize);
                        Messages.total(messages.total);
                    });
            }
        },
        model: '',
        modelId: '',
        ownerId: ko.observable(''),
        messages: ko.observableArray([]),
        message: ko.observable(''),
        sendMessage: function () {
            if (Config().isLoggedIn && Messages.message().compact()) {
                var data = {
                    sender: Config().user.id,
                    message: Messages.message()
                };
                data[Messages.model] = Messages.modelId;
                Api.call(Messages.model + 'Message', 'create', null, data, Messages.error, Messages.loading).done(function (message) {
                    addNewMessage(message);
                    Messages.message('');
                });
            }
        },
        loading: ko.observable(false),
        error: ko.observable(''),
        page: ko.observable(0),
        pageSize: ko.observable(0),
        total: ko.observable(0)
    };

    return Messages;

});
