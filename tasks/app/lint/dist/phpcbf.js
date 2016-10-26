module.exports = function(gulp, functions, $, paths, config, flags){
    return gulp.src(paths.phpFiles, { base: paths.currentLevel })
               .pipe($.shell([
                   'echo phpcbf -n --no-patch --standard="' + paths.composer_plugins + 'CustomPHPCS" "<%= file.path %>"',
                   'phpcbf -n --no-patch --standard="' + paths.composer_plugins + 'CustomPHPCS" "<%= file.path %>"',
               ], { ignoreErrors: true }))
    ;
};