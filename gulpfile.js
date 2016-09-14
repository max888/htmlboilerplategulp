// Define all modules
var gulp         = require('gulp'),
    concat       = require('gulp-concat'),
    uglify       = require('gulp-uglify'),
    // ngAnnotate = require('gulp-ng-annotate'),
    // del          = require('del'),
    bower        = require('gulp-bower'),
    sass         = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
// cssmin        = require('gulp-cssmin'),
    cleanCSS     = require('gulp-clean-css'),
    browserSync  = require('browser-sync'),
    watch        = require('gulp-watch'),
    plumber      = require('gulp-plumber'),
    batch        = require('gulp-batch'),
    history      = require('connect-history-api-fallback');
php          = require('gulp-connect-php');


// We can use this to reload all browsers.
var reload = browserSync.reload;


// Location constants
var DEST_BOWER  = 'bower_components/',
    DEV_CSS_SRC = 'scss/*.scss',
    DEST_CSS    = 'css/',
    DEST_JS     = 'js/',
    DIST_JS     = 'dist/js',
    DIST_CSS     = 'dist/css',

    FILE_LIST = [
        'js/vendor/jquery-1.11.2.min.js',
        'js/vendor/modernizr-2.8.3.min.js',
        'js/vendor/bootstrap.js',
        'js/custom/main.js'
    ];

var supported_browsers = ['last 4 versions', 'ie >= 9', 'Opera >= 30',
    'Chrome >= 40', 'Firefox >= 20', 'Safari >= 6',
    'Android >= 4' , '> 80%']


// Update bower
gulp.task('bower', function() {
    return bower().pipe(gulp.dest(DEST_BOWER));
});

// SASS processing task. Compiles, adds prefixes, reloads browser and minifies.
gulp.task('sass', function () {
    return gulp.src(DEV_CSS_SRC)
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer({
            browsers: supported_browsers,
            cascade: false
        }))
        .pipe(gulp.dest( DEST_CSS ))
        .pipe(browserSync.reload({stream:true}));
});


// concats to one file and places in js folder as app.js. Doesn't minify...
gulp.task('scripts-dev', function () {
    return gulp.src(FILE_LIST)
        .pipe(concat('app.js'))
        .pipe(gulp.dest(DEST_JS));
});



// Builds the scripts into app.js file and minifies them to 'dist' folder
gulp.task('scripts-dist', function () {
    return gulp.src(FILE_LIST)
        .pipe(concat('app.js'))
        .pipe(uglify())
        .pipe(gulp.dest(DIST_JS));
});

// Builds the SASS into dist/css/pages.scss file and minifies them
gulp.task('sass-dist', function () {
    return gulp.src(DEV_CSS_SRC)
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer({
            browsers: supported_browsers,
            cascade: false
        }))
        .pipe(cleanCSS({compatibility: 'ie8'}))
        .pipe(gulp.dest( DIST_CSS ))
});



gulp.task('prefix', function () {
    return gulp.src('css/pages.css')
        .pipe(autoprefixer({
            browsers: supported_browsers,
            cascade: false
        }))
        .pipe(gulp.dest('css'));
});

// Start server
gulp.task('browser-sync', function () {
    browserSync({
        server: {
            baseDir: './',
            index: 'index.html',
            middleware: [ history() ]
        }
    });
});

// Reload all Browsers
gulp.task('bs-reload', function () {
    browserSync.reload();
});

gulp.task('php', function() {
    php.server({ base: './', port: 8010, keepalive: true});
});

// Get assets, translate views, fetch and optimise images compile sass,
// start browser sync and watch for changes in some files.
gulp.task('dev', ['scripts-dev', 'sass', 'browser-sync'], function (){

    watch('scss/**/*.scss', batch(function (events, done) {
        gulp.start('sass', done);
    }));

    watch('js/custom/*.js', batch(function (events, done) {
        gulp.start('scripts-dev', done);
    }));

});




// Package site up for distribution - minify JS to reduce its size by 25%
gulp.task('dist', ['scripts-dist', 'sass-dist']);

// Default task
gulp.task('default', function () {
    console.log('No default task set. Run gulp dev');
});
