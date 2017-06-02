module.exports = function(gulp, functions, $, paths, config, flags){
    return gulp.src([paths.srcCss, paths.srcSass])
               .pipe($.plumber({ errorHandler: functions.onError }))
               .pipe($.changed(paths.dist)) // Must be dist
               .pipe($.tap(function(file, t){
                   paths.currentFile = file.path; // Update global var
               }))
               .pipe($.iff('*.css', $.rework($.reworkUrl(function(url){
                   return functions.calculateAdjustedUrl(url);
               }))))
               .pipe($.iff('*.css', $.csso()))
               .pipe($.iff('*.scss', $.sass(config.sassSettings).on('error', functions.onError)))
               .pipe($.autoprefixer({ browsers: config.AUTOPREFIXER_BROWSERS }))
               .pipe(gulp.dest(paths.dist))
               .pipe($.size({ title: 'app:build:styles:src:remote' }))
    ;
};