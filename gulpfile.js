'use strict';

var currentLevel = './',
    upOneLevel = '../';

var gulp = require('gulp'),
    config = require(currentLevel + 'config.json');

var $ = require('gulp-load-plugins')();

module.exports = gulp; //for Chrome plugin + gulp-devtools

var browserSync = require('browser-sync'),
    stylish = require('jshint-stylish'),
    open = require('opn'),
    pagespeed = require('psi'),
    runSequence = require('run-sequence'),
    argv = require('yargs').argv,
    Pageres = require('pageres'),
    mainBowerFiles = require('main-bower-files'),
    fs = require('fs'), //part of Node
    penthouse = require('penthouse'),
    del = require('del'),
    bower = require('bower'),
    beep = require('beepbeep')
;

var webBrowser = 'chrome',
    reload = browserSync.reload;

var stylesheetFileTypeArray = ['css'],
    scriptFileTypeArray = ['js'],
    imageFileTypeArray = ['gif', 'png'],
    pageFileTypeArray = ['html', 'php'],
    fontFileTypeArray = ['eot', 'svg', 'ttf', 'woff', 'woff2'],
    serverFileTypeArray = ['htaccess', 'access'];

var imageFileTypes = imageFileTypeArray.join(','),
    pageFileTypes = pageFileTypeArray.join(','),
    otherFileTypes = pageFileTypeArray.concat(fontFileTypeArray, serverFileTypeArray).join(','), //html,php,eot,svg,ttf,woff,htaccess,access
    allValidFileTypes = stylesheetFileTypeArray.concat(scriptFileTypeArray, imageFileTypeArray, pageFileTypeArray, fontFileTypeArray, serverFileTypeArray).join(','); //css,js,gif,png,html,php,eot,svg,ttf,woff,htaccess,access

// Loaded from ./config.json
var localProjectBaseDir = config.projectSettings.localProjectBaseDir,
    remoteProjectBaseDir = config.projectSettings.remoteProjectBaseDir,
    webAccount = config.environmentalSettings.webAccount,
    symbolicLink = config.environmentalSettings.symbolicLink,
    protocol = config.urlSettings.protocol,
    remoteBaseDevUrl = config.urlSettings.remoteBaseDevUrl,
    remoteBaseProdUrl = config.urlSettings.remoteBaseProdUrl,
    sftpHost = config.urlSettings.sftpHost,
    src = config.folderSettings.src,
    dist = config.folderSettings.dist,
    images = config.folderSettings.images,
    scripts = config.folderSettings.scripts,
    styles = config.folderSettings.styles,
    bowerComponents = config.folderSettings.bowerComponents,
    composerModules = config.folderSettings.composerModules,
    concatJsFile = config.filenameSettings.concatJsFile;

src = currentLevel + src + '/',
dist = currentLevel + dist + '/';

var htmlPhpFiles = dist + '**/*.{' + pageFileTypes + '}',
    phpFiles = dist + '**/*.php';

var srcScripts = src + scripts,
    distScripts = dist + scripts,
    srcStyles = src + styles,
    distStyles = dist + styles;

var srcCss = src + '**/*.css',
    srcSass = src + '**/*.scss',
    srcJs = src + '**/*.js',
    srcImages = src + '**/*.{' + imageFileTypes + '}';

var distCss = dist + '**/*.css',
    distJs = dist + '**/*.js',
    distImages = dist + '**/*.{' + imageFileTypes + '}';

var remoteBaseCssDevPrependUrl = '/' + webAccount + '/' + remoteProjectBaseDir,
    remoteBaseCssProdPrependUrl = '/' + symbolicLink + '/' + remoteProjectBaseDir;

//prepend URL is based on location of CSS files
var remoteCssDevPrependUrl = remoteBaseCssDevPrependUrl + '/',
    remoteCssProdPrependUrl = remoteBaseCssProdPrependUrl + '/';

remoteBaseDevUrl = protocol + '://' + remoteBaseDevUrl + remoteBaseCssDevPrependUrl,
remoteBaseProdUrl = protocol + '://' + remoteBaseProdUrl + remoteBaseCssProdPrependUrl;

var authDev = 'development', //defined in .ftppass
    authProd = 'production', //defined in .ftppass
    remotePath = 'public_html/' + remoteProjectBaseDir,
    remotePlatform = 'windows',
    browserSyncProxyUrl = protocol + '://' + 'localhost' + '/' + localProjectBaseDir + '/';

var docsBuildFile = 'compose.js',
    docsSrc  = 'docs/',
    docsDest = docsSrc + 'build/',
    docsTemplate = docsSrc + 'template/';

var SCREEN_RESOLUTIONS = [
    '320x480',
    '320x568',
    '768x1024',
    '1024x768',
    '1280x1024',
    '1280x800',
    '1366x768',
    '1440x900',
    '1600x900',
    '1920x1080'
];

var AUTOPREFIXER_BROWSERS = [
    'ie >= 7', //10
    'ie_mob >= 10',
    'ff >= 30',
    'chrome >= 34',
    'safari >= 7',
    'opera >= 23',
    'ios >= 7',
    'android >= 4.4',
    'bb >= 10'
];

var currentFile = ''; //used with tap plugin to know what file is currently within the pipe

/*------------------------------------------------*/

var onWarning = function(error){
    var displayError = $.util.colors.yellow(error);
    handleError.call(this, 'warning', error, displayError);
}

var onError = function(error){
    this.emit('end');
    var displayError = $.util.colors.red(error);
    handleError.call(this, 'error', error, displayError);
}

function handleError(level, error, displayError){
    $.util.log(displayError);

    if(level == 'error'){
        beep();
        process.exit(1);
    }
}

/*------------------------------------------------*/

gulp.task('app:lint:src:csslint', function(){
    return gulp.src(srcCss)
        .pipe($.csslint())
        .pipe($.csslint.reporter())
    ;
});

gulp.task('app:lint:src:jshint', function(){
    return gulp.src(srcJs)
        .pipe($.jshint())
        .pipe($.jshint.reporter(stylish))
        .pipe($.jshint.reporter('fail'))
    ;
});

gulp.task('app:generate:src:stats', function(){
    return gulp.src(srcJs)
        .pipe($.complexity())
    ;
});

gulp.task('app:lint:src:jscs', function(){
    return gulp.src(srcScripts + '/custom.js') //only run against single file - memory intensive
        .pipe($.jscs(currentLevel + '.jscsrc'))
    ;
});

gulp.task('app:lint:dist:htmlhint', function(){
    return gulp.src(phpFiles, {base: currentLevel})
        .pipe($.htmlhint({'htmlhintrc': currentLevel + '.htmlhintrc'}))
        .pipe($.htmlhint.reporter(stylish))
    ;
});

gulp.task('app:lint:dist:phpcs', function(){
    return gulp.src(phpFiles, {base: currentLevel})
        .pipe($.shell([
            'echo "' + composerModules + '/bin/phpcs" -n --standard="' + composerModules + '/phpcs-ruleset.xml" "<%= file.path %>"',
            '"' + composerModules + '/bin/phpcs" -n --standard="' + composerModules + '/phpcs-ruleset.xml" "<%= file.path %>"'
        ], {ignoreErrors: true}))
    ;
});

gulp.task('app:lint:dist:phpmd', function(){
    return gulp.src(phpFiles, {base: currentLevel})
        .pipe($.shell([
            'echo "' + composerModules + '/bin/phpmd" "<%= file.path %>" text "' + composerModules + '/phpmd-ruleset.xml"',
            '"' + composerModules + '/bin/phpmd" "<%= file.path %>" text "' + composerModules + '/phpmd-ruleset.xml"'
        ], {ignoreErrors: true}))
    ;
});

gulp.task('app:lint:dist:phpcpd', function(){
    return gulp.src(phpFiles, {base: currentLevel})
        .pipe($.shell([
            'echo "' + composerModules + '/bin/phpcpd" "<%= file.path %>"',
            '"' + composerModules + '/bin/phpcpd" "<%= file.path %>"'
        ], {ignoreErrors: true}))
    ;
});

gulp.task('app:generate:dist:screenshots', function(){
    var pageres = new Pageres({crop: true})
        .src(remoteBaseDevUrl, SCREEN_RESOLUTIONS)
        .dest(__dirname);

    pageres.run(function(error){
        if(error){
            onError(error);
        } else {
            console.log("Successfully generated 10 screenshots for:\n" + remoteBaseDevUrl);
        }
    });
});

gulp.task('app:generate:dist:pagespeed', function(cb){
    //You can use a Google Developer API key: http://goo.gl/RkN0vE
    pagespeed.output(remoteBaseDevUrl, {
        //key: 'YOUR_API_KEY',
        strategy: 'mobile',
        threshold: 65
    }, cb);
});

gulp.task('bower:install', function(){
    bower.commands
        .install([/* custom libs */], {save: true}, {/* custom config */})
        .on('end', function(installed){
            if(Object.keys(installed).length !== 0)
                onWarning(Object.keys(installed));
        });
});

gulp.task('app:build:styles:src:critical', function(){
    penthouse({
        url: browserSyncProxyUrl, //localhost
        css: srcStyles + '/screen.css', //main CSS file
        width: 400,
        height: 240
    }, function(error, criticalCss){
        if(error){
            onError(error);
        } else {
            onWarning(criticalCss);
        }
    });
});

gulp.task('__app:compose:documentation', function(){
    $.apidoc.exec({
        includeFilters: [docsBuildFile],
        src:  docsSrc,
        dest: docsDest,
        template: docsTemplate
    });

    console.log('Documentation can be found at: ' + currentLevel + docsDest);
});

gulp.task('app:build:documentation', function(){
    runSequence('__app:clean:documentation', '__app:compose:documentation');
});

/*------------------------------------------------*/

gulp.task('__app:clean:styles', function(cb){
    del([dist + '**/*.css'], {'force': true}, cb);
});

gulp.task('__app:clean:scripts', function(cb){
    del([dist + '**/*.js', distScripts + '/tinymce'], {'force': true}, cb);
});

gulp.task('__app:clean:images', function(cb){
    del([dist + '**/*.{' + imageFileTypes + '}'], {'force': true}, cb);
});

gulp.task('__app:clean:documentation', function(cb){
    del([docsDest + '**/*.*', '!' + docsDest + '.keep'], {'force': true}, cb);
});

gulp.task('__app:process:src:tabs', function(){
    return gulp.src(htmlPhpFiles)
        .pipe($.soften(4)) //4 spaces
        .pipe(gulp.dest(dist))
    ;
});

gulp.task('__app:process:src:eol', function(){
    return gulp.src(htmlPhpFiles)
        .pipe($.eol('\r\n', false))
        .pipe(gulp.dest(dist))
    ;
});

gulp.task('__app:clean:all', function(callback){
    return runSequence(['__app:process:src:tabs', '__app:process:src:eol'], '__app:clean:styles', '__app:clean:scripts', '__app:clean:images', callback);
});

gulp.task('app:process:path', function(){
    var isFolder = (argv.folder) ? true : false;
    //gulp app:process:path --folder app/controllers
    //gulp app:process:path --folder app/models
    //gulp app:process:path --folder app/views

    if(isFolder){
        var folder = argv.folder;

        if(fs.existsSync(folder)){
            console.log('Processed folder: ' + folder);

            return gulp.src(folder + '/**/*.{' + pageFileTypes + '}')
                .pipe($.soften(4)) //4 spaces
                .pipe($.eol('\r\n', false))
                .pipe(gulp.dest(folder + '/'))
            ;
        } else {
            return onError('Error: Folder not found at ' + folder);
        }
    } else {
        return onError('Error: --folder flag not set');
    }
});

/*------------------------------------------------*/

String.prototype.replaceLast = function(find, replace){
    var index = this.lastIndexOf(find);

    if(index >= 0)
        return this.substring(0, index) + replace + this.substring(index + find.length);

    return this.toString();
};

function calculateAdjustedUrl(url){
    var output = ''; //var to hold result

    currentFile = currentFile.replace(/\\/g, '/'); //convert all back-slashes to forward-slashes
    var dirname = currentFile.replace(/\/[^\/]*\/?$/, '') + '/';
    var url_without_params = url.replace(/(\?.*)|(#.*)/g, '');

    if(fs.existsSync(dirname + url_without_params)) //if path already exists, leave alone
        output = url;
    else if(url.charAt(0) == '/') //absolute URL, leave alone
        output = url;
    else if(url.indexOf('/') == -1)
        output = upOneLevel + images + '/' + url;
    else
        output = upOneLevel + url.replace(/^(?:\.\.\/)+/, '');

    var output_without_params = output.replace(/(\?.*)|(#.*)/g, '');

    if(fs.existsSync(dirname + output_without_params)){
        var stats = fs.statSync(dirname + output_without_params);
        var filemtime = Math.round(stats.mtime.getTime() / 1000); //convert to Unix timestamp
        output = output.replaceLast('.', '.' + filemtime + '.');
    } else {
        onWarning('File not found: ' + (dirname + output_without_params) + "\n" + 'Defined in: ' + currentFile.split('/').reverse()[0]);
    }

    return output;
}

/*------------------------------------------------*/

gulp.task('app:build:styles:src:local', function(){
    return gulp.src([srcCss, srcSass])
        .pipe($.plumber({
            errorHandler: onError
        }))
        .pipe($.changed(dist)) //must be dist
        .pipe($.tap(function(file, t){
            currentFile = file.path; //update global var
        }))
        .pipe($.if('*.css', $.cssUrlAdjuster({
            append: function(url){
                return calculateAdjustedUrl(url);
            }
        })))
        .pipe($.if('*.css', $.csso()))
        .pipe($.if('*.scss', $.sass({precision: 10}).on('error', onError)))
        .pipe($.autoprefixer({browsers: AUTOPREFIXER_BROWSERS}))
        .pipe(gulp.dest(dist))
        .pipe(reload({stream: true}))
        .pipe($.size({title: 'app:build:styles:src:local'}))
    ;
});

gulp.task('app:build:scripts:src:local', function(){
    var files = mainBowerFiles({filter: /\.(js)$/i});
    files.push(srcJs);

    return gulp.src(files)
        .pipe($.plumber({
            errorHandler: onError
        }))
        .pipe($.if(!argv.skipMinify && '*.js', $.uglify({
            mangle: false,
            output: {
                beautify: true
            }
        })))
        .pipe($.order([
            '**/**/jquery.js',
            '**/**/jquery.ui.js',
            '**/**/angular.js',
            '**/**/angular-resource.js',
            '**/**/ui-bootstrap.js',
            '**/**/custom.js',
            '**/**/modernizr.js',
            '**/**/jquery.fancybox.js',
            '**/**/URI.js',
            '**/**/*.js'
        ]))
        .pipe($.concat(concatJsFile))
        .pipe(gulp.dest(distScripts))
        .pipe(reload({stream: true, once: true}))
        .pipe($.size({title: 'app:build:scripts:src:local'}))
    ;
});

gulp.task('__app:reload:pages:local', function(){
    return gulp.src(htmlPhpFiles)
        .pipe($.changed(htmlPhpFiles))
        .pipe(reload({stream: true}))
    ;
});

/*------------------------------------------------*/

gulp.task('app:build:styles:src:remote', function(){
    return gulp.src([srcCss, srcSass])
        .pipe($.plumber({
            errorHandler: onError
        }))
        .pipe($.changed(dist)) //must be dist
        .pipe($.tap(function(file, t){
            currentFile = file.path; //update global var
        }))
        .pipe($.if('*.css', $.cssUrlAdjuster({
            append: function(url){
                return calculateAdjustedUrl(url);
            }
        })))
        .pipe($.if('*.css', $.csso()))
        .pipe($.if('*.scss', $.sass({precision: 10}).on('error', onError)))
        .pipe($.autoprefixer({browsers: AUTOPREFIXER_BROWSERS}))
        .pipe(gulp.dest(dist))
        .pipe($.size({title: 'app:build:styles:src:remote'}))
    ;
});

gulp.task('app:build:scripts:src:remote', function(){
    var files = mainBowerFiles({filter: /\.(js)$/i});
    files.push(srcJs);

    return gulp.src(files)
        .pipe($.plumber({
            errorHandler: onError
        }))
        .pipe($.if(
            argv.production, // --production flag
            $.removelogs()
        ))
        .pipe($.if(
            !argv.skipMinify && !argv.production && '*.js',
            $.uglify({
                mangle: false,
                output: {
                    beautify: true
                }
            })
        ))
        .pipe($.if(
            !argv.skipMinify && argv.production && '*.js', // --production flag
            $.uglify({preserveComments: 'some'})
        ))
        .pipe($.order([
            '**/**/jquery.js',
            '**/**/jquery.ui.js',
            '**/**/angular.js',
            '**/**/angular-resource.js',
            '**/**/ui-bootstrap.js',
            '**/**/custom.js',
            '**/**/modernizr.js',
            '**/**/jquery.fancybox.js',
            '**/**/URI.js',
            '**/**/*.js'
        ]))
        .pipe($.concat(concatJsFile))
        .pipe(gulp.dest(distScripts))
        .pipe($.size({title: 'app:build:scripts:src:remote'}))
    ;
});

gulp.task('app:prepare:styles:src:remote', function(){
    return gulp.src([srcCss, srcSass], {base: src})
        .pipe($.plumber({
            errorHandler: onError
        }))
        .pipe($.changed(dist)) //must be dist
        .pipe($.tap(function(file, t){
            currentFile = file.path; //update global var
        }))
        .pipe($.if('*.css', $.cssUrlAdjuster({
            append: function(url){
                return calculateAdjustedUrl(url);
            }
        })))
        .pipe($.if('*.css', $.csso()))
        .pipe($.if('*.scss', $.sass({precision: 10}).on('error', onError)))
        .pipe($.autoprefixer({browsers: AUTOPREFIXER_BROWSERS}))
        .pipe(gulp.dest(dist))
        .pipe($.size({title: 'app:prepare:styles:src:remote'}))
        .pipe($.if(
            !argv.production,
            $.sftp({
                host: sftpHost,
                auth: authDev,
                remotePath: remotePath,
                remotePlatform: remotePlatform
            })
        ))
        .pipe($.if(
            argv.production, // --production flag
            $.sftp({
                host: sftpHost,
                auth: authProd,
                remotePath: remotePath,
                remotePlatform: remotePlatform
            })
        ))
    ;
});

gulp.task('app:prepare:scripts:src:remote', function(){
    var files = mainBowerFiles({filter: /\.(js)$/i});
    files.push(srcJs);

    return gulp.src(files)
        .pipe($.plumber({
            errorHandler: onError
        }))
        .pipe($.if(
            argv.production, // --production flag
            $.removelogs()
        ))
        .pipe($.if(
            !argv.skipMinify && !argv.production && '*.js',
            $.uglify({
                mangle: false,
                output: {
                    beautify: true
                }
            })
        ))
        .pipe($.if(
            !argv.skipMinify && argv.production && '*.js', // --production flag
            $.uglify({preserveComments: 'some'})
        ))
        .pipe($.order([
            '**/**/jquery.js',
            '**/**/jquery.ui.js',
            '**/**/angular.js',
            '**/**/angular-resource.js',
            '**/**/ui-bootstrap.js',
            '**/**/custom.js',
            '**/**/modernizr.js',
            '**/**/jquery.fancybox.js',
            '**/**/URI.js',
            '**/**/*.js'
        ]))
        .pipe($.concat(concatJsFile))
        .pipe(gulp.dest(distScripts))
        .pipe($.size({title: 'app:prepare:scripts:src:remote'}))
        .pipe($.if(
            !argv.production,
            $.sftp({
                host: sftpHost,
                auth: authDev,
                remotePath: remotePath + '/' + scripts,
                remotePlatform: remotePlatform
            })
        ))
        .pipe($.if(
            argv.production, // --production flag
            $.sftp({
                host: sftpHost,
                auth: authProd,
                remotePath: remotePath + '/' + scripts,
                remotePlatform: remotePlatform
            })
        ))
    ;
});

gulp.task('__app:reload:pages:remote', function(){
    return gulp.src(htmlPhpFiles, {base: dist})
        .pipe($.plumber({
            errorHandler: onError
        }))
        .pipe($.changed(htmlPhpFiles))
        .pipe($.if(
            !argv.production,
            $.sftp({
                host: sftpHost,
                auth: authDev,
                remotePath: remotePath,
                remotePlatform: remotePlatform
            })
        ))
        .pipe($.if(
            argv.production, // --production flag
            $.sftp({
                host: sftpHost,
                auth: authProd,
                remotePath: remotePath,
                remotePlatform: remotePlatform
            })
        ))
    ;
});

/*------------------------------------------------*/

gulp.task('app:build:images:src', function(){
    return gulp.src(srcImages)
        .pipe($.imagemin({
            optimizationLevel: 5, //0-7
            progressive: true, //jpg
            interlaced: true //gif
        }))
        .pipe(gulp.dest(dist))
    ;
});

gulp.task('__app:copy:files', function(){
    //Manual copy for theme files etc.
    gulp.src([bowerComponents + '/' + 'tinymce/**/*'], {base: currentLevel})
        .pipe($.rename(function(path){
            //Remove directory from destination path
            path.dirname = path.dirname.replace(bowerComponents, '');
        }))
        .pipe(gulp.dest(distScripts));

    return gulp.src([src + '.{' + otherFileTypes + '}', src + '**/*.{' + otherFileTypes + '}'])
        .pipe(gulp.dest(dist))
    ;
});

/*------------------------------------------------*/

gulp.task('__app:sftp:dist', function(){
    return gulp.src([dist + '**/*.{' + allValidFileTypes + '}', '!' + currentLevel + 'gulpfile.js'], {dot: true})
        .pipe(plumber({
            errorHandler: onError
        }))
        .pipe($.if(
            !argv.production,
            $.sftp({
                host: sftpHost,
                auth: authDev,
                remotePath: remotePath,
                remotePlatform: remotePlatform
            })
        ))
        .pipe($.if(
            argv.production, // --production flag
            $.sftp({
                host: sftpHost,
                auth: authProd,
                remotePath: remotePath,
                remotePlatform: remotePlatform
            })
        ))
    ;
});

gulp.task('app:serve:local', function(){
    browserSync({
        proxy: browserSyncProxyUrl,
        notify: false,
        logPrefix: function(){
            return this.compile('{green:[' + localProjectBaseDir + '] ');
        }
    });

    gulp.watch(htmlPhpFiles, ['__app:reload:pages:local']);
    gulp.watch([srcCss, srcSass], ['app:build:styles:src:local']);
    gulp.watch(srcJs, ['app:build:scripts:src:local']);
});

gulp.task('app:serve:remote', function(){
    gulp.watch(htmlPhpFiles, ['__app:reload:pages:remote']);
    gulp.watch([srcCss, srcSass], ['app:prepare:styles:src:remote']);
    gulp.watch(srcJs, ['app:prepare:scripts:src:remote']);
});

gulp.task('app:open:dist:remote', function(){
    return argv.production ? open(remoteBaseProdUrl, webBrowser) : open(remoteBaseDevUrl, webBrowser);
});

/*------------------------------------------------*/

gulp.task('app:build:local', function(callback){
    runSequence('__app:clean:all', ['app:build:styles:src:local', 'app:build:scripts:src:local', 'app:build:images:src', '__app:copy:files'], callback);
});

gulp.task('app:build:remote', function(callback){
    runSequence('__app:clean:all', ['app:build:styles:src:remote', 'app:build:scripts:src:remote', 'app:build:images:src', '__app:copy:files'], callback);
});

gulp.task('default', function(callback){
    runSequence('app:build:local', 'app:serve:local', callback);
});

gulp.task('app:upload:dist', function(callback){
    runSequence('app:build:remote', '__app:sftp:dist', 'app:serve:remote', 'app:open:dist:remote', callback);
});

//Load custom tasks from the `tasks` directory (if it exists)
try { require('require-dir')('tasks'); } catch (error) { onError(error); }