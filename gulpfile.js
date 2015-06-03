'use strict';

var base = 'C:/Users/' + process.env.USERNAME + '/AppData/Roaming/',
    node_modules = base + 'npm/node_modules/',
    composer_bin = base + 'Composer/vendor/bin/',
    composer_plugins = 'composer_plugins/';

var currentLevel = './',
    upOneLevel = '../';

var gulp = require(node_modules + 'gulp'),
    config = require(currentLevel + 'config.json');

module.exports = gulp; //for Chrome plugin + gulp-devtools

var autoprefixer = require(node_modules + 'gulp-autoprefixer'),
    changed = require(node_modules + 'gulp-changed'),
    complexity = require(node_modules + 'gulp-complexity'),
    csslint = require(node_modules + 'gulp-csslint'),
    csso = require(node_modules + 'gulp-csso'),
    cssUrlAdjuster = require(node_modules + 'gulp-css-url-adjuster'),
    htmlhint = require(node_modules + 'gulp-htmlhint'),
    imagemin = require(node_modules + 'gulp-imagemin'),
    jscs = require(node_modules + 'gulp-jscs'),
    jshint = require(node_modules + 'gulp-jshint'),
    plumber = require(node_modules + 'gulp-plumber'),
    removelogs = require(node_modules + 'gulp-removelogs'),
    sftp = require(node_modules + 'gulp-sftp'),
    shell = require(node_modules + 'gulp-shell'),
    size = require(node_modules + 'gulp-size'),
    soften = require(node_modules + 'gulp-soften'),
    uglify = require(node_modules + 'gulp-uglify'),
    util = require(node_modules + 'gulp-util'),
    browserSync = require(node_modules + 'browser-sync'),
    stylish = require(node_modules + 'jshint-stylish'),
    open = require(node_modules + 'opn'),
    pagespeed = require(node_modules + 'psi'),
    runSequence = require(node_modules + 'run-sequence'),
    order = require(node_modules + 'gulp-order'),
    concat = require(node_modules + 'gulp-concat'),
    iff = require(node_modules + 'gulp-if'),
    argv = require(node_modules + 'yargs').argv,
    Pageres = require(node_modules + 'pageres'),
    mainBowerFiles = require(node_modules + 'main-bower-files'),
    fs = require('fs'), //part of Node
    tap = require(node_modules + 'gulp-tap'),
    penthouse = require(node_modules + 'penthouse'),
    del = require(node_modules + 'del'),
    eol = require(node_modules + 'gulp-eol'),
    bower = require(node_modules + 'bower')
;

var webBrowser = 'chrome',
    reload = browserSync.reload;

var stylesheetFileTypeArray = ['css'],
    scriptFileTypeArray = ['js'],
    imageFileTypeArray = ['gif', 'png'],
    pageFileTypeArray = ['html', 'php'],
    fontFileTypeArray = ['eot', 'svg', 'ttf', 'woff'],
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

var onError = function(error){
    //cause the terminal to play a beep sound to get your attention should an error occur
    util.beep();
    console.log(error);
};

/*------------------------------------------------*/

gulp.task('csslint', function(){
    return gulp.src(srcCss)
        .pipe(csslint())
        .pipe(csslint.reporter())
    ;
});

gulp.task('jshint', function(){
    return gulp.src(srcJs)
        .pipe(jshint())
        .pipe(jshint.reporter(stylish))
        .pipe(jshint.reporter('fail'))
    ;
});

gulp.task('stats', function(){
    return gulp.src(srcJs)
        .pipe(complexity())
    ;
});

gulp.task('jscs', function(){
    return gulp.src(srcScripts + '/custom.js') //only run against single file - memory intensive
        .pipe(jscs(currentLevel + '.jscsrc'))
    ;
});

gulp.task('htmlhint', function(){
    return gulp.src(phpFiles, {base: currentLevel})
        .pipe(htmlhint({'htmlhintrc': currentLevel + '.htmlhintrc'}))
        .pipe(htmlhint.reporter(stylish))
    ;
});

gulp.task('phpcs', function(){
    return gulp.src(phpFiles, {base: currentLevel})
        .pipe(shell([
            'echo phpcs -n --standard="' + composer_plugins + 'phpcs-ruleset.xml" "<%= file.path %>"',
            'phpcs -n --standard="' + composer_plugins + 'phpcs-ruleset.xml" "<%= file.path %>"'
        ], {ignoreErrors: true}))
    ;
});

gulp.task('phpmd', function(){
    return gulp.src(phpFiles, {base: currentLevel})
        .pipe(shell([
            'echo phpmd "<%= file.path %>" text "' + composer_plugins + 'phpmd-ruleset.xml"',
            'phpmd "<%= file.path %>" text "' + composer_plugins + 'phpmd-ruleset.xml"'
        ], {ignoreErrors: true}))
    ;
});

gulp.task('phpcpd', function(){
    return gulp.src(phpFiles, {base: currentLevel})
        .pipe(shell([
            'echo phpcpd "<%= file.path %>"',
            'phpcpd "<%= file.path %>"'
        ], {ignoreErrors: true}))
    ;
});

gulp.task('screenshots', function(){
    var pageres = new Pageres({crop: true})
        .src(remoteBaseDevUrl, SCREEN_RESOLUTIONS)
        .dest(__dirname);

    pageres.run(function(error){
        if(error)
            throw error;

        console.log('Successfully generated 10 screenshots');
    });
});

gulp.task('pagespeed', function(cb){
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
                console.log(Object.keys(installed));
        });
});

gulp.task('bower', function(){
    return gulp.start('bower:install');
});

gulp.task('critical:css', function(){
    penthouse({
        url: browserSyncProxyUrl, //localhost
        css: srcStyles + '/screen.css', //main CSS file
        width: 400,
        height: 240
    }, function(error, criticalCss){
        console.log(criticalCss);
    });
});

/*------------------------------------------------*/

gulp.task('clean:css', function(cb){
    del([dist + '**/*.css'], {'force': true}, cb);
});

gulp.task('clean:js', function(cb){
    del([dist + '**/*.js'], {'force': true}, cb);
});

gulp.task('clean:images', function(cb){
    del([dist + '**/*.{' + imageFileTypes + '}'], {'force': true}, cb);
});

gulp.task('tabsto4spaces', function(){
    return gulp.src(htmlPhpFiles)
        .pipe(soften(4)) //4 spaces
        .pipe(gulp.dest(dist))
    ;
});

gulp.task('eolfix', function(){
    return gulp.src(htmlPhpFiles)
        .pipe(eol('\r\n', false))
        .pipe(gulp.dest(dist))
    ;
});

gulp.task('clean:all', function(callback){
    return runSequence(['tabsto4spaces', 'eolfix'], 'clean:css', 'clean:js', 'clean:images', callback);
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
        var filemtime = stats.mtime.getTime() / 1000; //convert to Unix timestamp
        output = output.replaceLast('.', '.' + filemtime + '.');
    } else
        console.error('File not found: ' + (dirname + output_without_params) + "\n" + 'Defined in: ' + currentFile.split('/').reverse()[0]);

    return output;
}

/*------------------------------------------------*/

gulp.task('compile:css:local', function(){
    return gulp.src(srcCss)
        .pipe(plumber({
            errorHandler: onError
        }))
        .pipe(changed(dist)) //must be dist
        .pipe(tap(function(file, t){
            currentFile = file.path; //update global var
        }))
        .pipe(cssUrlAdjuster({
            append: function(url){
                return calculateAdjustedUrl(url);
            }
        }))
        .pipe(iff('*.css', csso()))
        .pipe(autoprefixer({browsers: AUTOPREFIXER_BROWSERS}))
        .pipe(gulp.dest(dist))
        .pipe(reload({stream: true}))
        .pipe(size({title: 'compile:css:local'}))
    ;
});

gulp.task('compile:js:local', function(){
    var files = mainBowerFiles({filter: /\.(js)$/i});
    files.push(srcJs);

    return gulp.src(files)
        .pipe(plumber({
            errorHandler: onError
        }))
        .pipe(iff('*.js', uglify({
            mangle: false,
            output: {
                beautify: true
            }
        })))
        .pipe(order([
            '**/**/jquery.js',
            '**/**/jquery.ui.js',
            '**/**/custom.js',
            '**/**/modernizr.js',
            '**/**/jquery.fancybox.js',
            '**/**/URI.js',
            '**/**/*.js'
        ]))
        .pipe(concat(concatJsFile))
        .pipe(gulp.dest(distScripts))
        .pipe(reload({stream: true, once: true}))
        .pipe(size({title: 'compile:js:local'}))
    ;
});

gulp.task('reloadhtmlphp', function(){
    return gulp.src(htmlPhpFiles)
        .pipe(changed(htmlPhpFiles))
        .pipe(reload({stream: true}))
    ;
});

/*------------------------------------------------*/

gulp.task('compile:css:remote', function(){
    return gulp.src(srcCss)
        .pipe(plumber({
            errorHandler: onError
        }))
        .pipe(changed(dist)) //must be dist
        .pipe(tap(function(file, t){
            currentFile = file.path; //update global var
        }))
        .pipe(cssUrlAdjuster({
            append: function(url){
                return calculateAdjustedUrl(url);
            }
        }))
        .pipe(iff('*.css', csso()))
        .pipe(autoprefixer({browsers: AUTOPREFIXER_BROWSERS}))
        .pipe(gulp.dest(dist))
        .pipe(size({title: 'compile:css:remote'}))
    ;
});

gulp.task('compile:js:remote', function(){
    var files = mainBowerFiles({filter: /\.(js)$/i});
    files.push(srcJs);

    return gulp.src(files)
        .pipe(plumber({
            errorHandler: onError
        }))
        .pipe(iff(
            argv.production, // --production flag
            removelogs()
        ))
        .pipe(iff(
            !argv.production && '*.js',
            uglify({
                mangle: false,
                output: {
                    beautify: true
                }
            })
        ))
        .pipe(iff(
            argv.production && '*.js', // --production flag
            uglify({preserveComments: 'some'})
        ))
        .pipe(order([
            '**/**/jquery.js',
            '**/**/jquery.ui.js',
            '**/**/custom.js',
            '**/**/modernizr.js',
            '**/**/jquery.fancybox.js',
            '**/**/*.js'
        ]))
        .pipe(concat(concatJsFile))
        .pipe(gulp.dest(distScripts))
        .pipe(size({title: 'compile:js:remote'}))
    ;
});

gulp.task('prepare:css:remote', function(){
    return gulp.src(srcCss, {base: src})
        .pipe(plumber({
            errorHandler: onError
        }))
        .pipe(changed(dist)) //must be dist
        .pipe(tap(function(file, t){
            currentFile = file.path; //update global var
        }))
        .pipe(cssUrlAdjuster({
            append: function(url){
                return calculateAdjustedUrl(url);
            }
        }))
        .pipe(iff('*.css', csso()))
        .pipe(autoprefixer({browsers: AUTOPREFIXER_BROWSERS}))
        .pipe(gulp.dest(dist))
        .pipe(size({title: 'prepare:css:remote'}))
        .pipe(iff(
            !argv.production,
            sftp({
                host: sftpHost,
                auth: authDev,
                remotePath: remotePath,
                remotePlatform: remotePlatform
            })
        ))
        .pipe(iff(
            argv.production, // --production flag
            sftp({
                host: sftpHost,
                auth: authProd,
                remotePath: remotePath,
                remotePlatform: remotePlatform
            })
        ))
    ;
});

gulp.task('prepare:js:remote', function(){
    var files = mainBowerFiles({filter: /\.(js)$/i});
    files.push(srcJs);

    return gulp.src(files)
        .pipe(plumber({
            errorHandler: onError
        }))
        .pipe(iff(
            argv.production, // --production flag
            removelogs()
        ))
        .pipe(iff(
            !argv.production && '*.js',
            uglify({
                mangle: false,
                output: {
                    beautify: true
                }
            })
        ))
        .pipe(iff(
            argv.production && '*.js', // --production flag
            uglify({preserveComments: 'some'})
        ))
        .pipe(order([
            '**/**/jquery.js',
            '**/**/jquery.ui.js',
            '**/**/custom.js',
            '**/**/modernizr.js',
            '**/**/jquery.fancybox.js',
            '**/**/*.js'
        ]))
        .pipe(concat(concatJsFile))
        .pipe(gulp.dest(distScripts))
        .pipe(size({title: 'prepare:js:remote'}))
        .pipe(iff(
            !argv.production,
            sftp({
                host: sftpHost,
                auth: authDev,
                remotePath: remotePath + '/' + scripts,
                remotePlatform: remotePlatform
            })
        ))
        .pipe(iff(
            argv.production, // --production flag
            sftp({
                host: sftpHost,
                auth: authProd,
                remotePath: remotePath + '/' + scripts,
                remotePlatform: remotePlatform
            })
        ))
    ;
});

gulp.task('reloadhtmlphpandupload', function(){
    return gulp.src(htmlPhpFiles, {base: dist})
        .pipe(plumber({
            errorHandler: onError
        }))
        .pipe(changed(htmlPhpFiles))
        .pipe(iff(
            !argv.production,
            sftp({
                host: sftpHost,
                auth: authDev,
                remotePath: remotePath,
                remotePlatform: remotePlatform
            })
        ))
        .pipe(iff(
            argv.production, // --production flag
            sftp({
                host: sftpHost,
                auth: authProd,
                remotePath: remotePath,
                remotePlatform: remotePlatform
            })
        ))
    ;
});

/*------------------------------------------------*/

gulp.task('optimise:images', function(){
    return gulp.src(srcImages)
        .pipe(imagemin({
            optimizationLevel: 5, //0-7
            progressive: true, //jpg
            interlaced: true //gif
        }))
        .pipe(gulp.dest(dist))
    ;
});

gulp.task('moveotherfiles', function(){
    return gulp.src([src + '**/*.{' + otherFileTypes + '}'])
        .pipe(gulp.dest(dist))
    ;
});

/*------------------------------------------------*/

gulp.task('sftp', function(){
    return gulp.src([dist + '**/*.{' + allValidFileTypes + '}', '!' + currentLevel + 'gulpfile.js'], {dot: true})
        .pipe(plumber({
            errorHandler: onError
        }))
        .pipe(iff(
            !argv.production,
            sftp({
                host: sftpHost,
                auth: authDev,
                remotePath: remotePath,
                remotePlatform: remotePlatform
            })
        ))
        .pipe(iff(
            argv.production, // --production flag
            sftp({
                host: sftpHost,
                auth: authProd,
                remotePath: remotePath,
                remotePlatform: remotePlatform
            })
        ))
    ;
});

gulp.task('serve:local', function(){
    browserSync({
        proxy: browserSyncProxyUrl,
        notify: false,
        logPrefix: function(){
            return this.compile('{green:[' + localProjectBaseDir + '] ');
        }
    });

    gulp.watch(htmlPhpFiles, ['reloadhtmlphp']);
    gulp.watch(srcCss, ['compile:css:local']);
    gulp.watch(srcJs, ['compile:js:local']);
});

gulp.task('serve:remote', function(){
    gulp.watch(htmlPhpFiles, ['reloadhtmlphpandupload']);
    gulp.watch(srcCss, ['prepare:css:remote']);
    gulp.watch(srcJs, ['prepare:js:remote']);
});

gulp.task('openurl:remote', function(){
    return argv.production ? open(remoteBaseProdUrl, webBrowser) : open(remoteBaseDevUrl, webBrowser);
});

/*------------------------------------------------*/

gulp.task('build:local', function(callback){
    runSequence('clean:all', ['compile:css:local', 'compile:js:local', 'optimise:images', 'moveotherfiles'], callback);
});

gulp.task('build:remote', function(callback){
    runSequence('clean:all', ['compile:css:remote', 'compile:js:remote', 'optimise:images', 'moveotherfiles'], callback);
});

gulp.task('default', function(callback){
    runSequence('build:local', 'serve:local', callback);
});

gulp.task('upload', function(callback){
    runSequence('build:remote', 'sftp', 'serve:remote', 'openurl:remote', callback);
});

//Load custom tasks from the `tasks` directory (if it exists)
try { require(node_modules + 'require-dir')('tasks'); } catch (error) { console.error(error); }