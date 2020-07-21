/**
 * Remove dev and test only code blocks from production builds.
 *
 * ---------------------------------------------------------------
 *
 * The grunt-strip-code plugin is used to remove sections of code from production builds that are only needed in development and test environments.
 * grunt-strip-code uses start and end comments to identify the code sections to strip out.
 *
 * For usage docs see:
 * https://github.com/nuzzio/grunt-strip-code
 */
module.exports = function (grunt) {

    grunt.config.set('strip_code', {
        all: {
            src: './assets/cleaned/**/*.js'
        }
    });

    grunt.loadNpmTasks('grunt-strip-code');

};
