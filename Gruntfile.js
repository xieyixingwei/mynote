var createHtml = function (grunt, taskname) {
    'use strict';
    let conf = grunt.config('createhtml')[taskname],
        tmpl = grunt.file.read(conf.template);

    grunt.config.set('templatesString', '');

    // register the task name in global scope so we can access it in the .tmpl file
    grunt.config.set('currentTask', {name: taskname});

    grunt.file.write(conf.dest, grunt.template.process(tmpl));
    grunt.log.writeln('Generated \'' + conf.dest + '\' from \'' + conf.template + '\'');
};

module.exports = function(grunt) {
    'use strict';
  
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        // Our own css and js
        ownCss: 'css/mycss.css',
        ownJs: [
            'js/init.js',
            'js/util.js',
            'js/stage.js',
            'js/marked.js',
            'js/toc.js',
            'js/main.js',
        ],

        // lib css and js
        libCss: [ ],
        libCssMin: [ ],

        libJs: [
            'lib/js/jquery-3.5.0.js',
        ],
        libJsMin: [
            'lib/js/jquery-3.5.0.min.js',
        ],

        // task
        cssmin: {
            options: {
                stripBanners: false,   // don't allow output header text
            },
            build: {
                src: '<%= ownCss %>',
                dest:'build/mycss.min.css',
            },
        },

        concat: {
            options: {
                stripBanners: true,
                banner: '/* jshint esversion: 6 */\n',
            },
            build: {
                src: '<%= ownJs %>',
                dest: 'build/<%= pkg.name %>.js',
            },
        },

        jshint: {
          all: ['<%= concat.build.dest %>']
        },

        uglify: {
            options: {
                // banner: '<%= banner %>'
            },
            build: {
                src: '<%= concat.build.dest %>',
                dest: 'build/<%= pkg.name %>.min.js'
            }
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
    });

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

    grunt.registerTask('release', ['cssmin:build', 'concat:build', 'jshint', 'uglify:build', 'createhtml_release']);
    grunt.registerTask('debug', ['cssmin:build', 'concat:build', 'jshint', 'uglify:build', 'createhtml_debug']);

    grunt.registerTask('default', ['release', 'debug']);
};
