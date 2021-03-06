//global
var gulp           = require('gulp');
var clean          = require('gulp-clean');
var rename         = require('gulp-rename');
var browserSync    = require('browser-sync').create();
var zip            = require('gulp-zip');

//css
var autoprefixer   = require('gulp-autoprefixer');
var sass           = require('gulp-sass');
var cleanCSS       = require('gulp-clean-css');

//js
var uglify         = require('gulp-uglify');

//Log de erros
function logError (error) {
    console.log(error.toString());
    this.emit('end');
}

//JS - distribution
gulp.task('js:dist', function(){
    return gulp.src('docs/assets/js/**/*.js')
    .pipe(gulp.dest('dist'))
    .pipe(uglify({
        preserveComments: 'all'
    }))
    .pipe(rename({
        suffix: '.min'
    }))
    .pipe(gulp.dest('dist'));
});

//SASS-CSS - development
gulp.task('sass:dev', function() {
    return gulp.src('docs/assets/scss/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('docs/assets/css'))
    .pipe(browserSync.stream());
});

//SASS-CSS - distribution
gulp.task('sass:dist', function() {
    return gulp.src('docs/assets/scss/edbox.scss')
    .pipe(gulp.dest('dist'))
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(gulp.dest('dist'))
    .pipe(cleanCSS())
    .pipe(rename({
        suffix: '.min'
    }))
    .pipe(gulp.dest('dist'));
});

//Assets - distribution
gulp.task('assets:dist', function(){
    return gulp.src('docs/assets/images/loading.svg')
    .pipe(gulp.dest('dist'));
});

//Clean dist folder
gulp.task('clean:dist', function(){
    return gulp.src('dist')
    .pipe(clean());
});

//Default task
gulp.task('default', function(){
    browserSync.init({
        server: "docs"
    });
    gulp.watch('docs/assets/scss/**/*.scss', ['sass:dev']);
    gulp.watch(['**/*.html','docs/assets/js/**/*.js']).on('change', browserSync.reload);
});

//Dist task
gulp.task('dist', ['clean:dist'], function(){
    return gulp.start('sass:dist','js:dist','assets:dist');
});

//Zip task
gulp.task('zip', function(){
    gulp.src('dist/**')
    .pipe(zip('docs/jquery.edbox.zip'))
    .pipe(gulp.dest('./'));
});