module.exports = function(gulp, functions, $, paths, config, flags){
    // Prevent "Warning: Possible EventEmitter memory leak detected"
    require('events').EventEmitter.defaultMaxListeners = Infinity;

    if(!flags.skipImageMin){
        return gulp.src(paths.srcImages)
                   .pipe($.cond(flags.verbose, $.debug.bind(null, { title: 'app:build:images:src' })))
                   .pipe($.imagemin({
                       optimizationLevel: 5, // 0-7
                       progressive: true, // jpg
                       interlaced: true, // gif
                   }))
                   .pipe(gulp.dest(paths.dist))
        ;
    } else {
        console.log('*** Skipping image minification ***');

        return true;
    }
};