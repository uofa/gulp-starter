module.exports = function(gulp, functions, $, paths, config, flags){
    var files = functions.loadBowerFiles();
    files.push(paths.srcJs);

    var scriptsConcatenationOrder = functions.buildScriptsConcatenationOrder(config.scriptSettings.concatenation.order);

    return gulp.src(files)
               .pipe($.cond(flags.verbose, $.debug.bind(null, { title: 'app:build:scripts:src:local' })))
               .pipe($.plumber({ errorHandler: functions.onError }))
               .pipe($.iff(!flags.skipMinify && '*.js',
                   $.iff(flags.skipBeautify,
                       $.uglify(),
                       $.uglify({
                           mangle: false,
                           output: { beautify: true }
                       })
                   )
               ))
               .pipe($.order(scriptsConcatenationOrder))
               .pipe($.concat(config.filenameSettings.concatJsFile))
               .pipe(gulp.dest(paths.distScripts))
               .pipe($.browserSync.reload({ stream: true, once: true }))
               .pipe($.size({ title: 'app:build:scripts:src:local' }))
    ;
};