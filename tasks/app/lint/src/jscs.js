module.exports = function(gulp, functions, $, paths, config, flags){
    return gulp.src(paths.srcScripts + '/custom.js') // Only run against single file - memory intensive
               .pipe($.jscs(paths.baseDir + '.jscsrc'))
               .pipe($.jscs.reporter())
               .pipe($.jscs.reporter('fail'))
    ;
};