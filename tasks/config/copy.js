/**
 * Copy files and folders.
 *
 * ---------------------------------------------------------------
 *
 * # dev task config
 * Copies all directories and files, exept coffescript and less fiels, from the sails
 * assets folder into the .tmp/public directory.
 *
 * # build task config
 * Copies all directories nd files from the .tmp/public directory into a www directory.
 *
 * For usage docs see:
 * https://github.com/gruntjs/grunt-contrib-copy
 */
module.exports = function (grunt) {

    grunt.config.set('copy', {
        dev: {
            files: [
                {
                    expand: true,
                    cwd: './assets',
                    src: ['**/*'],
                    dest: '.tmp/public'
                }
            ]
        },
        strip_code: {
            files: [
                {
                    expand: true,
                    cwd: './assets',
                    src: ['**/*'],
                    dest: './assets/cleaned'
                }
            ]
        },
        prod: {
            files: [
                {
                    expand: true,
                    cwd: './assets/build',
                    src: ['**/*'],
                    dest: '.tmp/public'
                }
            ]
        },
        www: {
            files: [
                {
                    expand: true,
                    cwd: './assets/build',
                    src: ['**/*'],
                    dest: './www'
                }
            ]
        }
    });

    grunt.loadNpmTasks('grunt-contrib-copy');

};
