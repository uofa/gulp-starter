module.exports = function(gulp, functions, $, paths, config, flags){
    return gulp.src(paths.htmlPhpFiles)
               .pipe($.changed(paths.htmlPhpFiles))
               .pipe($.browserSync.reload({ stream: true }))
    ;
};