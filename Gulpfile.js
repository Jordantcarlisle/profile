var gulp = require('gulp'),

    sass = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    minifyCss = require('gulp-minify-css'),
    sourceMaps = require('gulp-sourcemaps'),
    csslint = require('gulp-csslint'),

    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),

    del = require('del'),
    beautify = require('gulp-beautify'),
    concat = require('gulp-concat'),
    headerFooter = require('gulp-headerfooter'),
    gulpif = require('gulp-if'),
    gzip = require('gulp-gzip'),
    inject = require('gulp-inject'),
    foreach = require('gulp-foreach'),
    rename = require('gulp-rename'),
    replace = require('gulp-replace'),
    htmlClean = require('gulp-htmlclean'),
    rev = require('gulp-rev'),
    stripComments = require('gulp-strip-comments'),
    stripDebug = require('gulp-strip-debug'),
    sniffer = require('gulp-sniffer'),
    clean = require('gulp-clean'),
    notify = require('gulp-notify'),
    cache = require('gulp-cache'),
    livereload = require('gulp-livereload'),
    lr = require('tiny-lr'),
    server = lr(),
    argv = require('yargs').argv,
    wiredep = require('wiredep').stream,

    ignore_path = '/dist',

    // js files need to be loaded in a certail order.
    jsFiles = [
        './src/assets/js/app.js',
        './src/assets/js/app.ui.js'
    ],

    // partials need to be loaded in a certail order.
    templates = [
        { path: './src/index.html', other: 'configuration' }
    ],

    // files to be copied.
    copyList = [
        //{ src: lib_dir + 'ink/css/ink.css', dest: dist_css }
        { src: './bower_components/bootstrap-sass/assets/fonts/bootstrap/*', dest: './dist/assets/fonts/bootstrap' },
        { src: './bower_components/bootstrap-sass/assets/javascripts/bootstrap.min.js', dest: './dist/assets/js/vendor' },
        { src: './bower_components/font-awesome/fonts/*', dest: './dist/assets/fonts' },
        { src: './bower_components/jquery/dist/jquery.min.js', dest: './dist/assets/js/vendor' },
        { src: './bower_components/jquery/dist/jquery.min.map', dest: './dist/assets/js/vendor' },
        { src: './bower_components/underscore/underscore-min.js', dest: './dist/assets/js/vendor' },
        { src: './bower_components/underscore/underscore-min.map', dest: './dist/assets/js/vendor' },
        { src: './src/assets/images/*', dest: './dist/assets/images' }
    ],

    transformToString = function (filePath, file) {
        return file.contents.toString('utf8');
    };

// === Default ======================================================================================================

gulp.task('default', ['css', 'js', 'img', 'copy', 'html'], function () {
    //go to town
});


// === Watch ========================================================================================================

gulp.task('watch', function () {

    gulp.watch('./src/assets/scss/**/*.scss', ['css', 'html']);
    gulp.watch('./src/assets/js/**/*.js', ['js', 'html']);
    gulp.watch('./src/**/*.html', ['html']);

});


// === CSS ==========================================================================================================

gulp.task('css', function () {

    del('./dist/assets/css/app*', function (err, files) {
        console.log('gulpjs[\'css\'] del:', [err, files]);
    });

    return gulp.src('./src/assets/scss/app.scss')
        .pipe(rename('app.css'))
        .pipe(sass({ style: 'expanded' }))
        .pipe(rev())
        .pipe(gulp.dest('./dist/assets/css'))

        // --minify
        .pipe(gulpif(argv.minify, minifyCss({ keepSpecialComments: 0 })))

        // --gzip
        .pipe(gulpif(argv.gzip, gzip()))
        .pipe(gulpif(argv.gzip, gulp.dest('./dist/assets/css')));
});


// === JS ===========================================================================================================

gulp.task('js', function () {

    del('./dist/assets/js/app-*', function (err, files) {
        console.log('gulpjs[\'js\'] del:', [err, files]);
    });

    return gulp.src(jsFiles)
        .pipe(concat('app.js'))
        .pipe(headerFooter('window.app = window.app || {};\n\n(function (app, $, _, window, document) { \n\n\'use strict\';\n\n', '\n\n}(app, jQuery, _, window, document));'))
        .pipe(rev())
        .pipe(beautify({ indentSize: 3 }))
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
        .pipe(gulpif(argv.strip, stripDebug()))
        .pipe(gulpif(argv.strip, stripComments()))
        .pipe(gulpif(argv.strip, replace(/void 0;/g, '')))
        .pipe(gulp.dest('./dist/assets/js'))

        // --minify
        .pipe(gulpif(argv.minify, uglify()))

        // --gzip
        .pipe(gulpif(argv.gzip, gzip()))
        .pipe(gulpif(argv.gzip, gulp.dest('./dist/assets/js')));

});


// === Images =======================================================================================================

gulp.task('img', function () {
    //go to town
});


// === HTML =========================================================================================================

gulp.task('html', ['js', 'css'], function () {

    for (var i = 0, j = templates.length; i < j; i++) {

        gulp.src(templates[i].path)

            // partials
            .pipe(inject(gulp.src(['./src/assets/partials/doc-header.html']), { starttag: '<!-- inject:doc-header.html -->', transform: transformToString }))
            .pipe(inject(gulp.src(['./src/assets/partials/doc-footer.html']), { starttag: '<!-- inject:doc-footer.html -->', transform: transformToString }))
            .pipe(inject(gulp.src(['./src/assets/partials/header.html']), { starttag: '<!-- inject:header.html -->', transform: transformToString }))

            // our js and css
            .pipe(inject(gulp.src(['./dist/assets/css/app-*.css'], { read: false }), { starttag: '<!-- inject:app:css -->', ignorePath: ignore_path }))
            .pipe(inject(gulp.src(['./dist/assets/js/app-*.js'], { read: false }), { starttag: '<!-- inject:app:js -->', ignorePath: ignore_path }))

            // cleanup
            .pipe(replace(/<!-- inject(.*) -->/g, ''))
            .pipe(replace(/<!-- endinject -->/g, ''))

            // --minify
            .pipe(gulpif(argv.minify, htmlClean({
                // options
            })))
            .pipe(gulp.dest('./dist'))

            // --gzip
            .pipe(gulpif(argv.gzip, gzip()))
            .pipe(gulpif(argv.gzip, gulp.dest('./dist')));

    }

});


// === Copy =========================================================================================================

gulp.task('copy', function () {
    for (var i = 0, j = copyList.length; i < j; i++) {
        gulp.src(copyList[i].src).pipe(gulp.dest(copyList[i].dest));
    }
});


// === Dist =========================================================================================================

gulp.task('dist', function () {

    del('./dist', function (err, paths) {
        console.log('Deleted files/folders:\n', paths.join('\n'));
    });

});


// === Export =======================================================================================================

module.exports = gulp;
