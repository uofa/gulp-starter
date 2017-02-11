module.exports = function(gulp, functions, $, paths, config, flags){
    return gulp.src(paths.phpFiles, { base: paths.currentLevel })
               .pipe($.shell([
                   'echo phpmd "<%= file.path %>" text "' + paths.composer_plugins + 'phpmd-ruleset.xml"',
                   'phpmd "<%= file.path %>" text "' + paths.composer_plugins + 'phpmd-ruleset.xml"',
               ], { ignoreErrors: true }))
    ;
};