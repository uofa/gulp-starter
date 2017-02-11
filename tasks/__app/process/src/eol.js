module.exports = function(gulp, functions, $, paths, config, flags){
    return gulp.src(paths.htmlPhpFiles)
               .pipe($.eol('\r\n', false))
               .pipe(gulp.dest(paths.dist))
    ;
};