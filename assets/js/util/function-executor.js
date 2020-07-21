define(function () {
    return function execute(exec, tester, testInterval) {
        if (typeof exec == 'function') {
            if (((typeof tester == 'function') && tester()) || ((typeof tester != 'function') && tester)) {
                exec();
            } else {
                setTimeout(function () {
                    execute(exec, tester, testInterval);
                }, testInterval || 100);
            }
        }
    };
});
