## gulp-premailer

A [gulp](https://github.com/gulpjs/gulp) module using [Premailer](http://premailer.dialect.ca) to bring CSS styles inline when developing HTML emails.

### Prerequisites

gulp-premailer uses the [Premailer gem](https://github.com/premailer/premailer/) to inline styles, and is required for core functionality.

You can install via RubyGems package management framework for Ruby:

```
gem install premailer
```

Or you can add it to your project's Gemfile and run `bundle install`.

### Installation

Installing via [npm](https://www.npmjs.org/package/gulp-premailer):

```
npm install --save-dev gulp-premailer
```

### Usage and Example

gulp-premailer takes in piped streams and outputs the resulting HTML as a stream. This allows you to pipe the result to additional tools or the `gulp.dest()` function to save in a specified directory. To use gulp-premailer, specify it in a pipe within the project gulpfile:

```javascript
var gulp = require('gulp');
var premailer = require('gulp-premailer');

gulp.task('build', function () {
	gulp.src('*.html')
		.pipe(premailer())
		.pipe(gulp.dest('builds/'));
});
```

In the example above, any files matched by the `gulp.src()` glob are processed by Premailer, piped to `gulp.dest()` and, finally, saved to `builds/matched-filename.html`.

### Contributing
As said previously, this is a learning project based on need for other projects and desire to experiment with node. I welcome all insight, discussion and code suggestions.
