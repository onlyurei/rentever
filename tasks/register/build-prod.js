module.exports = function (grunt) {
    grunt.registerTask('buildProd', [
        'clean:temp',
        'stripCode',
        'optimize',
        'clean:dev',
        'copy:prod'
    ]);
};
