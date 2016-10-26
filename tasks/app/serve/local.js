module.exports = function(gulp, functions, $, paths, config, flags){
    if(!flags.skipPageOpen){
        if(flags.pageToOpen){
            paths.browserSyncProxyUrl += flags.pageToOpen.replace(/^\/|\/$/g, '');
        }

        $.browserSync({
            proxy: paths.browserSyncProxyUrl,
            notify: false,
            logPrefix: function(){
                return this.compile('{green:[' + config.projectSettings.localProjectBaseDir + '] ');
            }
        });
    }

    if(!flags.skipWatch){
        gulp.watch(paths.htmlPhpFiles, ['__app:reload:pages:local']);
        gulp.watch([paths.srcCss, paths.srcSass], ['app:build:styles:src:local']);

        if(!flags.skipBowerWatch){
            gulp.watch([paths.srcJs, paths.bowerComponentsJs], ['app:build:scripts:src:local']);
            gulp.watch('bower.json', ['app:install:scripts:src:local']);
        } else {
            gulp.watch(paths.srcJs, ['app:build:scripts:src:local']);
        }
    } else {
        console.log('*** Skipping watch tasks ***');
    }

    return true;
};