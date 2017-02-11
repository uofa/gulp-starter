module.exports = function(gulp, functions, $, paths, config, flags){
    return gulp.src(paths.srcJs)
               .pipe($.complexity())
    ;
};