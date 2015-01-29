'use strict'
path = require('path')
# lrSnippet = require('grunt-contrib-livereload/lib/utils').livereloadSnippet

folderMount = (connect, point) ->
	return connect.static(path.resolve(point))

checkForModifiedImports = (grunt, path, time, include) ->
	# contents = grunt.file.read path
	include true

module.exports = (grunt) ->

	grunt.initConfig
		pkg: grunt.file.readJSON('package.json')

		sass:
			options:
				compass: false
				style: 'compact'
				debugInfo: false
				trace:     true
			files:
				expand: true
				cwd: 'css-sass/'
				src: ['*.sass', '*.scss', '!_*.sass', '!_*.scss']
				dest: 'css/'
				ext: '.css'


		autoprefixer:
			options:
				map: true
				browsers: ['last 4 versions', '> 1%']
			files: 
				src: 'css/*.css'


		newer:
			options:
				override: (detail, include) ->
					if detail.task is 'sass' or detail.task is 'jade'
						include true
						# checkForModifiedImports grunt, detail.path, detail.time, include
					else
						include false

		concat:
			dist:
				src: [
					"bower_components/underscore/underscore-min.js",
					"bower_components/jquery/dist/jquery.min.js",
					"bower_components/angular/angular.min.js",
					"bower_components/angular-route/angular-route.min.js",
					"bower_components/angular-resource/angular-resource.min.js",
					"bower_components/angular-sanitize/angular-sanitize.min.js",
					"bower_components/angular-animate/angular-animate.min.js",
					"bower_components/gsap/src/minified/TweenMax.min.js",
					"bower_components/bootstrap/js/button.js",
					"bower_components/bootstrap/js/dropdown.js",
					"node_modules/typogr/typogr.min.js",
					"app/js/app.js",
					"app/js/directives.js",
					"app/js/animations.js",
					"app/js/filters.js",
					"app/js/services.js",
					"app/js/controllers.js",
					],
				dest: 'js/listDigest.js'

		watch:
			options:
				spawn: false
			sass:
				files: ['css-sass/**/*.sass', 'css-sass/**/*.scss']
				tasks: ['sass', 'autoprefixer']
			css:
				options:
					livereload: {
						port: 9000
						key: grunt.file.read('//Applications/MAMP/certificates/twd.local.key')
						cert: grunt.file.read('//Applications/MAMP/certificates/twd.local.crt')
					}
				files: ['css/**/*']
			app:
				options:
					livereload: {
						port: 9000
						key: grunt.file.read('//Applications/MAMP/certificates/twd.local.key')
						cert: grunt.file.read('//Applications/MAMP/certificates/twd.local.crt')
					}
				files: ['app/**/*']



	require('load-grunt-tasks')(grunt);


	# Default task(s).
	grunt.registerTask('compile', ['sass', 'autoprefixer', 'concat'])
	grunt.registerTask('default', ['compile', 'watch'])