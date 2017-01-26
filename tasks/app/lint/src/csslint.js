module.exports = function(gulp, functions, $, paths, config, flags){
    return gulp.src(paths.srcCss)
               .pipe($.csslint())
               .pipe($.csslint.formatter())
               .pipe($.csslint.formatter('fail'))
    ;
};