module.exports = function(grunt) {

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		concat: {
			dist: {
				src: [
					'js/libs/*.js',
					'js/site.js'
				],
				dest: 'js/build/production.js'
			}
		},

		uglify: {
			build: {
				src: 'js/build/production.js',
				dest: 'js/build/production.min.js'
			}
		},

		imagemin: {
			dynamic: {
				files: [{
					expand: true,
					cwd: 'assets/',
					src: ['**/*.{png,jpg,gif}'],
					dest: 'images/build/'

				}]
			}
		},

		watch: {
			scripts: {
				files: ['js/*.js'],
				tasks: ['concat', 'uglify'],
				options: {
					spawn: false
				}
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-imagemin');

	grunt.registerTask('default', ['concat', 'uglify', 'imagemin']);
};