module.exports = function(grunt) {

  require('load-grunt-tasks')(grunt);
  require('time-grunt')(grunt);

  var path = require('path');

  /**
   * some dependencies cannot be copied with grunt-copy-deps.
   * Instead, resolve external project resources as file path.
   */
  function resolvePath(project, file) {
    return path.join(path.dirname(require.resolve(project)), file);
  }

  grunt.initConfig({
    browserify: {
      options: {
        browserifyOptions: {
          debug: true
        },
        transform: [
          ['stringify', {
            extensions: ['.bpmn']
          }],
          ['babelify', {
            global: true,
            presets:['@babel/preset-env']
          }]
        ]
      },
      watch: {
        options: {
          watch: true
        },
        files: {
          'build/app.js': ['app/app.js']
        }
      },
      app: {
        files: {
          'build/app.js': ['app/app.js']
        }
      }
    },
    clean: ['build'],
    copydeps: {
      target: {
        options: {
          minified: true,
          unminified: true,
          css: true,
        },
        pkg: 'package.json',
        dest: 'build/dependencies/'
      }
    },
    copy: {
      bpmn_js: {
        files: [
          {
            expand: true,
            cwd: resolvePath('bpmn-js', 'build'),
            src: ['**/*.*', '!**/*.js'],
            dest: 'build/dependencies/bpmn-js'
          }
        ]
      },
      dot: {
        files: [
          {
            expand: true,
            cwd: 'node_modules/dot',
            src: ['**/*.min.js'],
            dest: 'build/dependencies'
          }
        ]
      },
      app: {
        files: [
          {
            expand: true,
            cwd: 'app/',
            src: ['**/*.*', '!**/*.js'],
            dest: 'build'
          }
        ]
      },
    },
    watch: {
      options: {
        livereload: true
      },

      samples: {
        files: ['app/**/*.*'],
        tasks: ['copy:app']
      },
    },

    connect: {
      livereload: {
        options: {
          port: 9013,
          livereload: true,
          hostname: 'localhost',
          open: true,
          base: [
            'build'
          ]
        }
      }
    }
  });

  // tasks
  grunt.loadNpmTasks('grunt-contrib-clean'); // https://github.com/gruntjs/grunt-contrib-clean
  grunt.loadNpmTasks('grunt-copy-deps'); // https://www.npmjs.com/package/grunt-copy-deps

  grunt.registerTask('build', ['clean', 'copy', 'copydeps', 'browserify:app']);

  grunt.registerTask('auto-build', [
    'clean',
    'copy',
    'copydeps',
    'browserify:watch',
    'connect:livereload',
    'watch'
  ]);

  grunt.registerTask('default', ['build']);

};
