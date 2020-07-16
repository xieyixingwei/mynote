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
        // Our own css
        ownCss: [
            'css/mycss.css',
        ],

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

        // lib css
        libCss: [ 
            'lib/prism/prism.css',
        ],

        libCssMin: [
            'lib/prism/prism.min.css',
        ],

        // lib js
        libJs: [
            'lib/jquery/jquery-3.5.0.js',
            'lib/prism/prism.js',
        ],

        libJsMin: [
            'lib/jquery/jquery-3.5.0.min.js',
            'lib/prism/prism.min.js',
        ],

        // conbine own js and own css
        concat: {
            options: {
                stripBanners: true,
                banner: '/* jshint esversion: 6 */\n',
            },
            js: {
                src: '<%= ownJs %>',
                dest: 'build/<%= pkg.name %>.js',
            },
            css: {
                src: '<%= ownCss %>',
                dest: 'build/<%= pkg.name %>.css',
            },
        },

        // check syntax of own js
        jshint: {
          all: ['<%= concat.js.dest %>']
        },

        // compress js
        uglify: {
            options: {
                // banner: '<%= banner %>'
            },
            ownjs: {
                src: '<%= concat.js.dest %>',
                dest: 'build/<%= pkg.name %>.min.js'
            },
            libjs: {
                src: '<%= libJs %>',
                dest: 'build/<%= pkg.name %>.min.js'
            }
        },

        // compress css
        cssmin: {
            options: {
                stripBanners: false,   // don't allow output header text
            },
            build: {
                src: '<%= ownCss %>',
                dest:'build/mycss.min.css',
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

    grunt.registerTask('release', ['cssmin:build', 'concat:build', 'jshint', 'uglify:build', 'createhtml_release']);
    grunt.registerTask('debug', ['cssmin:build', 'concat:build', 'jshint', 'uglify:build', 'createhtml_debug']);

    grunt.registerTask('default', ['release', 'debug']);
};
