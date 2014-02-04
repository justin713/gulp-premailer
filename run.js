var gulp = require('gulp');
var premailer = require('./index.js');

gulp.src('./fixtures/fixture.html')
  .pipe(premailer())
  .pipe(gulp.dest('./fixtures/'));