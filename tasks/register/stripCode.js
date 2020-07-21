module.exports = function (grunt) {
    grunt.registerTask('stripCode', [
        'copy:strip_code',
        'strip_code'
    ]);
};
