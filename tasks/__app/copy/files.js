module.exports = function(gulp, functions, $, paths, config, flags){
    // Manual copy for theme files etc.
    gulp.src([config.folderSettings.bowerComponents + '/' + 'tinymce/**/*'], { base: paths.currentLevel })
        .pipe($.cond(flags.verbose, $.debug.bind(null, { title: '__app:copy:files' })))
        .pipe($.rename(function(path){
            // Remove directory from destination path
            path.dirname = path.dirname.replace(config.folderSettings.bowerComponents, '');
        }))
        .pipe(gulp.dest(paths.distScripts));

    return gulp.src([paths.src + '.{' + paths.otherFileTypes + '}', paths.src + '**/*.{' + paths.otherFileTypes + '}'])
               .pipe(gulp.dest(paths.dist))
    ;
};