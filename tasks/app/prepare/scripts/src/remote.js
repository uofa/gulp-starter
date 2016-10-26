module.exports = function(gulp, functions, $, paths, config, flags){
    var files = functions.loadBowerFiles();
    files.push(paths.srcJs);

    var scriptsConcatenationOrder = functions.buildScriptsConcatenationOrder(config.scriptSettings.concatenation.order);

    return gulp.src(files)
               .pipe($.cond(flags.verbose, $.debug.bind(null, { title: 'app:prepare:scripts:src:remote' })))
               .pipe($.plumber({ errorHandler: functions.onError }))
               .pipe($.iff(
                   flags.production, // --production flag
                   $.removelogs()
               ))
               .pipe($.iff(!flags.skipMinify && !flags.production && '*.js',
                   $.iff(flags.skipBeautify,
                       $.uglify(),
                       $.uglify({
                           mangle: false,
                           output: { beautify: true }
                       })
                   )
               ))
               .pipe($.iff(
                   !flags.skipMinify && flags.production && '*.js', // --production flag
                   $.uglify({ preserveComments: 'some' })
               ))
               .pipe($.order(scriptsConcatenationOrder))
               .pipe($.concat(config.filenameSettings.concatJsFile))
               .pipe(gulp.dest(paths.distScripts))
               .pipe($.size({ title: 'app:prepare:scripts:src:remote' }))
               .pipe($.iff(
                   !flags.production,
                   $.sftp({
                       host: config.urlSettings.sftpHost,
                       auth: config.authDev,
                       remotePlatform: config.remotePlatform,
                       remotePath: paths.remotePath + '/' + scripts,
                   })
               ))
               .pipe($.iff(
                   flags.production, // --production flag
                   $.sftp({
                       host: config.urlSettings.sftpHost,
                       auth: config.authProd,
                       remotePlatform: config.remotePlatform,
                       remotePath: paths.remotePath + '/' + scripts,
                   })
               ))
    ;
};