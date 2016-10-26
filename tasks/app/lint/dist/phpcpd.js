module.exports = function(gulp, functions, $, paths, config, flags){
    return gulp.src(paths.phpFiles, { base: paths.currentLevel })
               .pipe($.shell([
                   'echo phpcpd "<%= file.path %>"',
                   'phpcpd "<%= file.path %>"',
               ], { ignoreErrors: true }))
    ;
};