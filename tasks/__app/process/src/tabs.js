module.exports = function(gulp, functions, $, paths, config, flags){
    return gulp.src(paths.htmlPhpFiles)
               .pipe($.soften(4)) // 4 spaces
               .pipe(gulp.dest(paths.dist))
    ;
};