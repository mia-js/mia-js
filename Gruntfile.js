module.exports = function (grunt) {

    require('jit-grunt')(grunt);
    //====================
    // React scripts
    //====================
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        watch: {
            react: {
                files: 'projects/demo/public/views/**/*.jsx',
                tasks: ['browserify']
            },
            styles: {
                files: ['projects/demo/public/assets/less/**/*.less'], // which files to watch
                tasks: ['less'],
                options: {
                    nospawn: true
                }
            }
        },

        browserify: {
            options: {
                transform: [require('grunt-react').browserify]
            },
            client: {
                src: ['projects/demo/public/views/**/*.jsx'],
                dest: 'projects/demo/public/assets/js/bundle.js'
            }
        },

        less: {
            development: {
                options: {
                    compress: true,
                    yuicompress: true,
                    optimization: 2
                },
                files: {
                    "projects/demo/public/assets/css/main.css": "projects/demo/public/assets/less/theme.less"  // destination file and source file
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('default', [
        'browserify'
    ]);

    grunt.registerTask('default', ['less', 'watch']);
};
