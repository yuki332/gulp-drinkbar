
import plugins from './plugins'
import objectAssign from 'object-assign'
import fs from 'fs'
import {log} from 'gulp-util'
import chalk from 'chalk'



export function extend(...objects) {
	objects.unshift({})

	return objectAssign.apply(null, objects)
}

export function checkParameterIsObject(parameters) {
	if (!typeof parameters === '') {
		throw Error('InvalidArgumentError: ' + 'must recipe parameters is object.')
	}
}

export function checkParameterHasInput(parameters) {
	if (!parameters.output) {
		throw Error('InvalidArgumentError: ' + 'require "parameters.input".')
	}
}

export function checkParameterHasOutput(parameters) {
	if (!parameters.output) {
		throw Error('InvalidArgumentError: ' + 'require "parameters.output".')
	}
}

export function isPluginInstalled(name, npmModule) {
	if (!plugins[name]) {
		log(chalk.red('Please install npm module ') + chalk.white.bgRed('"' + npmModule + '"') + chalk.red('.'))
		log(chalk.yellow('Install command is ') + chalk.green('"npm install ' + npmModule + ' --save-dev"'))
		return false
	}

	return true
}

export function isGlob(path) {
	return path.match(/\*/)
}

export function isValidGlobs(paths) {
	try {
		paths.forEach(path => {
			if (!isGlob(path)) {
				fs.accessSync(path, fs.F_OK)
			}
		})

		return true
	}
	catch (error) {
		log(chalk.red(error.message))
		return false
	}
}
