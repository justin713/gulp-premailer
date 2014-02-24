/*jslint node: true, white: true */

'use strict';

var fs = require('fs');
var path = require('path');
var gutil = require('gulp-util');
var through = require('through2');
var es = require('event-stream');
var child_process = require('child_process');
var spawn = require('win-spawn');
var tempWrite = require('temp-write');
var dargs = require('dargs');
var which = require('which');

module.exports = function (options) {
	try {
		which.sync('premailer');
	} catch (err) {
		throw new gutil.PluginError('gulp-premailer', 'You need to have Ruby and Premailer installed and in your PATH for this task to work.');
	}
	
	return through.obj(function (file, enc, cb) {
		var self = this;

		if (file.isNull() || path.basename(file.path)[0] === '_') {
			self.push(file);
			return cb();
		}

		if (file.isStream()) {
			self.emit('error', new gutil.PluginError('gulp-premailer', 'Streaming not supported'));
			return cb();
		}

		// Works, with events.js error: EPIPE
		// var pm = child_process.exec('premailer ' + file.path);
		// file.pipe(es.duplex(pm.stdin, pm.stdout))
		// 	// .pipe(process.stdout)
		// 	.pipe(fs.createWriteStream(path.dirname(file.path) + '/results/' + gutil.replaceExtension(path.basename(file.path), '-duplexed.html')));

		tempWrite(file.contents, path.extname(file.path), function (err, tempFile) {
			if (err) {
				self.emit('error', new gutil.PluginError('gulp-premailer', err));
				self.push(file);
				return cb();
			}
			
			var cp = spawn('premailer', [tempFile]);

			cp.on('error', function (err) {
				self.emit('error', new gutil.PluginError('gulp-premailer', err));
				self.push(file);
				return cb();
			});

			var errors = '';
			cp.stderr.setEncoding('utf8');
			cp.stderr.on('data', function (data) {
				errors += data;
			});
			if (errors.length >= 1) {
				console.log("Error: " + errors);
			}

			cp.stdout.pipe(fs.createWriteStream(path.dirname(file.path) + '/results/' + gutil.replaceExtension(path.basename(file.path), '-inline.html')));

			cp.on('close', function (code) {
				console.log('child process exited with code ' + code);
				
				if (code === 127) {
					self.emit('error', new gutil.PluginError('gulp-premailer', 'You need to have Ruby and Premailer installed and in your PATH for this task to work.'));
					self.push(file);
					return cb();
				}

				if (errors) {
					self.emit('error', new gutil.PluginError('gulp-premailer', '\n' + errors.replace(tempFile, file.path).replace('Use --trace for backtrace.\n', '')));
					self.push(file);
					return cb();
				}

				if (code > 0) {
					self.emit('error', new gutil.PluginError('gulp-premailer', 'Exited with error code ' + code));
					self.push(file);
					return cb();
				}
			});
		});
	});
};
