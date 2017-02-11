module.exports = function(gulp, functions, $, paths, config, flags){
    var isFolder = ($.argv.folder) ? true : false;
    // gulp app:process:path --folder app/controllers
    // gulp app:process:path --folder app/models
    // gulp app:process:path --folder app/views

    if(isFolder){
        var folder = $.argv.folder;

        if($.fs.existsSync(folder)){
            console.log('Processed folder: ' + folder);

            return gulp.src(folder + '/**/*.{' + paths.pageFileTypes + '}')
                       .pipe($.soften(4)) // 4 spaces
                       .pipe($.eol('\r\n', false))
                       .pipe(gulp.dest(folder + '/'))
            ;
        } else {
            return functions.onError('Error: Folder not found at ' + folder);
        }
    } else {
        return functions.onError('Error: --folder flag not set');
    }
};