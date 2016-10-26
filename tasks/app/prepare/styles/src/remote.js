module.exports = function(gulp, functions, $, paths, config, flags){
    return gulp.src([paths.srcCss, paths.srcSass], { base: paths.src })
               .pipe($.cond(flags.verbose, $.debug.bind(null, {title: 'app:prepare:styles:src:remote'})))
               .pipe($.plumber({ errorHandler: functions.onError }))
               .pipe($.changed(paths.dist)) // Must be dist
               .pipe($.tap(function(file, t){
                   paths.currentFile = file.path; // Update global var
               }))
               .pipe($.rework($.reworkUrl(function(url){
                   return functions.calculateAdjustedUrl(url);
               })))
               .pipe($.iff('*.css', $.csso()))
               .pipe($.iff('*.scss', $.sass({ precision: 10 }).on('error', functions.onError)))
               .pipe($.autoprefixer({ browsers: config.AUTOPREFIXER_BROWSERS }))
               .pipe(gulp.dest(paths.dist))
               .pipe($.size({ title: 'app:prepare:styles:src:remote' }))
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