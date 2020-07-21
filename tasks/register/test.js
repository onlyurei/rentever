module.exports = function (grunt) {
    grunt.registerTask('test', [
        'mochaTest',
        //for some reason .tmp is tampered after mochaTest, have to redo these in order to keep frontend working after commits without bouncing sails
        'clean:all',
        'copy:dev'
    ]);
};
