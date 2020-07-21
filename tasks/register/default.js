module.exports = function (grunt) {
    grunt.registerTask('default', [
        'clean:all',
        'copy:dev',
        'watch'
    ]);
};
