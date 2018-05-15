/*global module, require */
(function() {
  "use strict";

  module.exports = function(grunt) {

    grunt.initConfig({
      pkg: grunt.file.readJSON('package.json'),

      project: {
        html: [
          'frontend/html/*.html'
        ],
        js: [
          'frontend/js/lib/*.js',
          'frontend/js/*.js'
        ],
        scss: [
          'frontend/scss/*.scss'
        ],
        baseScss: [
          'frontend/scss/style.scss'
        ]
      },

      sass: {
        dev: {
          options: {
            style: 'nested'
          },
          files: {
            'build/style.css': '<%= project.baseScss %>'
          }
        },
        dist: {
          options: {
            style: 'compressed'
          },
          files: {
            'build/style.css': '<%= project.baseScss %>'
          }
        }
      },

      concat_in_order: {
        js: {
          files: {
            'build/app.js': [
              '<%=project.js %>'
            ]
          },
          options: {
            extractRequired: function () {
              return [];
            },
            extractDeclared: function () {
              return [];
            }
          }
        },
        html: {
          files: {
            'build/index.html': [
              '<%=project.html %>'
            ]
          },
          options: {
            extractRequired: function () {
              return [];
            },
            extractDeclared: function () {
              return [];
            }
          }
        }
      },

      jshint: {
        options: {
          laxbreak: true
        },
        default: [
          '<%=project.js %>'
        ]
      },
      
      uglify: {
        dist: {
          files: {
            'build/app.min.js': 'build/app.js'
          }
        }
      },

      watch: {
        sass: {
          files: "<%= project.scss %>",
          tasks: ['sass:dev']
        },
        concat_in_order: {
          files: ["<%= project.js %>", "<%= project.html %>"],
          tasks: [ 'concat_in_order' ]
        }
      }
    });

    grunt.loadNpmTasks("grunt-sass");

    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    grunt.registerTask('default', [
      'sass:dev',
      'concat_in_order',
    ]);


    grunt.registerTask('devel', [
      'sass:dev',
      'concat_in_order',
      'watch'
    ]);

    grunt.registerTask('deploy', [
      'sass:dist',
      'concat_in_order',
      'uglify:dist'
    ]);
  };
}());
