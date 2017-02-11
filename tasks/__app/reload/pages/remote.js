module.exports = function(gulp, functions, $, paths, config, flags){
    return gulp.src(paths.htmlPhpFiles, { base: paths.dist })
               .pipe($.plumber({ errorHandler: functions.onError }))
               .pipe($.changed(paths.htmlPhpFiles))
               .pipe($.iff(
                   !flags.production,
                   $.sftp({
                       host: config.urlSettings.sftpHost,
                       auth: config.authDev,
                       remotePlatform: config.remotePlatform,
                       remotePath: paths.remotePath,
                   })
               ))
               .pipe($.iff(
                   flags.production, // --production flag
                   $.sftp({
                       host: config.urlSettings.sftpHost,
                       auth: config.authProd,
                       remotePlatform: config.remotePlatform,
                       remotePath: paths.remotePath,
                   })
               ))
    ;
};