/**
 * Optimize JS and CSS using RequireJS' r.js optimizer.
 *
 * ---------------------------------------------------------------
 *
 * For usage docs see:
 * https://github.com/gruntjs/grunt-contrib-requirejs
 */
module.exports = function (grunt) {

    grunt.config.set('requirejs', {
        compile: {
            options: {
                appDir: 'assets/cleaned',
                baseUrl: 'js',
                dir: 'assets/build',
                mainConfigFile: 'assets/cleaned/js/common.js',
                optimize: 'uglify2',
                optimizeCss: 'standard',
                modules: [
                    {
                        name: 'common',
                        include: [
                            'app/shared/api/api',
                            'lib/jsface',
                            'util/error-reporter',
                            'widget/form/form',
                            'widget/form/form-input',
                            'framework/page',
                            'framework/router',
                            'app/shared/search-bar',
                            'lib/socket-io'
                        ]
                    },
                    {
                        name: 'app/contact/contact',
                        exclude: ['common']
                    },
                    {
                        name: 'app/document/document',
                        exclude: ['common']
                    },
                    {
                        name: 'app/error/error',
                        exclude: ['common']
                    },
                    {
                        name: 'app/home/home',
                        exclude: ['common']
                    },
                    {
                        name: 'app/listing/create/create',
                        exclude: ['common']
                    },
                    {
                        name: 'app/listing/detail/detail',
                        exclude: ['common']
                    },
                    {
                        name: 'app/listing/edit/edit',
                        exclude: ['common']
                    },
                    {
                        name: 'app/listing/questions/questions',
                        exclude: ['common']
                    },
                    {
                        name: 'app/listing/reservation/reservation',
                        exclude: ['common']
                    },
                    {
                        name: 'app/listing/reserve/reserve',
                        exclude: ['common']
                    },
                    {
                        name: 'app/listing/search/search',
                        exclude: ['common']
                    },
                    {
                        name: 'app/login/login',
                        exclude: ['common']
                    },
                    {
                        name: 'app/logout/logout',
                        exclude: ['common']
                    },
                    {
                        name: 'app/my/account/account',
                        exclude: ['common']
                    },
                    {
                        name: 'app/my/favorites/favorites',
                        exclude: ['common']
                    },
                    {
                        name: 'app/my/listings/listings',
                        exclude: ['common']
                    },
                    {
                        name: 'app/my/profile/profile',
                        exclude: ['common']
                    },
                    {
                        name: 'app/my/reservations/reservations',
                        exclude: ['common']
                    },
                    {
                        name: 'app/pickup-return/pickup-return',
                        exclude: ['common']
                    },
                    {
                        name: 'app/register/register',
                        exclude: ['common']
                    },
                    {
                        name: 'app/reset-password/reset-password',
                        exclude: ['common']
                    },
                    {
                        name: 'app/verify-email/verify-email',
                        exclude: ['common']
                    }
                ],
                done: function (done, output) {
                    console.log(output);
                    console.log('Running r.js build analysis...');
                    var duplicates = require('rjs-build-analysis').duplicates(output);
                    if (duplicates) {
                        console.log('Found the following duplicates:');
                        console.log(JSON.stringify(duplicates, null, 4));
                    }
                    done();
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-requirejs');

};
