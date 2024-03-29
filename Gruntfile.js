// Generated on 2014-02-06 using generator-angular 0.7.1
'use strict';

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

module.exports =
    function (grunt) {

        // Load grunt tasks automatically
        require('load-grunt-tasks')(grunt);

        // Time how long tasks take. Can help when optimizing build times
        require('time-grunt')(grunt);

        // Define the configuration for all the tasks
        grunt
            .initConfig({

                // Project settings
                yeoman : {
                    // configurable paths
                    app : require('./bower.json').appPath || 'app',
                    dist : 'dist'
                },

                // Watches files for changes and runs tasks based on the changed
                // files
                watch : {
                    js : {
                        files : [
                            '<%= yeoman.app %>/scripts/**/*.js'
                        ],
                        tasks : [
                            //'newer:jshint:all',
                            'bump:build'
                        ],
                        options : {
                            livereload : true,
                            interval: 5007
                        }
                    },
                    jsTest : {
                        files : [
                            'test/spec/{,*/}*.js'
                        ],
                        tasks : [
                            'newer:jshint:test', 'karma:unit'
                        ]
                    },
                    styles : {
                        files : [
                            '<%= yeoman.app %>/styles/{,*/}*.less'
                        ],
                        tasks : [
                            'less', 'newer:copy:styles', 'autoprefixer'
                        ]
                    },
                    gruntfile : {
                        files : [
                            'Gruntfile.js'
                        ]
                    },
                    livereload : {
                        options : {
                            livereload : '<%= connect.options.livereload %>',
                            interval: 5007
                        },
                        files : [
                            '<%= yeoman.app %>/**/*.html',
                            '.tmp/styles/{,*/}*.css'
                            //'<%= yeoman.app %>/images/**/*.{png,jpg,jpeg,gif,webp,svg}'
                        ]
                    }
                },

                // The actual grunt server settings
                connect : {
                    options : {
                        port : 9000,
                        // Change this to '0.0.0.0' to access the server from
                        // outside.
                        // hostname: 'localhost', //original
                        hostname : '0.0.0.0', // original
                        livereload : 35729
                    },
                    livereload : {
                        options : {
                            hostname : 'localhost',
                            open : true,
                            base : [
                                '.tmp', '<%= yeoman.app %>'
                            ]
                        }
                    },
                    test : {
                        options : {
                            port : 9001,
                            base : [
                                '.tmp', 'test', '<%= yeoman.app %>'
                            ]
                        }
                    },
                    dist : {
                        options : {
                            base : '<%= yeoman.dist %>'
                        }
                    }
                },

                // Make sure code styles are up to par and there are no obvious
                // mistakes
                jshint : {
                    options : {
                        jshintrc : '.jshintrc',
                        reporter : require('jshint-stylish')
                    },
                    all : [
                        'Gruntfile.js', '<%= yeoman.app %>/scripts/**/*.js'
                    ],
                    test : {
                        options : {
                            jshintrc : 'test/.jshintrc'
                        },
                        src : [
                            'test/spec/{,*/}*.js'
                        ]
                    }
                },

                // Empties folders to start fresh
                clean : {
                    dist : {
                        files : [
                            {
                                dot : true,
                                src : [
                                    '.tmp', '<%= yeoman.dist %>/*', '!<%= yeoman.dist %>/.git*'
                                ]
                            }
                        ]
                    },
                    server : '.tmp'
                },

                // Add vendor prefixed styles
                autoprefixer : {
                    options : {
                        browsers : [
                            'last 1 version'
                        ]
                    },
                    dist : {
                        files : [
                            {
                                expand : true,
                                cwd : '.tmp/styles/',
                                src : '{,*/}*.css',
                                dest : '.tmp/styles/'
                            }
                        ]
                    }
                },

                // Less
                less : {
                    dist : {
                        options : {
                            compress : true,
                            yuicompress : true,
                            optimization : 2
                        },
                        files : {
                            // target.css file: source.less file
                            '<%= yeoman.app %>/styles/css/main.css' : '<%= yeoman.app %>/styles/less/main.less'
                        }
                    }
                },

                ngtemplates:  {
                    glowingCatalogApp: {
                        cwd:      'app',
                        src:      ['views/**/*.html', 'routes/**/*.html', 'components/**/*.html'],
                        dest:     'dist/scripts/templates.js',
                        options:  {
                            usemin: 'scripts/scripts.js',
                            htmlmin: {
                                //collapseBooleanAttributes:      true,
                                //collapseWhitespace:             true,
                                //removeAttributeQuotes:          true,
                                //removeComments:                 true, // Only if you don't use comment directives!
                                //removeEmptyAttributes:          true,
                                //removeRedundantAttributes:      true,
                                //removeScriptTypeAttributes:     true,
                                //removeStyleLinkTypeAttributes:  true
                            }
                        }
                    }
                },

                // Automatically inject Bower components into the app
                'bower-install' : {
                    app : {
                        html : '<%= yeoman.app %>/index.html',
                        ignorePath : '<%= yeoman.app %>/'
                    }
                },

                // Renames files for browser caching purposes
                rev : {
                    dist : {
                        files : {
                            src : [
                                '<%= yeoman.dist %>/scripts/**/*.js',
                                '<%= yeoman.dist %>/styles/**/*.css',
                                '<%= yeoman.dist %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
                                '<%= yeoman.dist %>/styles/fonts/*'
                            ]
                        }
                    }
                },

                // Reads HTML for usemin blocks to enable smart builds that
                // automatically
                // concat, minify and revision files. Creates configurations in
                // memory so
                // additional tasks can operate on them
                useminPrepare : {
                    html : '<%= yeoman.app %>/index.html',
                    options : {
                        dest : '<%= yeoman.dist %>'
                    }
                },

                // Performs rewrites based on rev and the useminPrepare
                // configuration
                usemin : {
                    html : [
                        '<%= yeoman.dist %>/*.html',
                        // FIXME remove this '<%= yeoman.dist %>/views/**/*.html',
                        //'<%= yeoman.dist %>/components/**/*.html'
                    ],
                    css : [
                        '<%= yeoman.dist %>/styles/**/*.css'
                    ],
                    options : {
                        assetsDirs : [
                            '<%= yeoman.dist %>'
                        ]
                    }
                },

                // The following *-min tasks produce minified files in the dist
                // folder
                imagemin : {
                    dist : {
                        files : [
                            {
                                expand : true,
                                cwd : '<%= yeoman.app %>/images',
                                src : ['**/*.{png,jpg,jpeg,gif}', '!**/catalogOld/**'],
                                dest : '<%= yeoman.dist %>/images'
                            }
                        ]
                    }
                },
                svgmin : {
                    dist : {
                        files : [
                            {
                                expand : true,
                                cwd : '<%= yeoman.app %>/images',
                                src : '{,*/}*.svg',
                                dest : '<%= yeoman.dist %>/images'
                            }
                        ]
                    }
                },
                htmlmin : {
                    dist : {
                        options : {
                            collapseWhitespace : true,
                            collapseBooleanAttributes : true,
                            removeCommentsFromCDATA : true,
                            removeOptionalTags : true
                        },
                        files : [
                            {
                                expand : true,
                                cwd : '<%= yeoman.dist %>',
                                src : [
                                    '*.html', 'views/**/*.html', 'components/**/*.html'
                                ],
                                dest : '<%= yeoman.dist %>'
                            }
                        ]
                    }
                },

                // Allow the use of non-minsafe AngularJS files. Automatically
                // makes it
                // minsafe compatible so Uglify does not destroy the ng
                // references
                ngmin : {
                    dist : {
                        files : [
                            {
                                expand : true,
                                cwd : '.tmp/concat/scripts',
                                src : '*.js',
                                dest : '.tmp/concat/scripts'
                            }
                        ]
                    }
                },

                // Replace Google CDN references
                cdnify : {
                    dist : {
                        html : [
                            '<%= yeoman.dist %>/*.html'
                        ]
                    }
                },

                // Copies remaining files to places other tasks can use
                copy : {
                    dist : {
                        files : [
                            {
                                expand : true,
                                dot : true,
                                cwd : '<%= yeoman.app %>',
                                dest : '<%= yeoman.dist %>',
                                src : [
                                    '*.{ico,png,txt}',
                                    '.htaccess',
                                    '*.html',
                                    //'views/**/*.html',
                                    //'components/**/*.html',
                                    'bower_components/**/*',
                                    'images/{,*/}*.{webp}',
                                    'fonts/*',
                                    'styles/**/*.css',
                                    'resources/**/*',
                                    'scripts/**/*'
                                ]
                            },
                            {
                                src: '<%= yeoman.app %>/wishlist.manifest.dist',
                                dest: '<%= yeoman.dist %>/wishlist.manifest'
                            },
                            {
                                expand : true,
                                cwd : '.tmp/images',
                                dest : '<%= yeoman.dist %>/images',
                                src : [
                                    'generated/*'
                                ]
                            }
                        ]
                    },
                    styles : {
                        expand : true,
                        cwd : '<%= yeoman.app %>/styles',
                        dest : '.tmp/styles/',
                        src : '**/*.css'
                    }
                },

                // Run some tasks in parallel to speed up the build process
                concurrent : {
                    server : [
                        'copy:styles'
                    ],
                    test : [
                        'copy:styles'
                    ],
                    dist : [
                        'copy:styles', 'imagemin', 'svgmin'
                    ]
                },

                // By default, your `index.html`'s <!-- Usemin block --> will
                // take care of
                // minification. These next options are pre-configured if you do
                // not wish
                // to use the Usemin blocks.
                // cssmin: {
                // dist: {
                // files: {
                // '<%= yeoman.dist %>/styles/main.css': [
                // '.tmp/styles/{,*/}*.css',
                // '<%= yeoman.app %>/styles/{,*/}*.css'
                // ]
                // }
                // }
                // },
                // uglify: {
                // dist: {
                // files: {
                // '<%= yeoman.dist %>/scripts/scripts.js': [
                // '<%= yeoman.dist %>/scripts/scripts.js'
                // ]
                // }
                // }
                // },
                // concat: {
                // dist: {}
                // },

                // Test settings
                karma : {
                    unit : {
                        configFile : 'karma.conf.js',
                        singleRun : true
                    },
                    continuous : {
                        configFile : 'karma.conf.js',
                        singleRun : true,
                        browsers : [
                            'PhantomJS'
                        ],
                        reporters : [
                            'dots', 'junit'
                        ],
                        junitReporter : {
                            outputFile : 'test-results.xml'
                        }
                    },
                    coverage : {
                        configFile : 'karma.conf.js',
                        singleRun : true,
                        browsers : [
                            'PhantomJS'
                        ],
                        preprocessors : {
                            'app/scripts/**/*.js' : 'coverage',
                            'app/components/**/*.js' : 'coverage'
                        },
                        reporters : [
                            'coverage'
                        ],
                        coverageReporter : {
                            type : 'html',
                            dir : 'coverage/'
                        }
                    }
                },

                bump: {
                    options: {
                        files: ['package.json', 'app/wishlist.manifest', 'app/wishlist.manifest.dist'],
                        updateConfigs: [],
                        commit: false,
                        commitMessage: 'Release v%VERSION%',
                        commitFiles: ['package.json'],
                        createTag: false,
                        tagName: 'v%VERSION%',
                        tagMessage: 'Version %VERSION%',
                        push: false,
                        pushTo: 'upstream',
                        gitDescribeOptions: '--tags --always --abbrev=1 --dirty=-d' // options to use with '$ git describe'
                    }
                },

                compress : {
                    main : {
                        options : {
                            mode : 'tgz',
                            archive : 'target/build.tgz'
                        },
                        files : [
                            {
                                expand : true,
                                src : '**/*',
                                cwd : 'dist/',
                                dot : true
                            }
                        ]
                    }
                }
            });

        grunt.registerTask('serve', function (target) {
            if (target === 'dist') {
                return grunt.task.run([
                    'build', 'connect:dist:keepalive'
                ]);
            }

            grunt.task.run([
                'clean:server',
                'bower-install',
                //'less',
                'concurrent:server',
                //'autoprefixer',
                'connect:livereload',
                'watch'
            ]);
        });

        grunt
            .registerTask(
                'server',
                function () {
                    grunt.log
                        .warn('The `server` task has been deprecated. Use `grunt serve` to start a server.');
                    grunt.task.run([
                        'serve'
                    ]);
                });

        grunt.registerTask('test', [
            'clean:server', 'concurrent:test', 'less', 'autoprefixer', 'connect:test', 'karma:unit'
        ]);

        grunt.registerTask('build', [
            'clean:dist',
            'bower-install',
            'useminPrepare',
            'concurrent:dist',
            'ngtemplates',
            //'less',
            //'autoprefixer',
            'concat',
            'ngmin',
            'copy:dist',
            'cdnify',
            'cssmin',
            'uglify',
            // No need to revision since the manifest forces update 'rev',
            'usemin',
            // FIXME uncomment this 'htmlmin'
        ]);

        grunt.registerTask('default', [
            'newer:jshint', 'test', 'build'
        ]);

        grunt.registerTask('cibuild', [
            'karma:continuous', 'build', 'compress'
        ]);
    };
