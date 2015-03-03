var gulp = require('gulp');
var premailer = require('./index.js');

gulp.src('./fixtures/*.html')
	.pipe(premailer())
	.pipe(gulp.dest('./fixtures/results/'));