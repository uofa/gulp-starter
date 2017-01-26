module.exports = function(gulp, functions, $, paths, config, flags){
    if(!flags.skipWatch){
        gulp.watch(paths.htmlPhpFiles, ['__app:reload:pages:remote']);
        gulp.watch([paths.srcCss, paths.srcSass], ['app:prepare:styles:src:remote']);
        gulp.watch([paths.srcJs, paths.bowerComponentsJs], ['app:prepare:scripts:src:remote']);
        gulp.watch('bower.json', ['app:install:scripts:src:remote']);
    } else {
        console.log('*** Skipping `app:serve:remote` ***');
    }

    return true;
};