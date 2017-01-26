module.exports = function(gulp, functions, $, paths, config, flags){
    return gulp.src(paths.srcJs)
               .pipe($.jshint())
               .pipe($.jshint.reporter($.stylish))
               .pipe($.jshint.reporter('fail'))
    ;
};