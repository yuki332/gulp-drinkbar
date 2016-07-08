
import plugins from './plugins'
import config from './config'
import notifier from 'node-notifier'



plugins.config = config



const drinkbar = {
	config: config,

	plugins: plugins,

	watches: {},
}



drinkbar.TaskBuilder = function (task, dependentTasks) {
	this.task = task
	this.dependentTasks = dependentTasks
	this.handlers = {
		before: [],
		after: [],
	}
}

drinkbar.task = (task, dependentTasks = []) => {
	return new drinkbar.TaskBuilder(task, dependentTasks)
}

drinkbar.TaskBuilder.prototype.on = function (event, closure) {
	this.handlers[event].push(closure)
	return this
}

drinkbar.TaskBuilder.prototype.trigger = function (event, ...args) {
	this.handlers[event].forEach(closure => {
		closure(args)
	})
	return this
}

drinkbar.log = message => {
	plugins.util.log(message)
}

drinkbar.notify = (message, title = 'Gulp compile success!') => {
	notifier.notify({
		title: title,
		message: message,
	})
}

drinkbar.addBuilder = (method, closure) => {
	drinkbar.TaskBuilder.prototype[method] = function (...args) {
		closure.apply(drinkbar.TaskBuilder, [drinkbar.plugins, this].concat(args))
		return this
	}
}

drinkbar.addBuilder('define', ($, builder, closure = null) => {
	if (!closure) {
		closure = () => {
			builder.trigger('before')
			builder.trigger('after')
		}
	}

	$.gulp.task(builder.task, builder.dependentTasks, closure)
})

drinkbar.addBuilder('styles', require('./recipes/styles'))
drinkbar.addBuilder('scripts', require('./recipes/scripts'))
drinkbar.addBuilder('browserify', require('./recipes/browserify'))
drinkbar.addBuilder('pug', require('./recipes/pug'))
drinkbar.addBuilder('stylus', require('./recipes/stylus'))
drinkbar.addBuilder('sass', require('./recipes/sass'))
drinkbar.addBuilder('less', require('./recipes/less'))
drinkbar.addBuilder('coffeescript', require('./recipes/coffeescript'))
drinkbar.addBuilder('typescript', require('./recipes/typescript'))
drinkbar.addBuilder('riot', require('./recipes/riot'))
drinkbar.addBuilder('erase', require('./recipes/erase'))

drinkbar.addBuilder('watch', function ($, builder, patterns) {
	drinkbar.watches[builder.task] = patterns
})



module.exports = drinkbar
