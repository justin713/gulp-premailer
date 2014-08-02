/*jslint node: true, white: true */

'use strict';

var gutil = require('gulp-util');
var fs = require('fs');
var path = require('path');
var which = require('which');
var through = require('through2');
var spawn = require('win-spawn');
var cheerio = require('cheerio');

module.exports = function () {
	try {
		which.sync('premailer');
	} catch (err) {
		throw new gutil.PluginError('gulp-premailer', 'You need to have Ruby and Premailer installed and in your PATH for this task to work.');
	}

	var stream = through.obj(function (file, enc, done) {
		if (file.isNull()) {
			self.push(file);
			return done();
		}

		if (file.isStream()) {
			self.emit('error', new gutil.PluginError('gulp-premailer', 'Streaming not supported'));
			return done();
		}

		var $ = cheerio.load(file.contents.toString());
		var stylesheetList = getStylesheetList($);
		var stylesheetContents = getStylesheetContents(stylesheetList, file.path);

		stylesheetContents.forEach(function(styles) {
			$('head').append("<style>\r\n" + styles.toString() + "</style>\r\n");
		});

		file.contents = new Buffer($.html());

		var self = this;
		var errors = '';
		var bufferObjs = [];
		var cp = spawn('premailer', [file.path]);

		cp.on('error', function (err) {
			self.emit('error', new gutil.PluginError('gulp-premailer', err));
			self.push(file);
			return done();
		});

		cp.stderr.on('data', function (data) {
			errors += data;
		});

		cp.stdout.on('data', function (data) {
			bufferObjs.push(data);
		});

		cp.on('close', function (code) {
			if (code === 127) {
				self.emit('error', new gutil.PluginError('gulp-premailer', 'You need to have Ruby and Premailer installed and in your PATH for this task to work.'));
				self.push(file);
				return done();
			}

			if (errors) {
				self.emit('error', new gutil.PluginError('gulp-premailer', '\n' + errors.replace('Use --trace for backtrace.\n', '')));
				self.push(file);
				return done();
			}

			if (code > 0) {
				self.emit('error', new gutil.PluginError('gulp-premailer', 'Exited with error code ' + code));
				self.push(file);
				return done();
			}

			file.contents = new Buffer.concat(bufferObjs);
			self.push(file);
			done();
		});
	});

	return stream;
};

function getStylesheetList(cheerioObj) {
	var stylesheetList = [];

	cheerioObj('link').each(function (i, elem) {
		stylesheetList[i] = cheerioObj(this).attr('href');
	});

	if (stylesheetList.length === 0) {
		stylesheetList = false;
	}

	return stylesheetList;
}

function getStylesheetContents(styleList, filePath) {
	if (styleList.length === 0) {
		return false;
	}

	var stylesheetContents = [];
	for (var i=0; i < styleList.length; i++) {
		fs.readFile(path.dirname(filePath) + '/' + styleList[i], 'utf8', function (err, data) {
			if (err) console.log(err);
			stylesheetContents.push(data);
		});
	}

	return stylesheetContents;
}
