const fs = require('fs');
const path = require('path');

/// <binding />
// Se da visual studio non funziona il task runner seguire questa risposta:
// https://stackoverflow.com/questions/37986800/node-sass-could-not-find-a-binding-for-your-current-environment/41454385#41454385
module.exports = function (grunt) {
    'use strict';
    let srcPath = "src";
    let tsFolder = srcPath + "/ts";
    let targetPath = "static";
    let jsFolder = targetPath + "/js";
    let cssFolder = targetPath + '/css';
    let tsExtention = ".tsx";
    let rootTsFiles = [];
    let browserifyTasks = [];
    let watchTasks = [];

    let files = fs.readdirSync(tsFolder);
    files.map((file) => {
        var filePath = path.join(tsFolder, file);
        var hasExtention = file.endsWith(tsExtention);
        if (!fs.statSync(filePath).isDirectory() && hasExtention) {
            let name = file.replace(tsExtention, "");
            rootTsFiles.push(name);
            browserifyTasks.push("browserify:" + name);
            watchTasks.push("watch:" + name);
        } 
    });
    
    console.log(rootTsFiles);

    let getBundleBuild = (fileName) => {
        let option = {
            options: {
                browserifyOptions: {
                    debug: true,
                },
                configure: function (bundler) {
                    bundler.plugin(require('tsify'));
                    bundler.transform(require('babelify'), {
                        presets: ['es2015', 'react'],
                        extensions: ['.ts', '.tsx', '.js', '.jsx']
                    });
                }
            },
            files: [{
                expand: true,
                cwd: tsFolder,
                src: fileName + '.tsx',
                dest: jsFolder,
                ext: '-bundle.js',
                extDot: 'last'
            }]
        };
        return option;
    };

    // Project configuration.
    let gruntConfig = {
        pkg: grunt.file.readJSON('package.json'),
        // Clean
        clean: {
            css: [cssFolder],
            js: [jsFolder]
        },

        // Sass
        sass: {
            options: {
                sourceMap: true,
                outputStyle: 'compressed' // Minify output
            },
            dist: {
                files: [{
                    expand: true, // Recursive
                    cwd: srcPath + "/scss", // The startup directory
                    src: ["*.scss"], // Source files
                    dest: cssFolder, // Destination
                    ext: ".css" // File extension
                }]
            }
        },

        ts: {
            default: {
                tsconfig: './tsconfig.json',
                src: [tsFolder + "/*.ts", "!node_modules/**"]
            }
        },

        // Browserify
        browserify: {
            main: {
                options: {
                    browserifyOptions: {
                        debug: true,
                    },
                    configure: function (bundler) {
                        bundler.plugin(require('tsify'));
                        bundler.transform(require('babelify'), {
                            presets: ['es2015', 'react'],
                            extensions: ['.ts', '.tsx', '.js', '.jsx']
                        });
                    }
                },
                files: [{
                    expand: true,
                    cwd: tsFolder,
                    src: '*.tsx',
                    dest: jsFolder,
                    ext: '-bundle.js',
                    extDot: 'last'
                }]
            }
        },

        concurrent: {
            js: browserifyTasks
        },

        // Watch
        watch: {
            css: {
                files: [srcPath + '/scss/*.scss', srcPath + '/scss/**/*.scss', srcPath + '/scss/**/**/*.scss'],
                tasks: ['sass-task'],
                options: {
                    spawn: false,
                },
            },
            js: {
                files: [tsFolder + '/*.*', tsFolder + '/**/*.*', tsFolder + '/**/**/*.*'],
                tasks: ['scripts-task'],
                options: {
                    spawn: false,
                }
            }
        },
    };
    rootTsFiles.map((file) => {
        // Clean Task
        let filePath = jsFolder + "/" + file + "-bundle.js";
        gruntConfig.clean[file] = [filePath];

        // Browserify Task
        gruntConfig.browserify[file] = getBundleBuild(file);

        // Watch Task
        let watchFolder = tsFolder + "/" + file;
        let watchConfig = {
            files: [
                tsFolder +  "/" + file + ".tsx",
                watchFolder + '/*.*', 
                watchFolder + '/**/*.*', 
                watchFolder + '/**/**/*.*'],
            tasks: ['clean:' + file, 'browserify:' +  file],
            options: {
                spawn: false,
            }
        };
        gruntConfig.watch[file] = watchConfig;
    });
    grunt.initConfig(gruntConfig);

    // Load the plugin
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-sass');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-babel');
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-concurrent');

    // Default task(s).
    browserifyTasks.unshift('clean:js');
    grunt.registerTask('scripts-task-async', ['clean:js', 'concurrent:js']);
    grunt.registerTask('scripts-task', browserifyTasks);
    grunt.registerTask('type-task', ['clean:js', 'ts']);
    grunt.registerTask('clean-task', ['clean:css', 'clean:js']);
    grunt.registerTask('sass-task', ['clean:css', 'sass']);
    grunt.registerTask('css-watch-task', ['sass-task', 'watch:css']);
    grunt.registerTask('js-watch-task', ['scripts-task', 'watch:js']);
    grunt.registerTask('build', ['clean-task', 'copy-task', 'sass-task', 'scripts-task']);
};