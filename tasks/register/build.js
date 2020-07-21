module.exports = function (grunt) {
    grunt.registerTask('build', [
        'clean:temp',
        'stripCode',
        'optimize',
        'clean:www',
        'copy:www'
    ]);
};
