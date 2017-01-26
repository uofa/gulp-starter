module.exports = function(gulp, functions, $, paths, config, flags){
    return gulp.src(paths.phpFiles, { base: paths.currentLevel })
               .pipe($.htmlhint({ 'htmlhintrc': paths.baseDir + '.htmlhintrc' }))
               .pipe($.htmlhint.reporter($.stylish))
    ;
};