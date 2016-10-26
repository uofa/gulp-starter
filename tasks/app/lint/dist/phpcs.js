module.exports = function(gulp, functions, $, paths, config, flags){
    return gulp.src(paths.phpFiles, { base: paths.currentLevel })
               .pipe($.shell([
                   'echo phpcs -n -s --standard="' + paths.composer_plugins + 'CustomPHPCS" "<%= file.path %>"',
                   'phpcs -n -s --standard="' + paths.composer_plugins + 'CustomPHPCS" "<%= file.path %>"',
               ], { ignoreErrors: true }))
    ;
};