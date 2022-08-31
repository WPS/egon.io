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
          'dist/app.js': ['app/app.js'],
          // 'dist/domain-story-modeler/features/runtime-quality-analysis/index.js': ['index.js']
        }
      },
      app: {
        files: {
          'dist/app.js': ['app/app.js'],
          // 'dist/domain-story-modeler/features/runtime-quality-analysis/index.js': ['index.js']
        }
      }
    },
    clean: ['dist'],
    copydeps: {
      target: {
        options: {
          minified: true,
          unminified: true,
          css: true,
        },
        pkg: 'package.json',
        dest: 'dist/dependencies/'
      }
    },
    copy: {
      bpmn_js: {
        files: [
          {
            expand: true,
            cwd: resolvePath('bpmn-js', 'dist'),
            src: ['**/*.*', '!**/*.js'],
            dest: 'dist/dependencies/bpmn-js'
          }
        ]
      },
      dot: {
        files: [
          {
            expand: true,
            cwd: 'node_modules/dot',
            src: ['**/*.min.js'],
            dest: 'dist/dependencies'
          }
        ]
      },
      app: {
        files: [
          {
            expand: true,
            cwd: 'app/',
            src: ['**/*.*', '!**/*.js'],
            dest: 'dist'
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
            'dist'
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
