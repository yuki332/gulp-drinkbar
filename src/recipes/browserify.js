
import * as util from '../util'

/**
 * $ : object(plugins)
 * builder : object(TaskBuilder)
 * parameters : object
 *     .input  : string
 *     .inputs : array
 *     .output : string
 *     .clean  : string
 *     .cleans : array
 *     .config : object
 */
module.exports = function($, builder, parameters) {
	util.checkParameterIsObject(parameters)
	util.checkParameterHasOutput(parameters)

	let config = $.config
	let inputPaths = builder.resolvePaths(parameters.inputs || (parameters.input ? [parameters.input] : []))
	let outputPath = builder.resolvePath(parameters.output)
	let outputDirectory = $.path.dirname(outputPath)
	let outputFileTitle = $.path.basename(outputPath)
	let cleanPaths = builder.resolvePaths(parameters.cleans || (parameters.clean ? [parameters.clean] : []))
	let taskConfig = util.extend(config.browserify, parameters.config || {})

	$.gulp.task(builder.task, builder.dependentTasks, () => {
		if (!util.isPluginInstalled('browserify', 'gulp-drinkbar-browserify')) return
		if (!util.isValidGlobs(inputPaths)) return

		builder.trigger('before')

		return $.browserify(inputPaths, taskConfig)
			.transform($.browserify.babelify, taskConfig.babelify)
			.bundle()
			.on('error', function (err) {
				$.notify.onError({
					title: 'Gulp compile failed',
					message: '<%= error.message %>',
					onLast: true,
				})(err)

				this.emit('end')
			})
			.pipe($.source(outputFileTitle))
			.pipe($.buffer())
			.pipe($.notify({
				title: 'Gulp compile success!',
				message: '<%= file.relative %>',
			}))
			.pipe($.if(config.sourcemaps, $.sourcemaps.init({ loadMaps: true })))
			.pipe($.if(config.production, $.uglify(config.js.uglify)))
			.pipe($.if(config.sourcemaps, $.sourcemaps.write('.')))
			.pipe($.gulp.dest(outputDirectory))
			.on('end', function () {
				$.del.sync(cleanPaths)

				builder.trigger('after')
			})

		return result
	})
}
