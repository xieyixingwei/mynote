var createHtml = function (grunt, taskname) {
    'use strict';
    var conf = grunt.config('createhtml')[taskname],
        tmpl = grunt.file.read(conf.template);

    grunt.config.set('templatesString', '');

    // register the task name in global scope so we can access it in the .tmpl file
    grunt.config.set('currentTask', {name: taskname});

    grunt.file.write(conf.dest, grunt.template.process(tmpl));
    grunt.log.writeln('Generated \'' + conf.dest + '\' from \'' + conf.template + '\'');
};

module.exports = function(grunt) {
    'use strict';

    grunt.initConfig( {
        pkg: grunt.file.readJSON('package.json'),

        // Our own js
        ownJs: [
            'js/init.js',
            'js/util.js',
            'js/stage.js',
            'js/include.js',
            'js/marked.js',
            'js/toc.js',
            'js/main.js',
        ],

        // Our own css
        ownCss: [
            'css/mycss.css',
            'css/toc.css',
        ],

        // lib js
        libJs: [
            'lib/jquery-3.5.1.js',
            'lib/prism.js',
        ],

        // lib js min
        // the min js of libJS's can't be placed in libJsMin
        libJsMin: [ ],

        // lib css
        // the min css of libCss can't be placed in libCss
        libCss: [ 
            'lib/prism.css',
        ],

        // lib css min
        libCssMin: [ ],

        // combine own js and own css
        concat: {
            // combine our own js
            js: {
                options: {
                    stripBanners: true,
                    banner: '/* jshint esversion: 6 */\n',
                },
                files: [{
                    src: '<%= ownJs %>',
                    dest: 'build/<%= pkg.name %>.js',
                }],
            },
            // combine our own css
            css: {
                src: '<%= ownCss %>',
                dest: 'build/<%= pkg.name %>.css',
            },
        },

        // check syntax of own js
        jshint: {
          all: ['<%= concat.js.files[0].dest %>']
        },

        // compress js
        uglify: {
            options: { },
            ownjs: {
                options: {
                    mangle: true,
                    preserveComments: 'all',
                },
                files: [{
                    src: '<%= concat.js.files[0].dest %>',
                    dest: 'build/<%= pkg.name %>.min.js',
                }],
            },
            libjs: {
                options: {
                    mangle: false,
                    preserveComments: 'all',
                },
                files: [{
                    expand: true,
                    src: '<%= libJs %>',
                    dest: 'build/',
                    rename: function (dst, src) {
                        return dst + '/' + src.replace('.js', '.min.js');
                    }
                }]
            },
        },

        // compress css
        cssmin: {
            options: {
                stripBanners: false,   // don't allow output header text
            },
            owncss: {
                src: '<%= concat.css.dest %>',
                dest: 'build/<%= pkg.name %>.min.css',
            },
            libcss: {
                files: [{
                    expand: true,
                    src: '<%= libCss %>',
                    dest: 'build/',
                    ext: '.min.css',
                }],
            },
        },

        createhtml: {
          release: {
              template: 'template.tmpl',
              dest: 'build/mywiki.html'
          },
          debug: {
              template: 'template.tmpl',
              dest: 'build/mywiki-debug.html'
          }
        },

        copy: {
            release: {
                expand: false,
                flatten: true,
                src: ['build/mywiki.html' ],
                dest: '/home/gn/Workspace/Study/mywiki.html',
            },
            release_debug: {
                expand: false,
                flatten: true,
                src: [ 'build/mywiki-debug.html' ],
                dest: '/home/gn/Workspace/Study/mywiki-debug.html',
            },
        },
    } );

    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify-es');
    grunt.loadNpmTasks('grunt-contrib-copy');

    grunt.registerTask('createhtml_release', 'Generate release html', function() {
        createHtml(grunt, 'release');
    });

    grunt.registerTask('createhtml_debug', 'Generate debug html', function() {
        createHtml(grunt, 'debug');
    });

    grunt.registerTask('release', ['concat:js', 'concat:css', 'jshint', 'uglify:ownjs', 'uglify:libjs', 'cssmin:owncss', 'cssmin:libcss', 'createhtml_release']);
    grunt.registerTask('debug', ['concat:js', 'concat:css', 'jshint', 'createhtml_debug']);

    grunt.registerTask('default', ['release', 'debug']);
};
