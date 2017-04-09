'use strict';
// Dependencies
var gulp         = require('gulp'),
	nodemon      = require('gulp-nodemon'),
	livereload   = require('gulp-livereload'),
	changed      = require('gulp-changed'),
	del          = require('del'),
	gutil        = require('gulp-util'),
    concat       = require('gulp-concat'),
	concatCss 	 = require('gulp-concat-css'),
	plumber      = require('gulp-plumber'),
	imagemin     = require('gulp-imagemin'),
	minifyCSS    = require('gulp-minify-css'),
	htmlmin 	 = require('gulp-htmlmin'),
	rev          = require('gulp-rev'),
    jshint       = require('gulp-jshint'),
    imagemin     = require('gulp-imagemin'),
    revCollector = require('gulp-rev-collector'),
    uglify       = require('gulp-uglify'),
	sass         = require('gulp-sass');


var paths = {
	fontsSrc: 	'src/fonts/',
    htmlSrc:  	'src/views/',

    sassSrc:  	'src/sass/',
	sassBs:		'node_modules/bootstrap/scss/',

    jsSrc:    	'src/js/',
	jsBs:		'node_modules/bootstrap/dist/js/',

    imgSrc:   	'src/images/',

	tempDir:	'build/temp/',
    buildDir: 	'build/',
    revDir:   	'build/rev/',
    distDir:  	'dist/'
};

var onError = function (err) {
    gutil.beep();
    gutil.log(gutil.colors.green(err));
},
    nodemonServerInit = function(){
        livereload.listen();
        nodemon({
            script: 'app.js',
            ext: 'js'
        }).on('restart', function(){
            gulp.src('app.js')
                .pipe(livereload());
        })
};

if(process.env.NODE_ENV === 'production'){
	gulp.task('default', ['dist']);
}else {
	gulp.task('default', ['build', 'watch']);
}

gulp.task('clean', function(cb) {
    del([paths.buildDir, paths.distDir], cb);
});

gulp.task('build', ['build-html', 'build-css', 'build-js', 'build-images', 'build-favicon', 'build-fonts'], function (cb) {
    nodemonServerInit();
});

gulp.task('dist', ['dist-html', 'dist-js', 'dist-css', 'dist-images', 'dist-favicon', 'dist-fonts']);

/*
HTML Tasks
*/
gulp.task('build-html', function() {
    return gulp.src(paths.htmlSrc + '**/*.html')
        .pipe(gulp.dest(paths.buildDir + 'views/'))
        .pipe(livereload());
});

gulp.task('dist-html', ['build-html', 'dist-js', 'dist-css', 'dist-images'], function() {
    return gulp.src([
            paths.revDir + "**/*.json",
            paths.buildDir + 'views/' + "**/*.html"
        ])
        .pipe(revCollector())
		.pipe(htmlmin({collapseWhitespace: false}))
        .pipe(gulp.dest(paths.distDir + 'views'));
});

/*
	CSS tasks
*/
gulp.task('build-css', ['sass']);

gulp.task('pre-sass', function(done) {
	// Order of import matters bs must come first
	return gulp.src([
			paths.sassBs + '**/*.scss',
			paths.sassSrc + '**/*.scss'
		])
		.pipe(gulp.dest(paths.tempDir + 'sass/'))
		.pipe(livereload())

	done();
});

gulp.task('sass', ['pre-sass'], function () {
    return gulp.src(paths.tempDir + 'sass/main.scss')
        .pipe(sass({
            includePaths: require('node-neat').includePaths,
            style: 'nested',
            onError: function(){
            	console.log("Error in scss");
            }
        }))
		.pipe(concatCss('main.css'))
        .pipe(plumber({ errorHandler: onError }))
        .pipe(gulp.dest(paths.buildDir + 'css/'))
        .pipe(livereload());
});

gulp.task('dist-css', ['build-css', 'dist-images'], function() {
    return gulp.src([
            paths.buildDir + 'css/*',
            paths.revDir + "images/*.json"
        ])
        .pipe(revCollector())
        .pipe(minifyCSS())
        .pipe(rev())
        .pipe(gulp.dest(paths.distDir + 'css'))
        .pipe(rev.manifest())
        .pipe(gulp.dest(paths.revDir + 'css'));
});

gulp.task('build-fonts', [], function() {
     return gulp.src(paths.fontsSrc + '**/*.*')
        .pipe(gulp.dest(paths.buildDir + 'fonts/'))
        .pipe(livereload());
});

gulp.task('dist-fonts', ['build-fonts'], function() {
  return gulp.src('build/fonts/*')
  .pipe(gulp.dest(paths.distDir + "/fonts/"));
});

/*
JS Tasks
*/
gulp.task('build-js', ['js', 'js-plugins']);

gulp.task('js-plugins', [], function() {
    return gulp.src([
			'node_modules/bootstrap/dist/js/bootstrap.min.js',
            'src/lib/*.js'
        ])
        .pipe(concat('vendor.js'))
        .pipe(gulp.dest(paths.buildDir + 'js/'))
        .pipe(livereload());
});


gulp.task('js', function() {
    return gulp.src(paths.jsSrc + '*.js')
        .pipe(plumber({ errorHandler: onError }))
        .pipe(changed(paths.buildDir + 'js'))
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
        .pipe(gulp.dest(paths.buildDir + 'js'))
        .pipe(livereload());
});

gulp.task('dist-js', ['build-js'], function() {
    return gulp.src(paths.buildDir + 'js/*')
        .pipe(uglify())
        .pipe(rev())
        .pipe(gulp.dest(paths.distDir + 'js'))

        .pipe(rev.manifest())
        .pipe(gulp.dest(paths.revDir + 'js'));
});

/*
Image Tasks
*/
gulp.task('build-images', function() {
    return gulp.src(paths.imgSrc + '**/*.+(png|jpeg|jpg|gif|svg|eps)')
        .pipe(changed(paths.buildDir + 'images'))
        .pipe(gulp.dest(paths.buildDir + 'images'))
        .pipe(livereload());
});

gulp.task('dist-images', ['build-images'], function() {
    return gulp.src(paths.buildDir + 'images/**/*')
        .pipe(imagemin({
            progressive: true
        }))
        .pipe(rev())
        .pipe(gulp.dest(paths.distDir + 'images'))
        .pipe(rev.manifest())
        .pipe(gulp.dest(paths.revDir + 'images'));
});

gulp.task('build-favicon', function() {
    return gulp.src('src/favicon.ico')
        .pipe(changed(paths.buildDir))
        .pipe(gulp.dest(paths.buildDir))
        .pipe(livereload());
});

gulp.task('dist-favicon', ['build-favicon'], function() {
    return gulp.src(paths.buildDir + 'favicon.ico')
        .pipe(changed(paths.distDir))
        .pipe(gulp.dest(paths.distDir));
});

gulp.task('watch', function () {
	gulp.watch(['src/views/**/*.html'], ['build-html']);
    gulp.watch('src/sass/**/*.scss', ['pre-sass', 'sass']);
    gulp.watch(paths.jsSrc + '**/*.js', ['js']);
    gulp.watch('src/lib/**' + '**/*.js', ['js-plugins']);
    gulp.watch(paths.imgSrc + '**/*.+(png|jpeg|jpg|gif|svg)', ['build-images']);
});
